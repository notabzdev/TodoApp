// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 10 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Form validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Social login handler
function handleSocialLogin(provider) {
    console.log(`Signing in with ${provider}`);
    // Add your social login integration here
}

// Main initialization
document.addEventListener("DOMContentLoaded", function() {
    // Create particles
    createParticles();

    // Fade in the page
    document.body.classList.add('fade-in');

    // Get all form elements
    const loginForm = document.getElementById('loginForm');
    const createAccountLink = document.getElementById('createAccountLink');
    const loginBtn = document.querySelector('.login-btn');
    const spinner = document.querySelector('.spinner');
    const btnText = document.querySelector('.btn-text');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const rememberCheckbox = document.getElementById('remember');

    // Create account link click handler - SIMPLE AND CLEAN
    createAccountLink.addEventListener('click', function(e) {
        e.preventDefault();

        // Start fade out
        document.body.classList.remove('fade-in');
        document.body.classList.add('fade-out');

        // Navigate after fade completes
        setTimeout(function() {
            window.location.href = 'signup.html';
        }, 600);
    });

    // Input focus animations
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Real-time email validation
    emailInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            if (validateEmail(this.value)) {
                this.className = 'success';
            } else {
                this.className = 'error';
            }
        } else {
            this.className = '';
        }
    });

    // Real-time password validation
    passwordInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            if (this.value.length >= 6) {
                this.className = 'success';
            } else {
                this.className = 'warning';
            }
        } else {
            this.className = '';
        }
    });

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Validation
        let hasErrors = false;

        if (!validateEmail(email)) {
            emailInput.className = 'error';
            emailInput.focus();
            hasErrors = true;
        }

        if (password.length < 6) {
            passwordInput.className = 'error';
            if (!hasErrors) passwordInput.focus();
            hasErrors = true;
        }

        if (hasErrors) return;

        // Show loading state
        loginBtn.classList.add('loading');
        spinner.style.display = 'inline-block';
        btnText.textContent = 'Signing in...';

        // Simulate API call
        setTimeout(() => {
            // Show success
            loginBtn.style.background = 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)';
            btnText.textContent = 'Success!';

            // Handle remember me
            if (rememberCheckbox.checked) {
                localStorage.setItem('rememberedEmail', email);
            }

            setTimeout(() => {
                document.body.classList.remove('fade-in');
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 600);
            }, 1000);
        }, 1500);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (emailInput.matches(':focus') || passwordInput.matches(':focus'))) {
            loginForm.dispatchEvent(new Event('submit'));
        }

        if (e.key === 'Escape') {
            emailInput.value = '';
            passwordInput.value = '';
            emailInput.className = '';
            passwordInput.className = '';
            emailInput.focus();
        }
    });

    // Load remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
        passwordInput.focus();
    } else {
        // Auto-focus first input after fade-in
        setTimeout(() => {
            emailInput.focus();
        }, 700);
    }
});