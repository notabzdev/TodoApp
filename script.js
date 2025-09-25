document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('loginForm');
    const signupLink = document.querySelector('.signup-text a');

    // Login form fade-out
    loginForm.addEventListener('submit', function(e){
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 500); // matches CSS transition
    });

    // Sign Up link fade-out
    signupLink.addEventListener('click', function(e){
        e.preventDefault(); // stop instant navigation
        const target = this.getAttribute('href'); // get href (signup.html)
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = target; // navigate after fade
        }, 500); // same duration as CSS
    });
});
