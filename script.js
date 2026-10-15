/* ==========================================================================
   AMIT KUMAR PORTFOLIO - COMPLETE INTERACTIVITY (script.js)
   Features:
   1. Theme Toggle (Dark/Light) with localStorage persistence
   2. Responsive Mobile Navigation Drawer + Keyboard Accessibility
   3. Sticky Header & Back-to-Top Button Scroll States
   4. Active Navigation Link Highlighting (ScrollSpy)
   5. Scroll-Triggered Reveal Animations (IntersectionObserver)
   6. Graceful Image Fallback Handler (Hero Photo, About Photo, Project Previews)
   7. Project Category Filtering
   8. Graceful Resume File Check & Placeholder Link Toast Notifications
   9. Honest Contact Form Validation + Formspree / Mailto Delivery
   10. Automatic Footer Copyright Year
   ========================================================================== */

(function () {
  "use strict";

  // Enable progressive enhancement hooks in CSS (.js-enabled .reveal)
  document.documentElement.classList.add("js-enabled");

  document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initMobileNavigation();
    initScrollEffects();
    initActiveNavHighlight();
    initScrollReveal();
    initImageFallbacks();
    initProjectFilters();
    initPlaceholderAndResumeHandlers();
    initContactForm();
    initCurrentYear();
  });

  /* ------------------------------------------------------------------------
     1. DARK / LIGHT THEME TOGGLE WITH LOCALSTORAGE
     ------------------------------------------------------------------------ */
  function initThemeToggle() {
    const themeToggleBtn = document.getElementById("theme-toggle");
    const rootHtml = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const STORAGE_KEY = "amit_portfolio_theme";

    // Read saved preference from localStorage (Default to "dark")
    let savedTheme = "dark";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        savedTheme = stored;
      }
    } catch (err) {
      // Fallback if localStorage is blocked by browser privacy settings
      savedTheme = "dark";
    }

    applyTheme(savedTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const currentTheme = rootHtml.getAttribute("data-theme") || "dark";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);

        try {
          localStorage.setItem(STORAGE_KEY, nextTheme);
        } catch (err) {
          // Ignore storage errors in private browsing
        }
      });
    }

    function applyTheme(theme) {
      rootHtml.setAttribute("data-theme", theme);
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          theme === "dark" ? "#030712" : "#f8fafc"
        );
      }
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute(
          "aria-label",
          theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        );
      }
    }
  }

  /* ------------------------------------------------------------------------
     2. RESPONSIVE MOBILE NAVIGATION MENU
     ------------------------------------------------------------------------ */
  function initMobileNavigation() {
    const mobileToggle = document.getElementById("mobile-nav-toggle");
    const navMenu = document.getElementById("nav-menu");
    if (!mobileToggle || !navMenu) return;

    const navLinks = navMenu.querySelectorAll(".nav-link");

    function toggleMenu(forceState) {
      const isExpanded =
        mobileToggle.getAttribute("aria-expanded") === "true";
      const nextState =
        typeof forceState === "boolean" ? forceState : !isExpanded;

      mobileToggle.setAttribute("aria-expanded", String(nextState));
      mobileToggle.setAttribute(
        "aria-label",
        nextState ? "Close navigation menu" : "Open navigation menu"
      );
      navMenu.classList.toggle("is-open", nextState);
    }

    mobileToggle.addEventListener("click", () => toggleMenu());

    // Close mobile menu when a link is clicked
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          toggleMenu(false);
        }
      });
    });

    // Close mobile menu on Escape key press
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        mobileToggle.getAttribute("aria-expanded") === "true"
      ) {
        toggleMenu(false);
        mobileToggle.focus();
      }
    });

    // Close mobile drawer if screen is resized back to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        toggleMenu(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. STICKY HEADER & BACK-TO-TOP BUTTON
     ------------------------------------------------------------------------ */
  function initScrollEffects() {
    const header = document.getElementById("site-header");
    const backToTopBtn = document.getElementById("back-to-top");

    function updateOnScroll() {
      const scrollY = window.scrollY || window.pageYOffset;

      if (header) {
        header.classList.toggle("is-scrolled", scrollY > 20);
      }

      if (backToTopBtn) {
        backToTopBtn.classList.toggle("is-visible", scrollY > 420);
      }
    }

    window.addEventListener("scroll", updateOnScroll, { passive: true });
    updateOnScroll();

    if (backToTopBtn) {
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ------------------------------------------------------------------------
     4. ACTIVE NAVIGATION LINK HIGHLIGHTING ON SCROLL
     ------------------------------------------------------------------------ */
  function initActiveNavHighlight() {
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".nav-list .nav-link");
    if (!sections.length || !navLinks.length) return;

    function highlightCurrentSection() {
      const scrollPosition = window.scrollY + 160;
      let currentSectionId = "home";

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          currentSectionId = section.getAttribute("id");
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const isMatch = href === `#${currentSectionId}`;
        link.classList.toggle("active", isMatch);
      });
    }

    window.addEventListener("scroll", highlightCurrentSection, {
      passive: true,
    });
    highlightCurrentSection();
  }

  /* ------------------------------------------------------------------------
     5. SCROLL-TRIGGERED REVEAL ANIMATIONS
     ------------------------------------------------------------------------ */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal");
    if (!revealElements.length) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------------
     6. GRACEFUL MISSING IMAGE FALLBACKS
     ------------------------------------------------------------------------ */
  function initImageFallbacks() {
    const imagesWithFallback = document.querySelectorAll(
      "img[data-fallback-target]"
    );

    imagesWithFallback.forEach((img) => {
      const fallbackId = img.getAttribute("data-fallback-target");
      const fallbackEl = fallbackId
        ? document.getElementById(fallbackId)
        : null;

      function activateFallback() {
        img.style.display = "none";
        if (fallbackEl) {
          fallbackEl.hidden = false;
        }
      }

      function showLoadedImage() {
        img.style.display = "block";
        if (fallbackEl) {
          fallbackEl.hidden = true;
        }
      }

      img.addEventListener("error", activateFallback);
      img.addEventListener("load", showLoadedImage);

      // Handle case where image already failed before script attached
      if (img.complete) {
        if (img.naturalWidth === 0) {
          activateFallback();
        } else {
          showLoadedImage();
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     7. PROJECT CATEGORY FILTERING
     ------------------------------------------------------------------------ */
  function initProjectFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn[data-filter]");
    const projectCards = document.querySelectorAll(
      ".project-card[data-category]"
    );

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedFilter = button.getAttribute("data-filter") || "all";

        // Update active state on filter tabs
        filterButtons.forEach((btn) => {
          const isActive = btn === button;
          btn.classList.toggle("active", isActive);
          btn.setAttribute("aria-selected", String(isActive));
        });

        // Show or hide matching project cards
        projectCards.forEach((card) => {
          const categories = (card.getAttribute("data-category") || "").split(
            /\s+/
          );
          const shouldShow =
            selectedFilter === "all" || categories.includes(selectedFilter);

          card.classList.toggle("is-hidden", !shouldShow);
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. PLACEHOLDER LINKS & RESUME DOWNLOAD HANDLER
     ------------------------------------------------------------------------ */
  function initPlaceholderAndResumeHandlers() {
    // A. Project Placeholder Links (Live Demo / Source Code)
    const placeholderLinks = document.querySelectorAll(
      "[data-placeholder-link]"
    );

    placeholderLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = (link.getAttribute("href") || "").trim();
        const placeholderNote = link.getAttribute("data-placeholder-link");

        // If href still points to "#" or "#projects", show helpful instruction instead of jumping
        if (!href || href.startsWith("#")) {
          event.preventDefault();
          showToast(
            `Placeholder Link: ${placeholderNote}. Update the href attribute in index.html once deployed.`
          );
        }
      });
    });

    // B. Resume Download Buttons (Graceful Missing File Check)
    const resumeButtons = document.querySelectorAll("[data-resume-btn]");

    resumeButtons.forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        const resumeUrl = btn.getAttribute("href") || "assets/resume.pdf";

        // When running over http/https (Live Server or GitHub Pages), verify file exists first
        if (window.location.protocol.startsWith("http")) {
          event.preventDefault();
          try {
            const response = await fetch(resumeUrl, { method: "HEAD" });
            if (response.ok) {
              // Trigger download if file exists
              const tempLink = document.createElement("a");
              tempLink.href = resumeUrl;
              tempLink.setAttribute(
                "download",
                btn.getAttribute("download") || "Amit_Kumar_Resume.pdf"
              );
              document.body.appendChild(tempLink);
              tempLink.click();
              tempLink.remove();
            } else {
              showToast(
                "Resume PDF not added yet. Place your PDF file at assets/resume.pdf to enable downloads."
              );
            }
          } catch (err) {
            showToast(
              "Resume PDF not found. Place your PDF file at assets/resume.pdf to enable downloads."
            );
          }
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. HONEST CONTACT FORM VALIDATION & SUBMISSION
     ------------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const nameInput = document.getElementById("sender-name");
    const emailInput = document.getElementById("sender-email");
    const subjectInput = document.getElementById("message-subject");
    const messageInput = document.getElementById("message-body");
    const submitBtn = document.getElementById("contact-submit-btn");
    const statusBox = document.getElementById("form-status");

    const fields = [
      {
        input: nameInput,
        errorEl: document.getElementById("error-name"),
        validate: (val) =>
          val.length >= 2 ? "" : "Please enter your name (at least 2 characters).",
      },
      {
        input: emailInput,
        errorEl: document.getElementById("error-email"),
        validate: (val) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
            ? ""
            : "Please enter a valid email address.",
      },
      {
        input: subjectInput,
        errorEl: document.getElementById("error-subject"),
        validate: (val) =>
          val.length >= 3
            ? ""
            : "Please enter a subject (at least 3 characters).",
      },
      {
        input: messageInput,
        errorEl: document.getElementById("error-message"),
        validate: (val) =>
          val.length >= 10
            ? ""
            : "Please enter a message with at least 10 characters.",
      },
    ];

    // Live field validation on input
    fields.forEach(({ input, errorEl, validate }) => {
      if (!input) return;
      input.addEventListener("input", () => {
        const msg = validate(input.value.trim());
        setFieldError(input, errorEl, msg);
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideFormStatus();

      // Validate all fields
      let isFormValid = true;
      fields.forEach(({ input, errorEl, validate }) => {
        if (!input) return;
        const errorMsg = validate(input.value.trim());
        setFieldError(input, errorEl, errorMsg);
        if (errorMsg) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        showFormStatus(
          "Please fix the highlighted fields before sending your message.",
          "status-error"
        );
        return;
      }

      const nameVal = nameInput.value.trim();
      const emailVal = emailInput.value.trim();
      const subjectVal = subjectInput.value.trim();
      const messageVal = messageInput.value.trim();

      const formspreeEndpoint = (
        form.getAttribute("data-formspree-endpoint") || ""
      ).trim();
      const recipientEmail = (
        form.getAttribute("data-recipient-email") || "your.email@example.com"
      ).trim();

      // Mode 1: Real Formspree endpoint configured
      if (
        formspreeEndpoint &&
        formspreeEndpoint.startsWith("https://formspree.io/")
      ) {
        setSubmittingState(true);
        try {
          const response = await fetch(formspreeEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              name: nameVal,
              email: emailVal,
              subject: subjectVal,
              message: messageVal,
            }),
          });

          if (response.ok) {
            form.reset();
            showFormStatus(
              "Thank you! Your message has been sent successfully.",
              "status-success"
            );
          } else {
            showFormStatus(
              "Could not send message via Formspree. Please check your Formspree endpoint or use direct email.",
              "status-error"
            );
          }
        } catch (error) {
          showFormStatus(
            "Network error while submitting the form. Please try again or reach out via email directly.",
            "status-error"
          );
        } finally {
          setSubmittingState(false);
        }
      } else {
        // Mode 2: Honest Static Fallback (Opens user's email app with pre-filled details)
        const mailtoSubject = encodeURIComponent(
          `[Portfolio Inquiry] ${subjectVal}`
        );
        const mailtoBody = encodeURIComponent(
          `Name: ${nameVal}\nEmail: ${emailVal}\n\nMessage:\n${messageVal}`
        );

        showFormStatus(
          "Form validated! Because this static site does not have a Formspree backend connected yet, opening your email app with your message pre-filled.",
          "status-info"
        );

        window.location.href = `mailto:${recipientEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
      }
    });

    function setFieldError(inputEl, errorEl, message) {
      if (!inputEl || !errorEl) return;
      inputEl.classList.toggle("is-invalid", Boolean(message));
      errorEl.textContent = message;
    }

    function setSubmittingState(isSubmitting) {
      if (!submitBtn) return;
      const btnText = submitBtn.querySelector(".btn-text");
      submitBtn.disabled = isSubmitting;
      if (btnText) {
        btnText.textContent = isSubmitting ? "Sending..." : "Send Message";
      }
    }

    function showFormStatus(message, statusClass) {
      if (!statusBox) return;
      statusBox.className = `form-status ${statusClass}`;
      statusBox.textContent = message;
      statusBox.hidden = false;
    }

    function hideFormStatus() {
      if (!statusBox) return;
      statusBox.hidden = true;
      statusBox.textContent = "";
    }
  }

  /* ------------------------------------------------------------------------
     10. AUTOMATIC COPYRIGHT YEAR & TOAST HELPER
     ------------------------------------------------------------------------ */
  function initCurrentYear() {
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
      yearSpan.textContent = String(new Date().getFullYear());
    }
  }

  let toastTimeoutId = null;
  function showToast(message) {
    const toast = document.getElementById("toast-notification");
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;

    // Trigger reflow for smooth CSS transition
    void toast.offsetWidth;
    toast.classList.add("is-visible");

    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId);
    }

    toastTimeoutId = setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => {
        toast.hidden = true;
      }, 250);
    }, 4500);
  }
})();