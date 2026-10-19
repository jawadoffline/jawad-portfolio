/* Shared interactions. The page remains readable before JavaScript loads. */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initWalkthrough();
    initTerminal();
    initVisitorCounts();
    initToolForms();
});

function initTheme() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;
    const updateLabel = () => {
        const dark = document.documentElement.dataset.theme === 'dark';
        toggle.querySelector('[data-theme-label]').textContent = dark ? 'Light' : 'Dark';
        toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        document.querySelector('meta[name="theme-color"]').content = dark ? '#232620' : '#f4f1ea';
    };
    updateLabel();
    toggle.addEventListener('click', () => {
        const dark = document.documentElement.dataset.theme !== 'dark';
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        try { localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light'); } catch (_) {}
        updateLabel();
    });
}

function initNavigation() {
    const button = document.querySelector('[data-menu-toggle]');
    const nav = document.getElementById('site-nav');
    if (!button || !nav) return;
    const close = () => {
        button.setAttribute('aria-expanded', 'false');
        button.querySelector('span').textContent = '+';
        nav.classList.remove('is-open');
    };
    button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        button.querySelector('span').textContent = open ? '−' : '+';
        nav.classList.toggle('is-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
            close();
            button.focus();
        }
    });
    document.addEventListener('click', event => {
        if (!event.target.closest('.site-header')) close();
    });
    window.matchMedia('(min-width: 621px)').addEventListener('change', close);
}

