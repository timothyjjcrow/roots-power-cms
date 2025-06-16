// ===== GLOBAL VARIABLES =====
let navbar = null;
let navToggle = null;
let navMenu = null;
let backToTopBtn = null;
let contactForm = null;
let isScrolling = false;

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", function () {
  initializeElements();
  setupEventListeners();
  initializeAnimations();
  setupFormHandling();
  initializeIntersectionObserver();
});

// ===== ELEMENT INITIALIZATION =====
function initializeElements() {
  navbar = document.getElementById("navbar");
  navToggle = document.getElementById("nav-toggle");
  navMenu = document.getElementById("nav-menu");
  backToTopBtn = document.getElementById("backToTop");
  contactForm = document.getElementById("contact-form");
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Window events
  window.addEventListener("scroll", throttle(handleScroll, 16));
  window.addEventListener("resize", debounce(handleResize, 250));
  window.addEventListener("load", handlePageLoad);

  // Navigation events
  if (navToggle) {
    navToggle.addEventListener("click", toggleMobileMenu);
  }

  // Close mobile menu when clicking nav links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Back to top button
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", scrollToTop);
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", handleSmoothScroll);
  });

  // Service card interactions
  setupServiceCardInteractions();

  // Project card interactions
  setupProjectCardInteractions();

  // Form enhancements
  setupFormEnhancements();
}

// ===== SCROLL HANDLING =====
function handleScroll() {
  if (isScrolling) return;

  isScrolling = true;
  requestAnimationFrame(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Update navbar
    updateNavbar(scrollTop);

    // Update back to top button
    updateBackToTopButton(scrollTop);

    // Update scroll indicator
    updateScrollIndicator(scrollTop);

    isScrolling = false;
  });
}

function updateNavbar(scrollTop) {
  if (!navbar) return;

  if (scrollTop > 100) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

function updateBackToTopButton(scrollTop) {
  if (!backToTopBtn) return;

  if (scrollTop > 300) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
}

function updateScrollIndicator(scrollTop) {
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (!scrollIndicator) return;

  if (scrollTop > 200) {
    scrollIndicator.style.opacity = "0";
  } else {
    scrollIndicator.style.opacity = "1";
  }
}

// ===== MOBILE NAVIGATION =====
function toggleMobileMenu() {
  if (!navToggle || !navMenu) return;

  navToggle.classList.toggle("active");
  navMenu.classList.toggle("active");

  // Prevent body scroll when menu is open
  document.body.style.overflow = navMenu.classList.contains("active")
    ? "hidden"
    : "";
}

function closeMobileMenu() {
  if (!navToggle || !navMenu) return;

  navToggle.classList.remove("active");
  navMenu.classList.remove("active");
  document.body.style.overflow = "";
}

// ===== SMOOTH SCROLLING =====
function handleSmoothScroll(e) {
  e.preventDefault();

  const targetId = this.getAttribute("href");
  const targetElement = document.querySelector(targetId);

  if (targetElement) {
    const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar

    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });

    // Close mobile menu if open
    closeMobileMenu();
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// ===== SERVICE CARD INTERACTIONS =====
function setupServiceCardInteractions() {
  const serviceCards = document.querySelectorAll(".service-card");

  serviceCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });

    // Add touch interactions for mobile
    card.addEventListener("touchstart", function () {
      this.style.transform = "translateY(-4px) scale(1.01)";
    });

    card.addEventListener("touchend", function () {
      setTimeout(() => {
        this.style.transform = "translateY(0) scale(1)";
      }, 150);
    });
  });
}

// ===== PROJECT CARD INTERACTIONS =====
function setupProjectCardInteractions() {
  const projectCards = document.querySelectorAll(".project-card");

  projectCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      const image = this.querySelector(".project-image img");
      if (image) {
        image.style.transform = "scale(1.1)";
      }
    });

    card.addEventListener("mouseleave", function () {
      const image = this.querySelector(".project-image img");
      if (image) {
        image.style.transform = "scale(1)";
      }
    });
  });
}

// ===== FORM HANDLING =====
function setupFormHandling() {
  if (!contactForm) return;

  contactForm.addEventListener("submit", handleFormSubmit);
}

function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const submitButton = contactForm.querySelector(".form-submit");
  const originalText = submitButton.innerHTML;

  // Show loading state
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitButton.disabled = true;

  // Simulate form submission (replace with actual form handling)
  fetch(contactForm.action || "/", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        showSuccessMessage();
        contactForm.reset();
      } else {
        throw new Error("Form submission failed");
      }
    })
    .catch((error) => {
      console.error("Form submission error:", error);
      showErrorMessage();
    })
    .finally(() => {
      // Restore button state
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    });
}

