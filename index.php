<?php
require_once __DIR__ . '/../vendor/autoload.php';

// Set up Twig
$loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../templates');
$twig = new \Twig\Environment($loader, [
    'cache' => false,
]);

// Render the template
echo $twig->render('index.html.twig', [
    'title' => 'Hello World',
    'message' => 'My Twig + Tailwind App is Live!'
]);