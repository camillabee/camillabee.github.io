/**
 * Component Loader
 * Loads reusable components (navbar, footer) into pages
 */

async function loadComponent(componentName, targetElementId) {
	try {
		const response = await fetch(`components/${componentName}.html`);
		if (!response.ok) {
			throw new Error(`Failed to load ${componentName}: ${response.statusText}`);
		}
		const html = await response.text();
		const targetElement = document.getElementById(targetElementId);
		if (targetElement) {
			targetElement.innerHTML = html;
			
			// Set active states for navbar
			if (componentName === 'navbar') {
				// Use setTimeout to ensure DOM is fully updated
				setTimeout(() => {
					setActiveNavItem();
				}, 0);
			}
			
			// Re-initialize Bootstrap components after loading
			// Wait for Bootstrap to be available
			if (window.bootstrap) {
				// Initialize dropdowns
				const dropdowns = targetElement.querySelectorAll('.dropdown-toggle');
				dropdowns.forEach(dropdown => {
					// Only initialize if not already initialized
					if (!bootstrap.Dropdown.getInstance(dropdown)) {
						new bootstrap.Dropdown(dropdown);
					}
				});
			}
		} else {
			console.error(`Target element #${targetElementId} not found`);
		}
	} catch (error) {
		console.error(`Error loading component ${componentName}:`, error);
	}
}

/**
 * Set active state for navbar items based on current page
 */
function setActiveNavItem() {
	// Get current page filename
	let currentPage = window.location.pathname.split('/').pop();
	
	// Handle root/index case
	if (!currentPage || currentPage === '' || currentPage.endsWith('/')) {
		currentPage = 'index.html';
	}
	
	// Normalize to handle cases where path might include directory
	if (!currentPage.includes('.html')) {
		currentPage = currentPage || 'index.html';
	}
	
	// Handle main nav links (Home, About)
	const navLinks = document.querySelectorAll('.custom-navbar .nav-link');
	navLinks.forEach(link => {
		const href = link.getAttribute('href');
		if (href && !href.startsWith('http') && !href.startsWith('#')) {
			// Extract filename from href
			const linkPage = href.split('/').pop();
			// Check if this link matches current page
			if (linkPage === currentPage || 
				(linkPage === 'index.html' && currentPage === 'index.html') ||
				(linkPage === '' && currentPage === 'index.html')) {
				link.classList.add('active');
			}
		}
	});
	
	// Handle project dropdown items
	const projectPages = ['iu-mobile.html', 'building-a-mind.html', 'cloud9.html'];
	if (projectPages.includes(currentPage)) {
		// Mark the Projects dropdown toggle as active
		// Query from document to ensure we find it after DOM update
		const projectsToggle = document.querySelector('#projectsDropdown') ||
		                       document.querySelector('.custom-dropdown-toggle') ||
		                       document.querySelector('.nav-link.dropdown-toggle');
		if (projectsToggle) {
			projectsToggle.classList.add('active');
		} else {
			console.warn('Projects toggle not found. Current page:', currentPage);
		}
		
		// Mark the specific project dropdown item as active
		const dropdownItems = document.querySelectorAll('.custom-navbar .dropdown-item');
		dropdownItems.forEach(item => {
			const href = item.getAttribute('href');
			if (href) {
				const itemPage = href.split('/').pop();
				if (itemPage === currentPage) {
					item.classList.add('active');
				}
			}
		});

		// On mobile, open the dropdown by default when on a project page
		// Check if we're on mobile (window width < 768px)
		if (window.innerWidth < 768) {
			const dropdownMenu = document.querySelector('.custom-navbar .custom-dropdown-menu');
			const dropdownNavItem = document.querySelector('.custom-navbar .nav-item.dropdown');
			if (dropdownMenu && dropdownNavItem) {
				// Add 'show' class to both the nav-item and the dropdown-menu for Bootstrap
				dropdownNavItem.classList.add('show');
				dropdownMenu.classList.add('show');
			}
		}
	}
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
	// Load components in parallel
	Promise.all([
		loadComponent('navbar', 'navbar-container'),
		loadComponent('footer', 'footer-container')
	]).then(() => {
		// Ensure Bootstrap is initialized after components are loaded
		// This handles cases where Bootstrap loads after components
		if (window.bootstrap) {
			const dropdowns = document.querySelectorAll('.dropdown-toggle');
			dropdowns.forEach(dropdown => {
				if (!bootstrap.Dropdown.getInstance(dropdown)) {
					new bootstrap.Dropdown(dropdown);
				}
			});
		}
	});
});

