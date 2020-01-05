<?php
session_start();
$conn = mysqli_connect("localhost","root","","foodies");
if(!$conn){  
  die('Could not connect: '.mysqli_connect_error());  
}

$fname=$_POST['fname'];
$lname=$_POST['lname'];
$location=$_POST['location'];
$mob=$_POST['mob'];
$addr=$_POST['addr'];
$email=$_POST['email'];
$pw=$_POST['pw'];
$cpw=$_POST['cpw'];
$sql = "INSERT INTO user VALUES ('$fname', '$lname', '$location', '$mob', '$addr', '$email', '$pw', '$cpw');";

if(mysqli_query($conn, $sql))
{  
	$message = "Votre compte a été bien ajouté";
}
else
{  
	$message = "Erreur d'ajout du compte"; 
}
	echo "<script type='text/javascript'>alert('$message');</script>";
	$sql1 = "INSERT INTO php_users_login(`email`, `password`) VALUES ('$email', '$pw');";
	if(mysqli_query($conn, $sql1))
	{  
		$message1 = "Added in login table";
	}
	else
	{  
		$message1 = "Could not insert record";
	}
  
  header('Location: login.php');
  exit();
?>