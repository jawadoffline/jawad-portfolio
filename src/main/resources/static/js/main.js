/**
 * ═══════════════════════════════════════════════════════════
 * JAWAD ALI — COMMAND CENTER PORTFOLIO
 * Vanilla JS — no frameworks, no dependencies
 * ═══════════════════════════════════════════════════════════
 */

// Capture load start time
const _loadStart = performance.now();

document.addEventListener('DOMContentLoaded', () => {
    initBootSequence();
    initScrollReveal();
    initAnimatedCounters();
    initNavbar();
    initMobileMenu();
    initCommandPalette();
    initSkillBars();
    initScrollProgress();
    initTypingAnimation();
    initBackToTop();
    initThemeToggle();
    initLoadTime();
    initTerminal();
    initVisitorCounter();
    initSolveWalkthrough();
    initHeatmap();
    initKonamiCode();
    initVisitCounter();
});


/* ─── BOOT SEQUENCE ──────────────────────────────────────── */
function initBootSequence() {
    const overlay = document.getElementById('boot-overlay');
    const linesContainer = document.getElementById('boot-lines');
    const enterBtn = document.getElementById('boot-enter');

    // Skip if already seen this session
    if (sessionStorage.getItem('boot-seen')) {
        overlay.remove();
        document.getElementById('navbar').style.opacity = '1';
        return;
    }

    const lines = [
        '> PORTFOLIO SYSTEM v3.0',
        '> ████████████████████ 100%',
        '> Loading mission data............. OK',
        '> Systems diagnostic............... PASS',
        '> Comms channel.................... SECURE',
        '> ',
        '> OPERATOR: JAWAD ALI',
        '> STATUS:   ACTIVE — BERGAMO, ITALY',
    ];

    let lineIndex = 0;
    const lineDelay = 120;

    function addLine() {
        if (lineIndex < lines.length) {
            const lineEl = document.createElement('p');
            lineEl.textContent = lines[lineIndex];
            lineEl.className = 'boot-line';
            if (lines[lineIndex] === '> ') lineEl.innerHTML = '&nbsp;';
            if (lines[lineIndex].includes('JAWAD ALI')) lineEl.classList.add('text-white', 'font-bold');
            linesContainer.appendChild(lineEl);
            lineIndex++;
            setTimeout(addLine, lineDelay);
        } else {
            enterBtn.classList.remove('hidden');
            enterBtn.classList.add('boot-line');
        }
    }

    setTimeout(addLine, 400);

    function dismissBoot() {
        overlay.classList.add('hiding');
        document.getElementById('navbar').style.opacity = '1';
        sessionStorage.setItem('boot-seen', '1');
        setTimeout(() => overlay.remove(), 500);
    }

    enterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissBoot();
    });

    overlay.addEventListener('click', dismissBoot);

    document.addEventListener('keydown', function bootKey(e) {
        if (document.getElementById('boot-overlay')) {
            dismissBoot();
            document.removeEventListener('keydown', bootKey);
        }
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (document.getElementById('boot-overlay')) dismissBoot();
    }, 5000);
}


/* ─── SCROLL REVEAL ──────────────────────────────────────── */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach((el) => observer.observe(el));
}


/* ─── ANIMATED COUNTERS ──────────────────────────────────── */
function initAnimatedCounters() {
    const counters = document.querySelectorAll('.counter');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach((el) => observer.observe(el));
}

function animateCounter(el, target) {
    const duration = 1500;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}


/* ─── SKILL BAR ANIMATION ────────────────────────────────── */
function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.dataset.width + '%';
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.3 });

    bars.forEach((el) => observer.observe(el));
}



/* ─── NAVBAR ─────────────────────────────────────────────── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    // Active section highlighting
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach((link) => {
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));
}


/* ─── MOBILE MENU ────────────────────────────────────────── */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const links = document.querySelectorAll('.mobile-nav-link');

    let isOpen = false;

    btn.addEventListener('click', () => {
        isOpen = !isOpen;
        menu.classList.toggle('open', isOpen);
        menu.classList.toggle('hidden', !isOpen);
        menuIcon.classList.toggle('hidden', isOpen);
        closeIcon.classList.toggle('hidden', !isOpen);
    });

    links.forEach((link) => {
        link.addEventListener('click', () => {
            isOpen = false;
            menu.classList.remove('open');
            menu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        });
    });
}


