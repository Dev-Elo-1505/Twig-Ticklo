<?php
require_once __DIR__ . '/../helpers.php';

function showDashboard($twig) {
    requireAuth();
    
    $tickets = readJsonFile('tickets.json');
    $userEmail = $_SESSION['user']['email'];
    
    // Filter tickets for current user
    $userTickets = array_filter($tickets, function($ticket) use ($userEmail) {
        return $ticket['user'] === $userEmail;
    });
    
    $stats = [
        'total' => count($userTickets),
        'open' => count(array_filter($userTickets, fn($t) => $t['status'] === 'open')),
        'in_progress' => count(array_filter($userTickets, fn($t) => $t['status'] === 'in_progress')),
        'closed' => count(array_filter($userTickets, fn($t) => $t['status'] === 'closed'))
    ];
    
    echo $twig->render('dashboard.twig', [
        'stats' => $stats,
        'success' => $_SESSION['success'] ?? null
    ]);
    unset($_SESSION['success']);
}