<?php
/**
 * api/data.php — ATT&CK data endpoint
 *
 * Returns the full MITRE ATT&CK dataset as JSON.
 * All rendering happens client-side; this endpoint only serves data.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=3600');
header('Access-Control-Allow-Origin: *');

$dataFile = __DIR__ . '/../data/data.json';

if (!file_exists($dataFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'Data file not found']);
    exit;
}

readfile($dataFile);