/* ─── COMMAND PALETTE ────────────────────────────────────── */
function initCommandPalette() {
    const palette = document.getElementById('command-palette');
    const input = document.getElementById('command-input');
    const results = document.getElementById('command-results');

    const commands = [
        { name: 'about', desc: 'Jump to the short version', action: () => scrollTo('#hero') },
        { name: 'missions', desc: 'View career timeline', action: () => scrollTo('#missions') },
        { name: 'operations', desc: 'View projects & case studies', action: () => scrollTo('#operations') },
        { name: 'systems', desc: 'View skills & capabilities', action: () => scrollTo('#systems') },
        { name: 'comms', desc: 'Get in touch', action: () => scrollTo('#comms') },
        { name: 'resume', desc: 'View & download resume', action: () => window.open('/resume', '_blank') },
        { name: 'email', desc: 'Send an email', action: () => window.location.href = 'mailto:jawadali.pieas@gmail.com' },
        { name: 'linkedin', desc: 'Open LinkedIn profile', action: () => window.open('https://linkedin.com/in/jawadali21/', '_blank') },
        { name: 'top', desc: 'Scroll to top', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
        { name: 'theme light', desc: 'Switch to light mode', action: () => { document.getElementById('theme-toggle')?.click(); } },
        { name: 'theme dark', desc: 'Switch to dark mode', action: () => { if (document.body.classList.contains('light')) document.getElementById('theme-toggle')?.click(); } },
        { name: 'terminal', desc: 'Jump to live terminal', action: () => scrollTo('#terminal') },
        { name: 'solve', desc: 'Interactive problem walkthrough', action: () => scrollTo('#solve') },
        { name: 'play snake', desc: 'Play a game', action: () => { closePalette(); launchSnakeGame(); } },
        { name: 'sudo hire jawad', desc: '???', action: () => showEasterEgg() },
    ];

    let selectedIndex = 0;

    function scrollTo(selector) {
        document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
    }

    function showEasterEgg() {
        results.innerHTML = `
            <div class="p-6 text-center">
                <p class="text-2xl mb-2">🎉</p>
                <p class="text-emerald-400 font-mono text-sm mb-2">ACCESS GRANTED</p>
                <p class="text-gray-300">Great choice. Let's build something amazing together.</p>
                <a href="mailto:jawadali.pieas@gmail.com" class="inline-block mt-4 px-6 py-2 bg-emerald-500 text-gray-950 font-bold rounded-lg text-sm hover:bg-emerald-400 transition">
                    SEND OFFER →
                </a>
            </div>
        `;
    }

    function openPalette() {
        palette.classList.add('active');
        input.value = '';
        input.focus();
        renderCommands('');
    }

    function closePalette() {
        palette.classList.remove('active');
        input.value = '';
    }

    function renderCommands(query) {
        const filtered = commands.filter((cmd) =>
            cmd.name.toLowerCase().includes(query.toLowerCase())
        );
        selectedIndex = 0;

        results.innerHTML = filtered.map((cmd, i) => `
            <div class="command-item ${i === 0 ? 'selected' : ''}" data-index="${i}">
                <span class="cmd-name">${cmd.name}</span>
                <span class="cmd-desc">${cmd.desc}</span>
            </div>
        `).join('');

        // Click handlers
        results.querySelectorAll('.command-item').forEach((item, i) => {
            item.addEventListener('click', () => {
                filtered[i].action();
                closePalette();
            });
        });
    }

    function executeSelected() {
        const items = results.querySelectorAll('.command-item');
        if (items[selectedIndex]) {
            items[selectedIndex].click();
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Don't trigger if boot overlay is showing
        if (document.getElementById('boot-overlay')) return;

        // Open with / (not in input fields)
        if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            openPalette();
            return;
        }

        // Ctrl+K to open
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openPalette();
            return;
        }

        if (!palette.classList.contains('active')) return;

        // Close with Escape
        if (e.key === 'Escape') {
            closePalette();
            return;
        }

        // Navigate with arrows
        const items = results.querySelectorAll('.command-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            items.forEach((item, i) => item.classList.toggle('selected', i === selectedIndex));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            items.forEach((item, i) => item.classList.toggle('selected', i === selectedIndex));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            executeSelected();
        }
    });

    // Filter on input
    input.addEventListener('input', () => renderCommands(input.value));

    // Close on backdrop click
    palette.addEventListener('click', (e) => {
        if (e.target === palette) closePalette();
    });
}