function initWalkthrough() {
    const panel = document.getElementById('walkthrough-panel');
    if (!panel) return;
const scenarios = {
        'slow-ui': {
            title: 'Debugging a Slow Trading UI',
            steps: [
                {
                    phase: 'IDENTIFY',
                    title: 'Traders report: "The RFQ panel freezes for 2-3 seconds when I click Refresh"',
                    body: 'First instinct might be to jump into the code. But I start by <strong >reproducing the exact scenario</strong>. I ask: Which panel? How many bonds loaded? What market conditions? Peak hours or quiet? I need to see it happen with my own eyes before I touch any code.',
                    code: null,
                },
                {
                    phase: 'MEASURE',
                    title: 'Attach a profiler — don\'t guess, measure',
                    body: 'I connect <strong >VisualVM</strong> to the running application and trigger the refresh action. The CPU sampler immediately shows the bottleneck: <code >PricingEngine.recalculateAll()</code> is consuming 87% of the EDT (Event Dispatch Thread). The GUI freezes because heavy computation is blocking the Swing UI thread.',
                    code: '// The problem: blocking the EDT\nrefreshButton.addActionListener(e -> {\n    List<Bond> bonds = portfolio.getBonds(); // 500+ bonds\n    bonds.forEach(b -> pricingEngine.recalculate(b)); // BLOCKS UI\n    table.repaint();\n});',
                },
                {
                    phase: 'ANALYZE',
                    title: 'Root cause: computation on the UI thread',
                    body: 'Classic Swing antipattern. The pricing recalculation runs <strong >synchronously on the EDT</strong>, blocking all UI updates. With 500+ bonds, each taking ~5ms to reprice, that\'s 2.5 seconds of frozen UI. The fix isn\'t "make it faster" — it\'s "don\'t block the UI thread."',
                    code: null,
                },
                {
                    phase: 'FIX',
                    title: 'Move computation off the EDT, update UI incrementally',
                    body: 'I move the heavy work to a <strong >SwingWorker</strong> background thread. Bonds are repriced in batches, and the table updates progressively — the trader sees prices flowing in rather than a frozen screen. I also add a subtle progress indicator.',
                    code: '// The fix: background thread + incremental updates\nrefreshButton.addActionListener(e -> {\n    new SwingWorker<Void, Bond>() {\n        protected Void doInBackground() {\n            for (Bond b : portfolio.getBonds()) {\n                pricingEngine.recalculate(b);\n                publish(b); // send to UI thread\n            }\n            return null;\n        }\n        protected void process(List<Bond> updated) {\n            table.updateRows(updated); // runs on EDT\n        }\n    }.execute();\n});',
                },
                {
                    phase: 'VERIFY',
                    title: 'Measure again — confirm the fix',
                    body: 'After the fix: <strong >UI stays responsive throughout</strong>. The refresh button shows a spinner, prices update row-by-row in ~50ms batches. VisualVM confirms EDT utilization dropped from 87% to 3%. I write a regression test to ensure no future code puts heavy computation back on the EDT. Ship it.',
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
                    body: 'Operators report the ground control station becomes sluggish and eventually throws <code >OutOfMemoryError</code> during long UAV missions. This is mission-critical — the application <strong >cannot crash during live operations</strong>. I set up monitoring to capture heap dumps when memory exceeds 80%.',
                    code: null,
                },
                {
                    phase: 'CAPTURE',
                    title: 'Analyze the heap dump',
                    body: 'I use <strong >Eclipse MAT (Memory Analyzer)</strong> on the captured heap dump. The Leak Suspects report immediately flags: <code >TelemetryDataStore</code> holds 2.3 million objects consuming 1.8GB. Each telemetry reading (GPS, altitude, speed) is being stored but never released.',
                    code: '// Leak: every telemetry reading stored forever\npublic class TelemetryDataStore {\n    private final List<TelemetryReading> history = new ArrayList<>();\n\n    public void onReading(TelemetryReading reading) {\n        history.add(reading); // grows forever\n        updateDisplay(reading);\n    }\n}',
                },
                {
                    phase: 'ANALYZE',
                    title: 'Unbounded collection growing indefinitely',
                    body: 'At 5 readings/second over 8 hours = <strong >144,000 objects</strong>. Multiply by multiple data streams (GPS, IMU, engine, payload) and you hit millions. The original developer stored everything for "possible future replay" but never implemented a retention policy.',
                    code: null,
                },
                {
                    phase: 'FIX',
                    title: 'Ring buffer with configurable retention',
                    body: 'Replace the unbounded ArrayList with a <strong >ring buffer</strong> that keeps the last N readings. For replay, I write older data to disk in compressed batches. The operator can configure retention window based on mission type.',
                    code: '// Fix: bounded ring buffer + disk offload\npublic class TelemetryDataStore {\n    private final ArrayDeque<TelemetryReading> buffer;\n    private final int maxSize;\n\n    public TelemetryDataStore(int retentionMinutes) {\n        this.maxSize = retentionMinutes * 60 * READINGS_PER_SEC;\n        this.buffer = new ArrayDeque<>(maxSize);\n    }\n\n    public void onReading(TelemetryReading reading) {\n        if (buffer.size() >= maxSize) {\n            archiveToDisk(buffer.poll()); // offload oldest\n        }\n        buffer.add(reading);\n        updateDisplay(reading);\n    }\n}',
                },
                {
                    phase: 'VERIFY',
                    title: '48-hour soak test — stable at 180MB',
                    body: 'Ran the application for 48 hours straight in a simulated mission environment. Memory stabilized at <strong >~180MB</strong> (previously grew to 2GB+). No GC pauses exceeding 50ms. Operators confirmed smooth performance through extended missions. Added a heap monitoring dashboard to catch future leaks early.',
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
                    body: 'Small financial institutions need fixed income analytics but can\'t afford Bloomberg. I start by listing the <strong >core use cases</strong>: single-bond pricing, portfolio-level risk (DV01, duration, P&L), yield curve analysis, scenario modeling. The architecture must support all of these without becoming a monolith.',
                    code: null,
                },
                {
                    phase: 'DECISIONS',
                    title: 'Key architecture decisions and trade-offs',
                    body: 'I choose <strong >stateless service methods</strong> — pure functions that take input and return analytics. No mutable state, no side effects. This makes the math testable and the API predictable. DTOs as Java records for immutability. REST API so any frontend can consume it.',
                    code: '// Core principle: pure, stateless analytics\npublic record Bond(double faceValue, double couponRate,\n    int couponFrequency, int periodsRemaining,\n    int daysSinceLastCoupon, int daysInCouponPeriod,\n    DayCountConvention convention) {}\n\npublic record AnalyticsResult(double cleanPrice,\n    double dirtyPrice, double ytm, double duration,\n    double modifiedDuration, double dv01,\n    List<CashFlow> cashFlows) {}',
                },
                {
                    phase: 'STRUCTURE',
                    title: 'Layered architecture with clear boundaries',
                    body: 'Three layers: <strong >Controller → Service → Engine</strong>. Controllers handle HTTP, services orchestrate, engines do pure math. The pricing engine doesn\'t know about HTTP. The controller doesn\'t know about bond math. Each layer can be tested independently.',
                    code: '// Clean separation of concerns\n@RestController → BondController     // HTTP layer\n@Service        → BondService        // Orchestration\n(pure class)    → PricingEngine      // Pure math\n(pure class)    → YieldCurveEngine    // Market data\n(pure class)    → RiskEngine         // DV01, duration\n\n// No service knows about HTTP\n// No controller knows about math\n// Everything is independently testable',
                },
                {
                    phase: 'SCALE',
                    title: 'Portfolio-level aggregation without complexity',
                    body: 'For portfolio analytics, I <strong >compose single-bond results</strong> rather than building a separate system. Price each bond individually, then aggregate. This keeps the codebase simple — the portfolio analyzer is just a loop over the pricing engine plus aggregation logic.',
                    code: null,
                },
                {
                    phase: 'RESULT',
                    title: 'A platform that proves the architecture',
                    body: '10 features shipped: bond pricing, portfolio DV01/duration/P&L, FRED yield curve integration, G-spread, IRR scenarios, callable bonds, total return analysis, duration matching, immunization, and cash flow gap ALM. <strong >All built on the same clean architecture.</strong> Adding a new analytics feature means adding a new engine method and a new endpoint — nothing else changes.',
                    code: null,
                },
            ],
        },
    };

    let currentScenario = 'slow-ui';
    let currentStep = 0;
    const tabs = [...document.querySelectorAll('.scenario-btn')];
    const previous = document.getElementById('solve-prev');
    const next = document.getElementById('solve-next');
    const render = () => {
        const steps = scenarios[currentScenario].steps;
        const step = steps[currentStep];
        document.getElementById('solve-title').textContent = step.title;
        // Content comes exclusively from the fixed walkthrough definitions above.
        document.getElementById('solve-body').innerHTML = '<p>' + step.body + '</p>';
        const code = document.getElementById('solve-code');
        code.hidden = !step.code;
        code.textContent = step.code || '';
        document.getElementById('solve-step-badge').textContent = 'Step ' + (currentStep + 1) + ' of ' + steps.length;
        document.getElementById('solve-phase').textContent = step.phase;
        document.getElementById('solve-position').textContent = (currentStep + 1) + ' / ' + steps.length;
        previous.disabled = currentStep === 0;
        next.disabled = currentStep === steps.length - 1;
        next.textContent = next.disabled ? 'Complete ✓' : 'Next step →';
    };
    const selectTab = tab => {
        currentScenario = tab.dataset.scenario;
        currentStep = 0;
        tabs.forEach(item => {
            const selected = item === tab;
            item.setAttribute('aria-selected', String(selected));
            item.tabIndex = selected ? 0 : -1;
        });
        panel.setAttribute('aria-labelledby', tab.id);
        render();
    };
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('keydown', event => {
            let target;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = tabs[(index + 1) % tabs.length];
            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = tabs[(index - 1 + tabs.length) % tabs.length];
            if (event.key === 'Home') target = tabs[0];
            if (event.key === 'End') target = tabs[tabs.length - 1];
            if (target) { event.preventDefault(); selectTab(target); target.focus(); }
        });
    });
    previous.addEventListener('click', () => { if (currentStep > 0) { currentStep--; render(); } });
    next.addEventListener('click', () => {
        if (currentStep < scenarios[currentScenario].steps.length - 1) { currentStep++; render(); }
    });
    render();
}

