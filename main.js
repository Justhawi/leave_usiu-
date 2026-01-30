// Main JavaScript for Index Page

document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const ctaLoginBtn = document.getElementById('ctaLoginBtn');
    const ctaRegisterBtn = document.getElementById('ctaRegisterBtn');
    const contactLoginBtn = document.getElementById('contactLoginBtn');
    
    // Modal controls
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const showRegisterModal = document.getElementById('showRegisterModal');
    const showLoginModal = document.getElementById('showLoginModal');
    
    // Forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Open login modal
    loginBtn?.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
    
    getStartedBtn?.addEventListener('click', () => {
        loginModal.classList.add('active');
    });

    ctaLoginBtn?.addEventListener('click', () => {
        loginModal.classList.add('active');
    });

    contactLoginBtn?.addEventListener('click', () => {
        loginModal.classList.add('active');
    });

    // Open register modal
    ctaRegisterBtn?.addEventListener('click', () => {
        registerModal.classList.add('active');
    });
    
    // Close modals
    closeLoginModal?.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });
    
    closeRegisterModal?.addEventListener('click', () => {
        registerModal.classList.remove('active');
    });
    
    // Switch between modals
    showRegisterModal?.addEventListener('click', () => {
        loginModal.classList.remove('active');
        registerModal.classList.add('active');
    });
    
    showLoginModal?.addEventListener('click', () => {
        registerModal.classList.remove('active');
        loginModal.classList.add('active');
    });
    
    // Close modals when clicking outside
    loginModal?.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });
    
    registerModal?.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            registerModal.classList.remove('active');
        }
    });
    
    // Handle login form submission
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await window.loginUser(email, password);
        } catch (error) {
            // Error is handled in auth.js
        }
    });
    
    // Handle registration form submission
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const staffId = document.getElementById('regStaffId').value;
        const department = document.getElementById('regDepartment').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            window.showToast('Passwords do not match!', 'error');
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            window.showToast('Password must be at least 6 characters long!', 'error');
            return;
        }
        
        try {
            await window.registerUser(name, email, staffId, department, password);
        } catch (error) {
            // Error is handled in auth.js
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    
                    // Update active link
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
});