/* ─── SCROLL PROGRESS BAR ────────────────────────────────── */
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + '%';
    }, { passive: true });
}


/* ─── TYPING ANIMATION ──────────────────────────────────── */
function initTypingAnimation() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    const phrases = [
        'Building Trading Platforms',
        'Engineering Defense Systems',
        'Optimizing Performance',
        'Shipping Mission-Critical Software',
        'Solving Complex Problems',
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
        const current = phrases[phraseIndex];

        if (isPaused) {
            isPaused = false;
            isDeleting = true;
            setTimeout(type, 50);
            return;
        }

        if (!isDeleting) {
            el.textContent = current.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === current.length) {
                isPaused = true;
                setTimeout(type, 2000); // Pause at end
                return;
            }
            setTimeout(type, 60);
        } else {
            el.textContent = current.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(type, 300);
                return;
            }
            setTimeout(type, 30);
        }
    }

    // Start after a delay to let the page settle
    setTimeout(type, 1500);
}


/* ─── BACK TO TOP ────────────────────────────────────────── */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });
}


/* ─── THEME TOGGLE ───────────────────────────────────────── */
function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const iconDark = document.getElementById('theme-icon-dark');
    const iconLight = document.getElementById('theme-icon-light');
    if (!btn) return;

    // Load saved theme
    const saved = localStorage.getItem('theme');
    if (saved === 'light') applyLight();

    btn.addEventListener('click', () => {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateIcon(isLight);
        updateLightClasses(isLight);
    });

    function applyLight() {
        document.body.classList.add('light');
        updateIcon(true);
        updateLightClasses(true);
    }

    function updateIcon(isLight) {
        iconDark.classList.toggle('hidden', isLight);
        iconLight.classList.toggle('hidden', !isLight);
    }

    function updateLightClasses(isLight) {
        // Navbar
        const navbar = document.getElementById('navbar');
        if (isLight) {
            navbar.classList.remove('bg-gray-950/80');
            navbar.classList.add('bg-white/80');
            navbar.classList.remove('border-gray-800/50');
            navbar.classList.add('border-gray-200');
        } else {
            navbar.classList.add('bg-gray-950/80');
            navbar.classList.remove('bg-white/80');
            navbar.classList.add('border-gray-800/50');
            navbar.classList.remove('border-gray-200');
        }

        // All text that needs flipping
        document.querySelectorAll('.text-white').forEach(el => {
            el.classList.toggle('light-text-dark', isLight);
        });

        // Cards and borders
        document.querySelectorAll('.bg-gray-900\\/30, .bg-gray-900\\/50').forEach(el => {
            el.classList.toggle('light-card', isLight);
        });

        document.querySelectorAll('.border-gray-800\\/50').forEach(el => {
            el.classList.toggle('light-border', isLight);
        });
    }
}


/* ─── LOAD TIME ──────────────────────────────────────────── */
function initLoadTime() {
    const el = document.getElementById('load-time');
    if (!el) return;

    window.addEventListener('load', () => {
        const loadTime = Math.round(performance.now() - _loadStart);
        el.textContent = loadTime;
    });
}


