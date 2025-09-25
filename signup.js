// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 8 + 4 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Form validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateName(name) {
    return name.length >= 2 && /^[a-zA-Z\s]+$/.test(name);
}

function checkPasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;

    const levels = ['weak', 'weak', 'fair', 'good', 'strong'];
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    return {
        score: strength,
        level: levels[Math.min(strength, 4)],
        label: labels[Math.min(strength, 4)]
    };
}

// Social signup handler
function handleSocialSignup(provider) {
    console.log(`Signing up with ${provider}`);
}

// Main initialization
document.addEventListener("DOMContentLoaded", function() {
    // Create particles
    createParticles();

    // Fade in the page
    document.body.classList.add('fade-in');

    // Get all form elements
    const signupForm = document.getElementById('signupForm');
    const signInLink = document.getElementById('signInLink');
    const signupBtn = document.querySelector('.signup-btn');
    const spinner = document.querySelector('.spinner');
    const btnText = document.querySelector('.btn-text');

    const nameInput = document.querySelector('input[type="text"]');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]:nth-of-type(1)');
    const confirmPasswordInput = document.querySelector('input[type="password"]:nth-of-type(2)');
    const termsCheckbox = document.getElementById('terms');

    const strengthIndicator = document.querySelector('.password-strength');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');

    // Sign in link click handler - SIMPLE AND CLEAN
    signInLink.addEventListener('click', function(e) {
        e.preventDefault();

        // Start fade out
        document.body.classList.remove('fade-in');
        document.body.classList.add('fade-out');

        // Navigate after fade completes
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 600);
    });

    // Password strength checking
    passwordInput.addEventListener('input', function() {
        const password = this.value;

        if (password.length > 0) {
            strengthIndicator.classList.add('show');
            const strength = checkPasswordStrength(password);
            strengthFill.className = `strength-fill ${strength.level}`;
            strengthText.textContent = `Password strength: ${strength.label}`;
        } else {
            strengthIndicator.classList.remove('show');
        }

        // Check confirm password if it has a value
        if (confirmPasswordInput.value.length > 0) {
            checkPasswordMatch();
        }
    });

    // Confirm password validation
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const formGroup = confirmPasswordInput.parentElement;

        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                formGroup.classList.add('success');
                formGroup.classList.remove('error');
            } else {
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
            }
        } else {
            formGroup.classList.remove('success', 'error');
        }
    }

    // Real-time validation
    nameInput.addEventListener('input', function() {
        const formGroup = this.parentElement;
        if (this.value.length > 0) {
            if (validateName(this.value)) {
                formGroup.classList.add('success');
                formGroup.classList.remove('error');
            } else {
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
            }
        } else {
            formGroup.classList.remove('success', 'error');
        }
    });

    emailInput.addEventListener('input', function() {
        const formGroup = this.parentElement;
        if (this.value.length > 0) {
            if (validateEmail(this.value)) {
                formGroup.classList.add('success');
                formGroup.classList.remove('error');
            } else {
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
            }
        } else {
            formGroup.classList.remove('success', 'error');
        }
    });

    // Form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Show loading state
        signupBtn.classList.add('loading');
        spinner.style.display = 'inline-block';
        btnText.textContent = 'Creating account...';

        // Simulate API call
        setTimeout(() => {
            // Show success
            signupBtn.style.background = 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)';
            btnText.textContent = 'Account created!';

            setTimeout(() => {
                document.body.classList.remove('fade-in');
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 600);
            }, 1000);
        }, 2000);
    });

    // Auto-focus first input after fade-in
    setTimeout(() => {
        nameInput.focus();
    }, 700);
});