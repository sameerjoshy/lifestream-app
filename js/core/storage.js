/**
 * LifeStream Storage - Data Persistence and Management
 * Handles user data, goals, activities, and app state
 */

class Storage {
    constructor() {
        this.storageKey = 'lifestream_data';
        this.cache = new Map();
        this.isInitialized = false;
        this.syncQueue = [];
        this.isSyncing = false;
    }

    /**
     * Initialize storage system
     */
    async init() {
        console.log('💾 Storage initializing...');
        
        try {
            // Load existing data
            await this.loadFromStorage();
            
            // Setup auto-save
            this.setupAutoSave();
            
            // Setup cleanup
            this.setupDataCleanup();
            
            this.isInitialized = true;
            console.log('✅ Storage ready');
            
        } catch (error) {
            console.error('❌ Storage initialization failed:', error);
            await this.initializeDefaults();
        }
    }

    /**
     * Load data from browser storage
     */
    async loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                
                // Validate and migrate data if needed
                const validatedData = this.validateAndMigrate(data);
                
                // Load into cache
                Object.entries(validatedData).forEach(([key, value]) => {
                    this.cache.set(key, value);
                });
                
                console.log('📂 Data loaded from storage');
            } else {
                await this.initializeDefaults();
            }
        } catch (error) {
            console.error('💥 Failed to load from storage:', error);
            await this.initializeDefaults();
        }
    }

    /**
     * Initialize default data structure
     */
    async initializeDefaults() {
        console.log('🆕 Initializing default data...');
        
        const defaults = {
            userData: {
                profile: {
                    name: 'You',
                    streak: 0,
                    lifeScore: 7.0,
                    level: 1,
                    joinDate: Date.now()
                },
                goals: [
                    {
                        id: this.generateId(),
                        title: 'Workout 10 hours/week',
                        type: 'duration',
                        target: 10,
                        current: 0,
                        unit: 'hours',
                        timeframe: 'week',
                        created: Date.now(),
                        active: true
                    },
                    {
                        id: this.generateId(),
                        title: 'Call family 2x/week',
                        type: 'frequency',
                        target: 2,
                        current: 0,
                        unit: 'calls',
                        timeframe: 'week',
                        created: Date.now(),
                        active: true
                    }
                ],
                activities: [],
                patterns: {},
                insights: [],
                preferences: {
                    notifications: true,
                    aiInsights: true,
                    goalReminders: true,
                    theme: 'auto',
                    language: 'en'
                }
            },
            appState: {
                lastActive: Date.now(),
                currentView: 'chat',
                onboardingComplete: false,
                version: '2.0.0'
            },
            analytics: {
                sessions: [],
                totalActivities: 0,
                totalGoalsCompleted: 0,
                averageLifeScore: 7.0
            }
        };
        
        // Save defaults to cache and storage
        Object.entries(defaults).forEach(([key, value]) => {
            this.cache.set(key, value);
        });
        
        await this.saveToStorage();
    }

    /**
     * Validate and migrate data from older versions
     */
    validateAndMigrate(data) {
        console.log('🔄 Validating and migrating data...');
        
        // Ensure required structure exists
        if (!data.userData) data.userData = {};
        if (!data.userData.goals) data.userData.goals = [];
        if (!data.userData.activities) data.userData.activities = [];
        if (!data.userData.profile) data.userData.profile = {};
        if (!data.appState) data.appState = {};
        
        // Migrate goals to new format if needed
        data.userData.goals = data.userData.goals.map(goal => ({
            id: goal.id || this.generateId(),
            title: goal.title || 'Untitled Goal',
            type: goal.type || 'quantity',
            target: goal.target || 1,
            current: goal.current || 0,
            unit: goal.unit || 'units',
            timeframe: goal.timeframe || 'week',
            created: goal.created || Date.now(),
            active: goal.active !== false
        }));
        
        // Ensure profile has required fields
        const profile = data.userData.profile;
        if (!profile.name) profile.name = 'You';
        if (!profile.streak) profile.streak = 0;
        if (!profile.lifeScore) profile.lifeScore = 7.0;
        if (!profile.joinDate) profile.joinDate = Date.now();
        
        return data;
    }

    /**
     * Get data by key
     */
    async get(key, defaultValue = null) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        return this.cache.get(key) || defaultValue;
    }

    /**
     * Set data by key
     */
    async set(key, value) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        // Update cache
        this.cache.set(key, value);
        
        // Queue for saving
        this.queueSync(key, value);
        
        return value;
    }

    /**
     * Update nested data
     */
    async update(key, updateFn) {
        const current = await this.get(key, {});
        const updated = updateFn(current);
        return await this.set(key, updated);
    }

    /**
     * Delete data by key
     */
    async delete(key) {
        this.cache.delete(key);
        await this.saveToStorage();
    }

    /**
     * Get all data
     */
    async getAll() {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const result = {};
        this.cache.forEach((value, key) => {
            result[key] = value;
        });
        
        return result;
    }

    /**
     * Clear all data
     */
    async clear() {
        this.cache.clear();
        localStorage.removeItem(this.storageKey);
        await this.initializeDefaults();
    }

    /**
     * Queue data for syncing
     */
    queueSync(key, value) {
        this.syncQueue.push({ key, value, timestamp: Date.now() });
        
        // Debounced save
        if (!this.isSyncing) {
            setTimeout(() => this.processSyncQueue(), 1000);
        }
    }

    /**
     * Process sync queue
     */
    async processSyncQueue() {
        if (this.isSyncing || this.syncQueue.length === 0) return;
        
        this.isSyncing = true;
        
        try {
            await this.saveToStorage();
            this.syncQueue = [];
        } catch (error) {
            console.error('💥 Sync failed:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Save to browser storage
     */
    async saveToStorage() {
        try {
            const data = {};
            this.cache.forEach((value, key) => {
                data[key] = value;
            });
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            
        } catch (error) {
            console.error('💥 Failed to save to storage:', error);
            throw error;
        }
    }

    /**
     * Export user data
     */
    async exportData() {
        const allData = await this.getAll();
        return {
            ...allData,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
    }

    /**
     * Import user data
     */
    async importData(data) {
        console.log('📥 Importing data...');
        
        try {
            // Validate imported data
            const validatedData = this.validateAndMigrate(data);
            
            // Clear current data
            this.cache.clear();
            
            // Load imported data
            Object.entries(validatedData).forEach(([key, value]) => {
                this.cache.set(key, value);
            });
            
            // Save to storage
            await this.saveToStorage();
            
            console.log('✅ Data imported successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Import failed:', error);
            return false;
        }
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        // Save every 5 minutes
        setInterval(async () => {
            if (this.syncQueue.length > 0) {
                await this.processSyncQueue();
            }
        }, 5 * 60 * 1000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            if (this.syncQueue.length > 0) {
                // Synchronous save for page unload
                try {
                    const data = {};
                    this.cache.forEach((value, key) => {
                        data[key] = value;
                    });
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                } catch (error) {
                    console.error('💥 Emergency save failed:', error);
                }
            }
        });
    }

    /**
     * Setup data cleanup
     */
    setupDataCleanup() {
        // Clean old activities (keep last 30 days)
        setInterval(async () => {
            const userData = await this.get('userData', {});
            if (userData.activities) {
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                userData.activities = userData.activities.filter(
                    activity => activity.timestamp > thirtyDaysAgo
                );
                await this.set('userData', userData);
            }
        }, 24 * 60 * 60 * 1000); // Daily cleanup
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Get storage usage info
     */
    getStorageInfo() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const size = data ? new Blob([data]).size : 0;
            const sizeKB = Math.round(size / 1024 * 100) / 100;
            
            return {
                size: sizeKB,
                unit: 'KB',
                itemCount: this.cache.size,
                lastSaved: new Date().toISOString()
            };
        } catch (error) {
            return { size: 0, unit: 'KB', itemCount: 0, error: error.message };
        }
    }
}

// Create global storage instance
window.LifeStreamStorage = new Storage();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