/* ─── LIVE TERMINAL ──────────────────────────────────────── */
function initTerminal() {
    const input = document.getElementById('terminal-input');
    const history = document.getElementById('terminal-history');
    const body = document.getElementById('terminal-body');
    if (!input || !history) return;

    const commandHistory = [];
    let historyIndex = -1;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            const cmd = input.value.trim();

            // Handle clear locally
            if (cmd.toLowerCase() === 'clear') {
                history.innerHTML = '';
                input.value = '';
                return;
            }

            // Handle matrix locally
            if (cmd.toLowerCase() === 'matrix') {
                toggleMatrixRain();
                const div = document.createElement('div');
                div.innerHTML = '<div><div class="flex gap-2"><span class="text-emerald-400 select-none">visitor@jawad:~$</span><span class="text-gray-300">matrix</span></div><pre class="text-gray-400 text-xs sm:text-sm mt-1">Matrix rain ' + (document.getElementById('matrix-canvas')?.style.opacity === '1' ? 'activated' : 'deactivated') + '.</pre></div>';
                history.appendChild(div);
                input.value = '';
                body.scrollTop = body.scrollHeight;
                return;
            }

            commandHistory.unshift(cmd);
            historyIndex = -1;

            // Send to server via fetch (not HTMX — more control)
            fetch('/terminal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'command=' + encodeURIComponent(cmd),
            })
            .then(res => res.text())
            .then(html => {
                // Check for clear signal
                if (html.includes('__CLEAR__')) {
                    history.innerHTML = '';
                } else {
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    history.appendChild(div);
                }
                input.value = '';
                body.scrollTop = body.scrollHeight;
            })
            .catch(() => {
                const div = document.createElement('div');
                div.innerHTML = '<pre class="text-red-400 text-xs">Error: connection lost</pre>';
                history.appendChild(div);
                input.value = '';
            });
        }

        // Arrow up/down for history
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            }
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                input.value = '';
            }
        }
    });

    // Click anywhere in terminal body to focus input
    body.addEventListener('click', () => input.focus());
}


/* ─── REAL-TIME VISITOR COUNTER (SSE) ────────────────────── */
function initVisitorCounter() {
    const el = document.getElementById('visitor-count');
    if (!el) return;

    const source = new EventSource('/api/visitors/stream');

    source.addEventListener('visitors', (e) => {
        const count = parseInt(e.data);
        if (!isNaN(count)) {
            el.textContent = count;
        }
    });

    source.onerror = () => {
        // Silently fail — show static "1"
        el.textContent = '1';
    };
}


