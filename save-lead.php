<?php
/**
 * save-lead.php
 * Appends each submitted lead to a CSV file on the server as an internal backup.
 * The CSV lives in /leads/ which is blocked from public web access via .htaccess.
 *
 * The landing page form POSTs the lead JSON here (in addition to EmailJS).
 * This is a non-blocking backup — if it fails, the email still goes out.
 */

header('Content-Type: application/json');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Read the JSON body
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid payload']);
    exit;
}

// Only keep the fields we expect (whitelist)
$fields = [
    'submittedAt',
    'fullName',
    'phone',
    'email',
    'property',
    'firstTimeBuyer',
    'workingWithAgent',
    'timeline',
    'source',
    'page'
];

/**
 * Sanitise a value:
 *  - force to string, trim, cap length
 *  - strip CR/LF so rows can't be broken
 *  - neutralise CSV/formula injection (=, +, -, @, tab) by prefixing a quote
 */
function clean_value($v) {
    if (is_array($v)) { $v = ''; }
    $v = (string) $v;
    $v = trim($v);
    $v = preg_replace('/[\r\n]+/', ' ', $v);
    if (mb_strlen($v) > 500) {
        $v = mb_substr($v, 0, 500);
    }
    if ($v !== '' && in_array($v[0], ['=', '+', '-', '@', "\t"], true)) {
        $v = "'" . $v;
    }
    return $v;
}

$row = [];
foreach ($fields as $f) {
    $row[] = clean_value(isset($input[$f]) ? $input[$f] : '');
}

// Add server-side capture time and IP for reference
$row[] = date('c');                              // serverReceivedAt
$row[] = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';

// Storage location (created if missing)
$dir = __DIR__ . '/leads';
if (!is_dir($dir)) {
    @mkdir($dir, 0750, true);
}
$file = $dir . '/leads.csv';

// Write header row once
$writeHeader = !file_exists($file);

$fh = @fopen($file, 'a');
if ($fh === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Storage unavailable']);
    exit;
}

if (flock($fh, LOCK_EX)) {
    if ($writeHeader) {
        $header = array_merge($fields, ['serverReceivedAt', 'ip']);
        fputcsv($fh, $header);
    }
    fputcsv($fh, $row);
    fflush($fh);
    flock($fh, LOCK_UN);
}
fclose($fh);

echo json_encode(['ok' => true]);
