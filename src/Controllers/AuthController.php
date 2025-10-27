<?php
// Simple Auth controller that mimics the React localStorage mock auth.

function showSignupPage(\Twig\Environment $twig)
{
    // Try to inline auth svg if available
    $svg = '';
    $imagePath = dirname(dirname(__DIR__)) . '/public/images/auth.svg';
    if (file_exists($imagePath)) {
        $raw = file_get_contents($imagePath);
        if ($raw !== false) {
            $raw = preg_replace('/#6c63ff/i', 'var(--color-primary)', $raw);
            $raw = preg_replace('/\s(width|height)="[^\"]*"/i', '', $raw);
            if (!preg_match('/<svg[^>]*\bstyle\s*=\s*/i', $raw)) {
                $raw = preg_replace('/<svg(\b[^>]*)>/i', '<svg$1 style="width:100%;height:auto;display:block;">', $raw, 1);
            }
            $svg = $raw;
        }
    }

    echo $twig->render('auth/signup.twig', [
        'auth_svg' => $svg,
    ]);
}

function handleSignup($request)
{
    session_start();
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Basic validation (same rules as React zod schema)
    $errors = [];
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Invalid email address';
    }
    if (strlen($password) < 6) {
        $errors['password'] = 'Password must be at least 6 characters';
    }
    if (!empty($errors)) {
        // Persist form errors and old input to session for inline display
        $_SESSION['form_errors'] = $errors;
        $_SESSION['old'] = ['email' => $email];
        header('Location: /auth/signup');
        exit;
    }

    // Read users from session storage (mock localStorage)
    $users = $_SESSION['mock_users'] ?? [];
    foreach ($users as $u) {
        if (strtolower($u['email']) === strtolower($email)) {
            $_SESSION['form_errors'] = ['email' => 'An account with this email already exists.'];
            $_SESSION['old'] = ['email' => $email];
            header('Location: /auth/signup');
            exit;
        }
    }

    // Add new user
    $users[] = [
        'email' => $email,
        'password' => $password,
    ];
    $_SESSION['mock_users'] = $users;

    // Create session token
    $token = bin2hex(random_bytes(8));
    $_SESSION['ticketapp_session'] = ['token' => $token, 'email' => $email];
    // Keep a canonical user object for other controllers (tickets, dashboard)
    $_SESSION['user'] = ['email' => $email];

    $_SESSION['success'] = 'Account created — signed in';
    header('Location: /dashboard');
    exit;
}

function showLoginPage(\Twig\Environment $twig)
{
    // Inline auth svg like signup
    $svg = '';
    $imagePath = dirname(dirname(__DIR__)) . '/public/images/auth.svg';
    if (file_exists($imagePath)) {
        $raw = file_get_contents($imagePath);
        if ($raw !== false) {
            $raw = preg_replace('/#6c63ff/i', 'var(--color-primary)', $raw);
            $raw = preg_replace('/\s(width|height)="[^\"]*"/i', '', $raw);
            if (!preg_match('/<svg[^>]*\bstyle\s*=\s*/i', $raw)) {
                $raw = preg_replace('/<svg(\b[^>]*)>/i', '<svg$1 style="width:100%;height:auto;display:block;">', $raw, 1);
            }
            $svg = $raw;
        }
    }

    echo $twig->render('auth/login.twig', [
        'auth_svg' => $svg,
    ]);
}

function handleLogin($request)
{
    session_start();
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Validate input first (mirror authSchema)
    $errors = [];
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Invalid email address';
    }
    if (strlen($password) < 6) {
        $errors['password'] = 'Password must be at least 6 characters';
    }
    if (!empty($errors)) {
        $_SESSION['form_errors'] = $errors;
        $_SESSION['old'] = ['email' => $email];
        header('Location: /auth/login');
        exit;
    }

    $users = $_SESSION['mock_users'] ?? [];
    $found = null;
    foreach ($users as $u) {
        if (strtolower($u['email']) === strtolower($email)) {
            $found = $u;
            break;
        }
    }
    if (!$found) {
        // account does not exist -> toast error
        $_SESSION['error'] = 'No account found for this email.';
        header('Location: /auth/login');
        exit;
    }
    if ($found['password'] !== $password) {
        $_SESSION['error'] = 'Invalid credentials. Please check your email and password.';
        header('Location: /auth/login');
        exit;
    }

    $token = bin2hex(random_bytes(8));
    $_SESSION['ticketapp_session'] = ['token' => $token, 'email' => $email];
    // Expose a simple user object for requireAuth() and other controllers
    $_SESSION['user'] = ['email' => $email];
    $_SESSION['success'] = 'Signed in';
    header('Location: /dashboard');
    exit;
}

function handleLogout()
{
    session_start();
    unset($_SESSION['ticketapp_session']);
    // Also clear canonical user object
    unset($_SESSION['user']);
    $_SESSION['success'] = 'Signed out';
    header('Location: /');
    exit;
}
