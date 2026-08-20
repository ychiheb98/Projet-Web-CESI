"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { guessColumn, parseAmount, parseDate } from "@/lib/csv";
import { importExpenses, type ImportRow } from "@/lib/actions/expenses";

const NONE = "__none__";

export function ImportClient({ categoryNames }: { categoryNames: string[] }) {
  const router = useRouter();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [amountCol, setAmountCol] = useState("");
  const [dateCol, setDateCol] = useState("");
  const [noteCol, setNoteCol] = useState(NONE);
  const [categoryCol, setCategoryCol] = useState(NONE);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields ?? [];
        if (fields.length === 0 || results.data.length === 0) {
          setError("Couldn't find any rows in that file.");
          return;
        }
        setHeaders(fields);
        setRows(results.data);
        setAmountCol(guessColumn(fields, ["amount", "debit", "value", "total"]));
        setDateCol(guessColumn(fields, ["date", "occurred_on", "transaction date"]));
        setNoteCol(guessColumn(fields, ["description", "note", "memo", "merchant"]) || NONE);
        setCategoryCol(NONE);
      },
      error: () => setError("Couldn't read that file — make sure it's a valid CSV."),
    });
  }

  const mapped: ImportRow[] = rows
    .map((row): ImportRow | null => {
      const amount = parseAmount(row[amountCol]);
      const occurred_on = parseDate(row[dateCol]);
      if (amount === null || !occurred_on) return null;
      return {
        amount,
        occurred_on,
        note: noteCol !== NONE ? row[noteCol] ?? null : null,
        category_name: categoryCol !== NONE ? row[categoryCol] ?? null : null,
      };
    })
    .filter((r): r is ImportRow => r !== null);

  const skipped = rows.length - mapped.length;

  async function onImport() {
    setImporting(true);
    setError(null);
    const res = await importExpenses(mapped);
    setImporting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(`Imported ${res.inserted} expense${res.inserted === 1 ? "" : "s"}.`);
    setTimeout(() => {
      router.push("/expenses");
      router.refresh();
    }, 900);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <label className="block text-sm font-medium text-foreground mb-2" htmlFor="csv-file">
          Bank or card statement (CSV)
        </label>
        <input id="csv-file" type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm text-foreground" />
        <p className="text-xs text-muted mt-2">
          Nothing is uploaded to a bank — you export the CSV yourself and only the parsed rows below are saved.
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {headers.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <p className="font-medium text-foreground">Map columns</p>
          <ColumnSelect label="Amount" headers={headers} value={amountCol} onChange={setAmountCol} />
          <ColumnSelect label="Date" headers={headers} value={dateCol} onChange={setDateCol} />
          <ColumnSelect label="Note" headers={headers} value={noteCol} onChange={setNoteCol} allowNone />
          <ColumnSelect
            label="Category (matched by name to your existing categories)"
            headers={headers}
            value={categoryCol}
            onChange={setCategoryCol}
            allowNone
          />

          <div className="text-sm text-muted">
            {mapped.length} row{mapped.length === 1 ? "" : "s"} ready to import
            {skipped > 0 ? `, ${skipped} skipped (couldn't parse amount/date)` : ""}.
          </div>

          {categoryNames.length > 0 && (
            <p className="text-xs text-muted">Your categories: {categoryNames.join(", ")}</p>
          )}

          {result && <p className="text-sm text-success">{result}</p>}

          <button
            onClick={onImport}
            disabled={importing || mapped.length === 0}
            className="w-full rounded-lg bg-primary text-primary-foreground font-medium py-2.5 disabled:opacity-60"
          >
            {importing ? "Importing…" : `Import ${mapped.length} expense${mapped.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}
    </div>
  );
}

function ColumnSelect({
  label,
  headers,
  value,
  onChange,
  allowNone,
}: {
  label: string;
  headers: string[];
  value: string;
  onChange: (v: string) => void;
  allowNone?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
      >
        {allowNone && <option value={NONE}>None</option>}
        {headers.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
    </div>
  );
}
