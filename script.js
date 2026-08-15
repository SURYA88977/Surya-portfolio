/* =====================================================================
   Surya's portfolio — scroll & animation behaviours
   Everything here is additive: if JS fails to load the site still works,
   it just loses the extra motion.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    /* -------------------------------------------------------------
         1. Reveal-on-scroll for any element with .reveal-on-scroll
         ------------------------------------------------------------- */
    const revealTargets = document.querySelectorAll(".reveal-on-scroll");

    if (revealTargets.length) {
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            revealTargets.forEach((el) => el.classList.add("is-revealed"));
        } else {
            const revealObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-revealed");
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.15,
                    rootMargin: "0px 0px -60px 0px",
                },
            );

            revealTargets.forEach((el) => revealObserver.observe(el));
        }
    }

    /* -------------------------------------------------------------
         3. Sticky navbar shrink/shadow once the page has scrolled
         ------------------------------------------------------------- */
    const navbar = document.querySelector(".site-navbar");

    const updateNavbarState = () => {
        if (!navbar) return;
        navbar.classList.toggle("navbar-scrolled", window.scrollY > 40);
    };

    /* -------------------------------------------------------------
         4. Back-to-top button visibility + click handler
         ------------------------------------------------------------- */
    const backToTopButton = document.getElementById("backToTopButton");

    const updateBackToTopVisibility = () => {
        if (!backToTopButton) return;
        backToTopButton.classList.toggle("is-visible", window.scrollY > 500);
    };

    if (backToTopButton) {
        backToTopButton.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? "auto" : "smooth",
            });
        });
    }

    /* -------------------------------------------------------------
         5. Scroll-spy: highlight the current section's nav link
         ------------------------------------------------------------- */
    const sections = document.querySelectorAll("main section[id], footer[id]");
    const desktopNavLinks = document.querySelectorAll(".navbar-links-list a");

    const setActiveNavLink = (id) => {
        desktopNavLinks.forEach((link) => {
            const matches = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("nav-link-active", matches);
        });
    };

    if (sections.length && "IntersectionObserver" in window) {
        const spyObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveNavLink(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-45% 0px -45% 0px",
                threshold: 0,
            },
        );

        sections.forEach((section) => spyObserver.observe(section));
    }

    /* -------------------------------------------------------------
         6. Count-up animation for the stats strip (5+ Projects, etc.)
         ------------------------------------------------------------- */
    const countTargets = document.querySelectorAll("[data-count-target]");

    const animateCount = (el) => {
        const target = parseInt(el.getAttribute("data-count-target"), 10);
        const suffix = el.getAttribute("data-count-suffix") || "";

        if (!target || prefersReducedMotion) {
            el.textContent = target ? target + suffix : el.textContent;
            return;
        }

        const duration = 900;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased);
            el.textContent = value + suffix;
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target + suffix;
            }
        };

        requestAnimationFrame(tick);
    };

    if (countTargets.length && "IntersectionObserver" in window) {
        const countObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.6 },
        );

        countTargets.forEach((el) => countObserver.observe(el));
    }

    /* -------------------------------------------------------------
         7. Auto-close the mobile menu when a link inside it is tapped
         ------------------------------------------------------------- */
    const mobileMenuCheckbox = document.getElementById("mobile-menu-input");
    const mobileNavLinks = document.querySelectorAll(
        ".mobile-nav-links-list a, .mobile-nav-connect-button",
    );

    mobileNavLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (mobileMenuCheckbox) mobileMenuCheckbox.checked = false;
        });
    });

    /* -------------------------------------------------------------
         Single scroll listener driving progress bar, navbar and
         back-to-top state, throttled with requestAnimationFrame.
         ------------------------------------------------------------- */
    let scrollTicking = false;

    const onScroll = () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                updateScrollProgress();
                updateNavbarState();
                updateBackToTopVisibility();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Run once on load so the initial state (e.g. a mid-page refresh) is correct.
    updateScrollProgress();
    updateNavbarState();
    updateBackToTopVisibility();
});
