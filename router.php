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

// Prefer public/index.php (normal app entry). If it's missing (for example when the
// public folder wasn't populated during build), fall back to a repo-root index.php
// so the container can still respond.
$publicIndex = __DIR__ . '/public/index.php';
if (is_file($publicIndex)) {
    require_once $publicIndex;
} else {
    $rootIndex = __DIR__ . '/index.php';
    if (is_file($rootIndex)) {
        require_once $rootIndex;
    } else {
        // Last resort: show a tiny message so the container doesn't crash with a fatal error.
        http_response_code(500);
        echo "Application entrypoint not found. Expected public/index.php or index.php at repo root.";
    }
}
