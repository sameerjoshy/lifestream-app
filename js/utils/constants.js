/**
 * LifeStream Constants & Configuration
 * Central configuration for the world's most intelligent life tracking app
 * All app settings, themes, API endpoints, and behavioral constants
 */

// =============================================================================
// APP METADATA & BRANDING
// =============================================================================

const APP_INFO = {
    name: 'LifeStream',
    version: '2.0.0',
    tagline: 'AI Life Intelligence',
    description: 'The world\'s most intelligent conversational life tracking app',
    author: 'LifeStream Team',
    buildDate: new Date().toISOString(),
    
    // Social & Marketing
    website: 'https://lifestream.app',
    support: 'support@lifestream.app',
    privacy: 'https://lifestream.app/privacy',
    terms: 'https://lifestream.app/terms'
};

// =============================================================================
// DESIGN SYSTEM & THEMES
// =============================================================================

const THEME = {
    colors: {
        // Primary Aqua Brand Colors
        primary: '#00d4ff',
        primaryDark: '#00b8e6',
        primaryLight: '#33ddff',
        primaryUltraLight: '#e6f9ff',
        
        // Secondary & Accent
        secondary: '#ff6b6b',
        accent: '#4ecdc4',
        success: '#00e676',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
        
        // Neutral Palette
        white: '#ffffff',
        black: '#000000',
        gray: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a'
        },
        
        // Dark Mode
        dark: {
            bg: '#0a0f1c',
            surface: '#1a1f2e',
            border: '#2d3748',
            text: '#e2e8f0',
            textSecondary: '#94a3b8'
        }
    },
    
    typography: {
        fontFamily: {
            primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace'
        },
        fontSize: {
            xs: '0.75rem',      // 12px
            sm: '0.875rem',     // 14px
            base: '1rem',       // 16px
            lg: '1.125rem',     // 18px
            xl: '1.25rem',      // 20px
            '2xl': '1.5rem',    // 24px
            '3xl': '1.875rem',  // 30px
            '4xl': '2.25rem',   // 36px
            '5xl': '3rem'       // 48px
        },
        fontWeight: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            black: '900'
        }
    },
    
    spacing: {
        xs: '0.25rem',    // 4px
        sm: '0.5rem',     // 8px
        md: '1rem',       // 16px
        lg: '1.5rem',     // 24px
        xl: '2rem',       // 32px
        '2xl': '3rem',    // 48px
        '3xl': '4rem',    // 64px
        '4xl': '6rem'     // 96px
    },
    
    borderRadius: {
        none: '0',
        sm: '0.25rem',    // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
        xl: '0.75rem',    // 12px
        '2xl': '1rem',    // 16px
        full: '9999px'
    },
    
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(0, 212, 255, 0.3)'
    },
    
    animations: {
        duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms'
        },
        easing: {
            ease: 'ease',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out',
            spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }
    }
};

// =============================================================================
// ACTIVITY TRACKING SYSTEM
// =============================================================================

