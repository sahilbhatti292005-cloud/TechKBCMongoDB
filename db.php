<?php
// db.php - Simple MongoDB Connection
require 'vendor/autoload.php';

// Connect to MongoDB (Localhost)
$client = new MongoDB\Client("mongodb://localhost:27017");

// Select the Database
$db = $client->techkbc;
?>
