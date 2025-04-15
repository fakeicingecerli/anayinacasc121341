
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$dataFile = __DIR__ . '/credentials.json';

// Create the data file if it doesn't exist
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
    chmod($dataFile, 0666); // Make sure it's writable
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch and return all credentials sorted by timestamp
    $credentials = json_decode(file_get_contents($dataFile), true);
    usort($credentials, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });
    echo json_encode($credentials);
}
?>
