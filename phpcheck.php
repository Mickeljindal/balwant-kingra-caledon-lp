<?php
/**
 * phpcheck.php — TEMPORARY diagnostic. Delete after testing.
 * Visit https://lp1.balwantkingra.com/phpcheck.php to confirm PHP works
 * and that the leads folder is writable.
 */
header('Content-Type: text/plain; charset=utf-8');

echo "PHP is running. Version: " . phpversion() . "\n\n";

$dir = __DIR__ . '/leads';
$file = $dir . '/leads.csv';

echo "leads/ folder exists: " . (is_dir($dir) ? "YES" : "NO") . "\n";

if (!is_dir($dir)) {
    $made = @mkdir($dir, 0750, true);
    echo "tried to create leads/: " . ($made ? "created" : "FAILED") . "\n";
}

echo "leads/ writable: " . (is_writable($dir) ? "YES" : "NO") . "\n";
echo "leads.csv exists: " . (file_exists($file) ? "YES (" . filesize($file) . " bytes)" : "no, not yet") . "\n\n";

// Try a test write
$test = @file_put_contents($dir . '/_writetest.txt', 'ok ' . date('c'));
echo "test write to leads/: " . ($test !== false ? "SUCCESS" : "FAILED — permissions issue") . "\n";
@unlink($dir . '/_writetest.txt');
