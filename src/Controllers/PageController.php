<?php
// Simple page controller to provide data for static pages (landing, etc.)

function showLanding(\Twig\Environment $twig)
{
    // Features data converted from the React app
    $features = [
        [
            'id' => 1,
            'title' => 'Easy Ticket Creation',
            'description' => 'Log new issues or requests in seconds with our intuitive form and instant validation.',
            'image' => '/images/easy.svg',
        ],
        [
            'id' => 2,
            'title' => 'Real-Time Status Tracking',
            'description' => 'Stay updated as tickets move from Open to In Progress to Closed effortlessly.',
            'image' => '/images/tracking.svg',
        ],
        [
            'id' => 3,
            'title' => 'Powerful Dashboard',
            'description' => 'Monitor total, open, and resolved tickets in a clean and interactive dashboard view.',
            'image' => '/images/dashboard.svg',
        ],
        [
            'id' => 4,
            'title' => 'Multi-Framework',
            'description' => 'Explore our versatile ticketing system in React, Vue, and Twig versions.',
            'image' => '/images/framework.svg',
        ],
    ];

    // Try to inline and preprocess SVGs so templates can render them responsively
    $projectRoot = dirname(dirname(__DIR__));
    foreach ($features as &$f) {
        $f['svg'] = '';
        if (!empty($f['image'])) {
            // image path like '/images/easy.svg'
            $imagePath = $projectRoot . '/public' . $f['image'];
            if (file_exists($imagePath)) {
                $raw = file_get_contents($imagePath);
                if ($raw !== false) {
                    // replace color token #6c63ff (case-insensitive) with CSS var
                    $raw = preg_replace('/#6c63ff/i', 'var(--color-primary)', $raw);

                    // remove width/height attributes from svg tag
                    $raw = preg_replace('/\s(width|height)="[^\"]*"/i', '', $raw);

                    // inject responsive style if no style attribute exists
                    if (!preg_match('/<svg[^>]*\bstyle\s*=\s*/i', $raw)) {
                        $raw = preg_replace('/<svg(\b[^>]*)>/i', '<svg$1 style="width:100%;height:100%;max-width:100%;display:block">', $raw, 1);
                    }

                    $f['svg'] = $raw;
                }
            }
        }
    }

    echo $twig->render('landing.twig', [
        'features' => $features,
    ]);
}
