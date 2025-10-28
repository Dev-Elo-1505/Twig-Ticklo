<?php
// Router for PHP built-in server to ensure all requests are handled by index.php
// When the requested file exists, return false so the server serves it directly.
if (php_sapi_name() === 'cli-server') {
    $url = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . ($url['path'] ?? '');
    if ($file !== '' && is_file($file)) {
        return false; // serve the requested resource as-is
    }
}

require_once __DIR__ . '/index.php';
