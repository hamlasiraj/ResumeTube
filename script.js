(() => {
  "use strict";

  /* ---------------------------- Sticky header ---------------------------- */
  const header = document.getElementById("site-header");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    toggleBackToTop();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------ Mobile nav ------------------------------ */
  const navToggle = document.getElementById("nav-toggle");
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

  /* --------------------------- Scroll reveal (IO) -------------------------- */
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

  /* --------------------------------- FAQ ---------------------------------- */
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const answer = item.querySelector(".faq-answer");
      const isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          openItem.querySelector(".faq-answer").style.maxHeight = null;
        }
      });

      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = !isOpen ? `${answer.scrollHeight}px` : null;
    });
  });

  /* ------------------------------ Back to top ------------------------------ */
  const backToTop = document.getElementById("back-to-top");
  function toggleBackToTop() {
    backToTop.classList.toggle("is-visible", window.scrollY > 480);
  }
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* -------------------------------- Footer year ----------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ------------------------- Smooth anchor scrolling ------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          event.preventDefault();
          const offset = header.offsetHeight + 12;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    });
  });
})();
