/**
 * QUILLA TATTOO CUSCO — Microdemo Script
 * Funcionalidades: nav scroll, mobile menu, language toggle, banner close
 */

// ============================================
// DEMO BANNER
// ============================================
function closeBanner() {
    const banner = document.getElementById('demoBanner');
    if (banner) {
        banner.classList.add('hidden');
        // Adjust nav position after banner closes
        setTimeout(() => {
            const nav = document.getElementById('navbar');
            if (nav) {
                nav.style.top = '0';
            }
        }, 350);
        localStorage.setItem('quillaDemoBannerClosed', 'true');
    }
}

// Check if banner was previously closed
(function checkBannerState() {
    if (localStorage.getItem('quillaDemoBannerClosed') === 'true') {
        const banner = document.getElementById('demoBanner');
        const nav = document.getElementById('navbar');
        if (banner) {
            banner.classList.add('hidden');
        }
        if (nav) {
            nav.style.top = '0';
        }
    }
})();

// ============================================
// NAVIGATION SCROLL EFFECT
// ============================================
(function initNavScroll() {
    const nav = document.getElementById('navbar');
    const banner = document.getElementById('demoBanner');
    
    if (!nav) return;

    function handleScroll() {
        const scrollY = window.scrollY;
        const isBannerVisible = banner && !banner.classList.contains('hidden');
        const threshold = isBannerVisible ? 100 : 60;

        if (scrollY > threshold) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
})();

// ============================================
// MOBILE MENU TOGGLE
// ============================================
(function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function() {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    const links = menu.querySelectorAll('a');
    links.forEach(function(link) {
        link.addEventListener('click', function() {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
})();

// ============================================
// LANGUAGE TOGGLE
// ============================================
const QuillaLang = {
    current: 'en',
    
    elements: [],
    
    init() {
        // Collect all bilingual elements
        this.elements = document.querySelectorAll('[data-es]');
        
        // Pre-save original HTML for elements with formatting-only tags (e.g., <br>)
        this.elements.forEach(el => {
            if (!el.dataset.enHtml && el.children.length > 0) {
                const formattingOnlyTags = ['br', 'wbr'];
                const hasOnlyFormattingChildren = Array.from(el.children).every(child => {
                    return formattingOnlyTags.includes(child.tagName.toLowerCase());
                });
                if (hasOnlyFormattingChildren) {
                    el.dataset.enHtml = el.innerHTML;
                }
            }
        });
        
        // Check saved preference
        const saved = localStorage.getItem('quillaLang');
        if (saved === 'es') {
            this.set('es');
        }
    },
    
    set(lang) {
        this.current = lang;
        
        // Update toggle buttons
        document.querySelectorAll('.lang-toggle__btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // Update all bilingual elements
        this.elements.forEach(el => {
            const esText = el.dataset.es;
            if (!esText) return;
            
            if (lang === 'es') {
                // Store original EN text if not stored
                if (!el.dataset.en) {
                    el.dataset.en = el.textContent.trim();
                }
                // Store original EN HTML for elements with formatting-only tags (e.g., <br>)
                if (!el.dataset.enHtml && el.children.length > 0) {
                    const formattingOnlyTags = ['br', 'wbr'];
                    const hasOnlyFormattingChildren = Array.from(el.children).every(child => {
                        return formattingOnlyTags.includes(child.tagName.toLowerCase());
                    });
                    if (hasOnlyFormattingChildren) {
                        el.dataset.enHtml = el.innerHTML;
                    }
                }
                // Only update if element has no child elements (simple text)
                if (el.children.length === 0) {
                    el.textContent = esText;
                } else {
                    // For elements with children, find the text node
                    this.updateElementText(el, esText);
                }
            } else {
                // Restore EN text
                if (el.dataset.en) {
                    if (el.children.length === 0) {
                        el.textContent = el.dataset.en;
                    } else {
                        this.updateElementText(el, el.dataset.en, true);
                    }
                }
            }
        });
        
        // Save preference
        localStorage.setItem('quillaLang', lang);
        
        // Update HTML lang attribute
        document.documentElement.lang = lang === 'es' ? 'es' : 'en';
        
        // Update note visibility
        this.updateNotes();
    },
    
    updateElementText(el, text, isRestore = false) {
        // For elements with simple structure (like headings with no children)
        if (el.children.length === 0) {
            el.textContent = text;
            return;
        }
        
        // Check if element only contains formatting-only tags like <br>
        const formattingOnlyTags = ['br', 'wbr'];
        const hasOnlyFormattingChildren = Array.from(el.children).every(child => {
            return formattingOnlyTags.includes(child.tagName.toLowerCase());
        });
        
        if (hasOnlyFormattingChildren) {
            // On restore, use original HTML to preserve <br> tags
            if (isRestore && el.dataset.enHtml) {
                el.innerHTML = el.dataset.enHtml;
            } else {
                // Replace everything with just the translated text
                el.textContent = text;
            }
            return;
        }
        
        // For elements with meaningful child elements, remove all text nodes
        // and add the new text at the beginning
        Array.from(el.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                el.removeChild(node);
            }
        });
        
        if (el.firstChild) {
            el.insertBefore(document.createTextNode(text), el.firstChild);
        } else {
            el.textContent = text;
        }
    },
    
    updateNotes() {
        const heroNote = document.querySelector('.hero__note-es');
        const heroNoteDefault = document.querySelector('.hero__note > span:nth-child(2)');
        
        if (this.current === 'es') {
            if (heroNote) heroNote.style.display = 'inline';
            if (heroNoteDefault) heroNoteDefault.style.display = 'none';
        } else {
            if (heroNote) heroNote.style.display = 'none';
            if (heroNoteDefault) heroNoteDefault.style.display = 'inline';
        }
    },
    
    toggle() {
        this.set(this.current === 'en' ? 'es' : 'en');
    }
};

function setLang(lang) {
    QuillaLang.set(lang);
}

// Initialize language system
document.addEventListener('DOMContentLoaded', function() {
    QuillaLang.init();
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const nav = document.getElementById('navbar');
                const navHeight = nav ? nav.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
})();

// ============================================
// SCROLL REVEAL ANIMATION
// ============================================
(function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.about-card, .service-card, .aftercare-card, .review-card, .portfolio__item'
    );
    
    if (!revealElements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });
    
    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s`;
        observer.observe(el);
    });
})();

// ============================================
// NAVBAR HEIGHT COMPENSATION
// ============================================
(function initNavOffset() {
    function setNavOffset() {
        const nav = document.getElementById('navbar');
        if (nav) {
            const navHeight = nav.offsetHeight;
            document.documentElement.style.setProperty('--nav-height', navHeight + 'px');
        }
    }
    
    setNavOffset();
    window.addEventListener('resize', setNavOffset);
})();
