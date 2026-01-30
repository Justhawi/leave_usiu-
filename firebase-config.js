// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// See FIREBASE_SETUP_GUIDE.md for detailed instructions

const firebaseConfig = {
    apiKey: "AIzaSyBCmRqBfj779dJn6IjuBTuO-iyeZV6T0-Y",
    authDomain: "leave-usiu.firebaseapp.com",
    projectId: "leave-usiu",
    storageBucket: "leave-usiu.firebasestorage.app",
    messagingSenderId: "128310563589",
    appId: "1:128310563589:web:5f58c3f13a7fd8710add6c"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.warn('Firebase initialization failed:', error.message);
    // Create mock Firebase services for demo purposes
    window.mockFirebase = true;
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;

// Mock authentication for demo purposes (when Firebase is not properly configured)
if (window.mockFirebase) {
    console.log('Using mock authentication for demo');
    
    // Mock auth state change listener
    auth.onAuthStateChanged = (callback) => {
        // Simulate no user logged in for demo
        callback(null);
        return () => {}; // Unsubscribe function
    };
    
    // Mock login function
    auth.signInWithEmailAndPassword = (email, password) => {
        return Promise.reject(new Error('Demo mode: Please configure Firebase credentials'));
    };
    
    // Mock register function
    auth.createUserWithEmailAndPassword = (email, password) => {
        return Promise.reject(new Error('Demo mode: Please configure Firebase credentials'));
    };
    
    // Mock sign out
    auth.signOut = () => Promise.resolve();
    
    // Mock current user
    Object.defineProperty(auth, 'currentUser', {
        get: () => null
    });
    
    // Mock Firestore
    db.collection = (collectionName) => ({
        doc: (docId) => ({
            get: () => Promise.resolve({ exists: false }),
            set: () => Promise.resolve(),
            update: () => Promise.resolve(),
            delete: () => Promise.resolve()
        }),
        add: () => Promise.resolve({ id: 'mock-doc-id' }),
        where: () => ({
            get: () => Promise.resolve({ docs: [] })
        }),
        orderBy: () => ({
            get: () => Promise.resolve({ docs: [] })
        }),
        limit: () => ({
            get: () => Promise.resolve({ docs: [] })
        }),
        get: () => Promise.resolve({ docs: [] })
    });
    
    // Mock FieldValue
    firebase.firestore = {
        FieldValue: {
            serverTimestamp: () => new Date()
        }
    };
}
