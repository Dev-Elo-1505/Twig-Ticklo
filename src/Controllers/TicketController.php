<?php
require_once __DIR__ . '/../helpers.php';

function showTickets($twig) {
    requireAuth();
    
    $tickets = readJsonFile('tickets.json');
    $userEmail = $_SESSION['user']['email'];
    
    // Filter tickets for current user
    $userTickets = array_filter($tickets, function($ticket) use ($userEmail) {
        return $ticket['user'] === $userEmail;
    });
    
    // Sort by newest first
    usort($userTickets, function($a, $b) {
        return $b['id'] <=> $a['id'];
    });
    
    // Try to inline the new-ticket SVG to match the React UI
    $svg = '';
    $imagePath = dirname(dirname(__DIR__)) . '/public/images/newTicket.svg';
    if (file_exists($imagePath)) {
        $raw = file_get_contents($imagePath);
        if ($raw !== false) {
            // replace hardcoded primary color with CSS variable and strip width/height
            $raw = preg_replace('/#6c63ff/i', 'var(--color-primary)', $raw);
            $raw = preg_replace('/\s(width|height)="[^"]*"/i', '', $raw);
            if (!preg_match('/<svg[^>]*\bstyle\s*=\s*/i', $raw)) {
                $raw = preg_replace('/<svg(\b[^>]*)>/i', '<svg$1 style="width:100%;height:auto;display:block;">', $raw, 1);
            }
            $svg = $raw;
        }
    }

    echo $twig->render('tickets.twig', [
        'tickets' => array_values($userTickets),
        'success' => $_SESSION['success'] ?? null,
        'error' => $_SESSION['error'] ?? null,
        'new_ticket_svg' => $svg,
    ]);
    unset($_SESSION['success'], $_SESSION['error']);
}

function createTicket($request) {
    requireAuth();
    
    $title = trim($request->request->get('title'));
    $description = trim($request->request->get('description', ''));
    $status = $request->request->get('status', 'open');
    
    if (empty($title)) {
        $_SESSION['error'] = 'Title is required';
        redirect('/tickets');
    }
    
    $tickets = readJsonFile('tickets.json');
    $newTicket = [
        'id' => uniqid(),
        'title' => $title,
        'description' => $description,
        'status' => $status,
        'user' => $_SESSION['user']['email'],
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $tickets[] = $newTicket;
    writeJsonFile('tickets.json', $tickets);
    
    $_SESSION['success'] = 'Ticket created';
    redirect('/tickets');
}

function updateTicket($request, $id) {
    requireAuth();
    
    $tickets = readJsonFile('tickets.json');
    $userEmail = $_SESSION['user']['email'];
    
    $index = null;
    foreach ($tickets as $i => $ticket) {
        if ($ticket['id'] === $id && $ticket['user'] === $userEmail) {
            $index = $i;
            break;
        }
    }
    
    if ($index === null) {
        $_SESSION['error'] = 'Ticket not found';
        redirect('/tickets');
    }
    
    $tickets[$index]['title'] = trim($request->request->get('title'));
    $tickets[$index]['description'] = trim($request->request->get('description', ''));
    $tickets[$index]['status'] = $request->request->get('status', 'open');
    
    writeJsonFile('tickets.json', $tickets);
    
    $_SESSION['success'] = 'Ticket updated';
    redirect('/tickets');
}

function deleteTicket($id) {
    requireAuth();
    
    $tickets = readJsonFile('tickets.json');
    $userEmail = $_SESSION['user']['email'];
    
    $tickets = array_filter($tickets, function($ticket) use ($id, $userEmail) {
        return !($ticket['id'] === $id && $ticket['user'] === $userEmail);
    });
    
    writeJsonFile('tickets.json', array_values($tickets));
    
    $_SESSION['success'] = 'Ticket deleted';
    redirect('/tickets');
}