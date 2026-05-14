/**
 * Portfolio interactions — loader, particles, cursor glow, theme, nav,
 * scroll progress, reveal-on-scroll, typing effect, counters, contact form.
 */

(function () {
  "use strict";

  const html = document.documentElement;
  const body = document.body;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  /* -------------------------------------------------------------------------- */
  /* Loading screen                                                             */
  /* -------------------------------------------------------------------------- */
  const loader = document.getElementById("loader");

  function finishLoading() {
    body.classList.add("is-loaded");
    if (loader) loader.setAttribute("aria-hidden", "true");
  }

  window.addEventListener("load", () => {
    const delay = prefersReducedMotion ? 0 : 500;
    window.setTimeout(finishLoading, delay);
  });

  // Fallback if load event already fired
  if (document.readyState === "complete") {
    window.setTimeout(finishLoading, prefersReducedMotion ? 0 : 400);
  }

  /* -------------------------------------------------------------------------- */
  /* Footer year                                                                */
  /* -------------------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* -------------------------------------------------------------------------- */
  /* Theme toggle (dark / light)                                                */
  /* -------------------------------------------------------------------------- */
  const THEME_KEY = "mmbm-theme";
  const themeBtn = document.getElementById("theme-toggle");

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
    themeBtn?.setAttribute(
      "aria-label",
      next === "light" ? "Switch to dark theme" : "Switch to light theme"
    );
  }

  const stored = getStoredTheme();
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  }

  themeBtn?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(current === "light" ? "dark" : "light");
  });

  /* -------------------------------------------------------------------------- */
  /* Mobile navigation                                                          */
  /* -------------------------------------------------------------------------- */
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = navMenu?.querySelectorAll(".nav__link") ?? [];

  function setNavOpen(open) {
    body.classList.toggle("nav-open", open);
    navToggle?.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  navToggle?.addEventListener("click", () => {
    setNavOpen(!body.classList.contains("nav-open"));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNavOpen(false);
  });

  /* -------------------------------------------------------------------------- */
  /* Scroll progress bar                                                        */
  /* -------------------------------------------------------------------------- */
  const scrollProgress = document.getElementById("scroll-progress");

  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();

  /* -------------------------------------------------------------------------- */
  /* Cursor glow (fine pointer only)                                            */
  /* -------------------------------------------------------------------------- */
  const cursorGlow = document.getElementById("cursor-glow");
  let glowX = 0;
  let glowY = 0;
  let targetX = 0;
  let targetY = 0;
  let glowRaf = 0;

  function animateGlow() {
    const ease = 0.14;
    glowX += (targetX - glowX) * ease;
    glowY += (targetY - glowY) * ease;
    if (cursorGlow) {
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
    }
    glowRaf = requestAnimationFrame(animateGlow);
  }

  if (cursorGlow && !prefersReducedMotion && !isCoarsePointer) {
    body.classList.add("has-cursor-glow");
    glowRaf = requestAnimationFrame(animateGlow);

    window.addEventListener(
      "mousemove",
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
      },
      { passive: true }
    );

    window.addEventListener("mouseleave", () => {
      body.classList.remove("has-cursor-glow");
    });

    window.addEventListener("mouseenter", () => {
      body.classList.add("has-cursor-glow");
    });
  }

  /* -------------------------------------------------------------------------- */
  /* Floating particles (canvas)                                                */
  /* -------------------------------------------------------------------------- */
  const canvas = document.getElementById("particles");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      let particles = [];
      let width = 0;
      let height = 0;
      let particleRaf = 0;
      let particlesRunning = true;

      function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        const count = Math.min(110, Math.floor((width * height) / 16000));
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.6 + 0.3,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          a: Math.random() * Math.PI * 2,
        }));
      }

      function tick() {
        if (!ctx || !particlesRunning) return;
        ctx.clearRect(0, 0, width, height);
        const isLight = html.getAttribute("data-theme") === "light";
        const dot = isLight ? "rgba(8,145,178,0.35)" : "rgba(34,211,238,0.45)";
        const line = isLight ? "rgba(14,165,233,0.06)" : "rgba(56,189,248,0.07)";

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.a += 0.01;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.fillStyle = dot;
          ctx.arc(p.x, p.y, p.r + Math.sin(p.a) * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }

        // Sparse connections
        const maxDist = isLight ? 110 : 130;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.hypot(dx, dy);
            if (d < maxDist) {
              ctx.strokeStyle = line;
              ctx.lineWidth = 1 - d / maxDist;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        particleRaf = requestAnimationFrame(tick);
      }

      resize();
      window.addEventListener("resize", resize);
      particleRaf = requestAnimationFrame(tick);

      document.addEventListener("visibilitychange", () => {
        particlesRunning = !document.hidden;
        if (particlesRunning) {
          cancelAnimationFrame(particleRaf);
          particleRaf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(particleRaf);
        }
      });
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Scroll reveal                                                              */
  /* -------------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("reveal--visible"));
  }

  /* -------------------------------------------------------------------------- */
  /* Typing animation (hero)                                                    */
  /* -------------------------------------------------------------------------- */
  const typingEl = document.getElementById("typing-text");
  const phrases = [
    "Building interfaces with clarity and motion.",
    "Exploring Flutter, React Native, and modern web stacks.",
    "Pairing craft with AI-assisted workflows.",
  ];

  if (typingEl && !prefersReducedMotion) {
    let pi = 0;
    let ci = 0;
    let deleting = false;

    function stepTyping() {
      const full = phrases[pi % phrases.length];
      if (!deleting) {
        typingEl.textContent = full.slice(0, ci + 1);
        ci++;
        if (ci === full.length) {
          deleting = true;
          window.setTimeout(stepTyping, 1800);
          return;
        }
      } else {
        typingEl.textContent = full.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          deleting = false;
          pi++;
        }
      }
      const delay = deleting ? 28 : 42;
      window.setTimeout(stepTyping, delay);
    }

    window.setTimeout(stepTyping, 800);
  } else if (typingEl) {
    typingEl.textContent = phrases[0];
  }

  /* -------------------------------------------------------------------------- */
  /* Stat counters                                                              */
  /* -------------------------------------------------------------------------- */
  function animateCount(el, target, suffix, duration) {
    const start = performance.now();
    const from = 0;

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (target - from) * eased);
      el.textContent = `${value}${suffix}`;
      if (t < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function runCountersWhenVisible() {
    const statValues = document.querySelectorAll(".stat__value[data-count]");
    if (!statValues.length) return;

    const startCounters = () => {
      statValues.forEach((el) => {
        const target = Number(el.getAttribute("data-count"));
        const suffix = el.getAttribute("data-count-suffix") || "";
        if (Number.isFinite(target)) {
          animateCount(el, target, suffix, 1100);
        }
      });
    };

    const first = statValues[0];
    if ("IntersectionObserver" in window && first) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startCounters();
              obs.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      io.observe(first.closest(".stats") ?? first);
    } else {
      startCounters();
    }
  }

  if (!prefersReducedMotion) {
    runCountersWhenVisible();
  } else {
    document.querySelectorAll(".stat__value[data-count]").forEach((el) => {
      const target = el.getAttribute("data-count");
      const suffix = el.getAttribute("data-count-suffix") || "";
      if (target) el.textContent = `${target}${suffix}`;
    });
  }

  /* Graduation year: 2024 → 2028 */
  const yearStat = document.querySelector("[data-year-animate]");
  if (yearStat && !prefersReducedMotion) {
    const endYear = Number(yearStat.getAttribute("data-year-animate")) || 2028;
    const startYear = 2024;

    function runYearAnim() {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            obs.disconnect();
            let y = startYear;
            const id = window.setInterval(() => {
              yearStat.textContent = String(y);
              if (y >= endYear) {
                window.clearInterval(id);
                return;
              }
              y++;
            }, 120);
          });
        },
        { threshold: 0.3 }
      );
      io.observe(yearStat);
    }
    runYearAnim();
  } else if (yearStat) {
    yearStat.textContent = yearStat.getAttribute("data-year-animate") || "2028";
  }

  /* -------------------------------------------------------------------------- */
  /* Contact form → mailto (static hosting friendly)                            */
  /* -------------------------------------------------------------------------- */
  const form = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      if (formNote) formNote.textContent = "Please fill in all fields.";
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
    const mailto = `mailto:m.muaazbm@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;

    if (formNote) {
      formNote.textContent = "Opening your email client…";
      window.setTimeout(() => {
        formNote.textContent = "";
      }, 4000);
    }
  });

  /* Cancel glow RAF on page hide (optional cleanup) */
  window.addEventListener("beforeunload", () => {
    if (glowRaf) cancelAnimationFrame(glowRaf);
  });
})();
