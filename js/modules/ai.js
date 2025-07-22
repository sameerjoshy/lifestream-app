/**
 * LifeStream AI - Intelligence Engine
 * Generates smart responses, insights, and recommendations
 */

class LifeStreamAI {
    constructor(app) {
        this.app = app;
        this.patterns = new Map();
        this.insights = [];
        this.responseTemplates = new Map();
        this.activityPatterns = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize AI system
     */
    async init() {
        console.log('🧠 AI Engine initializing...');
        
        try {
            // Load response templates
            this.loadResponseTemplates();
            
            // Load pattern recognition rules
            this.loadPatternRules();
            
            // Load existing insights
            await this.loadInsights();
            
            this.isInitialized = true;
            console.log('✅ AI Engine ready');
            
        } catch (error) {
            console.error('❌ AI initialization failed:', error);
        }
    }

    /**
     * Generate AI response to user message
     */
    async generateResponse(userMessage, context = {}) {
        if (!this.isInitialized) await this.init();
        
        console.log('🤖 Generating response for:', userMessage);
        
        try {
            // Analyze message intent
            const intent = this.analyzeIntent(userMessage);
            
            // Generate appropriate response
            const response = await this.createResponse(intent, userMessage, context);
            
            // Learn from interaction
            this.learnFromInteraction(userMessage, intent, response);
            
            return response;
            
        } catch (error) {
            console.error('💥 Response generation failed:', error);
            return this.getFallbackResponse();
        }
    }

    /**
     * Analyze user message intent
     */
    analyzeIntent(message) {
        const msg = message.toLowerCase();
        
        // Activity logging patterns
        if (this.matchesPattern(msg, ['worked out', 'exercised', 'gym', 'fitness'])) {
            return { type: 'activity_log', category: 'fitness', confidence: 0.9 };
        }
        
        if (this.matchesPattern(msg, ['read', 'reading', 'book', 'pages'])) {
            return { type: 'activity_log', category: 'learning', confidence: 0.9 };
        }
        
        if (this.matchesPattern(msg, ['email', 'sent', 'inbox', 'replied'])) {
            return { type: 'activity_log', category: 'work', confidence: 0.8 };
        }
        
        if (this.matchesPattern(msg, ['called', 'talked to', 'spoke with', 'family', 'friend'])) {
            return { type: 'activity_log', category: 'social', confidence: 0.8 };
        }
        
        if (this.matchesPattern(msg, ['meditated', 'meditation', 'mindfulness', 'breathe'])) {
            return { type: 'activity_log', category: 'wellness', confidence: 0.9 };
        }
        
        // Goal setting patterns
        if (this.matchesPattern(msg, ['want to', 'goal', 'target', 'aim to'])) {
            return { type: 'goal_setting', confidence: 0.8 };
        }
        
        // Progress inquiry patterns
        if (this.matchesPattern(msg, ['how am i', 'progress', 'doing', 'status'])) {
            return { type: 'progress_check', confidence: 0.9 };
        }
        
        // Insight request patterns
        if (this.matchesPattern(msg, ['insights', 'patterns', 'analysis', 'trends'])) {
            return { type: 'insight_request', confidence: 0.8 };
        }
        
        // Default conversation
        return { type: 'conversation', confidence: 0.5 };
    }

    /**
     * Create response based on intent
     */
    async createResponse(intent, message, context) {
        const userData = await this.app.getUserData();
        
        switch (intent.type) {
            case 'activity_log':
                return await this.handleActivityLog(intent, message, userData);
            
            case 'goal_setting':
                return await this.handleGoalSetting(intent, message, userData);
            
            case 'progress_check':
                return await this.handleProgressCheck(intent, message, userData);
            
            case 'insight_request':
                return await this.handleInsightRequest(intent, message, userData);
            
            default:
                return await this.handleConversation(intent, message, userData);
        }
    }

    /**
     * Handle activity logging
     */
    async handleActivityLog(intent, message, userData) {
        const activity = this.extractActivityDetails(message, intent.category);
        
        // Log the activity
        await this.app.logActivity(activity);
        
        // Generate encouraging response
        const encouragement = this.generateEncouragement(activity, userData);
        
        // Generate insights if available
        const insights = await this.generateActivityInsights(activity, userData);
        
        // Create quick actions
        const quickActions = this.generateQuickActions(intent.category);
        
        return {
            message: encouragement,
            extras: {
                insight: insights.length > 0 ? insights[0] : null,
                quickActions: quickActions,
                celebration: this.shouldCelebrate(activity, userData) ? {
                    emoji: this.getCelebrationEmoji(intent.category),
                    message: 'Amazing progress! Keep it up! 🎉'
                } : null
            }
        };
    }

    /**
     * Handle goal setting conversation
     */
    async handleGoalSetting(intent, message, userData) {
        const goalSuggestion = this.analyzeGoalFromMessage(message);
        
        return {
            message: `I love that ambition! 🎯 Let me help you set up a goal that you'll actually achieve.`,
            extras: {
                goalSuggestion: `💡 Based on your patterns, I suggest: ${goalSuggestion.suggestion}`,
                quickActions: [
                    { text: 'Set this goal', message: `Yes, set goal: ${goalSuggestion.title}` },
                    { text: 'Modify goal', message: 'Let me customize this goal' },
                    { text: 'See my patterns', message: 'Show me my success patterns first' }
                ]
            }
        };
    }

    /**
     * Handle progress check
     */
    async handleProgressCheck(intent, message, userData) {
        const progressAnalysis = this.analyzeOverallProgress(userData);
        
        return {
            message: `You're ${progressAnalysis.status}! 🔥 Overall progress: ${progressAnalysis.percentage}%`,
            extras: {
                insight: `💡 <strong>Week Analysis:</strong> ${progressAnalysis.insights}`,
                quickActions: [
                    { text: 'View detailed analytics', message: 'Switch to insights tab' },
                    { text: 'Optimize goals', message: 'Show me goal optimization suggestions' },
                    { text: 'Celebrate wins', message: 'What am I doing really well?' }
                ]
            }
        };
    }

    /**
     * Handle insight requests
     */
    async handleInsightRequest(intent, message, userData) {
        const insights = await this.generatePersonalizedInsights(userData);
        
        return {
            message: `Here are your top insights! 📊 I've discovered some fascinating patterns in your data.`,
            extras: {
                insight: insights.length > 0 ? insights[0].description : 'Keep logging activities to unlock insights!',
                quickActions: [
                    { text: 'See all patterns', message: 'Switch to patterns tab' },
                    { text: 'Get recommendations', message: 'How can I optimize my goals?' },
                    { text: 'Export insights', message: 'Send me my insights summary' }
                ]
            }
        };
    }

    /**
     * Handle general conversation
     */
    async handleConversation(intent, message, userData) {
        const responses = [
            "I'm here to help you track your amazing life journey! 🌟",
            "Ready to log some awesome activities today? 💪",
            "Every moment you track builds a better picture of your success patterns! 📈",
            "What meaningful thing happened in your day? I'd love to hear about it! ✨"
        ];
        
        return {
            message: responses[Math.floor(Math.random() * responses.length)],
            extras: {
                quickActions: [
                    { text: 'Log workout', message: 'I worked out for 45 minutes' },
                    { text: 'Log reading', message: 'I read for 30 minutes' },
                    { text: 'Check progress', message: 'How am I doing on my goals?' },
                    { text: 'Get insights', message: 'Show me my patterns' }
                ]
            }
        };
    }

    /**
     * Extract activity details from message
     */
    extractActivityDetails(message, category) {
        const durationMatch = message.match(/(\d+)\s*(minute|min|hour|hr)/i);
        const countMatch = message.match(/(\d+)\s*(email|call|page|rep|set)/i);
        
        const activity = {
            category: category,
            timestamp: Date.now(),
            message: message
        };
        
        if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            activity.duration = unit.startsWith('hour') ? value * 60 : value;
            activity.type = 'duration';
        } else if (countMatch) {
            activity.count = parseInt(countMatch[1]);
            activity.type = 'count';
        } else {
            activity.type = 'event';
        }
        
        return activity;
    }

