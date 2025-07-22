/**
 * LifeStream Router - Navigation and View Management
 * Handles tab navigation, view switching, and mobile gestures
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.navigationContainer = null;
        this.mainContent = null;
        this.views = new Map();
        this.isAnimating = false;
    }

    /**
     * Initialize router
     */
    init() {
        console.log('🧭 Router initializing...');
        
        this.mainContent = document.getElementById('mainContent');
        this.setupGestureNavigation();
        this.setupKeyboardNavigation();
        
        // Listen for browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.route) {
                this.navigateTo(event.state.route, false);
            }
        });
    }

    /**
     * Set available routes
     */
    setRoutes(routes) {
        console.log('📍 Setting routes:', routes);
        
        routes.forEach(route => {
            this.routes.set(route.path, route);
        });
    }

    /**
     * Create navigation tabs
     */
    createNavigation(containerId) {
        this.navigationContainer = document.getElementById(containerId);
        if (!this.navigationContainer) {
            console.error('Navigation container not found:', containerId);
            return;
        }

        console.log('🔧 Creating navigation tabs...');
        
        // Clear existing content
        this.navigationContainer.innerHTML = '';
        
        // Create tabs for each route
        this.routes.forEach((route, path) => {
            const tab = this.createTab(route, path);
            this.navigationContainer.appendChild(tab);
        });
    }

    /**
     * Create individual tab element
     */
    createTab(route, path) {
        const tab = document.createElement('div');
        tab.className = 'tab inactive';
        tab.textContent = route.label;
        tab.dataset.path = path;
        tab.dataset.component = route.component;
        
        // Add click handler
        tab.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.navigateTo(path);
            }
        });
        
        return tab;
    }

    /**
     * Navigate to a specific route
     */
    async navigateTo(path, pushState = true) {
        const route = this.routes.get(path);
        if (!route) {
            console.warn('Route not found:', path);
            return;
        }

        console.log('🚀 Navigating to:', path);
        
        // Prevent navigation during animation
        if (this.isAnimating) {
            return;
        }
        
        this.isAnimating = true;
        
        try {
            // Update browser history
            if (pushState) {
                history.pushState({ route: path }, '', `#${path}`);
            }
            
            // Update active tab
            this.updateActiveTab(path);
            
            // Load and show view
            await this.showView(route);
            
            // Update current route
            this.currentRoute = route;
            
        } catch (error) {
            console.error('Navigation failed:', error);
        } finally {
            this.isAnimating = false;
        }
    }

    /**
     * Update active tab styling
     */
    updateActiveTab(activePath) {
        if (!this.navigationContainer) return;
        
        const tabs = this.navigationContainer.querySelectorAll('.tab');
        tabs.forEach(tab => {
            if (tab.dataset.path === activePath) {
                tab.classList.remove('inactive');
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
                tab.classList.add('inactive');
            }
        });
    }

    /**
     * Show view with animation
     */
    async showView(route) {
        if (!this.mainContent) return;
        
        console.log('📱 Showing view:', route.component);
        
        // Get or create view
        let viewElement = this.views.get(route.component);
        if (!viewElement) {
            viewElement = await this.createView(route);
            this.views.set(route.component, viewElement);
        }
        
        // Hide current view
        const currentView = this.mainContent.querySelector('.view.active');
        if (currentView) {
            currentView.classList.remove('active');
        }
        
        // Show new view
        if (!viewElement.parentNode) {
            this.mainContent.appendChild(viewElement);
        }
        
        // Trigger animation
        setTimeout(() => {
            viewElement.classList.add('active');
        }, 50);
        
        // Notify view module
        this.notifyViewModule(route.component, 'shown');
    }

    /**
     * Create view element
     */
    async createView(route) {
        console.log('🎨 Creating view:', route.component);
        
        const viewElement = document.createElement('div');
        viewElement.className = 'view';
        viewElement.id = `view-${route.component}`;
        
        // Load view content based on component
        const content = await this.loadViewContent(route.component);
        viewElement.innerHTML = content;
        
        return viewElement;
    }

    /**
     * Load view content from modules
     */
    async loadViewContent(component) {
        // Try to get content from corresponding module
        const moduleName = `LifeStream${component.charAt(0).toUpperCase() + component.slice(1)}`;
        const module = window.app?.getModule(moduleName);
        
        if (module && module.renderView) {
            return await module.renderView();
        }
        
        // Fallback to default content
        return this.getDefaultViewContent(component);
    }

    /**
     * Get default view content
     */
    getDefaultViewContent(component) {
        const defaults = {
            chat: `
                <div class="chat-container">
                    <div class="chat-header">
                        <div class="greeting">Good afternoon! 👋</div>
                        <div class="status">5-day productivity streak • 8.2/10 life score</div>
                    </div>
                    <div class="chat-area" id="chatArea">
                        <div class="message ai">
                            <div class="message-bubble">
                                Ready to track some amazing moments today? 🌟
                            </div>
                        </div>
                    </div>
                    <div class="input-area">
                        <div class="input-container">
                            <textarea class="chat-input" placeholder="Tell me about your day..." rows="1"></textarea>
                            <button class="btn btn-round btn-primary">➤</button>
                        </div>
                    </div>
                </div>
            `,
            insights: `
                <div class="analytics-container">
                    <div class="analytics-header">
                        <div class="analytics-title">🧠 AI Insights</div>
                        <div class="analytics-subtitle">Personalized intelligence from your life data</div>
                    </div>
                    <div class="grid grid-2">
                        <div class="metric-card">
                            <div class="metric-icon">⭐</div>
                            <div class="metric-value">8.2</div>
                            <div class="metric-label">Life Score</div>
                            <div class="metric-change">+0.5 this week</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">🎯</div>
                            <div class="metric-value">78%</div>
                            <div class="metric-label">Goal Success</div>
                            <div class="metric-change">+12% this month</div>
                        </div>
                    </div>
                </div>
            `,
            goals: `
                <div class="analytics-container">
                    <div class="analytics-header">
                        <div class="analytics-title">🎯 Goal Progress</div>
                        <div class="analytics-subtitle">Real-time tracking with AI optimization</div>
                    </div>
                    <div class="goals-section">
                        <div class="card">
                            <div class="card-body">
                                <div class="goal-header">
                                    <div class="goal-title">Workout 10 hours/week</div>
                                    <div class="goal-percentage">75%</div>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 75%"></div>
                                </div>
                                <div class="goal-stats">
                                    <span>7.5 / 10 hours</span>
                                    <span class="text-success font-semibold">On track! 🔥</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            patterns: `
                <div class="analytics-container">
                    <div class="analytics-header">
                        <div class="analytics-title">📊 Life Patterns</div>
                        <div class="analytics-subtitle">Discover your hidden productivity rhythms</div>
                    </div>
                    <div class="insight-card">
                        <div class="insight-header">
                            <div class="insight-icon">💪</div>
                            <div class="insight-title">Morning Workouts = 3x Success</div>
                            <div class="badge badge-success">High Impact</div>
                        </div>
                        <div class="insight-description">
                            You complete 95% of workouts when logged before 8 AM vs 32% in evenings
                        </div>
                        <div class="insight-action">
                            💡 Move remaining 2.5 workout hours to mornings this week
                        </div>
                    </div>
                </div>
            `
        };
        
        return defaults[component] || '<div class="analytics-container"><div class="analytics-header"><div class="analytics-title">🚧 Coming Soon</div></div></div>';
    }

    /**
     * Notify view module when shown/hidden
     */
    notifyViewModule(component, action) {
        const moduleName = `LifeStream${component.charAt(0).toUpperCase() + component.slice(1)}`;
        const module = window.app?.getModule(moduleName);
        
        if (module && module.onViewAction) {
            module.onViewAction(action);
        }
    }

    /**
     * Setup mobile gesture navigation
     */
    setupGestureNavigation() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1 && touchStartX) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndTime = Date.now();
                
                const diffX = touchStartX - touchEndX;
                const diffY = touchStartY - touchEndY;
                const diffTime = touchEndTime - touchStartTime;
                
                // Check for horizontal swipe
                if (Math.abs(diffX) > Math.abs(diffY) && 
                    Math.abs(diffX) > 50 && 
                    diffTime < 500 && 
                    !this.isAnimating) {
                    
                    const routes = Array.from(this.routes.keys());
                    const currentIndex = routes.indexOf(this.currentRoute?.path || '/');
                    
                    if (diffX > 0 && currentIndex < routes.length - 1) {
                        // Swipe left - next tab
                        this.navigateTo(routes[currentIndex + 1]);
                    } else if (diffX < 0 && currentIndex > 0) {
                        // Swipe right - previous tab
                        this.navigateTo(routes[currentIndex - 1]);
                    }
                }
                
                // Reset touch tracking
                touchStartX = 0;
                touchStartY = 0;
                touchStartTime = 0;
            }
        }, { passive: true });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Tab navigation with arrow keys
            if (e.altKey && !this.isAnimating) {
                const routes = Array.from(this.routes.keys());
                const currentIndex = routes.indexOf(this.currentRoute?.path || '/');
                
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    e.preventDefault();
                    this.navigateTo(routes[currentIndex - 1]);
                } else if (e.key === 'ArrowRight' && currentIndex < routes.length - 1) {
                    e.preventDefault();
                    this.navigateTo(routes[currentIndex + 1]);
                }
            }
        });
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Check if route exists
     */
    hasRoute(path) {
        return this.routes.has(path);
    }
}

// Create global router instance
window.LifeStreamRouter = new Router();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}
