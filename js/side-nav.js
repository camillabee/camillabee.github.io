/**
 * Side Navigation
 * Creates a dynamic side navigation from H2 and H3 elements
 * with scroll-based active state updates and expandable sections
 */

(function() {
    'use strict';

    // Generate a URL-friendly ID from text
    function generateId(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Build the navigation structure
    function buildNavigation() {
        const navList = document.getElementById('side-nav-list');
        if (!navList) return;

        // Clear existing navigation
        navList.innerHTML = '';

        // Find all H2 and H3 elements in main content
        const main = document.querySelector('main');
        if (!main) return;

        const headings = main.querySelectorAll('h2, h3');
        const navStructure = [];
        let currentH2 = null;

        headings.forEach((heading, index) => {
            // Skip H2s with sr-only class
            if (heading.tagName === 'H2' && heading.classList.contains('sr-only')) {
                return;
            }

            // Skip H3s that are inside special containers (like findings-title)
            if (heading.tagName === 'H3' && heading.classList.contains('findings-title')) {
                return;
            }

            if (heading.tagName === 'H3' && heading.classList.contains('features-title')) {
                return;
            }

            // Generate ID if it doesn't exist
            let id = heading.id;
            if (!id) {
                id = generateId(heading.textContent.trim());
                heading.id = id;
            }

            if (heading.tagName === 'H2') {
                // Create new H2 entry
                currentH2 = {
                    element: heading,
                    id: id,
                    text: heading.textContent.trim(),
                    children: []
                };
                navStructure.push(currentH2);
            } else if (heading.tagName === 'H3' && currentH2) {
                // Add H3 as child of current H2
                currentH2.children.push({
                    element: heading,
                    id: id,
                    text: heading.textContent.trim()
                });
            }
        });

        // Build the navigation HTML
        navStructure.forEach(h2Item => {
            const h2Li = document.createElement('li');
            h2Li.className = 'side-nav-item h2-item';
            
            const h2Link = document.createElement('a');
            h2Link.href = `#${h2Item.id}`;
            h2Link.className = 'side-nav-link';
            
            // Wrap text in a span to control flex behavior
            const textSpan = document.createElement('span');
            textSpan.textContent = h2Item.text;
            h2Link.appendChild(textSpan);
            
            // Add chevron if there are children
            if (h2Item.children.length > 0) {
                const chevron = document.createElement('i');
                chevron.className = 'bi bi-chevron-down side-nav-chevron';
                chevron.setAttribute('aria-hidden', 'true');
                h2Link.appendChild(chevron);
                
                // Create submenu
                const submenu = document.createElement('ul');
                submenu.className = 'side-nav-submenu';
                
                h2Item.children.forEach(h3Item => {
                    const h3Li = document.createElement('li');
                    h3Li.className = 'side-nav-item h3-item';
                    
                    const h3Link = document.createElement('a');
                    h3Link.href = `#${h3Item.id}`;
                    h3Link.className = 'side-nav-link';
                    h3Link.textContent = h3Item.text;
                    
                    h3Li.appendChild(h3Link);
                    submenu.appendChild(h3Li);
                });
                
                h2Li.appendChild(h2Link);
                h2Li.appendChild(submenu);
            } else {
                h2Li.appendChild(h2Link);
            }
            
            navList.appendChild(h2Li);
        });
    }

    // Get the currently visible section
    function getCurrentSection() {
        const headings = document.querySelectorAll('main h2[id], main h3[id]');
        let currentSection = null;
        const scrollPosition = window.scrollY + 150; // Offset for better UX

        for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i];
            const rect = heading.getBoundingClientRect();
            const top = rect.top + window.scrollY;

            if (top <= scrollPosition) {
                currentSection = heading.id;
                break;
            }
        }

        return currentSection;
    }

    // Update active state
    function updateActiveState() {
        const currentSection = getCurrentSection();
        if (!currentSection) return;

        // Remove all active states
        document.querySelectorAll('.side-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active state to current section
        const activeLink = document.querySelector(`.side-nav-link[href="#${currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            
            // Expand parent H2 if this is an H3
            const h3Item = activeLink.closest('.h3-item');
            if (h3Item) {
                const h2Item = h3Item.closest('.h2-item');
                if (h2Item) {
                    expandSection(h2Item);
                }
            } else {
                // If it's an H2, expand it
                const h2Item = activeLink.closest('.h2-item');
                if (h2Item && h2Item.querySelector('.side-nav-submenu')) {
                    expandSection(h2Item);
                }
            }
        }

        // Collapse sections that aren't active
        collapseInactiveSections(currentSection);
    }

    // Expand a section
    function expandSection(h2Item) {
        h2Item.classList.add('expanded');
    }

    // Collapse inactive sections
    function collapseInactiveSections(currentSection) {
        const allH2Items = document.querySelectorAll('.side-nav-item.h2-item');
        allH2Items.forEach(h2Item => {
            // Don't collapse if it was manually toggled recently
            if (h2Item.getAttribute('data-manual-toggle') === 'true') {
                return;
            }
            
            const link = h2Item.querySelector('.side-nav-link');
            const submenu = h2Item.querySelector('.side-nav-submenu');
            
            if (!submenu) return;
            
            // Check if this section contains the active link
            const activeLink = submenu.querySelector('.side-nav-link.active');
            const h2Link = h2Item.querySelector('.side-nav-link');
            const isH2Active = h2Link && h2Link.classList.contains('active');
            
            if (!activeLink && !isH2Active) {
                h2Item.classList.remove('expanded');
            }
        });
    }

    // Smooth scroll to section
    function scrollToSection(e) {
        e.preventDefault();
        const targetId = e.target.closest('.side-nav-link').getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const offset = 120; // Account for navbar
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update active state after scroll
            setTimeout(updateActiveState, 100);
        }
    }

    // Toggle mobile navigation
    function toggleMobileNav() {
        const sideNav = document.getElementById('side-nav');
        if (sideNav) {
            sideNav.classList.toggle('open');
        }
    }

    // Initialize
    function init() {
        // Only run if side nav exists
        const navList = document.getElementById('side-nav-list');
        if (!navList) return;

        // Build navigation
        buildNavigation();

        // Add click handlers using event delegation
        if (navList) {
            navList.addEventListener('click', function(e) {
                // Check if chevron was clicked (the <i> element itself or its parent)
                const chevron = e.target.closest('.side-nav-chevron');
                if (chevron) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    // Toggle expanded state
                    const h2Item = chevron.closest('.h2-item');
                    if (h2Item) {
                        // Temporarily disable auto-collapse to allow manual toggle
                        h2Item.classList.toggle('expanded');
                        // Mark as manually toggled to prevent auto-collapse
                        h2Item.setAttribute('data-manual-toggle', 'true');
                        // Clear the flag after a short delay so scroll can still manage it
                        setTimeout(() => {
                            h2Item.removeAttribute('data-manual-toggle');
                        }, 1000);
                    }
                    return false;
                }
                
                // Check if clicking on the text span or the link itself (but not the chevron)
                const clickedLink = e.target.closest('.side-nav-link');
                if (clickedLink && !e.target.closest('.side-nav-chevron')) {
                    scrollToSection(e);
                    // Close mobile nav after clicking
                    if (window.innerWidth < 768) {
                        const sideNav = document.getElementById('side-nav');
                        if (sideNav) {
                            sideNav.classList.remove('open');
                        }
                    }
                }
            }, true); // Use capture phase to catch events earlier
        }

        // Mobile toggle
        const toggle = document.getElementById('side-nav-toggle');
        if (toggle) {
            toggle.addEventListener('click', toggleMobileNav);
        }

        // Close side nav when clicking outside
        document.addEventListener('click', function(e) {
            const sideNav = document.getElementById('side-nav');
            if (!sideNav) return;
            
            // Only handle on mobile/tablet where side nav can be toggled
            if (window.innerWidth <= 1023) {
                const isSideNavOpen = sideNav.classList.contains('open');
                if (isSideNavOpen) {
                    // Check if click is outside side nav and toggle button
                    const clickedInsideSideNav = sideNav.contains(e.target);
                    const clickedOnToggle = toggle && (toggle.contains(e.target) || e.target === toggle);
                    
                    if (!clickedInsideSideNav && !clickedOnToggle) {
                        sideNav.classList.remove('open');
                    }
                }
            }
        });

        // Close navbar collapse menu when clicking outside (on mobile)
        document.addEventListener('click', function(e) {
            // Only handle on mobile where navbar collapse menu is used
            if (window.innerWidth < 768) {
                const navbar = document.querySelector('.custom-navbar');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                const navbarToggler = document.querySelector('.navbar-toggler');
                
                // Check if navbar collapse is open (has 'show' class)
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    // Check if click is outside navbar and toggler button
                    const clickedInsideNavbar = navbar && navbar.contains(e.target);
                    const clickedOnToggler = navbarToggler && (navbarToggler.contains(e.target) || e.target === navbarToggler);
                    
                    if (!clickedInsideNavbar && !clickedOnToggler) {
                        // Close the navbar collapse menu using Bootstrap's collapse API
                        if (window.bootstrap && navbarToggler) {
                            const collapseInstance = bootstrap.Collapse.getInstance(navbarCollapse);
                            if (collapseInstance) {
                                collapseInstance.hide();
                            } else {
                                // Fallback: manually remove show class
                                navbarCollapse.classList.remove('show');
                                if (navbarToggler) {
                                    navbarToggler.setAttribute('aria-expanded', 'false');
                                }
                            }
                        } else {
                            // Fallback: manually remove show class
                            navbarCollapse.classList.remove('show');
                            if (navbarToggler) {
                                navbarToggler.setAttribute('aria-expanded', 'false');
                            }
                        }
                    }
                }
            }
        });

        // Update active state on scroll
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateActiveState, 50);
        });

        // Initial active state
        updateActiveState();

        // Update on resize (for mobile/desktop switching)
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 768) {
                const sideNav = document.getElementById('side-nav');
                if (sideNav) {
                    sideNav.classList.remove('open');
                }
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