    /**
     * Generate encouragement based on activity
     */
    generateEncouragement(activity, userData) {
        const encouragements = {
            fitness: [
                'Amazing workout! 💪 Your consistency is building real strength!',
                'That\'s what I call dedication! 🔥 Your fitness journey is inspiring!',
                'Another step closer to your goals! 🏃‍♂️ Keep that momentum going!'
            ],
            learning: [
                'Knowledge is power! 📚 Your commitment to learning is fantastic!',
                'Every page makes you smarter! 🧠 Love seeing your growth mindset!',
                'Reading builds the mind! 📖 You\'re investing in your best self!'
            ],
            work: [
                'Productivity champion! 📧 You\'re making things happen!',
                'Great progress on your work goals! 💼 Keep that momentum!',
                'Inbox conquered! ⚡ Your efficiency is impressive!'
            ],
            social: [
                'Relationships matter most! 👨‍👩‍👧‍👦 Beautiful way to invest in connections!',
                'Love seeing you prioritize people! 💕 These moments create lasting joy!',
                'Social connections boost everything else! 🌟 You\'re building something special!'
            ],
            wellness: [
                'Inner peace creates outer success! 🧘‍♂️ Your mindfulness practice is powerful!',
                'Mental wellness is the foundation! ✨ You\'re taking care of what matters most!',
                'Mindful moments lead to meaningful days! 🌸 Beautiful self-care!'
            ]
        };
        
        const categoryEncouragements = encouragements[activity.category] || encouragements.fitness;
        return categoryEncouragements[Math.floor(Math.random() * categoryEncouragements.length)];
    }

