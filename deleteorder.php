<?php 
  session_start();

  include("config.php");
  $user_info= $_SESSION['user_info'];
  $qtystring = str_replace("'","",$_GET['idQty']);
 // UPDATE `orders` SET `qty1`=
  $sql1="UPDATE `orders` SET `".$qtystring. "`=0 WHERE email = '" . $user_info . "'";
  echo $sql1;

  /* Vérification de la connexion */
  if (mysqli_connect_errno()) {
    printf("Echec de la connexion : %s\n", mysqli_connect_error());
    exit();
  }

  if (!mysqli_query($connection, $sql1)) {
      printf("Error message: %s\n", mysqli_error($connection));
  }

  if(mysqli_query($connection ,$sql1))
  {  
    echo "Element supprimé";
  }
          
  header('Location: cartpage.php');
  exit();
?>