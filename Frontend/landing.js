// Create starfield
function createStarfield() {
    const starsContainer = document.getElementById('stars');
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        starsContainer.appendChild(star);
    }
}

// Create orbital task animations
function createOrbitalTasks() {
    const heroVisual = document.querySelector('.hero-visual');
    if (!heroVisual) return;

    // Create the task orbit container
    const taskOrbit = document.createElement('div');
    taskOrbit.className = 'task-orbit';
    taskOrbit.style.cssText = `
        position: absolute;
        width: 320px;
        height: 320px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: task-orbit 20s linear infinite;
        z-index: 1;
        pointer-events: none;
    `;

    // Task icons to orbit
    const taskIcons = ['✓', '📝', '⏰', '🎯', '📊', '🚀'];
    const taskPositions = [
        { top: '-12px', left: '50%', transform: 'translateX(-50%)' },
        { top: '25%', right: '-12px', transform: 'translateY(-50%)' },
        { bottom: '-12px', left: '50%', transform: 'translateX(-50%)' },
        { top: '75%', left: '-12px', transform: 'translateY(-50%)' },
        { top: '25%', left: '25%' },
        { bottom: '25%', right: '25%' }
    ];

    taskIcons.forEach((icon, index) => {
        const miniTask = document.createElement('div');
        miniTask.className = 'mini-task';
        miniTask.textContent = icon;
        miniTask.style.cssText = `
            position: absolute;
            width: 24px;
            height: 24px;
            background: rgba(16, 185, 129, 0.8);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
            animation: task-float 3s ease-in-out infinite;
            animation-delay: ${index * -0.5}s;
            ${Object.entries(taskPositions[index]).map(([key, value]) => `${key}: ${value}`).join('; ')};
        `;
        taskOrbit.appendChild(miniTask);
    });

    // Create shooting tasks container
    const shootingTasks = document.createElement('div');
    shootingTasks.className = 'shooting-tasks';
    shootingTasks.style.cssText = `
        position: absolute;
        width: 350px;
        height: 350px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 0;
    `;

    // Shooting task icons
    const shootingIcons = ['📋', '✅', '📌', '⭐'];
    shootingIcons.forEach((icon, index) => {
        const shootingTask = document.createElement('div');
        shootingTask.className = 'shooting-task';
        shootingTask.textContent = icon;
        shootingTask.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #4facfe, #00f2fe);
            border-radius: 4px;
            opacity: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: white;
            box-shadow: 0 0 8px rgba(79, 172, 254, 0.6);
            animation: shoot-task-${index + 1} 8s ease-in-out infinite;
            animation-delay: ${index * 2}s;
            top: 50%;
            left: 50%;
            transform-origin: 0 0;
        `;
        shootingTasks.appendChild(shootingTask);
    });

    // Add to hero visual
    heroVisual.appendChild(taskOrbit);
    heroVisual.appendChild(shootingTasks);

    // Add the CSS animations
    addOrbitalAnimations();
}

function addOrbitalAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes task-orbit {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes task-float {
            0%, 100% { 
                transform: scale(1);
                opacity: 0.8;
            }
            50% { 
                transform: scale(1.1);
                opacity: 1;
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.8);
            }
        }
        
        @keyframes shoot-task-1 {
            0% { 
                transform: translate(-50%, -50%) rotate(0deg) translateX(175px) rotate(0deg);
                opacity: 0;
            }
            10% { opacity: 1; }
            50% { 
                transform: translate(-50%, -50%) rotate(180deg) translateX(175px) rotate(-180deg);
                opacity: 1;
            }
            90% { opacity: 1; }
            100% { 
                transform: translate(-50%, -50%) rotate(360deg) translateX(175px) rotate(-360deg);
                opacity: 0;
            }
        }
        
        @keyframes shoot-task-2 {
            0% { 
                transform: translate(-50%, -50%) rotate(90deg) translateX(175px) rotate(-90deg);
                opacity: 0;
            }
            10% { opacity: 1; }
            50% { 
                transform: translate(-50%, -50%) rotate(270deg) translateX(175px) rotate(-270deg);
                opacity: 1;
            }
            90% { opacity: 1; }
            100% { 
                transform: translate(-50%, -50%) rotate(450deg) translateX(175px) rotate(-450deg);
                opacity: 0;
            }
        }
        
        @keyframes shoot-task-3 {
            0% { 
                transform: translate(-50%, -50%) rotate(180deg) translateX(175px) rotate(-180deg);
                opacity: 0;
            }
            10% { opacity: 1; }
            50% { 
                transform: translate(-50%, -50%) rotate(360deg) translateX(175px) rotate(-360deg);
                opacity: 1;
            }
            90% { opacity: 1; }
            100% { 
                transform: translate(-50%, -50%) rotate(540deg) translateX(175px) rotate(-540deg);
                opacity: 0;
            }
        }
        
        @keyframes shoot-task-4 {
            0% { 
                transform: translate(-50%, -50%) rotate(270deg) translateX(175px) rotate(-270deg);
                opacity: 0;
            }
            10% { opacity: 1; }
            50% { 
                transform: translate(-50%, -50%) rotate(450deg) translateX(175px) rotate(-450deg);
                opacity: 1;
            }
            90% { opacity: 1; }
            100% { 
                transform: translate(-50%, -50%) rotate(630deg) translateX(175px) rotate(-630deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Enhanced galactic trail effect for nav buttons
function initGalacticTrails() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(button => {
        const trail = button.querySelector('.galactic-trail');

        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Position the trail at mouse coordinates
            trail.style.left = x + 'px';
            trail.style.top = y + 'px';
            trail.style.transform = 'translate(-50%, -50%)';
        });

        button.addEventListener('mouseenter', () => {
            trail.style.opacity = '1';

            // Add particle burst effect
            createParticleBurst(button);
        });

        button.addEventListener('mouseleave', () => {
            trail.style.opacity = '0';
            trail.style.left = '50%';
            trail.style.top = '50%';
        });
    });
}

// Create particle burst effect
function createParticleBurst(button) {
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, #db2777, transparent);
            border-radius: 50%;
            pointer-events: none;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
        `;

        button.appendChild(particle);

        // Animate particles outward
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.animate([
            {
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 1
            },
            {
                transform: `translate(${x}px, ${y}px) scale(1)`,
                opacity: 0
            }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => {
            particle.remove();
        };
    }
}

// Smooth scrolling for navigation
function initSmoothScrolling() {
    document.getElementById('featuresBtn').addEventListener('click', () => {
        scrollToSection('featuresSection');
    });

    document.getElementById('previewBtn').addEventListener('click', () => {
        scrollToSection('previewSection');
    });

    document.getElementById('aboutBtn').addEventListener('click', () => {
        scrollToSection('aboutSection');
    });

    // Login button with fade transition
    document.getElementById('loginBtn').addEventListener('click', () => {
        fadeToPage('index.html');
    });

    // Hero buttons
    document.getElementById('getStartedBtn').addEventListener('click', () => {
        fadeToPage('index.html');
    });

    document.getElementById('tryDemoBtn').addEventListener('click', () => {
        scrollToSection('previewSection');
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function fadeToPage(url) {
    document.body.classList.remove('fade-in');
    document.body.classList.add('fade-out');

    setTimeout(() => {
        window.location.href = url;
    }, 600);
}

// Parallax effect for hero section
function initParallaxEffects() {
    const heroVisual = document.querySelector('.hero-visual');
    const floatingPlanet = document.querySelector('.floating-planet');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;

        if (heroVisual) {
            heroVisual.style.transform = `translateY(${rate}px)`;
        }
    });

    // Mouse movement parallax for planet
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        if (floatingPlanet) {
            const moveX = (mouseX - 0.5) * 20;
            const moveY = (mouseY - 0.5) * 20;
            floatingPlanet.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });
}

// Animate preview tasks
function animatePreviewTasks() {
    const taskItems = document.querySelectorAll('.task-item');

    // Add staggered animation to tasks
    taskItems.forEach((task, index) => {
        task.style.opacity = '0';
        task.style.transform = 'translateX(-20px)';

        setTimeout(() => {
            task.style.transition = 'all 0.6s ease';
            task.style.opacity = '1';
            task.style.transform = 'translateX(0)';
        }, index * 200);
    });

    // Make tasks interactive and fix initial styling
    taskItems.forEach(task => {
        const checkbox = task.querySelector('.task-checkbox');
        const taskText = task.querySelector('.task-text');

        if (checkbox && taskText) {
            // Fix initial styling for completed tasks
            if (task.classList.contains('completed')) {
                checkbox.textContent = '✓';
                checkbox.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                checkbox.style.borderColor = '#10b981';
                checkbox.style.color = '#ffffff';
                taskText.style.textDecoration = 'line-through';
                task.style.opacity = '0.7';
            } else {
                checkbox.textContent = '';
                checkbox.style.background = 'transparent';
                checkbox.style.borderColor = 'rgba(219, 39, 119, 0.5)';
                checkbox.style.color = 'transparent';
                taskText.style.textDecoration = 'none';
                task.style.opacity = '1';
            }

            // Add click handler to the entire task item
            task.style.cursor = 'pointer';

            task.addEventListener('click', function(e) {
                e.preventDefault();

                // Toggle completed state
                const isCompleted = this.classList.contains('completed');

                if (isCompleted) {
                    // Uncomplete the task
                    this.classList.remove('completed');
                    checkbox.textContent = '';
                    checkbox.style.background = 'transparent';
                    checkbox.style.borderColor = 'rgba(219, 39, 119, 0.5)';
                    checkbox.style.color = 'transparent';
                    taskText.style.textDecoration = 'none';
                    this.style.opacity = '1';

                    // Add uncomplete animation
                    checkbox.style.transform = 'scale(0.8)';
                    checkbox.style.boxShadow = '0 0 10px rgba(219, 39, 119, 0.4)';

                    // Create uncomplete effect
                    createUncheckEffect(checkbox);

                    setTimeout(() => {
                        checkbox.style.transform = 'scale(1)';
                        checkbox.style.boxShadow = 'none';
                    }, 200);
                } else {
                    // Complete the task
                    this.classList.add('completed');
                    checkbox.textContent = '✓';
                    checkbox.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    checkbox.style.borderColor = '#10b981';
                    checkbox.style.color = '#ffffff';
                    taskText.style.textDecoration = 'line-through';
                    this.style.opacity = '0.7';

                    // Add completion animation
                    checkbox.style.transform = 'scale(1.2)';
                    checkbox.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.6)';

                    // Create completion particle effect
                    createCompletionEffect(checkbox);

                    setTimeout(() => {
                        checkbox.style.transform = 'scale(1)';
                        checkbox.style.boxShadow = 'none';
                    }, 300);
                }

                // Add ripple effect
                createRippleEffect(this, e);
            });

            // Add hover effects
            task.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(248, 250, 252, 0.08)';
                this.style.transform = 'translateX(8px)';

                if (!this.classList.contains('completed')) {
                    checkbox.style.borderColor = '#c084fc';
                } else {
                    // Show that completed tasks are also clickable
                    checkbox.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.4)';
                }
            });

            task.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(248, 250, 252, 0.05)';
                this.style.transform = 'translateX(5px)';

                if (!this.classList.contains('completed')) {
                    checkbox.style.borderColor = 'rgba(219, 39, 119, 0.5)';
                } else {
                    checkbox.style.boxShadow = 'none';
                }
            });
        }
    });
}

