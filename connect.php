<?php
$NAME = $_POST['name'];

$server = 'localhost';
$username='root';
$password = '';
$database = 'police';

$conn = mysqli_connect('localhost','root','','police');

if(!$conn){
    die("connection failed: ".mysqli_connect_error());
}
else{
    echo "connection successfull";
}

$sql = "INSERT INTO `officers`(name) VALUES('$NAME')";

$query = mysqli_query($conn,$sql);


header("Location: dashboard.html");
?>
