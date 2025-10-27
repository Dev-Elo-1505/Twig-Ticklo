<?php

function requireAuth() {
    // Only start session if not already active to avoid "session_start(): Ignoring session_start() because a session is already active" notices
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
    if (!isset($_SESSION['user'])) {
        header('Location: /auth/login');
        exit;
    }
}

function redirect($path) {
    header("Location: $path");
    exit;
}

function json_response($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function getDataPath() {
    // Prefer mounted DATA_DIR (set in Render) so persistent disk works.
    $env = getenv('DATA_DIR');
    if ($env && is_string($env) && $env !== '') {
        $dir = rtrim($env, '/\\') . DIRECTORY_SEPARATOR;
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        return $dir;
    }

    return __DIR__ . '/../data/';
}

function readJsonFile($filename) {
    $path = getDataPath() . $filename;
    if (!file_exists($path)) {
        return [];
    }
    $content = file_get_contents($path);
    return json_decode($content, true) ?? [];
}

function writeJsonFile($filename, $data) {
    $path = getDataPath() . $filename;
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));
}