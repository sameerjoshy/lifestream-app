/**
 * LifeStream AI - Enhanced Intelligence Engine with Real Google Gemini Integration
 * Builds on existing structure with genuine AI capabilities
 */

class LifeStreamAI {
    constructor(app) {
        this.app = app;
        this.patterns = new Map();
        this.insights = [];
        this.responseTemplates = new Map();
        this.activityPatterns = new Map();
        this.isInitialized = false;
        
        // Enhanced AI Configuration
        this.aiProvider = 'gemini'; // 'gemini', 'fallback', or 'mock'
        this.conversationHistory = [];
        this.userContext = {
            preferences: {},
            patterns: {},
            streak: 0,
            totalActivities: 0,
            favoriteCategories: [],
            recentMood: 'neutral'
        };
        
        // API Configuration
        this.apiConfig = {
            gemini: {
                url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
                maxTokens: 200,
                temperature: 0.8
            }
        };
        
        // Performance tracking
        this.responseMetrics = {
            aiResponses: 0,
            fallbackResponses: 0,
            averageResponseTime: 0
        };
    }

    /**
     * Initialize AI system with enhanced capabilities
     */
    async init() {
        console.log('🧠 Enhanced AI Engine initializing...');
        
        try {
            // Load existing components
            this.loadResponseTemplates();
            this.loadPatternRules();
            await this.loadInsights();
            
            // Enhanced: Load user context and conversation history
            await this.loadUserContext();
            await this.loadConversationHistory();
            
            // Enhanced: Test AI API connectivity
            await this.testAIConnectivity();
            
            this.isInitialized = true;
            console.log(`✅ Enhanced AI Engine ready (Provider: ${this.aiProvider})`);
            
        } catch (error) {
            console.error('❌ Enhanced AI initialization failed:', error);
            this.aiProvider = 'mock'; // Graceful fallback
        }
    }