/* ─── SOLVE WITH ME WALKTHROUGH ──────────────────────────── */
function initSolveWalkthrough() {
    const scenarios = {
        'slow-ui': {
            title: 'Debugging a Slow Trading UI',
            steps: [
                {
                    phase: 'IDENTIFY',
                    title: 'Traders report: "The RFQ panel freezes for 2-3 seconds when I click Refresh"',
                    body: 'First instinct might be to jump into the code. But I start by <strong class="text-white">reproducing the exact scenario</strong>. I ask: Which panel? How many bonds loaded? What market conditions? Peak hours or quiet? I need to see it happen with my own eyes before I touch any code.',
                    code: null,
                },
                {
                    phase: 'MEASURE',
                    title: 'Attach a profiler — don\'t guess, measure',
                    body: 'I connect <strong class="text-white">VisualVM</strong> to the running application and trigger the refresh action. The CPU sampler immediately shows the bottleneck: <code class="text-emerald-400">PricingEngine.recalculateAll()</code> is consuming 87% of the EDT (Event Dispatch Thread). The GUI freezes because heavy computation is blocking the Swing UI thread.',
                    code: '// The problem: blocking the EDT\nrefreshButton.addActionListener(e -> {\n    List<Bond> bonds = portfolio.getBonds(); // 500+ bonds\n    bonds.forEach(b -> pricingEngine.recalculate(b)); // BLOCKS UI\n    table.repaint();\n});',
                },
                {
                    phase: 'ANALYZE',
                    title: 'Root cause: computation on the UI thread',
                    body: 'Classic Swing antipattern. The pricing recalculation runs <strong class="text-white">synchronously on the EDT</strong>, blocking all UI updates. With 500+ bonds, each taking ~5ms to reprice, that\'s 2.5 seconds of frozen UI. The fix isn\'t "make it faster" — it\'s "don\'t block the UI thread."',
                    code: null,
                },
                {
                    phase: 'FIX',
                    title: 'Move computation off the EDT, update UI incrementally',
                    body: 'I move the heavy work to a <strong class="text-white">SwingWorker</strong> background thread. Bonds are repriced in batches, and the table updates progressively — the trader sees prices flowing in rather than a frozen screen. I also add a subtle progress indicator.',
                    code: '// The fix: background thread + incremental updates\nrefreshButton.addActionListener(e -> {\n    new SwingWorker<Void, Bond>() {\n        protected Void doInBackground() {\n            for (Bond b : portfolio.getBonds()) {\n                pricingEngine.recalculate(b);\n                publish(b); // send to UI thread\n            }\n            return null;\n        }\n        protected void process(List<Bond> updated) {\n            table.updateRows(updated); // runs on EDT\n        }\n    }.execute();\n});',
                },
                {
                    phase: 'VERIFY',
                    title: 'Measure again — confirm the fix',
                    body: 'After the fix: <strong class="text-white">UI stays responsive throughout</strong>. The refresh button shows a spinner, prices update row-by-row in ~50ms batches. VisualVM confirms EDT utilization dropped from 87% to 3%. I write a regression test to ensure no future code puts heavy computation back on the EDT. Ship it.',
                    code: null,
                },
            ],
        },
        'memory-leak': {
            title: 'Hunting a Memory Leak in Ground Control Software',
            steps: [
                {
                    phase: 'DETECT',
                    title: 'GCS application crashes after 8 hours of continuous operation',
                    body: 'Operators report the ground control station becomes sluggish and eventually throws <code class="text-emerald-400">OutOfMemoryError</code> during long UAV missions. This is mission-critical — the application <strong class="text-white">cannot crash during live operations</strong>. I set up monitoring to capture heap dumps when memory exceeds 80%.',
                    code: null,
                },
                {
                    phase: 'CAPTURE',
                    title: 'Analyze the heap dump',
                    body: 'I use <strong class="text-white">Eclipse MAT (Memory Analyzer)</strong> on the captured heap dump. The Leak Suspects report immediately flags: <code class="text-emerald-400">TelemetryDataStore</code> holds 2.3 million objects consuming 1.8GB. Each telemetry reading (GPS, altitude, speed) is being stored but never released.',
                    code: '// Leak: every telemetry reading stored forever\npublic class TelemetryDataStore {\n    private final List<TelemetryReading> history = new ArrayList<>();\n\n    public void onReading(TelemetryReading reading) {\n        history.add(reading); // grows forever\n        updateDisplay(reading);\n    }\n}',
                },
                {
                    phase: 'ANALYZE',
                    title: 'Unbounded collection growing indefinitely',
                    body: 'At 5 readings/second over 8 hours = <strong class="text-white">144,000 objects</strong>. Multiply by multiple data streams (GPS, IMU, engine, payload) and you hit millions. The original developer stored everything for "possible future replay" but never implemented a retention policy.',
                    code: null,
                },
                {
                    phase: 'FIX',
                    title: 'Ring buffer with configurable retention',
                    body: 'Replace the unbounded ArrayList with a <strong class="text-white">ring buffer</strong> that keeps the last N readings. For replay, I write older data to disk in compressed batches. The operator can configure retention window based on mission type.',
                    code: '// Fix: bounded ring buffer + disk offload\npublic class TelemetryDataStore {\n    private final ArrayDeque<TelemetryReading> buffer;\n    private final int maxSize;\n\n    public TelemetryDataStore(int retentionMinutes) {\n        this.maxSize = retentionMinutes * 60 * READINGS_PER_SEC;\n        this.buffer = new ArrayDeque<>(maxSize);\n    }\n\n    public void onReading(TelemetryReading reading) {\n        if (buffer.size() >= maxSize) {\n            archiveToDisk(buffer.poll()); // offload oldest\n        }\n        buffer.add(reading);\n        updateDisplay(reading);\n    }\n}',
                },
                {
                    phase: 'VERIFY',
                    title: '48-hour soak test — stable at 180MB',
                    body: 'Ran the application for 48 hours straight in a simulated mission environment. Memory stabilized at <strong class="text-white">~180MB</strong> (previously grew to 2GB+). No GC pauses exceeding 50ms. Operators confirmed smooth performance through extended missions. Added a heap monitoring dashboard to catch future leaks early.',
                    code: null,
                },
            ],
        },
        'architecture': {
            title: 'Designing the BondLens Architecture',
            steps: [
                {
                    phase: 'REQUIREMENTS',
                    title: 'What problem are we actually solving?',
                    body: 'Small financial institutions need fixed income analytics but can\'t afford Bloomberg. I start by listing the <strong class="text-white">core use cases</strong>: single-bond pricing, portfolio-level risk (DV01, duration, P&L), yield curve analysis, scenario modeling. The architecture must support all of these without becoming a monolith.',
                    code: null,
                },
                {
                    phase: 'DECISIONS',
                    title: 'Key architecture decisions and trade-offs',
                    body: 'I choose <strong class="text-white">stateless service methods</strong> — pure functions that take input and return analytics. No mutable state, no side effects. This makes the math testable and the API predictable. DTOs as Java records for immutability. REST API so any frontend can consume it.',
                    code: '// Core principle: pure, stateless analytics\npublic record Bond(double faceValue, double couponRate,\n    int couponFrequency, int periodsRemaining,\n    int daysSinceLastCoupon, int daysInCouponPeriod,\n    DayCountConvention convention) {}\n\npublic record AnalyticsResult(double cleanPrice,\n    double dirtyPrice, double ytm, double duration,\n    double modifiedDuration, double dv01,\n    List<CashFlow> cashFlows) {}',
                },
                {
                    phase: 'STRUCTURE',
                    title: 'Layered architecture with clear boundaries',
                    body: 'Three layers: <strong class="text-white">Controller → Service → Engine</strong>. Controllers handle HTTP, services orchestrate, engines do pure math. The pricing engine doesn\'t know about HTTP. The controller doesn\'t know about bond math. Each layer can be tested independently.',
                    code: '// Clean separation of concerns\n@RestController → BondController     // HTTP layer\n@Service        → BondService        // Orchestration\n(pure class)    → PricingEngine      // Pure math\n(pure class)    → YieldCurveEngine    // Market data\n(pure class)    → RiskEngine         // DV01, duration\n\n// No service knows about HTTP\n// No controller knows about math\n// Everything is independently testable',
                },
                {
                    phase: 'SCALE',
                    title: 'Portfolio-level aggregation without complexity',
                    body: 'For portfolio analytics, I <strong class="text-white">compose single-bond results</strong> rather than building a separate system. Price each bond individually, then aggregate. This keeps the codebase simple — the portfolio analyzer is just a loop over the pricing engine plus aggregation logic.',
                    code: null,
                },
                {
                    phase: 'RESULT',
                    title: 'A platform that proves the architecture',
                    body: '10 features shipped: bond pricing, portfolio DV01/duration/P&L, FRED yield curve integration, G-spread, IRR scenarios, callable bonds, total return analysis, duration matching, immunization, and cash flow gap ALM. <strong class="text-white">All built on the same clean architecture.</strong> Adding a new analytics feature means adding a new engine method and a new endpoint — nothing else changes.',
                    code: null,
                },
            ],
        },
    };

    let currentScenario = 'slow-ui';
    let currentStep = 0;

    const title = document.getElementById('solve-title');
    const body = document.getElementById('solve-body');
    const code = document.getElementById('solve-code');
    const badge = document.getElementById('solve-step-badge');
    const phase = document.getElementById('solve-phase');
    const progress = document.getElementById('solve-progress');
    const dots = document.getElementById('solve-dots');
    const prevBtn = document.getElementById('solve-prev');
    const nextBtn = document.getElementById('solve-next');
    const scenarioBtns = document.querySelectorAll('.scenario-btn');

    if (!title) return;

    function render() {
        const scenario = scenarios[currentScenario];
        const step = scenario.steps[currentStep];
        const total = scenario.steps.length;

        title.textContent = step.title;
        body.innerHTML = '<p>' + step.body + '</p>';

        if (step.code) {
            code.textContent = step.code;
            code.classList.remove('hidden');
        } else {
            code.classList.add('hidden');
        }

        badge.textContent = 'STEP ' + (currentStep + 1) + ' / ' + total;
        phase.textContent = step.phase;
        progress.style.width = ((currentStep + 1) / total * 100) + '%';

        prevBtn.disabled = currentStep === 0;
        nextBtn.textContent = currentStep === total - 1 ? 'DONE' : 'NEXT →';

        // Dots
        dots.innerHTML = scenario.steps.map((_, i) =>
            '<span class="w-2 h-2 rounded-full transition ' +
            (i === currentStep ? 'bg-emerald-400' : 'bg-gray-700') +
            ' cursor-pointer" data-step="' + i + '"></span>'
        ).join('');

        dots.querySelectorAll('span').forEach(dot => {
            dot.addEventListener('click', () => {
                currentStep = parseInt(dot.dataset.step);
                render();
            });
        });
    }

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) { currentStep--; render(); }
    });

    nextBtn.addEventListener('click', () => {
        const total = scenarios[currentScenario].steps.length;
        if (currentStep < total - 1) { currentStep++; render(); }
    });

    scenarioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scenarioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentScenario = btn.dataset.scenario;
            currentStep = 0;
            render();
        });
    });

    render();
}


