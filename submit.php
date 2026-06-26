<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name    = htmlspecialchars($_POST['name']);
    $email   = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars($_POST['message']);

    $data = array(
        "name"    => $name,
        "email"   => $email,
        "message" => $message
    );

    $url = "https://script.google.com/macros/s/AKfycbzcKXAqUEABuOEKp6dR4PvFUdgKUeEbwOyeuIOGQ9C3oEp4oR7eoojbsr6r2ijDVmDS/exec";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $response = curl_exec($ch);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($response && strpos($response, "Success") !== false) {
        header("Location: thankyou.html");
        exit;
    } else {
        echo "Error submitting form. Server said: " . htmlspecialchars($response) . " | cURL error: " . $error;
    }
}
?>
