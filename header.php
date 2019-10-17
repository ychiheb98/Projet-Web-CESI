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

<A class="navbar-brand" HREF="index.php" style="padding-left:25px">Home</A>&nbsp&nbsp&nbsp
<A class="navbar-brand" HREF="help.php">Help</A>&nbsp&nbsp&nbsp
<?php  
session_start();
if(isset($_SESSION['user_info']))
	echo 'Welcome <A HREF="login.php"> '.$_SESSION['user_info'].'</a>';
else
	echo '<A class="navbar-brand" HREF="register.php">Login/Register</A>';
?> 
</FONT></nav>
</body>
</html>