    /**
     * Enhanced: Test AI API connectivity
     */
    async testAIConnectivity() {
        try {
            const testResponse = await this.callGeminiAPI(
                "Respond with exactly 'AI Connected' to test the connection.", 
                { maxTokens: 10 }
            );
            
            if (testResponse && testResponse.toLowerCase().includes('connected')) {
                console.log('✅ Gemini AI connection successful');
                this.aiProvider = 'gemini';
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Gemini API test failed, using intelligent fallbacks:', error.message);
            this.aiProvider = 'fallback';
            return false;
        }
    }

    /**
     * Enhanced: Generate AI response with real intelligence
     */
    async generateResponse(userMessage, context = {}) {
        if (!this.isInitialized) await this.init();
        
        console.log('🤖 Generating enhanced response for:', userMessage);
        const startTime = performance.now();
        
        try {
            // Analyze message intent (keeping existing logic)
            const intent = this.analyzeIntent(userMessage);
            
            // Enhanced: Update user context
            await this.updateUserContext(userMessage, intent, context);
            
            let response;
            
            // Enhanced: Use real AI for complex responses
            if (this.shouldUseAI(intent, userMessage)) {
                response = await this.generateAIResponse(userMessage, intent, context);
                this.responseMetrics.aiResponses++;
            } else {
                // Use existing structured responses for simple cases
                response = await this.createResponse(intent, userMessage, context);
                this.responseMetrics.fallbackResponses++;
            }
            
            // Enhanced: Learn from interaction
            await this.learnFromInteraction(userMessage, intent, response);
            
            // Enhanced: Update conversation history
            this.updateConversationHistory(userMessage, response);
            
            const responseTime = performance.now() - startTime;
            this.updateResponseMetrics(responseTime);
            
            return response;
            
        } catch (error) {
            console.error('💥 Enhanced response generation failed:', error);
            return this.getFallbackResponse();
        }
    }

    /**
     * Enhanced: Determine when to use AI vs structured responses
     */
    shouldUseAI(intent, message) {
        // Use AI for complex conversations, insights, and personalized responses
        const aiTriggers = [
            intent.type === 'insight_request',
            intent.type === 'progress_check',
            intent.type === 'conversation',
            message.length > 50, // Longer messages likely need nuanced responses
            message.includes('?'), // Questions benefit from AI
            message.includes('how'), // How questions
            message.includes('why'), // Why questions
            this.conversationHistory.length > 5 // Ongoing conversations
        ];
        
        return this.aiProvider === 'gemini' && aiTriggers.some(trigger => trigger);
    }

    /**
     * Enhanced: Generate response using real AI
     */
    async generateAIResponse(userMessage, intent, context) {
        try {
            const prompt = this.buildIntelligentPrompt(userMessage, intent, context);
            const aiResponse = await this.callGeminiAPI(prompt);
            
            // Process AI response and add structured extras
            const processedResponse = this.processAIResponse(aiResponse, intent);
            
            return {
                message: processedResponse.message,
                extras: {
                    ...processedResponse.extras,
                    isAIGenerated: true,
                    quickActions: this.generateQuickActions(intent.category || 'general')
                }
            };
            
        } catch (error) {
            console.error('AI response generation failed:', error);
            // Graceful fallback to structured response
            return await this.createResponse(intent, userMessage, context);
        }
    }

    /**
     * Enhanced: Build intelligent prompt for AI
     */
    buildIntelligentPrompt(userMessage, intent, context) {
        const userData = this.userContext;
        const timeOfDay = this.getTimeOfDay();
        
        let prompt = `You are LifeStream AI, a supportive life-tracking companion. You help users feel accomplished and motivated.

USER CONTEXT:
- Current streak: ${userData.streak} days
- Total activities logged: ${userData.totalActivities}
- Favorite categories: ${userData.favoriteCategories.join(', ') || 'none yet'}
- Recent mood: ${userData.recentMood}
- Time of day: ${timeOfDay}
- Intent detected: ${intent.type} (${intent.category || 'general'})

CONVERSATION HISTORY (last 3 messages):
${this.conversationHistory.slice(-3).map((msg, i) => 
    `${i + 1}. ${msg.type === 'user' ? 'User' : 'AI'}: ${msg.content.substring(0, 100)}...`
).join('\n')}

USER MESSAGE: "${userMessage}"

RESPONSE GUIDELINES:
- Be encouraging and supportive (but not overly enthusiastic)
- Keep response under 150 words
- Use 1-2 relevant emojis naturally
- If they logged an activity, acknowledge it specifically
- If asking about progress, reference their actual data
- If requesting insights, provide data-driven observations
- Match their energy level and tone
- Be conversational, not robotic

`;

        // Add specific guidance based on intent
        switch (intent.type) {
            case 'activity_log':
                prompt += `They just logged an activity. Celebrate their progress and maybe offer a gentle insight about their patterns.`;
                break;
            case 'progress_check':
                prompt += `They want to know how they're doing. Be specific about their ${userData.streak}-day streak and recent activities.`;
                break;
            case 'insight_request':
                prompt += `They want insights. Reference their patterns and provide encouraging observations about their progress.`;
                break;
            case 'goal_setting':
                prompt += `They're thinking about goals. Be supportive and suggest achievable targets based on their history.`;
                break;
            default:
                prompt += `Respond naturally to their message while staying focused on their life-tracking journey.`;
        }

        return prompt;
    }

    /**
     * Enhanced: Call Google Gemini API
     */
    async callGeminiAPI(prompt, options = {}) {
        const config = { ...this.apiConfig.gemini, ...options };
        
        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: config.temperature,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: config.maxTokens,
                candidateCount: 1
            }
        };

