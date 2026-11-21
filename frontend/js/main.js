
"use strict";

/* ==========================================
   BIVANGSU SINHA — PERSONAL ARCHIVE
   Main JavaScript
   Security-hardened edition
========================================== */

/* ==========================================
   01. DOM ELEMENTS
========================================== */

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");
const siteHeader = document.getElementById("site-header");
const footer = document.getElementById("site-footer");

/* ==========================================
   02. MOBILE NAVIGATION
========================================== */

function closeMobileMenu() {
  if (!menuToggle || !navLinks) return;

  navLinks.classList.remove("active");

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  // Close the menu after navigation.
  if (siteHeader) {
    siteHeader.querySelectorAll(".nav-links a, .nav-contact").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  // Close the menu when Escape is pressed.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("active")) {
      closeMobileMenu();
      menuToggle.focus();
    }
  });

  // Reset mobile navigation when returning to desktop width.
  const desktopMediaQuery = window.matchMedia("(min-width: 769px)");

  desktopMediaQuery.addEventListener("change", (event) => {
    if (event.matches) {
      closeMobileMenu();
    }
  });
}

/* ==========================================
   03. CURRENT YEAR
========================================== */

if (footer) {
  const currentYear = new Date().getFullYear();

  const footerParagraph = document.createElement("p");

  footerParagraph.textContent =
    `© ${currentYear} Bivangsu Sinha. ` +
    "Built with curiosity and questionable sleep schedules.";

  // Replace existing footer content safely.
  footer.replaceChildren(footerParagraph);
}

/* ==========================================
   04. ACTIVE NAVIGATION
========================================== */

const sections = document.querySelectorAll("main section[id]");
const navigationLinks = document.querySelectorAll(".nav-links a");

if (
  "IntersectionObserver" in window &&
  sections.length > 0 &&
  navigationLinks.length > 0
) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navigationLinks.forEach((link) => {
          const isActive =
            link.getAttribute("href") === `#${entry.target.id}`;

          link.classList.toggle("active", isActive);
        });
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}

/* ==========================================
   05. CONSOLE SIGNATURE
========================================== */

console.log(
  "%cBivangsu Sinha — Personal Archive",
  "color: #c6a87c; font-size: 16px; font-weight: bold;"
);

console.log(
  "%cLive. Laugh. Love. Learn. Let Go.",
  "color: #92918c; font-style: italic;"
);
