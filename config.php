<?php
/* Define MySQL connection details and database table name */ 
$SETTINGS["mysql_database"] = 'foodies';
$SETTINGS["USERS"] = 'php_users_login'; // this is the default table name that we used

/* Connect to MySQL */
$connection = mysqli_connect("localhost","root","", $SETTINGS["foodies"]) or die ('Impossible de se connecter au serveur MySQL.<br ><br >Veuillez vous assurer que vos informations de connexion MySQL sont correctes.');
?>