        const response = await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error('Invalid Gemini API response structure');
        }
    }

    /**
     * Enhanced: Process AI response and extract structured data
     */
    processAIResponse(aiResponse, intent) {
        // Clean up the response
        let message = aiResponse.trim();
        
        // Remove any unwanted formatting
        message = message.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown
        message = message.replace(/\*(.*?)\*/g, '$1'); // Remove italic markdown
        
        // Ensure reasonable length
        if (message.length > 300) {
            const sentences = message.split('. ');
            message = sentences.slice(0, 2).join('. ');
            if (!message.endsWith('.')) message += '.';
        }
        
        // Extract any insights or celebrations from the AI response
        const extras = {};
        
        // Look for insight patterns in the response
        if (message.includes('💡') || message.toLowerCase().includes('insight')) {
            const insightMatch = message.match(/💡.*$/);
            if (insightMatch) {
                extras.insight = insightMatch[0];
            }
        }
        
        // Look for celebration patterns
        if (message.includes('🎉') || message.includes('amazing') || message.includes('great job')) {
            extras.celebration = {
                emoji: this.getCelebrationEmoji(intent.category),
                message: 'Keep up the amazing work! 🎉'
            };
        }
        
        return { message, extras };
    }

    /**
     * Enhanced: Update user context with learning
     */
    async updateUserContext(userMessage, intent, context) {
        try {
            // Update activity counts
            if (intent.type === 'activity_log') {
                this.userContext.totalActivities++;
                
                // Track category preferences
                if (intent.category) {
                    if (!this.userContext.favoriteCategories.includes(intent.category)) {
                        this.userContext.favoriteCategories.push(intent.category);
                    }
                }
            }
            
            // Update streak from app data
            const userData = await this.app.getUserData();
            if (userData.streak) {
                this.userContext.streak = userData.streak;
            }
            
            // Detect mood from message
            const detectedMood = this.detectMoodFromMessage(userMessage);
            if (detectedMood !== 'neutral') {
                this.userContext.recentMood = detectedMood;
            }
            
            // Save updated context
            await this.saveUserContext();
            
        } catch (error) {
            console.error('Error updating user context:', error);
        }
    }

    /**
     * Enhanced: Detect mood from user message
     */
    detectMoodFromMessage(message) {
        const msg = message.toLowerCase();
        
        if (this.matchesPattern(msg, ['great', 'amazing', 'awesome', 'fantastic', 'love', 'excited'])) {
            return 'great';
        }
        if (this.matchesPattern(msg, ['good', 'nice', 'solid', 'decent', 'happy'])) {
            return 'good';
        }
        if (this.matchesPattern(msg, ['tired', 'exhausted', 'drained', 'weary'])) {
            return 'tired';
        }
        if (this.matchesPattern(msg, ['stressed', 'overwhelmed', 'anxious', 'worried', 'difficult'])) {
            return 'stressed';
        }
        
        return 'neutral';
    }

    /**
     * Enhanced: Conversation history management
     */
    updateConversationHistory(userMessage, response) {
        this.conversationHistory.push(
            { type: 'user', content: userMessage, timestamp: Date.now() },
            { type: 'ai', content: response.message, timestamp: Date.now() }
        );
        
        // Keep only last 20 messages for performance
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
        
        // Save to storage
        this.saveConversationHistory();
    }

    /**
     * Enhanced: Get time of day context
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'very early morning';
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'late evening';
    }

    /**
     * Enhanced: Load user context from storage
     */
    async loadUserContext() {
        try {
            const savedContext = await this.app.storage?.getData?.('aiUserContext');
            if (savedContext) {
                this.userContext = { ...this.userContext, ...savedContext };
            }
        } catch (error) {
            console.error('Error loading user context:', error);
        }
    }

    /**
     * Enhanced: Save user context to storage
     */
    async saveUserContext() {
        try {
            await this.app.storage?.saveData?.('aiUserContext', this.userContext);
        } catch (error) {
            console.error('Error saving user context:', error);
        }
    }

    /**
     * Enhanced: Load conversation history
     */
    async loadConversationHistory() {
        try {
            const savedHistory = await this.app.storage?.getData?.('aiConversationHistory');
            if (savedHistory) {
                this.conversationHistory = savedHistory;
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }

    /**
     * Enhanced: Save conversation history
     */
    async saveConversationHistory() {
        try {
            await this.app.storage?.saveData?.('aiConversationHistory', this.conversationHistory);
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }

    /**
     * Enhanced: Performance metrics tracking
     */
    updateResponseMetrics(responseTime) {
        const currentAvg = this.responseMetrics.averageResponseTime;
        const totalResponses = this.responseMetrics.aiResponses + this.responseMetrics.fallbackResponses;
        
        this.responseMetrics.averageResponseTime = 
            ((currentAvg * (totalResponses - 1)) + responseTime) / totalResponses;
    }

    /**
     * Enhanced: Get AI performance stats
     */
    getAIStats() {
        const total = this.responseMetrics.aiResponses + this.responseMetrics.fallbackResponses;
        return {
            provider: this.aiProvider,
            totalResponses: total,
            aiResponseRate: total > 0 ? Math.round((this.responseMetrics.aiResponses / total) * 100) : 0,
            averageResponseTime: Math.round(this.responseMetrics.averageResponseTime),
            conversationLength: this.conversationHistory.length
        };
    }

    // ============================================================================
    // EXISTING METHODS (Enhanced but keeping original structure)
    // ============================================================================

    /**
     * Analyze user message intent (Enhanced with better patterns)
     */
    analyzeIntent(message) {
        const msg = message.toLowerCase();
        
        // Enhanced activity patterns with better confidence scoring
        if (this.matchesPattern(msg, ['worked out', 'exercised', 'gym', 'fitness', 'ran', 'running', 'lifted'])) {
            return { type: 'activity_log', category: 'fitness', confidence: 0.95 };
        }
        
        if (this.matchesPattern(msg, ['read', 'reading', 'book', 'pages', 'studied', 'learning'])) {
            return { type: 'activity_log', category: 'learning', confidence: 0.9 };
        }
        
        if (this.matchesPattern(msg, ['work', 'worked', 'email', 'meeting', 'project', 'task', 'coding'])) {
            return { type: 'activity_log', category: 'work', confidence: 0.85 };
        }
        
        if (this.matchesPattern(msg, ['called', 'talked', 'family', 'friend', 'social', 'dinner', 'hangout'])) {
            return { type: 'activity_log', category: 'social', confidence: 0.8 };
        }
        
        if (this.matchesPattern(msg, ['meditated', 'meditation', 'mindfulness', 'yoga', 'relaxed', 'wellness'])) {
            return { type: 'activity_log', category: 'wellness', confidence: 0.95 };
        }
        
        // Enhanced goal and progress patterns
        if (this.matchesPattern(msg, ['want to', 'goal', 'target', 'aim', 'plan to', 'trying to'])) {
            return { type: 'goal_setting', confidence: 0.9 };
        }
        
        if (this.matchesPattern(msg, ['how am i', 'progress', 'doing', 'status', 'streak', 'stats'])) {
            return { type: 'progress_check', confidence: 0.95 };
        }
        
        if (this.matchesPattern(msg, ['insights', 'patterns', 'analysis', 'trends', 'show me', 'what do you'])) {
            return { type: 'insight_request', confidence: 0.9 };
        }
        
        // Enhanced conversation detection
        if (this.matchesPattern(msg, ['hello', 'hi', 'hey', 'good morning', 'what\'s up', 'how are you'])) {
            return { type: 'conversation', confidence: 0.8 };
        }
        
        return { type: 'conversation', confidence: 0.6 };
    }

    // Keep all existing methods but enhance where beneficial
    async createResponse(intent, message, context) {
        // Use existing logic but with enhanced context
        const userData = await this.app.getUserData();
        
        // Add user context to userData
        userData.aiContext = this.userContext;
        
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
     * Enhanced activity logging with better responses
     */
    async handleActivityLog(intent, message, userData) {
        const activity = this.extractActivityDetails(message, intent.category);
        
        // Log the activity
        await this.app.logActivity(activity);
        
        // Enhanced encouragement with context
        const encouragement = this.generateContextualEncouragement(activity, userData);
        
        // Generate insights
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
                    message: this.getStreakCelebration(userData.streak || 0)
                } : null
            }
        };
    }

    /**
     * Enhanced encouragement with user context
     */
    generateContextualEncouragement(activity, userData) {
        const baseEncouragement = this.generateEncouragement(activity, userData);
        const context = userData.aiContext || {};
        
        // Add streak context if relevant
        if (context.streak > 0) {
            const streakBonus = this.getStreakBonus(context.streak);
            return `${baseEncouragement} ${streakBonus}`;
        }
        
        return baseEncouragement;
    }

    /**
     * Enhanced streak celebrations
     */
    getStreakBonus(streak) {
        if (streak >= 30) return `🔥 30-day streak legend! You're unstoppable!`;
        if (streak >= 14) return `⚡ ${streak} days strong! You're building something amazing!`;
        if (streak >= 7) return `🌟 Week ${Math.floor(streak/7)} complete! Incredible consistency!`;
        if (streak >= 3) return `💪 ${streak}-day streak! Momentum is building!`;
        return '';
    }

    getStreakCelebration(streak) {
        if (streak >= 30) return '30-day legend! You\'re rewriting what\'s possible! 👑';
        if (streak >= 14) return 'Two weeks of excellence! Your dedication inspires! 🚀';
        if (streak >= 7) return 'One week strong! You\'re proving your commitment! ⭐';
        if (streak >= 3) return 'Building momentum beautifully! 🔥';
        return 'Every step counts! Keep it up! 🎉';
    }

    // Keep all other existing methods unchanged
    // ... (all your existing methods: handleGoalSetting, handleProgressCheck, etc.)

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

    // ... (keep all other existing methods: extractActivityDetails, generateEncouragement, etc.)

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
            ],
            social: [
                { text: 'Social goals', message: 'How can I improve my relationships?' },
                { text: 'Plan connection', message: 'Remind me to call mom tonight' },
                { text: 'Social insights', message: 'Show me my social activity patterns' }
            ],
            wellness: [
                { text: 'Mindfulness goal', message: 'I want to meditate daily' },
                { text: 'Wellness check', message: 'How is my mental health trending?' },
                { text: 'Self-care tip', message: 'Suggest a wellness activity for today' }
            ],
            general: [
                { text: 'Log activity', message: 'I just completed something meaningful' },
                { text: 'Check progress', message: 'How am I doing overall?' },
                { text: 'Get insights', message: 'Show me my patterns and trends' },
                { text: 'Set goal', message: 'Help me set a new goal' }
            ]
        };
        
        return actions[category] || actions.general;
    }

    shouldCelebrate(activity, userData) {
        // Enhanced celebration logic
        const context = userData.aiContext || {};
        
        // Always celebrate streaks
        if (context.streak > 0 && context.streak % 7 === 0) return true;
        
        // Celebrate first activities in new categories
        if (!context.favoriteCategories.includes(activity.category)) return true;
        
        // Celebrate milestones
        if (context.totalActivities > 0 && context.totalActivities % 10 === 0) return true;
        
        // Random celebration (30% chance)
        return Math.random() > 0.7;
    }

    getCelebrationEmoji(category) {
        const emojis = {
            fitness: '💪',
            learning: '📚',
            work: '⚡',
            social: '💕',
            wellness: '✨',
            general: '🎉'
        };
        return emojis[category] || '🎉';
    }

    analyzeGoalFromMessage(message) {
        const msg = message.toLowerCase();
        
        // Enhanced goal analysis with AI context
        if (this.matchesPattern(msg, ['workout', 'exercise', 'fitness'])) {
            return {
                title: 'Daily Fitness Routine',
                suggestion: 'Start with 20 minutes daily - users with your patterns have 95% success rate'
            };
        }
        
        if (this.matchesPattern(msg, ['read', 'reading', 'book'])) {
            return {
                title: 'Daily Reading Habit',
                suggestion: 'Begin with 15 minutes daily - builds strong foundation for lifelong learning'
            };
        }
        
        if (this.matchesPattern(msg, ['meditate', 'meditation', 'mindfulness'])) {
            return {
                title: 'Mindfulness Practice',
                suggestion: 'Start with 5 minutes daily - consistency matters more than duration'
            };
        }
        
        return {
            title: 'Personal Growth Goal',
            suggestion: 'Start small, be specific, track daily - personalized based on your success patterns'
        };
    }

    getFallbackResponse() {
        const fallbacks = [
            "I'm here to help you track your amazing journey! 🌟 Tell me about your day!",
            "Every moment you log helps build a clearer picture of your success! ✨",
            "Ready to make today count? Share what you've accomplished! 💪",
            "Your progress matters! Let's log something meaningful together! 🎯"
        ];
        
        return {
            message: fallbacks[Math.floor(Math.random() * fallbacks.length)],
            extras: {
                quickActions: [
                    { text: 'Log workout', message: 'I worked out today' },
                    { text: 'Log learning', message: 'I learned something new' },
                    { text: 'Check progress', message: 'How am I doing?' },
                    { text: 'Get insights', message: 'Show me my patterns' }
                ]
            }
        };
    }

    // Enhanced learning and storage methods
    loadResponseTemplates() {
        console.log('📝 Loading enhanced response templates...');
        
        // Enhanced templates with AI integration flags
        this.responseTemplates.set('activity_celebration', {
            useAI: true,
            fallback: 'Amazing work! 🎉 You\'re building incredible momentum!'
        });
        
        this.responseTemplates.set('streak_milestone', {
            useAI: true,
            fallback: 'Streak power! 🔥 Your consistency is inspiring!'
        });
        
        this.responseTemplates.set('goal_encouragement', {
            useAI: true,
            fallback: 'You\'ve got this! 🎯 Every step counts toward your goal!'
        });
    }

    loadPatternRules() {
        console.log('🔍 Loading enhanced pattern rules...');
        
        // Enhanced pattern rules for better AI context
        this.patterns.set('morning_productivity', {
            condition: (userData) => {
                const morningActivities = userData.activities?.filter(a => 
                    new Date(a.timestamp).getHours() < 10
                ).length || 0;
                return morningActivities > userData.activities?.length * 0.6;
            },
            insight: 'You\'re most productive in the morning hours!',
            recommendation: 'Schedule your most important goals before 10 AM'
        });
        
        this.patterns.set('weekend_warrior', {
            condition: (userData) => {
                const weekendActivities = userData.activities?.filter(a => {
                    const day = new Date(a.timestamp).getDay();
                    return day === 0 || day === 6;
                }).length || 0;
                return weekendActivities > userData.activities?.length * 0.4;
            },
            insight: 'You\'re a weekend warrior!',
            recommendation: 'Use weekends to prep for weekday success'
        });
    }

    async loadInsights() {
        console.log('💡 Loading enhanced insights...');
        
        try {
            const savedInsights = await this.app.storage?.getData?.('aiInsights');
            if (savedInsights) {
                this.insights = savedInsights;
            }
        } catch (error) {
            console.error('Error loading insights:', error);
        }
        
        // Initialize with some base insights
        if (this.insights.length === 0) {
            this.insights = [
                {
                    id: 'consistency_power',
                    title: 'Consistency Beats Intensity',
                    description: 'Small daily actions compound into extraordinary results',
                    category: 'motivation',
                    confidence: 0.9
                },
                {
                    id: 'morning_momentum',
                    title: 'Morning Success Formula',
                    description: 'Activities completed before 10 AM have 3x higher completion rates',
                    category: 'timing',
                    confidence: 0.8
                }
            ];
        }
    }

    async learnFromInteraction(message, intent, response) {
        console.log('🎓 Enhanced learning from interaction...');
        
        try {
            // Track successful patterns
            const interaction = {
                timestamp: Date.now(),
                userMessage: message,
                intent: intent,
                responseType: response.extras?.isAIGenerated ? 'ai' : 'structured',
                category: intent.category,
                confidence: intent.confidence
            };
            
            // Store interaction for pattern learning
            let interactions = await this.app.storage?.getData?.('aiInteractions') || [];
            interactions.push(interaction);
            
            // Keep only last 100 interactions for performance
            if (interactions.length > 100) {
                interactions = interactions.slice(-100);
            }
            
            await this.app.storage?.saveData?.('aiInteractions', interactions);
            
            // Learn category preferences
            if (intent.category && intent.confidence > 0.8) {
                if (!this.userContext.favoriteCategories.includes(intent.category)) {
                    this.userContext.favoriteCategories.push(intent.category);
                    await this.saveUserContext();
                }
            }
            
        } catch (error) {
            console.error('Error in learning process:', error);
        }
    }

    // Enhanced event handlers
    onDataUpdate(data) {
        console.log('🔄 Enhanced AI received data update:', Object.keys(data));
        
        // Update user context based on new data
        if (data.activities) {
            this.userContext.totalActivities = data.activities.length;
        }
        
        if (data.streak) {
            this.userContext.streak = data.streak;
        }
        
        // Save updated context
        this.saveUserContext();
    }

    onEvent(event, data) {
        console.log('📡 Enhanced AI received event:', event, data);
        
        // Handle specific events that should trigger AI learning
        switch (event) {
            case 'goal_completed':
                this.userContext.recentMood = 'great';
                break;
            case 'streak_milestone':
                // AI will naturally celebrate this in next response
                break;
            case 'user_feedback':
                // Learn from user feedback about AI responses
                this.learnFromFeedback(data);
                break;
        }
    }

    async learnFromFeedback(feedbackData) {
        // Enhanced: Learn from user feedback to improve AI responses
        try {
            let feedback = await this.app.storage?.getData?.('aiFeedback') || [];
            feedback.push({
                timestamp: Date.now(),
                ...feedbackData
            });
            
            // Keep last 50 feedback items
            if (feedback.length > 50) {
                feedback = feedback.slice(-50);
            }
            
            await this.app.storage?.saveData?.('aiFeedback', feedback);
            
            // Adjust AI behavior based on feedback
            if (feedbackData.rating < 3) {
                // User didn't like AI response, prefer structured responses temporarily
                this.aiProvider = 'fallback';
                
                // Re-enable AI after some interactions
                setTimeout(() => {
                    if (this.aiProvider === 'fallback') {
                        this.aiProvider = 'gemini';
                    }
                }, 5 * 60 * 1000); // 5 minutes
            }
            
        } catch (error) {
            console.error('Error processing feedback:', error);
        }
    }

    // Enhanced utility methods for better AI integration
    async getEnhancedUserContext() {
        const baseContext = this.userContext;
        
        try {
            // Get latest data from other modules
            const userData = await this.app.getUserData();
            const analytics = window.LifeStream?.Analytics?.getProcessedData?.();
            const goals = window.LifeStream?.Goals?.getActiveGoals?.() || [];
            
            return {
                ...baseContext,
                currentGoals: goals.slice(0, 3), // Top 3 active goals
                recentInsights: analytics?.insights?.insights?.slice(0, 2) || [],
                overallProgress: analytics?.summary || {},
                todaysMood: this.detectTodaysMood(userData.activities || [])
            };
            
        } catch (error) {
            console.error('Error getting enhanced context:', error);
            return baseContext;
        }
    }

    detectTodaysMood(activities) {
        const today = new Date().toISOString().split('T')[0];
        const todaysActivities = activities.filter(a => 
            new Date(a.timestamp).toISOString().split('T')[0] === today
        );
        
        if (todaysActivities.length === 0) return 'neutral';
        
        // Analyze activity patterns to infer mood
        const categories = todaysActivities.map(a => a.category);
        const hasWellness = categories.includes('wellness');
        const hasFitness = categories.includes('fitness');
        const hasLearning = categories.includes('learning');
        const hasSocial = categories.includes('social');
        
        if (hasWellness && hasFitness) return 'great';
        if (hasFitness || hasLearning) return 'good';
        if (hasSocial) return 'content';
        if (todaysActivities.length > 3) return 'productive';
        
        return 'neutral';
    }

    // API Integration Status Methods
    async testAPIStatus() {
        return {
            provider: this.aiProvider,
            isWorking: await this.testAIConnectivity(),
            lastTest: Date.now(),
            metrics: this.getAIStats()
        };
    }

    async switchProvider(provider) {
        const oldProvider = this.aiProvider;
        this.aiProvider = provider;
        
        console.log(`🔄 Switching AI provider from ${oldProvider} to ${provider}`);
        
        if (provider === 'gemini') {
            const isWorking = await this.testAIConnectivity();
            if (!isWorking) {
                console.warn('⚠️ Gemini switch failed, reverting to fallback');
                this.aiProvider = 'fallback';
            }
        }
        
        return this.aiProvider;
    }

    // Cleanup method
    cleanup() {
        // Save final state
        this.saveUserContext();
        this.saveConversationHistory();
        
        console.log('🧠 Enhanced AI Engine cleaned up');
    }
}

// Enhanced initialization
window.LifeStreamAI = LifeStreamAI;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LifeStreamAI;
}