const ACTIVITIES = {
    types: {
        WORKOUT: 'workout',
        WORK: 'work',
        SLEEP: 'sleep',
        READ: 'read',
        STUDY: 'study',
        MEDITATION: 'meditation',
        SOCIAL: 'social',
        ENTERTAINMENT: 'entertainment',
        COOKING: 'cooking',
        COMMUTE: 'commute',
        SHOPPING: 'shopping',
        CLEANING: 'cleaning',
        HOBBY: 'hobby',
        MOOD: 'mood',
        HEALTH: 'health',
        CUSTOM: 'custom'
    },
    
    categories: {
        FITNESS: ['workout', 'running', 'yoga', 'sports', 'walking'],
        PRODUCTIVITY: ['work', 'study', 'planning', 'organizing'],
        WELLNESS: ['sleep', 'meditation', 'health', 'mood', 'therapy'],
        LEARNING: ['read', 'study', 'course', 'research', 'practice'],
        SOCIAL: ['family', 'friends', 'meeting', 'date', 'party'],
        LIFESTYLE: ['cooking', 'shopping', 'cleaning', 'commute', 'hobby']
    },
    
    emojis: {
        workout: '💪',
        work: '💼',
        sleep: '😴',
        read: '📚',
        study: '📖',
        meditation: '🧘',
        social: '👥',
        entertainment: '🎬',
        cooking: '👨‍🍳',
        commute: '🚗',
        shopping: '🛍️',
        cleaning: '🧹',
        hobby: '🎨',
        mood: '😊',
        health: '🏥',
        custom: '⭐'
    },
    
    units: {
        time: ['minutes', 'hours', 'seconds'],
        distance: ['miles', 'kilometers', 'steps'],
        weight: ['pounds', 'kilograms', 'reps'],
        quantity: ['pages', 'chapters', 'items', 'sessions']
    },
    
    defaultGoals: {
        workout: { target: 150, unit: 'minutes', period: 'week' },
        sleep: { target: 8, unit: 'hours', period: 'day' },
        read: { target: 30, unit: 'minutes', period: 'day' },
        work: { target: 8, unit: 'hours', period: 'day' },
        meditation: { target: 10, unit: 'minutes', period: 'day' }
    }
};

// =============================================================================
// AI & INTELLIGENCE SYSTEM
// =============================================================================

const AI_CONFIG = {
    providers: {
        PRIMARY: 'gemini',
        FALLBACK: 'huggingface',
        LOCAL: 'local'
    },
    
    endpoints: {
        gemini: {
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            key: null, // Set via environment or user input
            model: 'gemini-pro'
        },
        huggingface: {
            url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
            key: null, // Set via environment or user input
            model: 'microsoft/DialoGPT-large'
        }
    },
    
    responseTypes: {
        ENCOURAGEMENT: 'encouragement',
        INSIGHT: 'insight',
        QUESTION: 'question',
        SUGGESTION: 'suggestion',
        CELEBRATION: 'celebration',
        CONCERN: 'concern'
    },
    
    personality: {
        tone: 'enthusiastic_supportive',
        style: 'conversational_coach',
        expertise: 'life_optimization',
        approach: 'data_driven_empathetic'
    },
    
    limits: {
        maxTokens: 150,
        maxResponseTime: 10000, // 10 seconds
        maxRetries: 3,
        rateLimitPerMinute: 30
    }
};

// =============================================================================
// GAMIFICATION & ENGAGEMENT
// =============================================================================

const GAMIFICATION = {
    streaks: {
        levels: [
            { days: 1, title: 'Getting Started', emoji: '🌱', reward: 10 },
            { days: 3, title: 'Building Momentum', emoji: '🔥', reward: 25 },
            { days: 7, title: 'Week Warrior', emoji: '⚡', reward: 50 },
            { days: 14, title: 'Habit Former', emoji: '💪', reward: 100 },
            { days: 30, title: 'Life Changer', emoji: '🚀', reward: 250 },
            { days: 60, title: 'Transformation Master', emoji: '🏆', reward: 500 },
            { days: 100, title: 'Legendary', emoji: '👑', reward: 1000 }
        ]
    },
    
    achievements: {
        FIRST_LOG: { title: 'First Step', description: 'Logged your first activity', points: 10, emoji: '🎯' },
        DAILY_GOAL: { title: 'Goal Crusher', description: 'Met your daily goal', points: 25, emoji: '✅' },
        WEEKLY_GOAL: { title: 'Week Winner', description: 'Completed weekly goal', points: 100, emoji: '🏅' },
        PERFECT_DAY: { title: 'Perfect Day', description: 'Logged all planned activities', points: 50, emoji: '⭐' },
        EARLY_BIRD: { title: 'Early Bird', description: 'Logged before 8 AM', points: 15, emoji: '🌅' },
        NIGHT_OWL: { title: 'Night Owl', description: 'Logged after 10 PM', points: 15, emoji: '🦉' },
        CONSISTENCY_KING: { title: 'Consistency King', description: '7 days in a row', points: 200, emoji: '👑' },
        DATA_LOVER: { title: 'Data Lover', description: 'Logged 100 activities', points: 300, emoji: '📊' }
    },
    
    points: {
        perLog: 1,
        perGoalMet: 10,
        perStreakDay: 2,
        bonusMultiplier: 1.5,
        weeklyBonus: 25
    },
    
    levels: [
        { level: 1, points: 0, title: 'Beginner', emoji: '🌱' },
        { level: 2, points: 100, title: 'Explorer', emoji: '🗺️' },
        { level: 3, points: 250, title: 'Tracker', emoji: '📈' },
        { level: 4, points: 500, title: 'Optimizer', emoji: '⚡' },
        { level: 5, points: 1000, title: 'Master', emoji: '🏆' },
        { level: 6, points: 2000, title: 'Legend', emoji: '👑' },
        { level: 7, points: 5000, title: 'Life Guru', emoji: '🧘‍♂️' }
    ]
};

