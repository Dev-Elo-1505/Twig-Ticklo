<?php
require_once __DIR__ . '/../helpers.php';

function showLoginPage($twig) {
    session_start();
    if (isset($_SESSION['user'])) {
        redirect('/dashboard');
    }
    echo $twig->render('auth/login.twig', [
        'error' => $_SESSION['error'] ?? null
    ]);
    unset($_SESSION['error']);
}

function showSignupPage($twig) {
    session_start();
    if (isset($_SESSION['user'])) {
        redirect('/dashboard');
    }
    echo $twig->render('auth/signup.twig', [
        'error' => $_SESSION['error'] ?? null
    ]);
    unset($_SESSION['error']);
}

function handleLogin($request) {
    session_start();
    
    $email = $request->request->get('email');
    $password = $request->request->get('password');
    
    // Validate
    if (empty($email) || empty($password)) {
        $_SESSION['error'] = 'Email and password are required';
        redirect('/auth/login');
    }
    
    // Check credentials
    $users = readJsonFile('users.json');
    $user = null;
    foreach ($users as $u) {
        if (strtolower($u['email']) === strtolower($email)) {
            $user = $u;
            break;
        }
    }
    
    if (!$user || $user['password'] !== $password) {
        $_SESSION['error'] = 'Invalid email or password';
        redirect('/auth/login');
    }
    
    // Set session
    $_SESSION['user'] = [
        'email' => $user['email'],
        'token' => bin2hex(random_bytes(16))
    ];
    $_SESSION['success'] = 'Successfully signed in';
    
    redirect('/dashboard');
}

function handleSignup($request) {
    session_start();
    
    $email = $request->request->get('email');
    $password = $request->request->get('password');
    
    // Validate
    if (empty($email) || empty($password)) {
        $_SESSION['error'] = 'Email and password are required';
        redirect('/auth/signup');
    }
    
    if (strlen($password) < 6) {
        $_SESSION['error'] = 'Password must be at least 6 characters';
        redirect('/auth/signup');
    }
    
    // Check if user exists
    $users = readJsonFile('users.json');
    foreach ($users as $u) {
        if (strtolower($u['email']) === strtolower($email)) {
            $_SESSION['error'] = 'An account with this email already exists';
            redirect('/auth/signup');
        }
    }
    
    // Create user
    $users[] = [
        'email' => $email,
        'password' => $password
    ];
    writeJsonFile('users.json', $users);
    
    // Set session
    $_SESSION['user'] = [
        'email' => $email,
        'token' => bin2hex(random_bytes(16))
    ];
    $_SESSION['success'] = 'Account created — signed in';
    
    redirect('/dashboard');
}

function handleLogout() {
    session_start();
    session_destroy();
    redirect('/');
}