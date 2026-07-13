(() => {
  "use strict";

  /* ------------------------------- Dark mode ------------------------------- */
  /* Applied again here (in addition to the inline head script) so the toggle
     button and its aria state stay in sync even if this file loads late. */
  const THEME_KEY = "pps-theme";
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (err) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      /* localStorage unavailable (e.g. private mode) — theme just won't persist */
    }
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  if (themeToggle) {
    // Reflect whatever the head script already applied before paint.
    applyTheme(root.getAttribute("data-theme") || "light");

    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      storeTheme(next);
    });

    // Follow the OS theme live only if the person has never made an explicit choice.
    if (!getStoredTheme() && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onSystemChange = (e) => {
        if (!getStoredTheme()) applyTheme(e.matches ? "dark" : "light");
      };
      if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
    }
  }

  /* ---------------------------- Sticky header ---------------------------- */
  const header = document.getElementById("site-header");
  const backToTop = document.getElementById("back-to-top");

  function toggleBackToTop() {
    if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 480);
  }

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    toggleBackToTop();
  }

  if (header) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------ Mobile nav ------------------------------ */
  try {
    const navToggle = document.getElementById("nav-toggle");
    if (navToggle && header) {
      navToggle.addEventListener("click", () => {
        const isOpen = header.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });

      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
          header.classList.remove("nav-open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  } catch (err) {
    console.error("Mobile nav failed to initialize:", err);
  }

  /* --------------------------- Scroll reveal (IO) -------------------------- */
  try {
    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => observer.observe(el));

      // Safety net: if any element never crosses the intersection threshold
      // (e.g. an automated full-page screenshot that never truly scrolls),
      // reveal everything after a short delay so content is never stuck hidden.
      window.setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-visible"));
      }, 1500);
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  } catch (err) {
    console.error("Scroll reveal failed to initialize:", err);
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  /* --------------------------------- FAQ ---------------------------------- */
  try {
    document.querySelectorAll(".faq-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        if (!item) return;
        const answer = item.querySelector(".faq-answer");
        const isOpen = item.classList.contains("is-open");

        document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove("is-open");
            const openBtn = openItem.querySelector(".faq-question");
            const openAnswer = openItem.querySelector(".faq-answer");
            if (openBtn) openBtn.setAttribute("aria-expanded", "false");
            if (openAnswer) openAnswer.style.maxHeight = null;
          }
        });

        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
        if (answer) {
          answer.style.maxHeight = !isOpen ? `${answer.scrollHeight}px` : null;
        }
      });
    });
  } catch (err) {
    console.error("FAQ accordion failed to initialize:", err);
  }

  /* ------------------------------ Back to top ------------------------------ */
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -------------------------------- Footer year ----------------------------- */
  document.querySelectorAll("#year").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ------------------------- Smooth anchor scrolling ------------------------ */
  try {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (targetId.length > 1) {
          const target = document.querySelector(targetId);
          if (target) {
            event.preventDefault();
            const offset = (header ? header.offsetHeight : 0) + 12;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }
      });
    });
  } catch (err) {
    console.error("Smooth anchor scrolling failed to initialize:", err);
  }

  /* Recalculate any open FAQ answer's max-height after resize/font-load,
     so it never gets clipped. */
  window.addEventListener("resize", () => {
    document.querySelectorAll(".faq-item.is-open").forEach((item) => {
      const answer = item.querySelector(".faq-answer");
      if (answer) answer.style.maxHeight = `${answer.scrollHeight}px`;
    });
  });
})();