// =============================================================================
// USER INTERFACE CONFIGURATION
// =============================================================================

const UI_CONFIG = {
    navigation: {
        tabs: [
            { id: 'chat', label: 'Chat', icon: '💬', route: '/chat' },
            { id: 'goals', label: 'Goals', icon: '🎯', route: '/goals' },
            { id: 'analytics', label: 'Stats', icon: '📊', route: '/analytics' },
            { id: 'insights', label: 'Insights', icon: '💡', route: '/insights' }
        ],
        defaultTab: 'chat'
    },
    
    chat: {
        maxMessages: 1000,
        autoSave: true,
        autoSaveInterval: 5000, // 5 seconds
        maxMessageLength: 1000,
        typingIndicatorDelay: 500,
        scrollBehavior: 'smooth'
    },
    
    notifications: {
        enabled: true,
        position: 'top-right',
        duration: 3000,
        types: {
            SUCCESS: 'success',
            ERROR: 'error',
            WARNING: 'warning',
            INFO: 'info'
        }
    },
    
    animations: {
        enabled: true,
        reducedMotion: false, // Respect user preference
        pageTransitions: true,
        microInteractions: true
    },
    
    accessibility: {
        highContrast: false,
        fontSize: 'normal', // small, normal, large
        keyboardNavigation: true,
        screenReader: true
    }
};

// =============================================================================
// DATA & STORAGE CONFIGURATION
// =============================================================================

const STORAGE_CONFIG = {
    keys: {
        USER_DATA: 'lifestream_user',
        CHAT_HISTORY: 'lifestream_chat',
        ACTIVITIES: 'lifestream_activities',
        GOALS: 'lifestream_goals',
        SETTINGS: 'lifestream_settings',
        ACHIEVEMENTS: 'lifestream_achievements',
        STATS: 'lifestream_stats'
    },
    
    limits: {
        maxChatMessages: 1000,
        maxActivitiesPerDay: 100,
        maxGoals: 50,
        storageQuotaWarning: 0.8 // Warn at 80% usage
    },
    
    backup: {
        enabled: true,
        frequency: 'daily',
        retention: 30, // days
        compression: true
    },
    
    sync: {
        enabled: false, // Future cloud sync
        conflictResolution: 'client_wins',
        batchSize: 100
    }
};

// =============================================================================
// PERFORMANCE & OPTIMIZATION
// =============================================================================

const PERFORMANCE_CONFIG = {
    lazy: {
        enabled: true,
        threshold: 100, // pixels
        placeholder: 'blur'
    },
    
    caching: {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 50, // MB
        strategy: 'lru' // Least Recently Used
    },
    
    debounce: {
        search: 300,
        input: 150,
        resize: 100,
        scroll: 50
    },
    
    batch: {
        enabled: true,
        size: 10,
        timeout: 1000
    }
};

// =============================================================================
// FEATURE FLAGS & EXPERIMENTS
// =============================================================================

