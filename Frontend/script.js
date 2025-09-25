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

// Logo click handler
function goToLanding() {
    document.body.classList.remove('fade-in');
    document.body.classList.add('fade-out');

    setTimeout(function() {
        window.location.href = '/';
    }, 600);
}

// Social login handler
function handleSocialLogin(provider) {
    console.log(`Signing in with ${provider}`);
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

    // Create account link click handler
    createAccountLink.addEventListener('click', function(e) {
        e.preventDefault();

        document.body.classList.remove('fade-in');
        document.body.classList.add('fade-out');

        setTimeout(function() {
            window.location.href = '/signup';
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

    // REAL AUTHENTICATION - NO FAKE FALLBACK
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        console.log('Login attempt:', email);

        // Validation
        if (!validateEmail(email)) {
            alert('Please enter a valid email address');
            emailInput.focus();
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            passwordInput.focus();
            return;
        }

        // Show loading state
        loginBtn.classList.add('loading');
        spinner.style.display = 'inline-block';
        btnText.textContent = 'Signing in...';

        // ONLY call real authentication - no setTimeout fallback
        authenticateUser(email, password);
    });

    // Real authentication function
    async function authenticateUser(email, password) {
        console.log('Making authentication request to server...');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            console.log('Server response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('Authentication result:', data);

            if (data.success && data.sessionToken) {
                // Store session data
                localStorage.setItem('sessionToken', data.sessionToken);
                localStorage.setItem('userData', JSON.stringify(data.user));

                // Handle remember me
                if (rememberCheckbox.checked) {
                    localStorage.setItem('rememberedEmail', email);
                }

                // Show success
                loginBtn.style.background = 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)';
                btnText.textContent = 'Success!';

                // Redirect only after successful authentication
                setTimeout(() => {
                    document.body.classList.remove('fade-in');
                    document.body.classList.add('fade-out');
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 600);
                }, 800);

            } else {
                // Authentication failed
                resetLoginForm();
                alert(data.message || 'Invalid credentials. Please try again.');
            }

        } catch (error) {
            console.error('Authentication error:', error);
            resetLoginForm();
            alert('Connection error. Please check your internet connection and try again.');
        }
    }

    // Reset form on authentication failure
    function resetLoginForm() {
        loginBtn.classList.remove('loading');
        spinner.style.display = 'none';
        btnText.textContent = 'Sign In';
        emailInput.style.borderColor = '#ff6b6b';
        passwordInput.style.borderColor = '#ff6b6b';
    }

    // Load saved email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const newAccountEmail = localStorage.getItem('newAccountEmail');

    if (newAccountEmail) {
        emailInput.value = newAccountEmail;
        passwordInput.focus();
        localStorage.removeItem('newAccountEmail');
    } else if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
        passwordInput.focus();
    } else {
        setTimeout(() => {
            emailInput.focus();
        }, 700);
    }

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
});