/* ─── SNAKE GAME EASTER EGG ──────────────────────────────── */
function launchSnakeGame() {
    // Remove existing game if any
    document.getElementById('snake-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'snake-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:60;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;flex-direction:column;backdrop-filter:blur(4px)';

    overlay.innerHTML = `
        <div style="text-align:center;margin-bottom:16px">
            <p style="color:#10b981;font-family:monospace;font-size:14px;margin-bottom:4px">SNAKE — USE ARROW KEYS</p>
            <p id="snake-score" style="color:#6b7280;font-family:monospace;font-size:12px">Score: 0</p>
        </div>
        <canvas id="snake-canvas" width="300" height="300" style="border:1px solid #1f2937;border-radius:8px;background:#030712"></canvas>
        <p style="color:#374151;font-family:monospace;font-size:11px;margin-top:12px">ESC to close</p>
    `;

    document.body.appendChild(overlay);

    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('snake-score');
    const gridSize = 15;
    const tileCount = 20;

    let snake = [{ x: 10, y: 10 }];
    let food = spawnFood();
    let dx = 0, dy = 0;
    let score = 0;
    let gameLoop;
    let started = false;

    function spawnFood() {
        return {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }

    function draw() {
        // Background
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = '#0a0f1e';
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        // Food
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0;

        // Snake
        snake.forEach((seg, i) => {
            ctx.fillStyle = i === 0 ? '#10b981' : '#065f46';
            ctx.shadowColor = i === 0 ? '#10b981' : 'transparent';
            ctx.shadowBlur = i === 0 ? 6 : 0;
            ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
        });
        ctx.shadowBlur = 0;
    }

    function update() {
        if (!started) return;

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Wrap around
        if (head.x < 0) head.x = tileCount - 1;
        if (head.x >= tileCount) head.x = 0;
        if (head.y < 0) head.y = tileCount - 1;
        if (head.y >= tileCount) head.y = 0;

        // Self collision
        if (snake.some(s => s.x === head.x && s.y === head.y)) {
            clearInterval(gameLoop);
            scoreEl.textContent = 'Game Over! Score: ' + score + ' — Press R to restart';
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreEl.textContent = 'Score: ' + score;
            food = spawnFood();
        } else {
            snake.pop();
        }

        draw();
    }

    draw();

    function handleKey(e) {
        if (e.key === 'Escape') {
            clearInterval(gameLoop);
            document.removeEventListener('keydown', handleKey);
            overlay.remove();
            return;
        }

        if (e.key === 'r' || e.key === 'R') {
            clearInterval(gameLoop);
            snake = [{ x: 10, y: 10 }];
            food = spawnFood();
            dx = 0; dy = 0;
            score = 0;
            started = false;
            scoreEl.textContent = 'Score: 0';
            draw();
            gameLoop = setInterval(update, 120);
            return;
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            if (!started) {
                started = true;
            }
        }

        if (e.key === 'ArrowUp' && dy !== 1) { dx = 0; dy = -1; }
        if (e.key === 'ArrowDown' && dy !== -1) { dx = 0; dy = 1; }
        if (e.key === 'ArrowLeft' && dx !== 1) { dx = -1; dy = 0; }
        if (e.key === 'ArrowRight' && dx !== -1) { dx = 1; dy = 0; }
    }

    document.addEventListener('keydown', handleKey);
    gameLoop = setInterval(update, 120);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            clearInterval(gameLoop);
            document.removeEventListener('keydown', handleKey);
            overlay.remove();
        }
    });
}


