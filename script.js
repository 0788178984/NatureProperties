document.addEventListener('DOMContentLoaded', function() {
    // Throttle function for performance optimization
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Debounce function for performance optimization
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    // Handle window resize with debouncing
    const handleResize = debounce(function() {
        if (window.innerWidth > 992) {
            if (navLinks) navLinks.style.display = 'flex';
        } else {
            if (navLinks) navLinks.style.display = 'none';
        }
    }, 250);
    
    window.addEventListener('resize', handleResize);

    // Preload background images for hero slider (optimized)
    function preloadBackgroundImages() {
        const slides = document.querySelectorAll('.slide[data-bg-loaded="false"]');
        slides.forEach((slide, index) => {
            const bgImageUrl = slide.getAttribute('data-bg-image');
            if (bgImageUrl) {
                const img = new Image();
                img.onload = function() {
                    slide.style.backgroundImage = `url('${bgImageUrl}')`;
                    slide.setAttribute('data-bg-loaded', 'true');
                    // Remove will-change after image loads to save memory
                    setTimeout(() => {
                        slide.style.willChange = 'auto';
                    }, 1000);
                };
                img.onerror = function() {
                    console.warn('Failed to load background image:', bgImageUrl);
                };
                // Start loading
                img.src = bgImageUrl;
            }
        });
    }

    // Hero Slider
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-controls .prev');
    const nextBtn = document.querySelector('.slider-controls .next');
    let currentSlide = 0;

    // Preload first slide immediately, others after page load
    if (slides.length > 0) {
        preloadBackgroundImages();
    }

    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Show the current slide
        const currentSlide = slides[index];
        currentSlide.classList.add('active');
        
        // Ensure current slide background is loaded
        if (currentSlide.getAttribute('data-bg-loaded') === 'false') {
            const bgImageUrl = currentSlide.getAttribute('data-bg-image');
            if (bgImageUrl) {
                const img = new Image();
                img.onload = function() {
                    currentSlide.style.backgroundImage = `url('${bgImageUrl}')`;
                    currentSlide.setAttribute('data-bg-loaded', 'true');
                };
                img.src = bgImageUrl;
            }
        }
        
        // Preload next slide background if not loaded
        const nextIndex = (index + 1) % slides.length;
        const nextSlide = slides[nextIndex];
        if (nextSlide && nextSlide.getAttribute('data-bg-loaded') === 'false') {
            const bgImageUrl = nextSlide.getAttribute('data-bg-image');
            if (bgImageUrl) {
                const img = new Image();
                img.onload = function() {
                    nextSlide.style.backgroundImage = `url('${bgImageUrl}')`;
                    nextSlide.setAttribute('data-bg-loaded', 'true');
                };
                img.src = bgImageUrl;
            }
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    // Auto slide every 5 seconds (only if slides exist)
    let slideInterval = null;
    if (slides.length > 0) {
        slideInterval = setInterval(nextSlide, 5000);

        // Pause auto slide on hover
        const slider = document.querySelector('.slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => {
                if (slideInterval) {
                    clearInterval(slideInterval);
                    slideInterval = null;
                }
            });

            slider.addEventListener('mouseleave', () => {
                if (!slideInterval) {
                    slideInterval = setInterval(nextSlide, 5000);
                }
            });
        }

        // Navigation controls
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                if (slideInterval) {
                    clearInterval(slideInterval);
                }
                slideInterval = setInterval(nextSlide, 5000);
            });

            nextBtn.addEventListener('click', () => {
                nextSlide();
                if (slideInterval) {
                    clearInterval(slideInterval);
                }
                slideInterval = setInterval(nextSlide, 5000);
            });
        }
    }

    // Testimonial Cards Animation on Scroll
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    if (testimonialCards.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const testimonialObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    testimonialObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        testimonialCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            testimonialObserver.observe(card);
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 992) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });

    // Sticky header on scroll (optimized with throttling)
    const header = document.querySelector('.header');
    let lastScroll = 0;
    let ticking = false;
    
    function updateHeader() {
        const currentScroll = window.pageYOffset;
        
        if (header) {
            if (currentScroll > lastScroll && currentScroll > 200) {
                // Scrolling down and past header
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up or at top
                header.style.transform = 'translateY(0)';
            }
            
            // Add shadow when scrolled
            if (currentScroll > 50) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            } else {
                header.style.boxShadow = 'none';
                header.style.backgroundColor = 'var(--white)';
            }
        }
        
        lastScroll = currentScroll;
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

    // Countdown Timer for Sale Banner (optimized)
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    let countdownInterval = null;
    
    if (daysEl && hoursEl && minutesEl && secondsEl) {
        function updateCountdown() {
            const now = new Date();
            // Set the target date to Black Friday (November 29, 2025)
            const targetDate = new Date('November 29, 2025 00:00:00').getTime();
            const nowTime = now.getTime();
            
            // If the sale has already started, show 00:00:00:00 and clear interval
            if (nowTime >= targetDate) {
                daysEl.textContent = '00';
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                }
                return;
            }
            
            // Calculate remaining time
            const distance = targetDate - nowTime;
            
            // Time calculations for days, hours, minutes and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Display the result
            daysEl.textContent = days.toString().padStart(2, '0');
            hoursEl.textContent = hours.toString().padStart(2, '0');
            minutesEl.textContent = minutes.toString().padStart(2, '0');
            secondsEl.textContent = seconds.toString().padStart(2, '0');
        }
        
        // Update the countdown every second
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Form submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would typically send the form data to a server
            alert('Thank you for your message! We will get back to you soon.');
            form.reset();
        });
    });

    // Property card hover effect (optimized - use CSS classes instead of inline styles)
    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover-active');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover-active');
        });
    });

    // Animate elements on scroll (optimized - cache elements and use requestAnimationFrame)
    // Note: Testimonials use IntersectionObserver, so we exclude them here
    const animatedElements = document.querySelectorAll('.service-card, .property-card');
    let animatedElementsArray = Array.from(animatedElements);
    let animationTicking = false;
    
    // Set initial styles for animation
    animatedElementsArray.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    function animateOnScroll() {
        const screenPosition = window.innerHeight / 1.3;
        
        animatedElementsArray.forEach(element => {
            if (element.getBoundingClientRect().top < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
        
        animationTicking = false;
    }
    
    // Run once on page load
    setTimeout(animateOnScroll, 300);
    
    // Run on scroll with throttling
    window.addEventListener('scroll', function() {
        if (!animationTicking) {
            window.requestAnimationFrame(animateOnScroll);
            animationTicking = true;
        }
    }, { passive: true });

    // Back to top button (optimized with throttling)
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    document.body.appendChild(backToTopBtn);
    
    let backToTopTicking = false;
    function updateBackToTop() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
        backToTopTicking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!backToTopTicking) {
            window.requestAnimationFrame(updateBackToTop);
            backToTopTicking = true;
        }
    }, { passive: true });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
