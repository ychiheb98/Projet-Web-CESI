<?php 
include("config.php");
session_start();
if (isset($_POST['submit'])){
	if(!empty($_SESSION['user_info'])) {
		$qty1=$_POST['qty1'];
		$qty2=$_POST['qty2'];
		$qty3=$_POST['qty3'];
		$qty4=$_POST['qty4'];
		$qty5=$_POST['qty5'];
		$qty6=$_POST['qty6'];
		$qty7=$_POST['qty7'];
		$qty8=$_POST['qty8'];
		$qty9=$_POST['qty9'];
		$user_info=$_SESSION['user_info'];
		$sum=30*$qty1+60*$qty2+30*$qty3+180*$qty4+350*$qty5+200*$qty6+300*$qty7+250*$qty8+270*$qty9;
		$msg="Commande passée avec succès. Veuillez effectuer un paiement ".$sum." en espèces lors de la réception";
		/* Vérification de la connexion */
		if (mysqli_connect_errno()) {
			printf("Echec de la connexion : %s\n", mysqli_connect_error());
			exit();
		}

		$sql1="INSERT INTO orders(email,qty1,qty2,qty3,qty4,qty5,qty6,qty7,qty8,qty9)VALUES('$user_info','$qty1','$qty2','$qty3','$qty4','$qty5','$qty6','$qty7','$qty8','$qty9');";
		
		if(mysqli_query($connection ,$sql1, MYSQLI_USE_RESULT) === TRUE)
		{  

			echo '<script type="text/javascript"> alert("'.$msg.'")</script>';
		}
		else
		{ 
			echo $sql1;
			echo("Erreur description: " . mysqli_error($connection));
			echo "<script type='text/javascript'>alert('Impossible de passer la commande');</script>";
		} 
	}
	else
		echo "<script type='text/javascript'>alert('Connexion nécessaire');</script>";
}
?>
<html>
<head>
<title>Order</title>
<style type="text/css">
@import url(style.css);
   a:link {color: #ffffff}
   a:visited {color: #ffffff}
   a:hover {color: #ffffff}
   a:active {color: #ffffff}
  font{color:white}
img{width:300; height:200;}
table{border-color:white;height:90%;}
img{border-color:white}
body{no-repeat center center fixed; 
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;}
</style>
<script type="text/javascript">
	function subtractQty(qty){
		if(qty.value - 1 < 0)
			return;
	else
	qty.value--;
	}
	function chk()
	{
		var qty1=document.getElementById("qty1");
		var qty2=document.getElementById("qty2");
		var qty3=document.getElementById("qty3");
		var qty4=document.getElementById("qty4");
		var qty5=document.getElementById("qty5");
		var qty6=document.getElementById("qty6");
		var qty7=document.getElementById("qty7");
		var qty8=document.getElementById("qty8");
		var qty9=document.getElementById("qty9");
		if((qty1.value=='' && qty2.value=='' && qty3.value=='' && qty4.value=='' &&qty5.value=='' && qty6.value=='' && qty7.value=='' && qty8.value=='' &&qty9.value=='')||(qty1.value=='0' && qty2.value=='0' && qty3.value=='0' && qty4.value=='0' && qty5.value=='0' && qty6.value=='0' && qty7.value=='0' && qty8.value=='0' && qty9.value=='0' ))
		{
			alert("Please select atleast 1 item");
			return false;
		}
		return true;	
	}
</script>
</head>
<body background="bg1.png">
<FONT size="4" color="black">
<NAV align="right">
<A HREF="index.php" style="color:black;">Accueil</A>&nbsp&nbsp&nbsp
<A HREF="help.php" style="color:black;">Aide</A>&nbsp&nbsp&nbsp
<?php  
if(isset($_SESSION['user_info']))
	echo 'Bienvenue <A HREF="login.php"> '.$_SESSION['user_info'].'</a>';
else
	echo '<A HREF="register.php" style="color:black;">Connexion/Inscription</A>';
?>
</FONT></NAV>
<form action="order.php" name="orderform" method="post">
<table cellspacing="5" cellpadding="2" align="center" style="width:35%;margin:auto">
<caption style="text-align:center;"><font size="5" style="color:black;"><U>Commander ici</U></font></caption>
<tr><td style="border-top: 1px solid #000000;">
<img src="menu/resine.jpg" width="300" height="200" border="5"><br/>
<font size="4" style="color:black;">Bonbons</font>
&nbsp;&nbsp;<input type='text' name='qty1' id='qty1' size="1" maxlength="2" class="qty" style="width: 25px;"/>
			<input type='button' name='add' onclick='javascript: document.getElementById("qty1").value++;' value='+'/>
			<input type='button' name='subtract' onclick='javascript: subtractQty(qty1);' value='-'/>
<font size="4" style="color:black;">10,80€</font>
</td>
<td style="border-top: 1px solid #000000;">
<img src="menu/massage.png" width="300" height="200" border="2"><br/>
<font size="4" style="color:black;">Huile massage </font>
&nbsp;&nbsp;<input type='text' name='qty2' id='qty2' size="1" maxlength="2" class="qty" style="width: 25px;"/>
			<input type='button' name='add' onclick='javascript: document.getElementById("qty2").value++;' value='+'/>
			<input type='button' name='subtract' onclick='javascript: subtractQty(qty2);' value='-'/>
<font size="4" style="color:black;">29,80€</font>
</td style="border-top: 1px solid #000000;">
<td style="border-top: 1px solid #000000;">
<img src="menu/herbe.jpg" width="300" height="200" border="2"><br/>
<font size="4" style="color:black;">Vitamine</font>
&nbsp;&nbsp;<input type='text' name='qty3' id='qty3' size="1" maxlength="2" class="qty" style="width: 25px;"/>
			<input type='button' name='add' onclick='javascript: document.getElementById("qty3").value++;' value='+'/>
			<input type='button' name='subtract' onclick='javascript: subtractQty(qty3);' value='-'/>
<font size="4" style="color:black;">12€</font>
</td>
</tr>
<tr>
<td style="border-top: 1px solid #000000;">
<img src="menu/eliquid.jpg" width="300" height="200" border="2" ><br/>
<font size="4" style="color:black;">E-liquid</font>
&nbsp;&nbsp;<input type='text' name='qty4' id='qty4' size="1" maxlength="2" class="qty" style="width: 25px;"/>
			<input type='button' name='add' onclick='javascript: document.getElementById("qty4").value++;' value='+'/>
			<input type='button' name='subtract' onclick='javascript: subtractQty(qty4);' value='-'/>
<font size="4" style="color:black;">25€</font>
</td><td style="border-top: 1px solid #000000;">
<img src="menu/chocolat.jpg" width="300" height="200" border="2"><br/>
<font size="4" style="color:black;">Chocolat</font>
&nbsp;&nbsp;<input type='text' name='qty5' id='qty5' size="1" maxlength="2" class="qty" style="width: 25px;"/>
			<input type='button' name='add' onclick='javascript: document.getElementById("qty5").value++;' value='+'/>
			<input type='button' name='subtract' onclick='javascript: subtractQty(qty5);' value='-'/>
			<font size="4" style="color:black;">5,99€</font>
</td>
<td style="border-top: 1px solid #000000;">
<img src="menu/infusion.png" width="300" height="200" border="2"><br/>
<font size="4" style="color:black;">Infusion</font>
&nbsp;&nbsp;<input type='text' name='qty6' id='qty6' size="1" maxlength="2" class="qty" style="width: 25px;"/>
			<input type='button' name='add' onclick='javascript: document.getElementById("qty6").value++;' value='+'/>
			<input type='button' name='subtract' onclick='javascript: subtractQty(qty6);' value='-'/>
<font size="4" style="color:black;">9,99€</font>
</td>
</tr>
<tr>
<td style="border-top: 1px solid #000000;">
<img src="menu/seeds.jpg" width="300" height="200" border="2"><br/>
<font size="4" style="color:black;">Graines</font>
&nbsp;&nbsp;<input type='text' name='qty7' id='qty7' size="1" maxlength="2" class="qty" style="width: 25px;"/>
			<input type='button' name='add' onclick='javascript: document.getElementById("qty7").value++;' value='+'/>
			<input type='button' name='subtract' onclick='javascript: subtractQty(qty7);' value='-'/>
<font size="4" style="color:black;">8,99€</font>
</td><td style="border-top: 1px solid #000000;">
<img src="menu/the.jpg" width="300" height="200" border="2"><br/>
<font size="4" style="color:black;">Thé</font>
&nbsp;&nbsp;<input type='text' name='qty8' id='qty8' size="1" maxlength="2" class="qty" style="width: 25px;"/>
			<input type='button' name='add' onclick='javascript: document.getElementById("qty8").value++;' value='+'/>
			<input type='button' name='subtract' onclick='javascript: subtractQty(qty8);' value='-'/>
<font size="4" style="color:black;">10,99€</font>
</td>
<td style="border-top: 1px solid #000000;">
<img src="menu/oil.jpg" width="300" height="200" border="2"><br/>
<font size="4" style="color:black;">Huile</font>
&nbsp;&nbsp;<input type='text' name='qty9' id='qty9' size="1" maxlength="2" class="qty" style="width: 25px;"/>
			<input type='button' name='add' onclick='javascript: document.getElementById("qty9").value++;' value='+'/>
			<input type='button' name='subtract' onclick='javascript: subtractQty(qty9);' value='-'/>
<font size="4" style="color:black;">29,99€</font>
</td>
</tr>
<tr></tr><tr></tr><tr></tr><tr></tr><tr><td colspan="3" style="border-top: 1px solid #000000; text-align: center;"><INPUT TYPE="submit" value="Valider" id="login" class="button" style="border-radius: 2px;width:120px;height:60px; background-color: #4CAF50; color: #242424;font-size: 20px; border: 2px solid #4CAF50; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);" onclick="return chk()"></td></tr>
</table></form>
</body>
</html>