const FEATURES = {
    // Core Features
    CHAT_INTERFACE: true,
    GOAL_TRACKING: true,
    ANALYTICS_DASHBOARD: true,
    INSIGHTS_ENGINE: true,
    
    // Advanced Features
    VOICE_INPUT: false,
    PHOTO_LOGGING: false,
    SOCIAL_SHARING: false,
    CALENDAR_INTEGRATION: false,
    WEARABLE_SYNC: false,
    
    // AI Features
    REAL_TIME_AI: false, // Enable when API keys available
    PREDICTIVE_INSIGHTS: false,
    SMART_REMINDERS: false,
    MOOD_ANALYSIS: false,
    
    // Experimental
    DARK_MODE: true,
    OFFLINE_MODE: true,
    PROGRESSIVE_WEB_APP: true,
    BACKGROUND_SYNC: false
};

// =============================================================================
// VALIDATION & ERROR HANDLING
// =============================================================================

const VALIDATION = {
    activity: {
        nameMinLength: 1,
        nameMaxLength: 100,
        durationMin: 0,
        durationMax: 1440, // 24 hours in minutes
        valueMin: 0,
        valueMax: 999999
    },
    
    goal: {
        titleMinLength: 3,
        titleMaxLength: 50,
        targetMin: 0.1,
        targetMax: 10000,
        periodOptions: ['day', 'week', 'month', 'year']
    },
    
    user: {
        nameMinLength: 2,
        nameMaxLength: 30,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
};

const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Connection failed. Please check your internet and try again.',
    AI_SERVICE_ERROR: 'AI service is temporarily unavailable. Your data is safe.',
    STORAGE_FULL: 'Storage is full. Please clear some old data.',
    INVALID_INPUT: 'Please check your input and try again.',
    GENERIC_ERROR: 'Something went wrong. Please try again.',
    RATE_LIMIT: 'Too many requests. Please wait a moment.',
    OFFLINE: 'You\'re offline. Changes will sync when connection returns.'
};

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

// Make all constants available globally
window.LifeStream = window.LifeStream || {};
window.LifeStream.Config = {
    APP_INFO,
    THEME,
    ACTIVITIES,
    AI_CONFIG,
    GAMIFICATION,
    UI_CONFIG,
    STORAGE_CONFIG,
    PERFORMANCE_CONFIG,
    FEATURES,
    VALIDATION,
    ERROR_MESSAGES,
    
    // Utility functions for configuration
    getTheme: (isDark = false) => isDark ? THEME.colors.dark : THEME.colors,
    
    getActivityEmoji: (type) => ACTIVITIES.emojis[type] || ACTIVITIES.emojis.custom,
    
    isFeatureEnabled: (feature) => FEATURES[feature] || false,
    
    getStorageKey: (key) => STORAGE_CONFIG.keys[key] || `lifestream_${key}`,
    
    validateActivity: (activity) => {
        const { nameMinLength, nameMaxLength, durationMin, durationMax } = VALIDATION.activity;
        return activity.name?.length >= nameMinLength && 
               activity.name?.length <= nameMaxLength &&
               activity.duration >= durationMin &&
               activity.duration <= durationMax;
    },
    
    // Get current app version and build info
    getBuildInfo: () => ({
        version: APP_INFO.version,
        buildDate: APP_INFO.buildDate,
        features: Object.keys(FEATURES).filter(key => FEATURES[key]).length
    })
};

console.log(`🚀 LifeStream v${APP_INFO.version} Configuration Loaded`);
console.log(`✨ ${Object.keys(FEATURES).filter(key => FEATURES[key]).length} features enabled`);
console.log(`🎨 Theme system with ${Object.keys(THEME.colors).length} color definitions`);
console.log(`📊 ${Object.keys(ACTIVITIES.types).length} activity types configured`);
console.log(`🏆 ${GAMIFICATION.achievements ? Object.keys(GAMIFICATION.achievements).length : 0} achievements available`);
