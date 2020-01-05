<HTML>
<HEAD>
<TITLE>Inscription Green Therapy</TITLE>
<LINK REL="STYLESHEET" HREF="STYLE.CSS">
<SCRIPT type="text/javascript">
function validate()
{
	var fname=document.getElementById("fname");
	var lname=document.getElementById("lname");
	var mob=document.getElementById("mob");
	var location=document.getElementById("location");
	var EmailId=document.getElementById("email");
	var addr=document.getElementById("addr");
	var pw=document.getElementById("pw");
	var cpw=document.getElementById("cpw");
	var alphaExp = /^[a-zA-Z]+$/;
	var atpos = EmailId.value.indexOf("@");
    var dotpos = EmailId.value.lastIndexOf(".");
 	if(pw.value.length< 8 || cpw.value.length< 8)
	{
		alert("Veuillez saisir un mot de passe d'au moins 8 caractères");
		pw.focus();
		return false;
	}
	else if (pw.value.length != cpw.value.length) 
	{
		alert("Les mots de passe ne correspondent pas.");
		pw.focus();
        return false;
    }
	else if (pw.value != cpw.value) 
	{
		alert("Les mots de passe ne correspondent pas.");
		pw.focus();
        return false;
    }
	if (atpos<1 || dotpos<atpos+2 || dotpos+2>=EmailId.value.length) 
	{
        alert("Entrer un email valide");
		EmailId.focus();
        return false;
   	}
	if(fname.value==null || fname.value=="")
	{
		fname.focus();
		alert("Entrez un prénom valide");
		return false;
	}
	if(fname.value.match(alphaExp)){}
	else{
		alert("Le prénom ne peut avoir que des lettres");
		fname.focus();
		return false;
	}
	if(lname.value==null || lname.value=="")
	{
		lname.focus();
		alert("Entrez un nom de famille valide");
		return false;
	}
	if(lname.value.match(alphaExp)){}
	else{
		alert("Le nom de famille ne peut contenir que des lettres");
		lname.focus();
		return false;
	}
	if(mob.value==null || mob.value==" ")
	{
		alert("Veuillez entrer le numéro de portable");
		mob.focus();
		return false;
	}
	if (isNaN(mob.value))
	{
		alert("Votre numéro de mobile doit être des nombres entiers");
		mob.focus();
		return false;
	}
	if((mob.value.length!= 10))
	{
		alert("Entrez le numéro de mobile valide (comme: 0610111213)");
		mob.focus();
		return false;
	}
	if(location.selectedIndex==0)
	{
		alert("Veuillez sélectionner un lieu");
		location.focus();
		return false;		
	}
	if(addr.value==" " || addr.value=="")
	{
		alert("Veuillez entrer votre adresse");
		addr.focus();
		return false;
	}
	if (confirm("Souhaitez-vous soumettre vos informations?") == true) {} 
	else 
	{
       return false;
    }
    var survey=prompt("Comment avez-vous entendu parler de nous? (Utilisé uniquement pour l'enquête)");
	return true;
}
</SCRIPT>
</HEAD>
<BODY  background="background6.png" link="BLACK" alink="BLACK" vlink="BLACK">
<FONT size="4"><NAV align="right">
<A HREF="index.php">Accueil</A>&nbsp&nbsp&nbsp
&nbsp<A HREF="help.php">Aide</A>&nbsp&nbsp&nbsp<A HREF="register.php">Connexion/Inscription</A></FONT></NAV>
<center>
<FORM action="login.php">
<P align="CENTER"><FONT size="6" color="BLACK" face="Arial">
Vous avez déjà un compte chez nous?<BR></FONT><BR>
<INPUT TYPE="submit" value="Connexion" id="login" class="button" style="border-radius: 2px;width:120px;height:60px; background-color: #4CAF50; color: #242424;font-size: 20px; border: 2px solid #4CAF50; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
</P>
</FORM>
<FORM name="register" method="post" action="registerquery.php" onsubmit="return validate()" style="width:27%;">
<TABLE border="2" bordercolor="BLACK" style=" background-image: url(background7.png); box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
<CAPTION style="text-align:center"><FONT size="6" color="BLACK">Entrez vos informations</FONT></CAPTION>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Prénom</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT name="fname" type="TEXT" placeholder="Entre ton prénom" size="30" maxlength="30" align="center" id="fname"  style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Nom de famille:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT type="TEXT" name="lname" align="center" size="30" maxlength="30" placeholder="Entre ton nom de famille" id="lname" style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Emplacement:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><SELECT name="location" id="location" style="color:#d3d3d3; border-radius: 5px;" onchange="document.postElementById('location').style.color='black';">
<OPTION VALUE="none" disabled selected>-------Sélectionnez votre emplacement :-------</OPTION>
<OPTION VALUE="Bordeaux" style="color:black;">Bordeaux</OPTION>
<OPTION VALUE="Mérignac" style="color:black;">Mérignac</OPTION>
<OPTION VALUE="Pessac" style="color:black;">Pessac</OPTION>
<OPTION VALUE="Bruges" style="color:black;">Bruges</OPTION>
</SELECT></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Téléphone:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT type="TEXT" name="mob" size="30" maxlength="10" placeholder="Ente ton téléphone" id="mob" style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Adresse:</FONT></TD>
<TD class="left" style="border: 2px solid black;text-align:center"><TEXTAREA rows="7" cols="33" wrap="physical" placeholder="Entre ton adresse"addr" name="addr" style="border-radius: 5px;"></TEXTAREA></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">E-Mail :</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT name="email" type="TEXT" id="email" placeholder="Entre ton E-mail" size="30" maxlength="30" style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Mot de passe:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT type="PASSWORD" name="pw" size="30" id="pw" style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Confirmez votre mot de passe:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT type="PASSWORD" name="cpw" size="30" id="cpw" style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD colspan="2" style="border: 2px solid black;text-align:center"><FONT size="4" color="BLACK">
<INPUT type="checkbox" name="tc" value="tc" style="border-radius: 5px;">
J'ai lu et accepté les Termes et Conditions et <BR>&nbsp&nbsp&nbsp&nbsp&nbspla politique de confidentialité</FONT></TD>
</TR>
</TABLE><BR>
<P><INPUT TYPE="Submit" value="Confirmer" id="submit" onclick="if(!this.form.tc.checked){alert('Vous devez accepter les conditions.');return false}" class="button" style="border-radius: 2px;width:120px;height:60px; background-color: #4CAF50; color: #242424;font-size: 20px; border: 2px solid #4CAF50; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
<INPUT TYPE="Reset" value="Annuler" id="reset" class="button" style="border-radius: 2px;width:120px;height:60px; background-color: #4CAF50; color: #242424;font-size: 20px; border: 2px solid #4CAF50; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
</P></FORM>
<HR width="1000">
</center>
</BODY>
</HTML>
