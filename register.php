<?php
session_start();
$conn = mysqli_connect("localhost","root","","foodies");
if(!$conn){  
  die('Could not connect: '.mysqli_connect_error());  
}
if (isset($_POST['submit']))
{
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
	$message = "You have been successfully registered";
}
else
{  
	$message = "Could not insert record"; 
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
	echo "<script type='text/javascript'>alert('$message1');</script>";}
?>
<HTML>
<HEAD>
<TITLE>Register-24X7 Foodies.com</TITLE>
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
		alert("Please enter a password of atleast 8 characters");
		pw.focus();
		return false;
	}
	else if (pw.value.length != cpw.value.length) 
	{
		alert("Passwords do not match.");
		pw.focus();
        return false;
    }
	else if (pw.value != cpw.value) 
	{
		alert("Passwords do not match.");
		pw.focus();
        return false;
    }
	if (atpos<1 || dotpos<atpos+2 || dotpos+2>=EmailId.value.length) 
	{
        alert("Enter valid email-ID");
		EmailId.focus();
        return false;
   	}
	if(fname.value==null || fname.value=="")
	{
		fname.focus();
		alert("Enter valid first name");
		return false;
	}
	if(fname.value.match(alphaExp)){}
	else{
		alert("First name can have only letters");
		fname.focus();
		return false;
	}
	if(lname.value==null || lname.value=="")
	{
		lname.focus();
		alert("Enter valid last name");
		return false;
	}
	if(lname.value.match(alphaExp)){}
	else{
		alert("Last name can have only letters");
		lname.focus();
		return false;
	}
	if(mob.value==null || mob.value==" ")
	{
		alert("Please Enter Mobile Number");
		mob.focus();
		return false;
	}
	if (isNaN(mob.value))
	{
		alert(" Your Mobile Number must be Integers");
		mob.focus();
		return false;
	}
	if((mob.value.length!= 10))
	{
		alert("Enter the valid Mobile Number(Like : 9669666999)");
		mob.focus();
		return false;
	}
	if(location.selectedIndex==0)
	{
		alert("Please select location");
		location.focus();
		return false;		
	}
	if(addr.value==" " || addr.value=="")
	{
		alert("Please Enter Your Address");
		addr.focus();
		return false;
	}
	if (confirm("Do you want to submit your details?") == true) {} 
	else 
	{
       return false;
    }
    var survey=prompt("How did you hear about us? (Used only for survey)");
	return true;
}
</SCRIPT>
</HEAD>
<BODY  background="background6.png" link="BLACK" alink="BLACK" vlink="BLACK">
<FONT size="4"><NAV align="right">
<A HREF="index.php">Home</A>&nbsp&nbsp&nbsp
&nbsp<A HREF="help.php">Help</A>&nbsp&nbsp&nbsp<A HREF="register.php">Login/Register</A></FONT></NAV>
<center>
<FORM action="login.php">
<P align="CENTER"><FONT size="6" color="BLACK" face="Arial">
Already have an account with us?<BR></FONT><BR>
<INPUT TYPE="submit" value="LOGIN" id="login" class="button" style="border-radius: 2px;width:120px;height:60px; background-color: #4CAF50; color: #242424;font-size: 20px; border: 2px solid #4CAF50; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
</P>
</FORM>
<FORM name="register" method="post" action="register.php" onsubmit="return validate()" style="width:27%;">
<TABLE border="2" bordercolor="BLACK" style=" background-image: url(background7.png); box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
<CAPTION style="text-align:center"><FONT size="6" color="BLACK">Enter your details:</FONT></CAPTION>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">First name:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT name="fname" type="TEXT" placeholder="Enter your first name" size="30" maxlength="30" align="center" id="fname"  style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Last name:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT type="TEXT" name="lname" align="center" size="30" maxlength="30" placeholder="Enter your last name" id="lname" style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Location:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><SELECT name="location" id="location" style="color:#d3d3d3; border-radius: 5px;" onchange="document.postElementById('location').style.color='black';">
<OPTION VALUE="none" disabled selected>-------SELECT YOUR LOCATION-------</OPTION>
<OPTION VALUE="Kandivali West" style="color:black;">Kandivali West</OPTION>
<OPTION VALUE="Kandivali East" style="color:black;">Kandivali East</OPTION>
<OPTION VALUE="Borivali East" style="color:black;">Borivali East</OPTION>
<OPTION VALUE="Borivali West" style="color:black;">Borivali West</OPTION>
</SELECT></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Mobile Number:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT type="TEXT" name="mob" size="30" maxlength="10" placeholder="Enter your mobile number" id="mob" style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Address:</FONT></TD>
<TD class="left" style="border: 2px solid black;text-align:center"><TEXTAREA rows="7" cols="33" wrap="physical" placeholder="Enter your address" id="addr" name="addr" style="border-radius: 5px;"></TEXTAREA></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">E-Mail ID:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT name="email" type="TEXT" id="email" placeholder="Enter your E-Mail ID" size="30" maxlength="30" style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Password:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT type="PASSWORD" name="pw" size="30" id="pw" style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD style="border: 2px solid black;text-align:center"><FONT size="5" color="BLACK">Confirm Password:</FONT></TD>
<TD style="border: 2px solid black;text-align:center"><INPUT type="PASSWORD" name="cpw" size="30" id="cpw" style="border-radius: 5px;"></TD>
</TR>
<TR class="left">
<TD colspan="2" style="border: 2px solid black;text-align:center"><FONT size="4" color="BLACK">
<INPUT type="checkbox" name="tc" value="tc" style="border-radius: 5px;">
I have read and accepted the Terms and Conditions and <BR>&nbsp&nbsp&nbsp&nbsp&nbspPrivacy Policy</FONT></TD>
</TR>
</TABLE><BR>
<P><INPUT TYPE="Submit" value="Submit" id="submit" onclick="if(!this.form.tc.checked){alert('You must agree to the terms first.');return false}" class="button" style="border-radius: 2px;width:120px;height:60px; background-color: #4CAF50; color: #242424;font-size: 20px; border: 2px solid #4CAF50; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
<INPUT TYPE="Reset" value="Reset" id="reset" class="button" style="border-radius: 2px;width:120px;height:60px; background-color: #4CAF50; color: #242424;font-size: 20px; border: 2px solid #4CAF50; box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);">
</P></FORM>
<HR width="1000">
</center>
</BODY>
</HTML>
