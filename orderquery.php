<?php 
include("config.php");
session_start();

	if(!empty($_SESSION['user_info'])) {
    if (!empty($_POST['qty1'])){$qty1=$_POST['qty1'];}else{$qty1=0;};
    if (!empty($_POST['qty2'])){$qty2=$_POST['qty2'];}else{$qty2=0;};
    if (!empty($_POST['qty3'])){$qty3=$_POST['qty3'];}else{$qty3=0;};
    if (!empty($_POST['qty4'])){$qty4=$_POST['qty4'];}else{$qty4=0;};
    if (!empty($_POST['qty5'])){$qty5=$_POST['qty5'];}else{$qty5=0;};
    if (!empty($_POST['qty6'])){$qty6=$_POST['qty6'];}else{$qty6=0;};
    if (!empty($_POST['qty7'])){$qty7=$_POST['qty7'];}else{$qty7=0;};
    if (!empty($_POST['qty8'])){$qty8=$_POST['qty8'];}else{$qty8=0;};
    if (!empty($_POST['qty9'])){$qty9=$_POST['qty9'];}else{$qty9=0;};

		$user_info=$_SESSION['user_info'];
		$sum=10.80*$qty1+29.80*$qty2+12*$qty3+25*$qty4+5.99*$qty5+9.99*$qty6+8.99*$qty7+10.99*$qty8+29.99*$qty9;
		$msg="Commande passée avec succès. Veuillez effectuer un paiement ".$sum."€ en espèces lors de la réception. Une confirmation de commande vous a été envoyé par mail";
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
			echo("Erreur description: " . mysqli_error($connection));
			echo "<script type='text/javascript'>alert('Impossible de passer la commande');</script>";
		} 
	}
	else {
    echo "<script type='text/javascript'>alert('Connexion nécessaire');</script>";
  }
  header('Location: cartpage.php');
  exit();
?>