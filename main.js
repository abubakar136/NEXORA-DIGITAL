// NEXORA DIGITAL – Shared Behaviour
// Every feature checks that its elements exist first.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;


// 1. Theme Toggle (saved in localStorage)
const root = document.documentElement;
const tb = $('#theme-btn');

function applyTheme(theme) {
    root.setAttribute('data-theme', theme);

    if (tb) {
        tb.textContent = theme === 'dark' ? '☀' : '☾';
        tb.setAttribute(
            'aria-label',
            `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`
        );
        tb.setAttribute('aria-pressed', theme === 'light');
    }

    try {
        localStorage.setItem('nx-theme', theme);
    } catch (error) {
        // Theme still works if storage is unavailable.
    }
}

// Load the saved theme.
let savedTheme = 'dark';

try {
    const storedTheme = localStorage.getItem('nx-theme');

    if (storedTheme === 'light' || storedTheme === 'dark') {
        savedTheme = storedTheme;
    }
} catch (error) {
    // Use dark theme by default.
}

applyTheme(savedTheme);

// Toggle theme when the button is clicked (ONE listener only).
if (tb) {
    tb.addEventListener('click', () => {
        const nextTheme =
            root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

        applyTheme(nextTheme);
    });
}


// 2. Mobile Menu
const mb = $('#menu-btn');
const nav = $('#site-nav');

if (mb && nav) {
    mb.onclick = () => {
        mb.setAttribute('aria-expanded', nav.classList.toggle('open'));
    };

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            nav.classList.remove('open');
            mb.setAttribute('aria-expanded', 'false');
            mb.focus();
        }
    });
}


// 3. Scroll to Top
const topBtn = $('#top');

if (topBtn) {
    addEventListener(
        'scroll',
        () => topBtn.classList.toggle('show', scrollY > 500),
        { passive: true }
    );

    topBtn.onclick = () => {
        scrollTo({
            top: 0,
            behavior: reduce ? 'auto' : 'smooth'
        });
    };
}


// 4. Animated Counters (start when visible)
const counters = $$('[data-count]');

if (counters.length) {
    const run = el => {
        const end = +el.dataset.count;
        const suf = el.dataset.suffix || '';

        if (reduce) {
            el.textContent = end + suf;
            return;
        }

        let t0;

        const step = t => {
            t0 ??= t;

            const p = Math.min((t - t0) / 1400, 1);

            el.textContent =
                Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;

            if (p < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
        es => es.forEach(e => {
            if (e.isIntersecting) {
                run(e.target);
                io.unobserve(e.target);
            }
        }),
        { threshold: 0.5 }
    );

    counters.forEach(c => io.observe(c));
}


// 5. Typing Animation
const ty = $('#typed');

if (ty) {
    const w = [
        'web design.',
        'UI/UX systems.',
        'search visibility.',
        'online stores.'
    ];

    if (reduce) {
        ty.textContent = w[0];
    } else {
        let i = 0;
        let j = 0;
        let del = false;

        (function tick() {
            const s = w[i];

            ty.textContent = s.slice(0, j);

            if (!del && j === s.length) {
                del = true;
                return setTimeout(tick, 1600);
            }

            if (del && j === 0) {
                del = false;
                i = (i + 1) % w.length;
            }

            j += del ? -1 : 1;

            setTimeout(tick, del ? 40 : 80);
        })();
    }
}


// 6. FAQ Accordion
$$('.faq button').forEach(b => {
    b.onclick = () => {
        const a = document.getElementById(b.getAttribute('aria-controls'));
        const o = b.getAttribute('aria-expanded') === 'true';

        b.setAttribute('aria-expanded', !o);
        a.hidden = o;
    };
});


// 7. Slider (buttons, dots, arrow keys)
const sl = $('.slider');

if (sl) {
    const slides = $$('.slide', sl);
    const dots = $('.dots', sl);

    let n = 0;

    slides.forEach((_, i) => {
        const d = document.createElement('button');

        d.className = 'dot';
        d.setAttribute('aria-label', 'Go to project ' + (i + 1));
        d.onclick = () => show(i);

        dots.append(d);
    });

    function show(i) {
        n = (i + slides.length) % slides.length;

        slides.forEach((s, k) => {
            s.classList.toggle('on', k === n);
        });

        $$('.dot', sl).forEach((d, k) => {
            d.setAttribute('aria-current', k === n);
        });
    }

    $('.prev', sl).onclick = () => show(n - 1);
    $('.next', sl).onclick = () => show(n + 1);

    sl.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') show(n - 1);
        if (e.key === 'ArrowRight') show(n + 1);
    });

    show(0);
}


// 8. Portfolio Filters
const fb = $$('[data-filter]');

fb.forEach(b => {
    b.onclick = () => {
        fb.forEach(x => {
            x.setAttribute('aria-pressed', x === b);
        });

        $$('[data-cat]').forEach(c => {
            c.hidden = !(
                b.dataset.filter === 'all' ||
                c.dataset.cat.split(' ').includes(b.dataset.filter)
            );
        });
    };
});


// 9. Contact Form Validation (client-side demo only)
const f = $('#contact-form');

if (f) {
    const rules = {
        name: v =>
            v.trim().length >= 2 ||
            'Please enter your name (at least 2 characters).',

        email: v =>
            !v.trim()
                ? 'Email is required.'
                : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ||
                  'Enter a valid email, e.g. name@example.com.',

        subject: v =>
            v.trim().length >= 3 ||
            'Please add a subject.',

        message: v =>
            v.trim().length >= 20 ||
            'Please write at least 20 characters so we can understand your project.'
    };

    const check = el => {
        const r = rules[el.name](el.value);
        const ok = r === true;

        el.setAttribute('aria-invalid', !ok);
        $('#e-' + el.name).textContent = ok ? '' : r;

        return ok;
    };

    $$('input, textarea', f).forEach(el => {
        el.addEventListener('blur', () => check(el));
    });

    f.addEventListener('submit', e => {
        e.preventDefault();

        const all = $$('input, textarea', f).map(check);

        if (all.includes(false)) {
            $$('[aria-invalid=true]', f)[0].focus();
            return;
        }

        f.hidden = true;

        const s = $('#success');
        s.hidden = false;
        s.focus();
    });
}