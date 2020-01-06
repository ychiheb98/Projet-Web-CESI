<?php
session_start();
error_reporting(1);
include("config.php");
if(isset($_POST['']))
{
	 if(isset($_SESSION['user_info']) && is_array($_SESSION['user_info']))	{
	 $_SESSION['check']='1';
	 }
}
?>
<!DOCTYPE html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Login Form</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="css/main.css">
        <link href='http://fonts.googleapis.com/css?family=Roboto:400,300,500' rel='stylesheet' type='text/css'>
        <link href="//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet">
        <script src="js/jquery-1.8.2.min.js"></script>
        <script src="js/jquery.validate.min.js"></script>
        <script src="js/main.js"></script>
		<style type="text/css">
		a:link {color: #ffffff}
		a:visited {color: #ffffff}
		a:hover {color: #ffffff}
		a:active {color: #ffffff}
		</style>
    </head>
    <body>
	<?php include("header.php"); ?>
<?php
	$error = '';
	if(isset($_POST['is_login'])){
		$sql = "SELECT * FROM ".$SETTINGS["USERS"]." WHERE `email` = '".$_POST['email']."' AND `password` = '".$_POST['password']."'";
		
		if(mysqli_query($connection, $sql))
		{  
			$user = mysqli_fetch_assoc(mysqli_query($connection, $sql));
		}
		else
		{
			$message = "Erreur d'exécution SQL : " . $sql ; 
		}
		
		if(!empty($user)){
			$_SESSION['user_info'] = $user['email'];
		}
		else{
			$error = 'Email or password invalide.';
		}
	}
	if(isset($_GET['ac']) && $_GET['ac'] == 'logout'){
		$_SESSION['user_info'] = null;
		unset($_SESSION['user_info']);
	}
?>
<?php if(isset($_SESSION['user_info']))	{
$_SESSION['userName'] = 'Root';		$_COOKIE['varname'] = 9;	?>
	    <form id="login-form" class="login-form" name="form1" method="post" action="index.php">

	        <div id="form-content">
	            <div class="welcome">
				<h3>Bienvenue, vous êtes connectés.</h3>
					Merci de nous avoir choisi! 					
					<br /><br>
					<INPUT TYPE="Reset" value="Commandez" id="reset" class="button" style="border-radius: 2px;width:auto;height:auto; background-color: #cef2d1; color: black;font-size: 20px; border: 2px solid #cef2d1; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19); margin:8px;" onclick="window.location='order.php';">
					<INPUT TYPE="Reset" value= <?php echo "Panier(" . $_SESSION['counter'] . ")" ?> id="reset" class="button" style="border-radius: 2px;width:auto;height:auto; background-color: #cef2d1; color: black;font-size: 20px; border: 2px solid #cef2d1; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19); margin:8px;" onclick="window.location='cartpage.php';">
					<INPUT TYPE="Reset" value="Changez le MDP" id="reset" class="button" style="border-radius: 2px;width:auto;height:auto; background-color: #cef2d1; color: black;font-size: 20px; border: 2px solid #cef2d1; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19); margin:8px;" onclick="window.location='#';">
					<INPUT TYPE="Reset" value="Désactivez votre compte" id="reset" class="button" style="border-radius: 2px;width:auto;height:auto; background-color: #cef2d1; color: black;font-size: 20px; border: 2px solid #cef2d1; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19); margin:8px;margin-left:50px;" onclick="window.location='#';">
					<INPUT TYPE="Reset" value="Se Déconnecter" id="reset" class="button" style="border-radius: 2px;width:auto;height:auto; background-color: #cef2d1; color: black;font-size: 20px; border: 2px solid #cef2d1; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19); margin:8px;" onclick="window.location='logout.php';">
				</div>	
	        </div>
	    </form>
	<?php } else { ?>
	    <form id="login-form" class="login-form" name="form1" method="post" action="login.php">
	    	<input type="hidden" name="is_login" value="1">
	        <div class="h1">Authentification</div>
	        <div id="form-content">
	            <div class="group">
	                <label for="email">Email</label>
	                <div><input id="email" name="email" class="form-control required" type="email" placeholder="E-mail"></div>
	            </div>
	           <div class="group">
	                <label for="name">Mot de passe</label>
	                <div><input id="password" name="password" class="form-control required" type="password" placeholder="Mot de Passe"></div>
	            </div>
	            <?php if($error) { ?>
	                <em>
						<label class="err" for="password" generated="true" style="display: block;"><?php echo $error ?></label>
					</em>
				<?php } ?>
	            <div class="group submit">
	                <label class="empty"></label>
	                <div><input name="submit" type="submit" value="Se Connecter"/></div>
	            </div>
	        </div>
	        <div id="form-loading" class="hide"><i class="fa fa-circle-o-notch fa-spin"></i></div>
	    </form>
	<?php } ?>   
    </body>
</html>