/* ─── MATRIX RAIN EFFECT ─────────────────────────────────── */
let matrixActive = false;
let matrixInterval = null;

function toggleMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    matrixActive = !matrixActive;

    if (matrixActive) {
        canvas.style.opacity = '1';
        startMatrix(canvas);
    } else {
        canvas.style.opacity = '0';
        if (matrixInterval) {
            cancelAnimationFrame(matrixInterval);
            matrixInterval = null;
        }
    }
}

function startMatrix(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
        if (!matrixActive) return;

        ctx.fillStyle = 'rgba(3, 7, 18, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#10b98130';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        matrixInterval = requestAnimationFrame(draw);
    }

    draw();
}


/* ─── CONTRIBUTION HEATMAP ───────────────────────────────── */
function initHeatmap() {
    const container = document.getElementById('heatmap');
    if (!container) return;

    const weeks = 20;
    const days = 7;

    // Generate realistic-looking activity data
    // More active on weekdays, some weekends, occasional breaks
    const seed = 42;
    function seededRandom(n) {
        let x = Math.sin(n + seed) * 10000;
        return x - Math.floor(x);
    }

    for (let w = 0; w < weeks; w++) {
        const col = document.createElement('div');
        col.className = 'flex flex-col gap-1';

        for (let d = 0; d < days; d++) {
            const idx = w * 7 + d;
            const r = seededRandom(idx);
            const isWeekend = d === 0 || d === 6;

            let level = 0;
            if (isWeekend) {
                if (r > 0.6) level = 1;
                if (r > 0.8) level = 2;
            } else {
                if (r > 0.15) level = 1;
                if (r > 0.35) level = 2;
                if (r > 0.55) level = 3;
                if (r > 0.8) level = 4;
            }

            // Occasional vacation/breaks
            if (w >= 8 && w <= 9 && r < 0.7) level = 0;

            const colors = [
                'bg-gray-800',
                'bg-emerald-900',
                'bg-emerald-700',
                'bg-emerald-500',
                'bg-emerald-400',
            ];

            const cell = document.createElement('div');
            cell.className = 'w-3 h-3 rounded-sm ' + colors[level] + ' transition-colors hover:ring-1 hover:ring-emerald-400/50';
            cell.title = level === 0 ? 'No activity' : level + ' contribution' + (level > 1 ? 's' : '');
            col.appendChild(cell);
        }

        container.appendChild(col);
    }
}


