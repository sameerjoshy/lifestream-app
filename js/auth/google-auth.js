// Google Authentication for LifeStream
class GoogleAuth {
    constructor() {
        this.isSignedIn = false;
        this.currentUser = null;
        this.gapi = null;
        this.init();
    }

    async init() {
        try {
            console.log('🔐 Initializing Google Auth...');
            
            // Load Google API
            await this.loadGoogleAPI();
            
            // Initialize GAPI
            await new Promise((resolve, reject) => {
                gapi.load('auth2:client:drive', {
                    callback: resolve,
                    onerror: reject
                });
            });

            // Initialize auth2
            const authInstance = await gapi.auth2.init({
                client_id: 'YOUR_CLIENT_ID_HERE', // Replace with your actual client ID
                scope: 'https://www.googleapis.com/auth/drive.file profile email'
            });

            this.authInstance = authInstance;
            this.isSignedIn = authInstance.isSignedIn.get();
            
            if (this.isSignedIn) {
                this.currentUser = authInstance.currentUser.get();
                this.handleSignIn();
            }

            console.log('✅ Google Auth initialized');
            
        } catch (error) {
            console.warn('⚠️ Google Auth initialization failed:', error);
            this.setupDemoMode();
        }
    }

    async loadGoogleAPI() {
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

    setupDemoMode() {
        console.log('🎭 Setting up demo mode...');
        // Demo mode for testing without Google API
        this.isDemoMode = true;
        setTimeout(() => {
            this.handleDemoSignIn();
        }, 1000);
    }

    async signIn() {
        try {
            if (this.isDemoMode) {
                this.handleDemoSignIn();
                return;
            }

            console.log('🔐 Starting Google sign-in...');
            const user = await this.authInstance.signIn();
            this.currentUser = user;
            this.isSignedIn = true;
            this.handleSignIn();
            
        } catch (error) {
            console.warn('Sign-in error:', error);
            showStatusMessage('⚠️ Sign-in failed, starting demo mode', 'error');
            this.handleDemoSignIn();
        }
    }

    handleSignIn() {
        const profile = this.currentUser.getBasicProfile();
        const userName = profile.getName();
        const userEmail = profile.getEmail();
        const userImage = profile.getImageUrl();

        console.log('✅ User signed in:', userName);
        
        // Update UI
        this.updateUserInterface(userName, userEmail, userImage);
        
        // Hide login, show main app
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        
        // Initialize main app
        initializeMainApp();
        
        showStatusMessage(`🎉 Welcome ${userName}!`, 'success');
    }

    handleDemoSignIn() {
        console.log('🎭 Demo mode sign-in');
        
        const demoUser = {
            name: 'Demo User',
            email: 'demo@lifestream.app',
            image: 'https://via.placeholder.com/40x40/00d4ff/ffffff?text=D'
        };

        this.updateUserInterface(demoUser.name, demoUser.email, demoUser.image);
        
        // Hide login, show main app
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        
        // Initialize main app
        initializeMainApp();
        
        showStatusMessage('🎭 Demo Mode: Your data will be stored locally', 'success');
    }

    updateUserInterface(name, email, imageUrl) {
        // Update user name
        const userNameEl = document.querySelector('.user-name');
        if (userNameEl) {
            userNameEl.textContent = name;
        }

        // Add user avatar if it doesn't exist
        const userProfileLeft = document.querySelector('.user-profile-left');
        if (userProfileLeft && !userProfileLeft.querySelector('.user-avatar')) {
            const avatar = document.createElement('img');
            avatar.src = imageUrl;
            avatar.alt = name;
            avatar.className = 'user-avatar';
            userProfileLeft.insertBefore(avatar, userProfileLeft.firstChild);
        }

        // Add sign out button
        this.addSignOutButton();
    }

    addSignOutButton() {
        const userInfo = document.getElementById('user-info');
        if (userInfo && !userInfo.querySelector('.sign-out-btn')) {
            const signOutBtn = document.createElement('button');
            signOutBtn.className = 'sign-out-btn';
            signOutBtn.textContent = 'Sign Out';
            signOutBtn.onclick = () => this.signOut();
            
            userInfo.appendChild(signOutBtn);
        }
    }

    async signOut() {
        try {
            if (this.authInstance && !this.isDemoMode) {
                await this.authInstance.signOut();
            }
            
            this.isSignedIn = false;
            this.currentUser = null;
            
            // Show login, hide main app
            document.getElementById('main-app').style.display = 'none';
            document.getElementById('login-section').style.display = 'block';
            
            showStatusMessage('👋 Signed out successfully', 'success');
            
        } catch (error) {
            console.warn('Sign-out error:', error);
        }
    }

    getAccessToken() {
        if (this.isDemoMode) {
            return 'demo-token';
        }
        
        if (this.currentUser) {
            return this.currentUser.getAuthResponse().access_token;
        }
        return null;
    }
}

// Initialize Google Auth
const googleAuth = new GoogleAuth();
console.log('🔐 Google Auth module loaded');
