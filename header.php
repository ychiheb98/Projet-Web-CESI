<!DOCTYPE html>
<html>
<head>
<title><?php echo "$title" ?></title>

   <!-- Stylesheets -->
   <link rel="stylesheet" href="css/plugins.css">
	<link rel="stylesheet" href="style.css">
   <link rel="stylesheet" href="css/custom.css">
   <link rel="stylesheet" href="css/bootstrap.min.css">
   
 <!-- Modernizer js -->
 <script src="js/vendor/modernizr-3.5.0.min.js"></script>

</head>
<body>
<FONT size="4">
<nav class=" navbar-right navbar-light" style="background-color:#737373;">
  <!-- Navbar content -->

<A class="navbar-brand" HREF="index.php" style="padding-left:25px">Accueil</A>&nbsp&nbsp&nbsp
<A class="navbar-brand" HREF="help.php">Aide</A>&nbsp&nbsp&nbsp
<?php  
session_start();
include("config.php");
if(isset($_SESSION['user_info']))
  $user_info= $_SESSION['user_info'];
  echo 'Bienvenue ,  <A HREF="login.php"> '.$_SESSION['user_info'].'</a>';

  $sql1="SELECT * FROM `orders` WHERE email = '" . $user_info . "'";

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
    $sql1="SELECT * FROM orders WHERE email = '" . $user_info . "'";

    /* Vérification de la connexion */
    if (mysqli_connect_errno()) {
      printf("Echec de la connexion : %s\n", mysqli_connect_error());
      exit();
    }
    
    if(mysqli_query($connection ,$sql1))
    {  
      $counter = 0;
      $order = mysqli_fetch_assoc(mysqli_query($connection, $sql1));
      if($order['qty1'] > 0){ $counter = $counter + 1; }
      if($order['qty2'] > 0){ $counter = $counter + 1; }
      if($order['qty3'] > 0){ $counter = $counter + 1; }
      if($order['qty4'] > 0){ $counter = $counter + 1; }
      if($order['qty5'] > 0){ $counter = $counter + 1; }
      if($order['qty6'] > 0){ $counter = $counter + 1; }
      if($order['qty7'] > 0){ $counter = $counter + 1; }
      if($order['qty8'] > 0){ $counter = $counter + 1; }
      if($order['qty9'] > 0){ $counter = $counter + 1; }

      $_SESSION['counter'] = $counter;

      echo '<A HREF="cartpage.php" style="margin-left: 850px;"> Panier ('.$counter.')</a>';

    }
  }

else
	echo '<A class="navbar-brand" HREF="register.php">Connexion/Inscription</A>';
?> 
</FONT></nav>
</body>
</html>