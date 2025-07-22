/**
 * LifeStream App - Main Application Controller
 * Initializes all modules and coordinates app lifecycle
 */

class LifeStreamApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.loadingScreen = null;
        this.appContent = null;
    }

    /**
     * Initialize the entire application
     */
    async init() {
        try {
            console.log('🌊 LifeStream initializing...');
            
            // Get DOM elements
            this.loadingScreen = document.getElementById('loadingScreen');
            this.appContent = document.getElementById('appContent');
            
            // Initialize core systems
            await this.initializeCore();
            
            // Initialize modules
            await this.initializeModules();
            
            // Setup routing
            this.setupRouting();
            
            // Show app content
            this.showApp();
            
            console.log('✅ LifeStream ready!');
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ LifeStream initialization failed:', error);
            this.showError(error);
        }
    }

    /**
     * Initialize core systems
     */
    async initializeCore() {
        console.log('🔧 Initializing core systems...');
        
        // Initialize storage
        if (window.LifeStreamStorage) {
            await LifeStreamStorage.init();
        }
        
        // Initialize router
        if (window.LifeStreamRouter) {
            LifeStreamRouter.init();
        }
        
        // Load user data
        await this.loadUserData();
    }

    /**
     * Initialize all feature modules
     */
    async initializeModules() {
        console.log('📦 Initializing modules...');
        
        const moduleClasses = [
            'LifeStreamAI',
            'LifeStreamGoals', 
            'LifeStreamChat',
            'LifeStreamAnalytics',
            'LifeStreamInsights'
        ];

        for (const moduleClass of moduleClasses) {
            if (window[moduleClass]) {
                try {
                    console.log(`  🔄 Loading ${moduleClass}...`);
                    this.modules[moduleClass] = new window[moduleClass](this);
                    await this.modules[moduleClass].init();
                    console.log(`  ✅ ${moduleClass} ready`);
                } catch (error) {
                    console.warn(`  ⚠️ ${moduleClass} failed to load:`, error);
                }
            }
        }
    }

    /**
     * Setup navigation routing
     */
    setupRouting() {
        console.log('🧭 Setting up routing...');
        
        if (window.LifeStreamRouter) {
            // Define routes
            const routes = [
                { path: '/', component: 'chat', label: '💬 Chat' },
                { path: '/insights', component: 'insights', label: '🧠 Insights' },
                { path: '/goals', component: 'goals', label: '🎯 Goals' },
                { path: '/patterns', component: 'patterns', label: '📊 Patterns' }
            ];
            
            LifeStreamRouter.setRoutes(routes);
            LifeStreamRouter.createNavigation('navigationTabs');
            LifeStreamRouter.navigateTo('/'); // Default route
        }
    }

    /**
     * Load user data and preferences
     */
    async loadUserData() {
        console.log('👤 Loading user data...');
        
        // Load from storage or set defaults
        this.userData = await LifeStreamStorage.get('userData') || {
            goals: [
                { id: 1, title: 'Workout 10 hours/week', current: 7.5, target: 10, type: 'duration' },
                { id: 2, title: 'Call family 2x/week', current: 1, target: 2, type: 'frequency' },
                { id: 3, title: 'Read 30min daily', current: 4, target: 7, type: 'streak' },
                { id: 4, title: 'Send 100 emails/month', current: 67, target: 100, type: 'quantity' }
            ],
            activities: [],
            patterns: {},
            lifeScore: 8.2,
            streak: 5,
            preferences: {
                notifications: true,
                aiInsights: true,
                goalReminders: true
            }
        };
        
        // Save if new
        await LifeStreamStorage.set('userData', this.userData);
    }

    /**
     * Show the main app and hide loading screen
     */
    showApp() {
        console.log('🎨 Showing app interface...');
        
        // Animate loading screen out
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 500);
        }
        
        // Show app content
        if (this.appContent) {
            this.appContent.style.display = 'flex';
            setTimeout(() => {
                this.appContent.style.opacity = '1';
            }, 100);
        }
    }

    /**
     * Show error message
     */
    showError(error) {
        console.error('💥 App error:', error);
        
        if (this.loadingScreen) {
            this.loadingScreen.innerHTML = `
                <div class="loading-animation">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <div class="loading-text">Oops!</div>
                    <div class="loading-subtitle">Something went wrong. Please refresh the page.</div>
                    <button onclick="window.location.reload()" 
                            style="margin-top: 2rem; padding: 1rem 2rem; background: white; color: #00BCD4; border: none; border-radius: 25px; cursor: pointer;">
                        Refresh App
                    </button>
                </div>
            `;
        }
    }

    /**
     * Get module instance
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Get user data
     */
    getUserData() {
        return this.userData;
    }

    /**
     * Update user data
     */
    async updateUserData(newData) {
        this.userData = { ...this.userData, ...newData };
        await LifeStreamStorage.set('userData', this.userData);
        
        // Notify modules of data change
        this.broadcastDataUpdate(newData);
    }

    /**
     * Broadcast data updates to all modules
     */
    broadcastDataUpdate(data) {
        Object.values(this.modules).forEach(module => {
            if (module.onDataUpdate) {
                module.onDataUpdate(data);
            }
        });
    }

    /**
     * Log activity (used by modules)
     */
    async logActivity(activity) {
        console.log('📝 Logging activity:', activity);
        
        this.userData.activities.push({
            ...activity,
            timestamp: Date.now(),
            id: this.generateId()
        });
        
        await this.updateUserData(this.userData);
        return activity;
    }

    /**
     * Update goal progress (used by modules)
     */
    async updateGoalProgress(goalId, progress) {
        console.log('🎯 Updating goal progress:', goalId, progress);
        
        const goal = this.userData.goals.find(g => g.id === goalId);
        if (goal) {
            goal.current = progress;
            await this.updateUserData(this.userData);
        }
        
        return goal;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Handle app events
     */
    emit(event, data) {
        console.log('📡 App event:', event, data);
        
        // Handle specific app-level events
        switch (event) {
            case 'goal_completed':
                this.handleGoalCompleted(data);
                break;
            case 'streak_updated':
                this.handleStreakUpdated(data);
                break;
            case 'insight_discovered':
                this.handleInsightDiscovered(data);
                break;
        }
        
        // Broadcast to modules
        Object.values(this.modules).forEach(module => {
            if (module.onEvent) {
                module.onEvent(event, data);
            }
        });
    }

    /**
     * Handle goal completion
     */
    handleGoalCompleted(goal) {
        console.log('🎉 Goal completed!', goal);
        // Could trigger celebration animation, notification, etc.
    }

    /**
     * Handle streak update
     */
    handleStreakUpdated(streak) {
        console.log('🔥 Streak updated!', streak);
        this.userData.streak = streak;
    }

    /**
     * Handle new insight discovery
     */
    handleInsightDiscovered(insight) {
        console.log('💡 New insight!', insight);
        // Could show notification, update insights view, etc.
    }
}

// Global app instance
window.LifeStreamApp = LifeStreamApp;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new LifeStreamApp();
    await window.app.init();
});

// Handle app lifecycle events
window.addEventListener('beforeunload', () => {
    console.log('👋 LifeStream shutting down...');
});

// Handle errors
window.addEventListener('error', (event) => {
    console.error('🚨 Unhandled error:', event.error);
    if (window.app) {
        window.app.showError(event.error);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LifeStreamApp;
}