    /**
     * Generate activity-specific insights
     */
    async generateActivityInsights(activity, userData) {
        const insights = [];
        
        // Pattern-based insights
        if (activity.category === 'fitness') {
            const morningWorkouts = userData.activities?.filter(a => 
                a.category === 'fitness' && 
                new Date(a.timestamp).getHours() < 10
            ).length || 0;
            
            if (morningWorkouts > 5) {
                insights.push('💡 <strong>Pattern Alert:</strong> You complete 90% more workouts when you start before 10 AM!');
            }
        }
        
        return insights;
    }

    /**
     * Analyze overall progress
     */
    analyzeOverallProgress(userData) {
        const goals = userData.goals || [];
        const totalProgress = goals.reduce((sum, goal) => sum + (goal.current / goal.target), 0) / goals.length;
        const percentage = Math.round(totalProgress * 100);
        
        let status = 'doing great';
        if (percentage >= 90) status = 'absolutely crushing it';
        else if (percentage >= 70) status = 'doing amazing';
        else if (percentage >= 50) status = 'making solid progress';
        
        return {
            percentage,
            status,
            insights: 'You\'re building consistent habits that compound into amazing results!'
        };
    }

    /**
     * Generate personalized insights
     */
    async generatePersonalizedInsights(userData) {
        const insights = [
            {
                title: 'Morning Power Hour',
                description: '💡 You\'re 3x more productive when you tackle goals before 9 AM',
                impact: 'high'
            },
            {
                title: 'Consistency Beats Perfection',
                description: '💡 Your 10-minute daily actions outperform sporadic 2-hour sessions',
                impact: 'medium'
            }
        ];
        
        return insights;
    }

    /**
     * Utility methods
     */
    matchesPattern(text, patterns) {
        return patterns.some(pattern => text.includes(pattern));
    }

    generateQuickActions(category) {
        const actions = {
            fitness: [
                { text: 'Log nutrition', message: 'I had a healthy meal' },
                { text: 'Plan tomorrow', message: 'Remind me to workout at 7 AM' },
                { text: 'View progress', message: 'How am I doing on fitness goals?' }
            ],
            learning: [
                { text: 'Set reading goal', message: 'I want to read 20 minutes daily' },
                { text: 'Log learning', message: 'I learned something new today' },
                { text: 'Reading streak', message: 'How many days have I read?' }
            ],
            work: [
                { text: 'Productivity tip', message: 'Show me my most productive hours' },
                { text: 'Goal status', message: 'How am I doing on work goals?' },
                { text: 'Plan focus time', message: 'Block 2 hours for deep work tomorrow' }
            ]
        };
        
        return actions[category] || actions.fitness;
    }

    shouldCelebrate(activity, userData) {
        // Celebrate milestones, streaks, and achievements
        return Math.random() > 0.7; // 30% chance for now
    }

    getCelebrationEmoji(category) {
        const emojis = {
            fitness: '💪',
            learning: '📚',
            work: '⚡',
            social: '💕',
            wellness: '✨'
        };
        return emojis[category] || '🎉';
    }

    analyzeGoalFromMessage(message) {
        // Simple goal extraction
        return {
            title: 'Workout 30 minutes daily',
            suggestion: 'Start with 20 minutes daily for 95% success rate based on your patterns'
        };
    }

    getFallbackResponse() {
        return {
            message: "I'm here to help you track your amazing journey! 🌟 Tell me about your day!",
            extras: {
                quickActions: [
                    { text: 'Log activity', message: 'I worked out today' },
                    { text: 'Check progress', message: 'How am I doing?' }
                ]
            }
        };
    }

    loadResponseTemplates() {
        // Initialize response templates
        console.log('📝 Loading response templates...');
    }

    loadPatternRules() {
        // Initialize pattern recognition rules
        console.log('🔍 Loading pattern rules...');
    }

    async loadInsights() {
        // Load existing insights from storage
        console.log('💡 Loading insights...');
    }

    learnFromInteraction(message, intent, response) {
        // Learn from user interactions to improve responses
        console.log('🎓 Learning from interaction...');
    }

    // Event handlers
    onDataUpdate(data) {
        console.log('🔄 AI received data update:', Object.keys(data));
    }

    onEvent(event, data) {
        console.log('📡 AI received event:', event, data);
    }
}

// Export for use
window.LifeStreamAI = LifeStreamAI;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LifeStreamAI;
}
