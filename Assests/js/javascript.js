// --- Global Element Selectors ---
const header = document.querySelector('.top-nav'); // For scroll styling
const slides = document.querySelectorAll('.slide');
const taglineText = document.getElementById('tagline-text');
const menuToggle = document.getElementById('menuToggle'); 
const navLinks = document.querySelector('.nav-links'); 
const closeMenu = document.getElementById('closeMenu'); 
const viewServicesBtn = document.getElementById('viewServicesBtn');
const hiddenCardsContainer = document.querySelector('.hidden-cards');
const hiddenCards = hiddenCardsContainer ? hiddenCardsContainer.querySelectorAll('.service-card') : [];
const initialCardsContainer = document.querySelector('.initial-cards');
const initialCards = initialCardsContainer ? initialCardsContainer.querySelectorAll('.service-card') : []; 

// Exclude service-card elements from general animations (they get staggered animation)
const animatedElements = document.querySelectorAll('.animate-on-scroll:not(.service-card)'); 

// Project Slider Elements
const projectsGrid = document.getElementById('projectsGrid');
const prevProjectBtn = document.getElementById('prevProject');
const nextProjectBtn = document.getElementById('nextProject');


// --- Hero Slideshow Variables ---
const intervalTime = 3500; 
let currentSlideIndex = 0;
let slideInterval;

const imageUrls = [
    // Ensure these are working image URLs
    "https://i.pinimg.com/736x/3d/70/38/3d7038db30335c1da9cb84506ef06267.jpg", 
    "https://i.pinimg.com/1200x/d4/9c/1b/d49c1bcf62eac926ac2ccc6c3a99da31.jpg",
    "https://i.pinimg.com/1200x/0e/c0/a1/0ec0a1ec3153e6f0a29f47e7f4236ea2.jpg"
];

// --- Utility for Preloading Images ---
const preloadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
    });
};


// ======================================================
// Hero Slideshow Logic
// ======================================================

function nextSlide() {
    const currentSlide = slides[currentSlideIndex];

    currentSlide.classList.remove('active');
    taglineText.classList.remove('show');
    
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    const nextSlide = slides[currentSlideIndex];
    
    // Slight delay to allow the opacity transition to occur smoothly
    setTimeout(() => {
        taglineText.textContent = nextSlide.getAttribute('data-tagline');
        taglineText.classList.add('show');
    }, 500); 

    nextSlide.classList.add('active');
}

async function initializeHeroSlides() {
    const promises = [];
    
    slides.forEach((slide, index) => {
        if (imageUrls[index]) {
            slide.style.backgroundImage = `url('${imageUrls[index]}')`;
            promises.push(preloadImage(imageUrls[index]));
        }
    });

    // Wait for images to load before starting the timer
    await Promise.all(promises).catch(error => {
        console.error("One or more background images failed to load:", error);
    });
    
    if (slides.length > 0 && taglineText) {
        taglineText.textContent = slides[0].getAttribute('data-tagline');
        slides[0].classList.add('active'); 
        taglineText.classList.add('show');
        slideInterval = setInterval(nextSlide, intervalTime);
    }
}


// ======================================================
// Mobile Menu Toggle Logic
// ======================================================

function openSidebar() {
    if (navLinks) navLinks.classList.add('active');
}

function closeSidebar() {
    if (navLinks) navLinks.classList.remove('active');
}

// ======================================================
// Scroll Animation Logic 
// ======================================================

const generalScrollCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;

            // Check if the element is an initial service card (for staggered animation)
            if (target.closest('.services-grid') && target.classList.contains('service-card')) {
                const card = target; 
                const index = Array.from(initialCards).indexOf(card);
                
                if (!card.classList.contains('show-animate')) {
                    setTimeout(() => {
                        card.classList.add('show-animate');
                    }, index * 150);
                }
            } else {
                // Apply 'visible' class for simple slide/fade animations
                target.classList.add('visible');
            }
            
            observer.unobserve(target);
        }
    });
};

function setupScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        animatedElements.forEach(el => el.classList.add('visible'));
        initialCards.forEach(card => card.classList.add('show-animate'));
        return;
    }

    const observerOptions = {
        root: null, 
        rootMargin: '0px 0px -50px 0px', 
        threshold: 0.1 
    };

    const generalObserver = new IntersectionObserver(generalScrollCallback, observerOptions);
    
    // 1. Observe all standard animated elements
    animatedElements.forEach(element => {
        generalObserver.observe(element);
    });
    
    // 2. Explicitly observe the individual initial service cards for staggered effect
    initialCards.forEach(card => {
        generalObserver.observe(card);
    });
}

