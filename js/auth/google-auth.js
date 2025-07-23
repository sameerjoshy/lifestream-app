// LifeStream Google Authentication
// Customer-first approach: Easy login, secure storage in user's Drive

class GoogleAuth {
    constructor() {
        this.CLIENT_ID = '883206169436-4b09c73o9o0hci05jprlll572d7c6msq.apps.googleusercontent.com';
        this.SCOPES = [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ].join(' ');
        
        this.gapi = null;
        this.currentUser = null;
        this.isSignedIn = false;
    }

    // Initialize Google API
    async init() {
        try {
            // Load Google API
            await this.loadGoogleAPI();
            
            // Initialize gapi
            await gapi.load('auth2:client:drive', async () => {
                await gapi.client.init({
                    clientId: this.CLIENT_ID,
                    scope: this.SCOPES,
                    discoveryDocs: [
                        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
                    ]
                });

                // Set up auth listener
                const authInstance = gapi.auth2.getAuthInstance();
                this.isSignedIn = authInstance.isSignedIn.get();
                
                if (this.isSignedIn) {
                    this.currentUser = authInstance.currentUser.get();
                    this.onSignInSuccess();
                }

                // Listen for sign-in state changes
                authInstance.isSignedIn.listen(this.updateSigninStatus.bind(this));
            });

            console.log('✅ Google Auth initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Google Auth initialization failed:', error);
            return false;
        }
    }

    // Load Google API dynamically
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Handle sign-in
    async signIn() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            
            this.currentUser = user;
            this.isSignedIn = true;
            
            console.log('✅ User signed in successfully');
            this.onSignInSuccess();
            
            return true;
        } catch (error) {
            console.error('❌ Sign-in failed:', error);
            this.showError('Sign-in failed. Please try again.');
            return false;
        }
    }

    // Handle sign-out
    async signOut() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signOut();
            
            this.currentUser = null;
            this.isSignedIn = false;
            
            console.log('✅ User signed out successfully');
            this.onSignOut();
            
            return true;
        } catch (error) {
            console.error('❌ Sign-out failed:', error);
            return false;
        }
    }

    // Get user info
    getUserInfo() {
        if (!this.currentUser) return null;

        const profile = this.currentUser.getBasicProfile();
        return {
            id: profile.getId(),
            email: profile.getEmail(),
            name: profile.getName(),
            picture: profile.getImageUrl(),
            firstName: profile.getGivenName(),
            lastName: profile.getFamilyName()
        };
    }

    // Update sign-in status
    updateSigninStatus(isSignedIn) {
        this.isSignedIn = isSignedIn;
        
        if (isSignedIn) {
            this.currentUser = gapi.auth2.getAuthInstance().currentUser.get();
            this.onSignInSuccess();
        } else {
            this.currentUser = null;
            this.onSignOut();
        }
    }

    // Success callback - customize this!
    onSignInSuccess() {
        const userInfo = this.getUserInfo();
        console.log('👤 User info:', userInfo);
        
        // Hide login UI, show main app
        this.updateUI(true);
        
        // Initialize Drive storage
        this.initializeDriveStorage();
    }

    // Sign out callback
    onSignOut() {
        console.log('👋 User signed out');
        
        // Show login UI, hide main app
        this.updateUI(false);
    }

    // Update UI based on auth state
    updateUI(isSignedIn) {
        const loginSection = document.getElementById('login-section');
        const mainApp = document.getElementById('main-app');
        const userInfo = document.getElementById('user-info');

        if (isSignedIn) {
            // User is signed in
            if (loginSection) loginSection.style.display = 'none';
            if (mainApp) mainApp.style.display = 'block';
            
            // Show user info
            if (userInfo) {
                const user = this.getUserInfo();
                userInfo.innerHTML = `
                    <div class="user-profile">
                        <img src="${user.picture}" alt="${user.name}" class="user-avatar">
                        <span class="user-name">${user.name}</span>
                        <button onclick="googleAuth.signOut()" class="sign-out-btn">Sign Out</button>
                    </div>
                `;
            }
        } else {
            // User is signed out
            if (loginSection) loginSection.style.display = 'block';
            if (mainApp) mainApp.style.display = 'none';
            if (userInfo) userInfo.innerHTML = '';
        }
    }

    // Initialize Drive storage (placeholder for next phase)
    async initializeDriveStorage() {
        console.log('📁 Initializing Drive storage...');
        // We'll implement this in the next step!
    }

    // Show error message
    showError(message) {
        console.error('⚠️ Error:', message);
        // You can customize this to show user-friendly errors
        alert(message);
    }
}

// Create global instance
const googleAuth = new GoogleAuth();

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    googleAuth.init();
});
