<?php
// Router for PHP built-in server placed at repository root.
// It serves static files from /public directly, otherwise forwards to public/index.php
if (php_sapi_name() === 'cli-server') {
    $url = parse_url($_SERVER['REQUEST_URI']);
    $path = $url['path'] ?? '/';
    // prevent directory traversal
    $clean = preg_replace('#/+#','/', $path);
    $file = __DIR__ . '/public' . $clean;
    if ($file !== '' && is_file($file)) {
        return false; // let the built-in server serve the file
    }
}

require_once __DIR__ . '/public/index.php';
