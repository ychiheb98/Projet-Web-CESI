<?php 
  include("config.php");
  session_start();

  $sql1="UPDATE `orders` SET `qty2`='0' WHERE email = '" . $user_info . "'";

  /* Vérification de la connexion */
  if (mysqli_connect_errno()) {
    printf("Echec de la connexion : %s\n", mysqli_connect_error());
    exit();
  }
  mysqli_query($connection ,$sql1);
          
  header('Location: cartpage.php');
  exit();
?>