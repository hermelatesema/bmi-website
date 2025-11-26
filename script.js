// ==============================
// Utility helpers
// ==============================

/**
 * Shorthand DOM selector
 * @param {string} selector
 * @param {Element|Document} [scope=document]
 * @returns {Element|null}
 */
const $ = (selector, scope = document) => scope.querySelector(selector);

/**
 * Shorthand DOM selector for multiple elements
 * @param {string} selector
 * @param {Element|Document} [scope=document]
 * @returns {Element[]}
 */
const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

/**
 * Check reduces-motion preference
 */
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ==============================
// Basic app state pattern
// ==============================
const AppState = {
  menuOpen: false,
};

// ==============================
// Smooth scrolling for nav links
// ==============================
function setupSmoothScrolling() {
  const links = $$('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      // If it's a skip link, let the browser handle focus but still scroll
      event.preventDefault();

      if (prefersReducedMotion) {
        targetElement.scrollIntoView({ behavior: "auto", block: "start" });
      } else {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Move focus for accessibility when it's not the skip link
      if (!link.classList.contains("skip-link")) {
        targetElement.setAttribute("tabindex", "-1");
        targetElement.focus({ preventScroll: true });
      }
    });
  });
}

// ==============================
// Mobile menu toggle (ARIA-safe)
// ==============================
function setupMobileMenu() {
  // NOTE: you'll need to add a button.menu-toggle in your HTML
  const menuToggle = $(".menu-toggle");
  const nav = $(".site-nav");

  if (!menuToggle || !nav) {
    // If the HTML doesn't have a toggle yet, do nothing gracefully
    return;
  }

  menuToggle.addEventListener("click", () => {
    AppState.menuOpen = !AppState.menuOpen;
    const expanded = AppState.menuOpen;

    menuToggle.setAttribute("aria-expanded", String(expanded));
    document.body.classList.toggle("nav-open", expanded);
  });

  // Close menu when a nav link is clicked (mobile)
  $$(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      if (!AppState.menuOpen) return;
      AppState.menuOpen = false;
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

// ==============================
// Reveal-on-scroll animations
// ==============================
function setupRevealOnScroll() {
  const revealElements = $$(
    ".card, .hero-text, .hero-illustration, .section-header"
  );

  if (prefersReducedMotion) {
    // If user prefers reduced motion, show everything immediately
    revealElements.forEach((el) => {
      el.classList.add("revealed");
    });
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15,
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => {
    el.classList.add("reveal-on-scroll");
    observer.observe(el);
  });
}

// ==============================
// Footer year helper
// ==============================
function setCurrentYear() {
  const yearSpan = $("#year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

// ==============================
// Init
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  setupSmoothScrolling();
  setupMobileMenu();
  setupRevealOnScroll();
  setCurrentYear();
});
