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

// Logo click handler
function goToLanding() {
    window.location.href = '/';
}

// Social signup handler
function handleSocialSignup(provider) {
    console.log(`Signing up with ${provider}`);
}

// Debounce function
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

// Main initialization
document.addEventListener("DOMContentLoaded", function() {
    console.log('=== SIGNUP PAGE LOADING ===');

    // Initialize particles and fade in
    createParticles();
    document.body.classList.add('fade-in');

    // Get ALL elements first
    const signupForm = document.getElementById('signupForm');
    const signInLink = document.getElementById('signInLink');
    const signupBtn = document.querySelector('.signup-btn');
    const spinner = document.querySelector('.spinner');
    const btnText = document.querySelector('.btn-text');
    const nameInput = document.querySelector('input[type="text"]');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const termsCheckbox = document.getElementById('terms');
    const strengthIndicator = document.querySelector('.password-strength');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');

    // DEBUG: Log which elements were found
    console.log('Element check:');
    console.log('signupForm:', signupForm ? 'FOUND' : 'NULL');
    console.log('nameInput:', nameInput ? 'FOUND' : 'NULL');
    console.log('emailInput:', emailInput ? 'FOUND' : 'NULL');
    console.log('passwordInput:', passwordInput ? 'FOUND' : 'NULL');
    console.log('confirmPasswordInput:', confirmPasswordInput ? 'FOUND' : 'NULL');
    console.log('termsCheckbox:', termsCheckbox ? 'FOUND' : 'NULL');
    console.log('signupBtn:', signupBtn ? 'FOUND' : 'NULL');
    console.log('Total password inputs found:', passwordInputs.length);

    // CHECK IF FORM EXISTS
    if (!signupForm) {
        console.error('CRITICAL ERROR: signupForm element not found!');
        alert('Form not found - check HTML structure');
        return;
    }

    console.log('✓ Form found, setting up event listener...');

    // Sign in link click handler - redirect to /login (which serves index.html)
    if (signInLink) {
        signInLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Redirecting to login page');
            window.location.href = '/login'; // This serves index.html
        });
    }

    // Basic validation helpers
    function setSuccess(formGroup) {
        formGroup.className = 'form-group success';
        const error = formGroup.querySelector('.error-message');
        if (error) error.remove();
    }

    function setError(formGroup, message) {
        formGroup.className = 'form-group error';
        let error = formGroup.querySelector('.error-message');
        if (!error) {
            error = document.createElement('div');
            error.className = 'error-message';
            formGroup.appendChild(error);
        }
        error.textContent = message;
        error.style.opacity = '1';
    }

    function clearValidation(formGroup) {
        formGroup.className = 'form-group';
        const error = formGroup.querySelector('.error-message');
        if (error) error.remove();
    }

    // Simple input validation
    if (nameInput) {
        nameInput.addEventListener('input', debounce(() => {
            const formGroup = nameInput.parentElement;
            const name = nameInput.value.trim();

            if (name.length === 0) {
                clearValidation(formGroup);
            } else if (validateName(name)) {
                setSuccess(formGroup);
            } else {
                setError(formGroup, "Please enter a valid name");
            }
        }, 600));
    }

    if (emailInput) {
        emailInput.addEventListener('input', debounce(() => {
            const formGroup = emailInput.parentElement;
            const email = emailInput.value.trim();

            if (email.length === 0) {
                clearValidation(formGroup);
            } else if (validateEmail(email)) {
                setSuccess(formGroup);
            } else if (email.includes('@') && email.includes('.')) {
                setError(formGroup, "Please enter a valid email address");
            }
        }, 600));
    }

    // Password validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const formGroup = this.parentElement;

            if (password.length === 0) {
                strengthIndicator.classList.remove('show');
                clearValidation(formGroup);
                return;
            }

            strengthIndicator.classList.add('show');
            const strength = checkPasswordStrength(password);
            strengthFill.className = `strength-fill ${strength.level}`;
            strengthText.textContent = `Password strength: ${strength.label}`;

            if (password.length >= 6) {
                setSuccess(formGroup);
            } else {
                setError(formGroup, "Password must be at least 6 characters");
            }

            if (confirmPasswordInput && confirmPasswordInput.value) {
                checkPasswordMatch();
            }
        });
    }

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const formGroup = confirmPasswordInput.parentElement;

        if (confirmPassword.length === 0) {
            clearValidation(formGroup);
        } else if (password === confirmPassword && password.length >= 6) {
            setSuccess(formGroup);
        } else if (password !== confirmPassword) {
            setError(formGroup, "Passwords do not match");
        }
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }

    // THE CRITICAL PART - FORM SUBMISSION
    console.log('Setting up form submit handler...');

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('🔥 FORM SUBMIT TRIGGERED! 🔥');

        // Check if all required elements exist
        if (!nameInput) {
            console.error('nameInput is null');
            alert('Name input not found');
            return;
        }
        if (!emailInput) {
            console.error('emailInput is null');
            alert('Email input not found');
            return;
        }
        if (!passwordInput) {
            console.error('passwordInput is null');
            alert('Password input not found');
            return;
        }
        if (!confirmPasswordInput) {
            console.error('confirmPasswordInput is null');
            alert('Confirm password input not found');
            return;
        }
        if (!termsCheckbox) {
            console.error('termsCheckbox is null');
            alert('Terms checkbox not found');
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const termsAccepted = termsCheckbox.checked;

        console.log('Form data collected:', {
            name: name,
            email: email,
            passwordLength: password.length,
            termsAccepted: termsAccepted
        });

        // Validation
        let hasErrors = false;

        if (!validateName(name)) {
            setError(nameInput.parentElement, "Please enter a valid name");
            hasErrors = true;
        }

        if (!validateEmail(email)) {
            setError(emailInput.parentElement, "Please enter a valid email address");
            hasErrors = true;
        }

        if (password.length < 6) {
            setError(passwordInput.parentElement, "Password must be at least 6 characters");
            hasErrors = true;
        }

        if (password !== confirmPassword) {
            setError(confirmPasswordInput.parentElement, "Passwords do not match");
            hasErrors = true;
        }

        if (!termsAccepted) {
            alert("Please accept the Terms of Service and Privacy Policy");
            hasErrors = true;
        }

        if (hasErrors) {
            console.log('❌ Validation failed');
            return;
        }

        console.log('✅ Validation passed - sending to server');

        // Show loading
        signupBtn.classList.add('loading');
        if (spinner) spinner.style.display = 'inline-block';
        if (btnText) btnText.textContent = 'Creating account...';

        // Send to server
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        })
            .then(response => {
                console.log('Server response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Server response:', data);

                if (data.success) {
                    console.log('SUCCESS! Account created successfully!');

                    // Store email for login
                    localStorage.setItem('newAccountEmail', email);

                    // Show success
                    signupBtn.style.background = 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)';
                    if (btnText) btnText.textContent = 'Account Created!';
                    if (spinner) spinner.style.display = 'none';

                    console.log('Starting redirect timer...');

                    // Redirect to /login (which serves index.html)
                    setTimeout(() => {
                        console.log('Timer finished - redirecting now...');
                        console.log('Current location:', window.location.href);
                        console.log('Redirecting to: /login');

                        // Force redirect
                        window.location.replace('/login');

                    }, 2000);

                } else {
                    console.log('Server returned error:', data);
                    throw new Error(data.message || 'Registration failed');
                }
            })
            .catch(error => {
                console.error('Registration error:', error);

                // Reset button
                signupBtn.classList.remove('loading');
                if (spinner) spinner.style.display = 'none';
                if (btnText) btnText.textContent = 'Create Account';
                signupBtn.style.background = '';

                alert('Registration failed: ' + error.message);
            });
    });

    console.log('✅ Form handler attached successfully');

    // Focus name input
    setTimeout(() => {
        if (nameInput) nameInput.focus();
    }, 500);
});