function initTerminal() {
    const form = document.getElementById('terminal-form');
    if (!form) return;
    const input = document.getElementById('terminal-input');
    const history = document.getElementById('terminal-history');
    const status = document.getElementById('terminal-status');
    const submit = form.querySelector('button');
    const commands = [];
    let historyIndex = -1;
    let busy = false;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const command = input.value.trim();
        if (!command || busy) return;
        if (command.toLowerCase() === 'clear') { history.replaceChildren(); input.value = ''; status.textContent = ''; return; }
        commands.unshift(command);
        historyIndex = -1;
        busy = true;
        submit.disabled = true;
        status.textContent = 'Waiting for the server…';
        try {
            const response = await fetch('/terminal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ command }),
                signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) throw new Error('Server returned ' + response.status);
            const html = await response.text();
            const entry = document.createElement('div');
            entry.innerHTML = html;
            history.appendChild(entry);
            history.scrollTop = history.scrollHeight;
            input.value = '';
            status.textContent = '';
        } catch (_) {
            status.textContent = 'Couldn’t reach the server. Your command is still here — try again.';
        } finally { busy = false; submit.disabled = false; }
    });
    input.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            historyIndex = Math.min(historyIndex + 1, commands.length - 1);
            input.value = commands[historyIndex] || '';
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            historyIndex = Math.max(historyIndex - 1, -1);
            input.value = commands[historyIndex] || '';
        }
    });
}