// ======================================================
// Load More Services Logic 
// ======================================================

function showMoreServices(event) {
    event.preventDefault();

    if (!hiddenCardsContainer || hiddenCards.length === 0) return;

    // 1. Show the hidden cards container and apply staggered animation
    hiddenCardsContainer.style.display = 'contents';

    hiddenCards.forEach((card, index) => {
        // Remove 'hidden' to allow it to be part of the grid layout
        card.classList.remove('hidden');

        // Apply staggered animation
        setTimeout(() => {
            card.classList.add('show-animate');
        }, index * 150); 
    });

    // 2. Hide the button after all cards are displayed
    viewServicesBtn.style.display = 'none';

    // 3. Scroll down slightly to view the new cards
    if (hiddenCards[0]) {
        const newCardsPosition = hiddenCards[0].getBoundingClientRect().top + window.scrollY - 100; 
        window.scrollTo({
            top: newCardsPosition,
            behavior: 'smooth'
        });
    }
}

// ======================================================
// Project Slider Logic 
// ======================================================
function setupProjectSlider() {
    if (!projectsGrid || !prevProjectBtn || !nextProjectBtn || projectsGrid.children.length === 0) return;

    const scrollCard = projectsGrid.querySelector('.project-card');
    if (!scrollCard) return;
    
    const gap = 30; 

    const calculateScrollAmount = () => {
        // Card width plus the gap
        const cardWidth = scrollCard.offsetWidth;
        return cardWidth + gap;
    }

    const handleScroll = (direction) => {
        const amount = calculateScrollAmount();
        const scrollDirection = direction === 'next' ? amount : -amount;
        
        projectsGrid.scrollBy({ left: scrollDirection, behavior: 'smooth' });
    };

    prevProjectBtn.addEventListener('click', () => handleScroll('prev'));
    nextProjectBtn.addEventListener('click', () => handleScroll('next'));
    
    const updateArrowVisibility = () => {
        // Calculate tolerance for checking ends
        const scrollTolerance = 5; 
        const isAtStart = projectsGrid.scrollLeft < scrollTolerance; 
        const isAtEnd = projectsGrid.scrollWidth - (projectsGrid.scrollLeft + projectsGrid.clientWidth) < scrollTolerance;

        // Adjust opacity for visual feedback
        prevProjectBtn.style.opacity = isAtStart ? 0.5 : 1;
        nextProjectBtn.style.opacity = isAtEnd ? 0.5 : 1;
        
        // Disable pointer events if at the end/start
        prevProjectBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
        nextProjectBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    };
    
    projectsGrid.addEventListener('scroll', updateArrowVisibility);
    // Initial check
    updateArrowVisibility();
}

// ======================================================
// FAQ Accordion Logic 
// ======================================================
function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other open items (single-open accordion)
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle the current item's state
            item.classList.toggle('active', !isActive);
            
            // Scroll the item into view when it opens
            if (!isActive) {
                setTimeout(() => {
                    const itemTop = item.getBoundingClientRect().top + window.scrollY;
                    window.scrollTo({
                        top: itemTop - 100, // Offset from the top
                        behavior: 'smooth'
                    });
                }, 50); 
            }
        });
    });
}

// ======================================================
// Scroll-based Header Styling (Shrink/Shadow)
// ======================================================
function handleHeaderScroll() {
    const scrollPosition = window.scrollY;
    // Activate 'scrolled' class after scrolling past 100px
    if (scrollPosition > 100) { 
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// ======================================================
// Initial Page Load & Event Listeners
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeHeroSlides();
    setupScrollAnimations(); 
    setupProjectSlider(); 
    setupFaqAccordion(); 
    
    // Header Scroll Listener
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Run immediately on load

    // Event listeners for the sidebar
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', openSidebar);
        closeMenu.addEventListener('click', closeSidebar); 

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    setTimeout(closeSidebar, 100); 
                }
            });
        });
    }

    // Event Listener for "Load More" button
    if (viewServicesBtn) {
        viewServicesBtn.addEventListener('click', showMoreServices);
    }
});
