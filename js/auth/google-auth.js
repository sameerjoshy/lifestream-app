// LifeStream Google Authentication
// Mobile PWA optimized with customer-first approach

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
        this.isMobile = window.innerWidth < 768;
    }

    // Initialize Google API
    async init() {
        try {
            console.log('🚀 Initializing mobile-optimized Google Auth...');
            
            // Load Google API
            await this.loadGoogleAPI();
            
            // Initialize gapi with mobile optimizations
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
                    await this.onSignInSuccess();
                }

                // Listen for sign-in state changes
                authInstance.isSignedIn.listen(this.updateSigninStatus.bind(this));
            });

            console.log('✅ Mobile Google Auth initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Google Auth initialization failed:', error);
            this.showError('Authentication system unavailable. Please refresh the page.');
            return false;
        }
    }

    // Load Google API dynamically with mobile optimizations
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = resolve;
            script.onerror = () => {
                console.error('Failed to load Google API script');
                reject(new Error('Google API script failed to load'));
            };
            
            // Add loading timeout for mobile networks
            const timeout = setTimeout(() => {
                reject(new Error('Google API script load timeout'));
            }, 15000);
            
            script.onload = () => {
                clearTimeout(timeout);
                resolve();
            };
            
            document.head.appendChild(script);
        });
    }

    // Handle sign-in with mobile optimizations
    async signIn() {
        try {
            console.log('👤 Starting mobile-optimized sign-in...');
            
            // Show loading state
            this.updateSignInButton(true);
            
            const authInstance = gapi.auth2.getAuthInstance();
            
            // Mobile-optimized sign-in options
            const signInOptions = {
                prompt: 'select_account'  // Always show account picker on mobile
            };
            
            const user = await authInstance.signIn(signInOptions);
            
            this.currentUser = user;
            this.isSignedIn = true;
            
            console.log('✅ Mobile sign-in successful');
            await this.onSignInSuccess();
            
            // Haptic feedback on mobile
            if (this.isMobile && navigator.vibrate) {
                navigator.vibrate([50, 30, 50]);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Mobile sign-in failed:', error);
            this.updateSignInButton(false);
            
            // Mobile-friendly error messages
            if (error.error === 'popup_closed_by_user') {
                this.showError('Sign-in was cancelled. Please try again.');
            } else if (error.error === 'popup_blocked_by_browser') {
                this.showError('Pop-up blocked. Please allow pop-ups and try again.');
            } else {
                this.showError('Sign-in failed. Please check your connection and try again.');
            }
            
            return false;
        }
    }

    // Handle sign-out
    async signOut() {
        try {
            console.log('👋 Starting sign-out...');
            
            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signOut();
            
            this.currentUser = null;
            this.isSignedIn = false;
            
            console.log('✅ Sign-out successful');
            this.onSignOut();
            
            // Mobile feedback
            if (this.isMobile && navigator.vibrate) {
                navigator.vibrate(100);
            }
            
            // Show success message
            this.showStatusMessage('👋 Signed out successfully', 'success');
            
            return true;
        } catch (error) {
            console.error('❌ Sign-out failed:', error);
            this.showError('Sign-out failed. Please refresh the page.');
            return false;
        }
    }

    // Get user info with mobile optimizations
    getUserInfo() {
        if (!this.currentUser) return null;

        try {
            const profile = this.currentUser.getBasicProfile();
            return {
                id: profile.getId(),
                email: profile.getEmail(),
                name: profile.getName(),
                picture: profile.getImageUrl(),
                firstName: profile.getGivenName(),
                lastName: profile.getFamilyName()
            };
        } catch (error) {
            console.error('❌ Failed to get user info:', error);
            return null;
        }
    }

    // Update sign-in status
    updateSigninStatus(isSignedIn) {
        console.log('🔄 Sign-in status changed:', isSignedIn);
        this.isSignedIn = isSignedIn;
        
        if (isSignedIn) {
            this.currentUser = gapi.auth2.getAuthInstance().currentUser.get();
            this.onSignInSuccess();
        } else {
            this.currentUser = null;
            this.onSignOut();
        }
    }

    // Success callback with mobile PWA integration
    async onSignInSuccess() {
        const userInfo = this.getUserInfo();
        console.log('👤 User authenticated:', userInfo?.email);
        
        // Update UI immediately
        this.updateUI(true);
        
        // Show welcome message
        this.showStatusMessage(`👋 Welcome ${userInfo?.firstName || 'back'}!`, 'success');
        
        // Initialize Drive storage
        await this.initializeDriveStorage();
        
        // Initialize main app after authentication
        if (typeof initializeMainApp === 'function') {
            console.log('🎯 Initializing main app...');
            initializeMainApp();
        }
        
        // Mobile PWA: Hide loading screen if still visible
        if (typeof hideLoadingScreen === 'function') {
            setTimeout(hideLoadingScreen, 500);
        }
    }

    // Sign out callback
    onSignOut() {
        console.log('👋 User signed out');
        
        // Show login UI, hide main app
        this.updateUI(false);
        
        // Clear any cached data
        this.clearCachedData();
    }

    // Update UI with mobile optimizations
    updateUI(isSignedIn) {
        const loginSection = document.getElementById('login-section');
        const mainApp = document.getElementById('main-app');