// Create uncheck effect
function createUncheckEffect(element) {
    const particleCount = 4;
    const rect = element.getBoundingClientRect();

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 3px;
            height: 3px;
            background: #db2777;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
        `;

        document.body.appendChild(particle);

        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 20;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.animate([
            {
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 0.8
            },
            {
                transform: `translate(${x}px, ${y}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 400,
            easing: 'ease-in'
        }).onfinish = () => {
            particle.remove();
        };
    }
}

// Create completion particle effect
function createCompletionEffect(element) {
    const particleCount = 6;
    const rect = element.getBoundingClientRect();

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: #10b981;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
        `;

        document.body.appendChild(particle);

        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 30;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.animate([
            {
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 1
            },
            {
                transform: `translate(${x}px, ${y}px) scale(1)`,
                opacity: 0
            }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => {
            particle.remove();
        };
    }
}

// Create ripple effect
function createRippleEffect(element, event) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(192, 132, 252, 0.3);
        transform: translate(-50%, -50%) scale(0);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 1;
    `;

    element.style.position = 'relative';
    element.appendChild(ripple);

    ripple.animate([
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(2)', opacity: 0 }
    ], {
        duration: 400,
        easing: 'ease-out'
    }).onfinish = () => {
        ripple.remove();
    };
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                // Special animation for preview section
                if (entry.target.id === 'previewSection') {
                    setTimeout(animatePreviewTasks, 300);
                }
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Add cosmic particle effects to hero
function createCosmicParticles() {
    const particlesContainer = document.querySelector('.cosmic-particles');
    if (!particlesContainer) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 6 + 2}px;
            height: ${Math.random() * 6 + 2}px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.6), transparent);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float-particle ${Math.random() * 10 + 5}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;

        particlesContainer.appendChild(particle);
    }
}

