// Mobile nav toggle + simple accessibility state management
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav__toggle");
const navLinks = Array.from(document.querySelectorAll(".nav__links a"));

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("nav--open");
  if (navToggle) navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("nav--open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

// Intersection Observer for reveal animations + skill bar fill
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll("[data-animate]").forEach((el) => revealObserver.observe(el));

// Dynamic year in footer
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Basic (non-sending) contact form handler to show intent
const form = document.querySelector(".contact__form");
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = formData.get("name") || "there";
  alert(`Thanks, ${name}! Your message was received. I will reply soon.`);
  form.reset();
});

// Theme toggle with localStorage persistence
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle?.querySelector(".theme-toggle__icon");
const themeLabel = themeToggle?.querySelector(".theme-toggle__label");
const THEME_KEY = "preferred-theme";

const applyTheme = (mode, persist = true) => {
  document.body.dataset.theme = mode;
  if (themeIcon && themeLabel) {
    const isDark = mode === "dark";
    themeIcon.textContent = isDark ? "🌞" : "🌙";
    themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
  }
  if (persist) localStorage.setItem(THEME_KEY, mode);
};

const initTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = stored || (prefersDark ? "dark" : "light");
  applyTheme(initial, false);
};

themeToggle?.addEventListener("click", () => {
  const nextMode = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextMode);
});

initTheme();

// Highlight active nav link on scroll
const sections = Array.from(document.querySelectorAll("main section[id]"));
const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("is-active", isActive);
          if (isActive) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      }
    });
  },
  { threshold: 0.4, rootMargin: "-10% 0px -40% 0px" }
);

sections.forEach((section) => navObserver.observe(section));