function initVisitorCounts() {
    const online = document.getElementById('visitor-count');
    if (online && 'EventSource' in window) {
        const source = new EventSource('/api/visitors/stream');
        source.addEventListener('visitors', event => {
            const count = Number.parseInt(event.data, 10);
            if (Number.isFinite(count)) online.textContent = count;
        });
        source.onerror = () => { online.textContent = '—'; };
        window.addEventListener('pagehide', () => source.close(), { once: true });
    }
    const total = document.getElementById('total-visits');
    if (!total) return;
    let recorded = false;
    try { recorded = sessionStorage.getItem('visit-recorded') === '1'; } catch (_) {}
    fetch(recorded ? '/api/visits' : '/api/visit', { method: recorded ? 'GET' : 'POST' })
        .then(response => { if (!response.ok) throw new Error('Unavailable'); return response.text(); })
        .then(count => {
            total.textContent = count;
            try { sessionStorage.setItem('visit-recorded', '1'); } catch (_) {}
        })
        .catch(() => { total.textContent = '—'; });
}

function initToolForms() {
    const forms = [...document.querySelectorAll('form[hx-post]')];
    forms.forEach(form => {
        const feedback = document.createElement('p');
        feedback.className = 'form-feedback';
        feedback.setAttribute('role', 'status');
        form.insertAdjacentElement('afterend', feedback);
        const button = form.querySelector('[type="submit"]');
        form.addEventListener('htmx:beforeRequest', () => {
            feedback.textContent = '';
            if (button) button.disabled = true;
            document.querySelector(form.getAttribute('hx-target'))?.setAttribute('aria-busy', 'true');
        });
        form.addEventListener('htmx:afterRequest', event => {
            if (button) button.disabled = false;
            document.querySelector(form.getAttribute('hx-target'))?.setAttribute('aria-busy', 'false');
            if (event.detail.failed) feedback.textContent = 'The request couldn’t be completed. Please check your inputs and try again.';
        });
        form.addEventListener('htmx:sendError', () => { feedback.textContent = 'Couldn’t reach the server. Please try again.'; });
    });
}
