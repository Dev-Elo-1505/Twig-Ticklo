<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

// Initialize Twig (search both src/views and templates directories)
$loader = new \Twig\Loader\FilesystemLoader([
    __DIR__ . '/../src/views',
    __DIR__ . '/../templates',
]);
$twig = new \Twig\Environment($loader, [
    'cache' => false,
    'debug' => true,
]);

// Start session and expose to templates
session_start();

// Pull flash/form errors/old input from session and clear them so they don't persist on reload
$flash = [
    'success' => $_SESSION['success'] ?? null,
    'error' => $_SESSION['error'] ?? null,
];
unset($_SESSION['success'], $_SESSION['error']);

$form_errors = $_SESSION['form_errors'] ?? [];
unset($_SESSION['form_errors']);

$old = $_SESSION['old'] ?? [];
unset($_SESSION['old']);

// Expose these to Twig templates as globals
$twig->addGlobal('flash', $flash);
$twig->addGlobal('form_errors', $form_errors);
$twig->addGlobal('old', $old);

// Keep session global as well for convenience (but flash is handled separately)
$twig->addGlobal('session', $_SESSION ?? []);

// Polyfill minimal Request/Response if Symfony HttpFoundation is not installed
if (!class_exists('\\Symfony\\Component\\HttpFoundation\\Request')) {
    $poly = <<<'PHP'
namespace Symfony\Component\HttpFoundation;
class Request {
    public $server;
    public $request;
    public static function createFromGlobals() {
        $r = new self();
        $r->server = $_SERVER;
        $r->request = $_REQUEST;
        return $r;
    }
    public function getPathInfo() {
        return parse_url($this->server['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    }
    public function getMethod() {
        return $this->server['REQUEST_METHOD'] ?? 'GET';
    }
    public function getContent() {
        return file_get_contents('php://input');
    }
    public function get($key, $default = null) {
        return $this->request[$key] ?? $default;
    }
}
class Response {}
PHP;
    eval($poly);
}

// Get request (either Symfony Request or our polyfill)
$request = \Symfony\Component\HttpFoundation\Request::createFromGlobals();
$uri = $request->getPathInfo();
$method = $request->getMethod();

// Simple router
try {
    switch (true) {
        case $uri === '/' || $uri === '':
            require __DIR__ . '/../src/Controllers/PageController.php';
            showLanding($twig);
            break;

        case $uri === '/auth/login' && $method === 'GET':
            require __DIR__ . '/../src/Controllers/AuthController.php';
            showLoginPage($twig);
            break;

        case $uri === '/auth/login' && $method === 'POST':
            require __DIR__ . '/../src/Controllers/AuthController.php';
            handleLogin($request);
            break;

        case $uri === '/auth/signup' && $method === 'GET':
            require __DIR__ . '/../src/Controllers/AuthController.php';
            showSignupPage($twig);
            break;

        case $uri === '/auth/signup' && $method === 'POST':
            require __DIR__ . '/../src/Controllers/AuthController.php';
            handleSignup($request);
            break;

        case $uri === '/auth/logout':
            require __DIR__ . '/../src/Controllers/AuthController.php';
            handleLogout();
            break;

        case $uri === '/tickets/stats' && $method === 'GET':
            require __DIR__ . '/../src/Controllers/TicketController.php';
            ticketStats();
            break;

        case $uri === '/dashboard':
            require __DIR__ . '/../src/Controllers/DashboardController.php';
            showDashboard($twig);
            break;

        case $uri === '/tickets' && $method === 'GET':
            require __DIR__ . '/../src/Controllers/TicketController.php';
            showTickets($twig);
            break;

        case $uri === '/tickets/create' && $method === 'POST':
            require __DIR__ . '/../src/Controllers/TicketController.php';
            createTicket($request);
            break;

        case preg_match('/\/tickets\/(\w+)\/edit/', $uri, $matches) && $method === 'POST':
            require __DIR__ . '/../src/Controllers/TicketController.php';
            updateTicket($request, $matches[1]);
            break;

        case preg_match('/\/tickets\/(\w+)\/delete/', $uri, $matches) && $method === 'POST':
            require __DIR__ . '/../src/Controllers/TicketController.php';
            deleteTicket($matches[1]);
            break;

        default:
            http_response_code(404);
            echo $twig->render('404.twig');
            break;
    }
} catch (\Throwable $e) {
    // If something goes wrong, show a simple friendly page instead of a hard crash.
    http_response_code(500);
    try {
        echo $twig->render('landing.twig', ['message' => 'An error occurred — showing the landing page']);
    } catch (\Throwable $inner) {
        // Last resort: plain text
        echo "An error occurred. Please check the server logs.";
    }
}