// Add CSS animation for floating particles
function addParticleAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float-particle {
            0% {
                transform: translateY(0px) translateX(0px);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) translateX(${Math.random() * 50 - 25}px);
                opacity: 0;
            }
        }
        
        section {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s ease;
        }
        
        section.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .feature-card {
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.6s ease;
        }
        
        .features.animate-in .feature-card {
            transform: translateY(0);
            opacity: 1;
        }
        
        .features.animate-in .feature-card:nth-child(1) { transition-delay: 0.1s; }
        .features.animate-in .feature-card:nth-child(2) { transition-delay: 0.2s; }
        .features.animate-in .feature-card:nth-child(3) { transition-delay: 0.3s; }
    `;
    document.head.appendChild(style);
}

// Enhanced CTA button effects
function initCTAEffects() {
    const ctaButtons = document.querySelectorAll('.cta-btn');

    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.transform = 'translate(-50%, -50%) scale(0)';

            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add ripple animation
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: translate(-50%, -50%) scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
}

// Main initialization
document.addEventListener("DOMContentLoaded", function() {
    // Create cosmic environment
    createStarfield();
    createCosmicParticles();
    createOrbitalTasks(); // Add this line!

    // Initialize interactive effects
    initGalacticTrails();
    initSmoothScrolling();
    initParallaxEffects();
    initScrollAnimations();
    initCTAEffects();

    // Add custom animations
    addParticleAnimation();

    // Fade in the page
    document.body.classList.add('fade-in');

    // Update navbar on scroll
    let lastScrollTop = 0;
    const navbar = document.querySelector('.top-bar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    });

    // Add dynamic background based on scroll
    window.addEventListener('scroll', () => {
        const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
        const cosmicBg = document.querySelector('.cosmic-background');

        if (cosmicBg) {
            cosmicBg.style.opacity = Math.max(0.3, 1 - scrollPercent * 0.7);
        }
    });
});