/* ─── KONAMI CODE EASTER EGG ─────────────────────────────── */
function initKonamiCode() {
    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let progress = 0;

    document.addEventListener('keydown', (e) => {
        // Don't trigger in inputs
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        if (e.key === sequence[progress]) {
            progress++;
            if (progress === sequence.length) {
                progress = 0;
                triggerConfetti();
            }
        } else {
            progress = 0;
        }
    });
}

function triggerConfetti() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:60;pointer-events:none;overflow:hidden';
    document.body.appendChild(overlay);

    const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
    const particles = 150;

    for (let i = 0; i < particles; i++) {
        const p = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        const x = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = Math.random() * 2 + 2;

        p.style.cssText = `
            position:absolute;
            top:-10px;
            left:${x}%;
            width:${size}px;
            height:${size}px;
            background:${color};
            border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
            animation:confettiFall ${duration}s ease-in ${delay}s forwards;
            opacity:0.9;
        `;
        overlay.appendChild(p);
    }

    // Add a message
    const msg = document.createElement('div');
    msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:61;text-align:center;pointer-events:none';
    msg.innerHTML = `
        <p style="font-size:48px;margin-bottom:8px">🎮</p>
        <p style="color:#10b981;font-family:monospace;font-size:20px;font-weight:bold">KONAMI CODE ACTIVATED!</p>
        <p style="color:#9ca3af;font-family:monospace;font-size:14px;margin-top:4px">You really explored everything. I like that.</p>
    `;
    document.body.appendChild(msg);

    // Add confetti animation keyframes
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiFall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        overlay.remove();
        msg.remove();
    }, 4000);
}


/* ─── PERSISTENT VISIT COUNTER ───────────────────────────── */
function initVisitCounter() {
    const el = document.getElementById('total-visits');
    if (!el) return;

    // Record this visit
    if (!sessionStorage.getItem('visit-recorded')) {
        fetch('/api/visit', { method: 'POST' })
            .then(res => res.text())
            .then(count => {
                el.textContent = count;
                sessionStorage.setItem('visit-recorded', '1');
            })
            .catch(() => {});
    } else {
        // Just fetch the count
        fetch('/api/visits')
            .then(res => res.text())
            .then(count => { el.textContent = count; })
            .catch(() => {});
    }
}