function showSuccessMessage() {
  const message = createMessage(
    "success",
    "Thank you! Your message has been sent successfully. We'll get back to you soon."
  );
  showMessage(message);
}

function showErrorMessage() {
  const message = createMessage(
    "error",
    "Sorry, there was an error sending your message. Please try again or contact us directly."
  );
  showMessage(message);
}

function createMessage(type, text) {
  const message = document.createElement("div");
  message.className = `form-message form-message-${type}`;
  message.innerHTML = `
        <i class="fas fa-${
          type === "success" ? "check-circle" : "exclamation-triangle"
        }"></i>
        <span>${text}</span>
        <button class="message-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
  return message;
}

function showMessage(message) {
  const form = document.querySelector(".contact-form");
  form.insertBefore(message, form.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (message.parentElement) {
      message.remove();
    }
  }, 5000);
}

// ===== FORM ENHANCEMENTS =====
function setupFormEnhancements() {
  // Add floating labels
  const inputs = document.querySelectorAll(
    ".form-group input, .form-group textarea, .form-group select"
  );

  inputs.forEach((input) => {
    // Add focus/blur animations
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", function () {
      if (!this.value) {
        this.parentElement.classList.remove("focused");
      }
    });

    // Check if input has value on load
    if (input.value) {
      input.parentElement.classList.add("focused");
    }
  });

  // Add real-time validation
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.addEventListener("input", validateEmail);
  }

  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", formatPhoneNumber);
  }
}

function validateEmail() {
  const email = this.value;
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  this.classList.toggle("valid", isValid && email.length > 0);
  this.classList.toggle("invalid", !isValid && email.length > 0);
}

function formatPhoneNumber() {
  let value = this.value.replace(/\D/g, "");

  if (value.length >= 6) {
    value = value.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  } else if (value.length >= 3) {
    value = value.replace(/(\d{3})(\d{0,3})/, "($1) $2");
  }

  this.value = value;
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
function initializeIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(
    handleIntersection,
    observerOptions
  );

  // Observe elements for animations
  const animatedElements = document.querySelectorAll(
    ".service-card, .project-card, .feature-item, .about-content, .contact-content"
  );

  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    observer.observe(el);
  });
}

function handleIntersection(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.transition =
        "opacity 0.6s ease-out, transform 0.6s ease-out";
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}

// ===== ANIMATIONS =====
function initializeAnimations() {
  // Add stagger animations to service cards
  const serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });

  // Add stagger animations to project cards
  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });

  // Add parallax effect to hero section
  setupParallaxEffect();
}

function setupParallaxEffect() {
  // Parallax effect removed to prevent scroll lag on hero section
  // The hero section now has optimal performance
  return;
}

// ===== UTILITY FUNCTIONS =====
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// ===== RESIZE HANDLING =====
function handleResize() {
  // Close mobile menu on resize to desktop
  if (window.innerWidth > 768) {
    closeMobileMenu();
  }

  // Recalculate any position-dependent elements
  updateLayoutOnResize();
}

function updateLayoutOnResize() {
  // Layout updates optimized for performance
  // Hero section uses CSS viewport units for sizing
  return;
}

// ===== PAGE LOAD HANDLING =====
function handlePageLoad() {
  // Hide loading spinner if exists
  const loader = document.querySelector(".loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 500);
  }

  // Trigger initial animations
  document.body.classList.add("loaded");

  // Initialize any lazy loading
  initializeLazyLoading();
}

// ===== LAZY LOADING =====
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener("keydown", function (e) {
  // Handle escape key to close mobile menu
  if (e.key === "Escape") {
    closeMobileMenu();
  }

  // Handle tab navigation improvements
  if (e.key === "Tab") {
    document.body.classList.add("keyboard-navigation");
  }
});

// Remove keyboard navigation class on mouse use
document.addEventListener("mousedown", function () {
  document.body.classList.remove("keyboard-navigation");
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Preload critical images
function preloadCriticalImages() {
  const criticalImages = [
    "./logo/navbar logo.jpg",
    "./logo/RootsPowerColorStacked_BLK_SM_HQ.jpg",
  ];

  criticalImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

// Call preload on page load
document.addEventListener("DOMContentLoaded", preloadCriticalImages);

// ===== ERROR HANDLING =====
window.addEventListener("error", function (e) {
  console.error("JavaScript error:", e.error);
  // Could implement error reporting here
});

// ===== SERVICE WORKER REGISTRATION (if needed for PWA) =====
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    // Uncomment if you add a service worker
    // navigator.serviceWorker.register('/sw.js')
    //     .then(registration => console.log('SW registered'))
    //     .catch(error => console.log('SW registration failed'));
  });
}
