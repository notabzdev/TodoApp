document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.getElementById('signupForm');
    const loginLink = document.querySelector('.login-text a');

    // Fade in the page on load
    requestAnimationFrame(() => {
        document.body.style.opacity = "1";
    });

    // Fade-out when submitting the signup form
    signupForm.addEventListener('submit', function(e){
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = "dashboard.html"; // redirect after fade
        }, 500);
    });

    // Fade-out when clicking Login link
    loginLink.addEventListener('click', function(e){
        e.preventDefault();
        const target = this.getAttribute('href');
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = target; // redirect to login page
        }, 500);
    });
});
