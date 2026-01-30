// Authentication Module

// Check authentication state on page load
auth.onAuthStateChanged(async (user) => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
        // User is signed in
        console.log('User authenticated:', user.email);
        
        // Get user data from Firestore
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Redirect based on role and department
                if (currentPage === 'index.html' || currentPage === '') {
                    if (userData.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        // Redirect to department-specific dashboard
                        switch(userData.department) {
                            case 'HR':
                                window.location.href = 'hr-dashboard.html';
                                break;
                            case 'IT':
                                window.location.href = 'it-dashboard.html';
                                break;
                            case 'Finance':
                                window.location.href = 'finance-dashboard.html';
                                break;
                            case 'Academics':
                                window.location.href = 'academics-dashboard.html';
                                break;
                            case 'Administration':
                                window.location.href = 'administration-dashboard.html';
                                break;
                            case 'Marketing':
                                window.location.href = 'marketing-dashboard.html';
                                break;
                            case 'Library':
                                window.location.href = 'library-dashboard.html';
                                break;
                            default:
                                window.location.href = 'staff-dashboard.html';
                        }
                    }
                }
                
                // Check if user is on the right dashboard
                if (currentPage === 'staff-dashboard.html' && userData.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else if (currentPage === 'admin-dashboard.html' && userData.role !== 'admin') {
                    window.location.href = 'staff-dashboard.html';
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    } else {
        // No user is signed in
        if (currentPage !== 'index.html' && currentPage !== '') {
            window.location.href = 'index.html';
        }
    }
});

// Login function
async function login(email, password) {
    // Check if in demo mode
    if (window.mockFirebase) {
        showToast('Demo mode: Please configure Firebase credentials to enable login functionality', 'error');
        throw new Error('Demo mode: Firebase not configured');
    }
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showToast('Login successful!');
        
        // Get user role and redirect
        const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                // Redirect to department-specific dashboard
                switch(userData.department) {
                    case 'HR':
                        window.location.href = 'hr-dashboard.html';
                        break;
                    case 'IT':
                        window.location.href = 'it-dashboard.html';
                        break;
                    case 'Finance':
                        window.location.href = 'finance-dashboard.html';
                        break;
                    case 'Academics':
                        window.location.href = 'academics-dashboard.html';
                        break;
                    case 'Administration':
                        window.location.href = 'administration-dashboard.html';
                        break;
                    case 'Marketing':
                        window.location.href = 'marketing-dashboard.html';
                        break;
                    case 'Library':
                        window.location.href = 'library-dashboard.html';
                        break;
                    default:
                        window.location.href = 'staff-dashboard.html';
                }
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. Please check your credentials.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        }
        
        showToast(errorMessage, 'error');
        throw error;
    }
}

// Register function
async function register(name, email, staffId, department, password) {
    // Check if in demo mode
    if (window.mockFirebase) {
        showToast('Demo mode: Please configure Firebase credentials to enable registration functionality', 'error');
        throw new Error('Demo mode: Firebase not configured');
    }
    
    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user document in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            staffId: staffId,
            department: department,
            role: 'staff', // Default role
            leaveBalance: 21, // Default annual leave balance
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Registration successful! Redirecting...');
        
        // Redirect to staff dashboard
        setTimeout(() => {
            window.location.href = 'staff-dashboard.html';
        }, 1500);
    } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'An account with this email already exists.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        }
        
        showToast(errorMessage, 'error');
        throw error;
    }
}

// Logout function
async function logout() {
    console.log('Logout function called');
    try {
        console.log('Attempting to sign out');
        await auth.signOut();
        console.log('Sign out successful');
        showToast('Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logged out', 'error');
    } finally {
        console.log('Redirecting to index.html');
        window.location.href = 'index.html';
    }
}

// Get current user data
async function getCurrentUserData() {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            return { id: user.uid, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Utility function to show toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast show';
    
    if (type === 'error') {
        toast.style.background = '#e74c3c';
    } else {
        toast.style.background = '#1a237e';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Export functions for use in other files
window.loginUser = login;
window.registerUser = register;
window.logoutUser = logout;
window.getCurrentUserData = getCurrentUserData;
window.showToast = showToast;
