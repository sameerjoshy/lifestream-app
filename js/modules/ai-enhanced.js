/**
 * LifeStream AI Enhanced - Real Google Gemini Integration
 * Step-by-step backend AI integration with conversation memory
 */

class LifeStreamAIEnhanced {
    constructor() {
        // API Configuration
        this.apiKey = null; // Will be set during initialization
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        
        // Conversation & Context
        this.conversationHistory = [];
        this.userContext = {
            name: 'User',
            totalActivities: 0,
            currentStreak: 0,
            favoriteCategories: [],
            recentMood: 'neutral',
            goals: [],
            achievements: []
        };
        
        // Performance Tracking
        this.responseMetrics = {
            totalRequests: 0,
            successfulRequests: 0,
            averageResponseTime: 0,
            apiErrors: 0
        };
        
        // State Management
        this.isInitialized = false;
        this.isApiAvailable = false;
        
        console.log('🤖 LifeStream AI Enhanced - Initializing...');
    }

    /**
     * Initialize AI with API key and test connection
     */
    async initialize(apiKey) {
        try {
            if (!apiKey) {
                throw new Error('API key is required');
            }
            
            this.apiKey = apiKey;
            console.log('🔑 API key configured');
            
            // Test API connection
            const isConnected = await this.testConnection();
            
            if (isConnected) {
                this.isApiAvailable = true;
                console.log('✅ Gemini AI connected successfully');
            } else {
                console.warn('⚠️ Gemini AI unavailable, using enhanced fallback');
                this.isApiAvailable = false;
            }
            
            // Load conversation history
            await this.loadConversationHistory();
            
            // Load user context
            await this.loadUserContext();
            
            this.isInitialized = true;
            return { success: true, aiAvailable: this.isApiAvailable };
            
        } catch (error) {
            console.error('❌ AI initialization failed:', error);
            this.isApiAvailable = false;
            this.isInitialized = true; // Still initialize with fallback
            return { success: false, error: error.message, aiAvailable: false };
        }
    }

    /**
     * Test Gemini API connection
     */
    async testConnection() {
        try {
            const testResponse = await this.callGeminiAPI(
                "Respond with exactly 'AI Connected' to confirm the connection.",
                { maxTokens: 10 }
            );
            
            return testResponse && testResponse.toLowerCase().includes('connected');
            
        } catch (error) {
            console.warn('🔧 API test failed:', error.message);
            return false;
        }
    }

    /**
     * Generate intelligent response to user message
     */
    async generateResponse(userMessage, activityData = null, options = {}) {
        const startTime = performance.now();
        this.responseMetrics.totalRequests++;
        
        try {
            // Update user context with new information
            this.updateUserContext(userMessage, activityData);
            
            let response;
            
            if (this.isApiAvailable) {
                // Use real AI
                response = await this.generateAIResponse(userMessage, activityData, options);
                this.responseMetrics.successfulRequests++;
            } else {
                // Use enhanced fallback
                response = this.generateEnhancedFallback(userMessage, activityData);
            }
            
            // Update conversation history
            this.updateConversationHistory(userMessage, response);
            
            // Save updated context
            await this.saveConversationHistory();
            await this.saveUserContext();
            
            // Track performance
            const responseTime = performance.now() - startTime;
            this.updatePerformanceMetrics(responseTime);
            
            return response;
            
        } catch (error) {
            console.error('🚨 Response generation failed:', error);
            this.responseMetrics.apiErrors++;
            
            // Always provide a fallback response
            const fallbackResponse = this.generateEmergencyFallback(userMessage, activityData);
            this.updateConversationHistory(userMessage, fallbackResponse);
            
            return fallbackResponse;
        }
    }

    /**
     * Generate AI response using Google Gemini
     */
    async generateAIResponse(userMessage, activityData, options = {}) {
        const prompt = this.buildIntelligentPrompt(userMessage, activityData);
        const aiResponse = await this.callGeminiAPI(prompt, options);
        
        return this.processAIResponse(aiResponse, activityData);
    }

    /**
     * Build intelligent prompt with full context
     */
    buildIntelligentPrompt(userMessage, activityData) {
        const timeOfDay = this.getTimeOfDay();
        const contextSummary = this.generateContextSummary();
        
        let prompt = `You are LifeStream AI, a supportive and intelligent life-tracking companion. You help users feel accomplished and motivated about their progress.

CURRENT USER CONTEXT:
- Total activities logged: ${this.userContext.totalActivities}
- Current streak: ${this.userContext.currentStreak} days
- Favorite categories: ${this.userContext.favoriteCategories.join(', ') || 'discovering preferences'}
- Recent mood: ${this.userContext.recentMood}
- Active goals: ${this.userContext.goals.length}
- Time of day: ${timeOfDay}

RECENT CONVERSATION CONTEXT:
${this.getRecentConversationContext()}

USER MESSAGE: "${userMessage}"
`;

        if (activityData) {
            prompt += `
DETECTED ACTIVITY:
- Type: ${activityData.type}
- Category: ${activityData.category}
- Duration: ${activityData.duration} minutes
- This brings their total activities to: ${this.userContext.totalActivities + 1}
`;
        }

        prompt += `
RESPONSE GUIDELINES:
- Be genuinely encouraging and supportive (not overly enthusiastic)
- Keep response under 150 words
- Use 1-2 relevant emojis naturally
- Reference their specific progress and patterns when relevant
- If they logged an activity, acknowledge it specifically
- Be conversational, not robotic
- Match their energy level
- Provide brief insights about their patterns when appropriate

Generate a response that makes them feel proud of their progress and motivated to continue.`;

        return prompt;
    }

    /**
     * Call Google Gemini API
     */
    async callGeminiAPI(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxTokens || 200,
                candidateCount: 1
            }
        };

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error('Invalid API response structure');
        }
    }

    /**
     * Process AI response and extract insights
     */
    processAIResponse(aiResponse, activityData) {
        // Clean up the response
        let message = aiResponse.trim();
        
        // Remove markdown formatting
        message = message.replace(/\*\*(.*?)\*\*/g, '$1');
        message = message.replace(/\*(.*?)\*/g, '$1');
        
        // Ensure reasonable length
        if (message.length > 300) {
            const sentences = message.split('. ');
            message = sentences.slice(0, 2).join('. ');
            if (!message.endsWith('.')) message += '.';
        }
        
        // Generate response object with metadata
        const response = {
            message: message,
            type: 'ai_generated',
            timestamp: Date.now(),
            metadata: {
                hasActivity: !!activityData,
                activityType: activityData?.type,
                responseLength: message.length,
                apiProvider: 'gemini'
            }
        };
        
        // Add contextual extras
        if (activityData) {
            response.celebration = this.generateCelebration(activityData);
            response.insight = this.generateActivityInsight(activityData);
        }
        
        return response;
    }

    /**
     * Generate enhanced fallback response when AI is unavailable
     */
    generateEnhancedFallback(userMessage, activityData) {
        const contextualResponses = this.getContextualResponses(activityData);
        const randomResponse = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
        
        // Add personalization based on user context
        let personalizedResponse = randomResponse;
        
        if (this.userContext.currentStreak > 0) {
            personalizedResponse += ` Your ${this.userContext.currentStreak}-day streak shows amazing consistency!`;
        }
        
        if (this.userContext.totalActivities > 0 && this.userContext.totalActivities % 10 === 0) {
            personalizedResponse += ` 🎉 Milestone alert: You've logged ${this.userContext.totalActivities} activities!`;
        }
        
        return {
            message: personalizedResponse,
            type: 'enhanced_fallback',
            timestamp: Date.now(),
            metadata: {
                hasActivity: !!activityData,
                activityType: activityData?.type,
                apiProvider: 'fallback'
            }
        };
    }

    /**
     * Get contextual responses based on activity type
     */
    getContextualResponses(activityData) {
        if (!activityData) {
            return [
                "I'm here to help you track your amazing journey! 🌟 Tell me about your activities!",
                "Every moment you share helps build a clearer picture of your progress! ✨",
                "Ready to make today count? What have you accomplished? 💪",
                "Your consistency is building something beautiful! Keep going! 🚀"
            ];
        }
        
        const responsesByCategory = {
            fitness: [
                "Amazing workout! 💪 Your body is thanking you right now!",
                "That's what I call dedication! 🔥 You're building real strength!",
                "Every rep, every step makes you stronger! ⚡ Incredible work!",
                "Your fitness journey is inspiring! 🏃‍♂️ Keep that momentum!"
            ],
            learning: [
                "Knowledge is your superpower! 📚 Your brain is growing stronger!",
                "Every page, every lesson plants a seed of wisdom! 🌱",
                "Learning never stops, and neither do you! 🧠 Amazing dedication!",
                "You're investing in your best self! 📖 Keep that curiosity alive!"
            ],
            wellness: [
                "Self-care is the best care! 🧘‍♂️ Your peace of mind matters!",
                "You're nurturing your inner strength! ✨ Beautiful mindfulness!",
                "Taking care of yourself = taking care of everything! 🌸",
                "Your wellness practice is powerful! 💆‍♀️ Keep prioritizing yourself!"
            ],
            productivity: [
                "You're making things happen! 💼 Your focus is impressive!",
                "Progress over perfection, always! ⚡ Great work!",
                "Your productivity is building something amazing! 🎯",
                "Getting things done like a champion! 🚀 Keep that energy!"
            ]
        };
        
        return responsesByCategory[activityData.category] || responsesByCategory.fitness;
    }

    /**
     * Generate emergency fallback for critical errors
     */
    generateEmergencyFallback(userMessage, activityData) {
        return {
            message: "Thanks for sharing! 🌟 I'm here to support your journey, even when things get a bit technical behind the scenes!",
            type: 'emergency_fallback',
            timestamp: Date.now(),
            metadata: {
                hasActivity: !!activityData,
                apiProvider: 'emergency'
            }
        };
    }

    /**
     * Update user context with new information
     */
    updateUserContext(userMessage, activityData) {
        // Update activity count
        if (activityData) {
            this.userContext.totalActivities++;
            
            // Update favorite categories
            if (!this.userContext.favoriteCategories.includes(activityData.category)) {
                this.userContext.favoriteCategories.push(activityData.category);
            }
        }
        
        // Detect mood from message
        const detectedMood = this.detectMoodFromMessage(userMessage);
        if (detectedMood !== 'neutral') {
            this.userContext.recentMood = detectedMood;
        }
        
        // Update streak (simplified - in real app this would be more sophisticated)
        if (activityData) {
            this.userContext.currentStreak = Math.min(this.userContext.currentStreak + 1, 365);
        }
    }

    /**
     * Detect mood from user message
     */
    detectMoodFromMessage(message) {
        const msg = message.toLowerCase();
        
        if (this.matchesPattern(msg, ['amazing', 'awesome', 'fantastic', 'love', 'excited', 'great'])) {
            return 'great';
        }
        if (this.matchesPattern(msg, ['good', 'nice', 'solid', 'happy', 'pleased'])) {
            return 'good';
        }
        if (this.matchesPattern(msg, ['tired', 'exhausted', 'drained', 'weary', 'tough'])) {
            return 'tired';
        }
        if (this.matchesPattern(msg, ['stressed', 'overwhelmed', 'anxious', 'difficult', 'hard'])) {
            return 'stressed';
        }
        
        return 'neutral';
    }

    /**
     * Utility method for pattern matching
     */
    matchesPattern(text, patterns) {
        return patterns.some(pattern => text.includes(pattern));
    }

    /**
     * Update conversation history
     */
    updateConversationHistory(userMessage, response) {
        this.conversationHistory.push({
            timestamp: Date.now(),
            user: userMessage,
            ai: response.message,
            type: response.type,
            metadata: response.metadata
        });
        
        // Keep only last 20 conversations for performance
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    /**
     * Get recent conversation context for AI
     */
    getRecentConversationContext() {
        if (this.conversationHistory.length === 0) {
            return "This is the beginning of your conversation.";
        }
        
        const recentConversations = this.conversationHistory.slice(-3);
        return recentConversations.map((conv, index) => 
            `${index + 1}. User: "${conv.user}" | AI: "${conv.ai.substring(0, 100)}..."`
        ).join('\n');
    }

    /**
     * Generate celebration for activity completion
     */
    generateCelebration(activityData) {
        const celebrations = {
            fitness: { emoji: '💪', message: 'Strength building activated!' },
            learning: { emoji: '📚', message: 'Brain power increasing!' },
            wellness: { emoji: '✨', message: 'Inner peace unlocked!' },
            productivity: { emoji: '⚡', message: 'Productivity mode engaged!' }
        };
        
        return celebrations[activityData.category] || celebrations.fitness;
    }

    /**
     * Generate activity-specific insight
     */
    generateActivityInsight(activityData) {
        const insights = {
            fitness: "Regular exercise boosts mental clarity and energy levels throughout the day!",
            learning: "Continuous learning creates new neural pathways and enhances problem-solving abilities!",
            wellness: "Mindfulness practices reduce stress and improve emotional regulation!",
            productivity: "Focused work sessions increase overall life satisfaction and goal achievement!"
        };
        
        return insights[activityData.category] || "Every positive action creates momentum for more positive actions!";
    }

    /**
     * Utility methods
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'early morning';
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    }

    generateContextSummary() {
        return {
            totalActivities: this.userContext.totalActivities,
            currentStreak: this.userContext.currentStreak,
            favoriteCategory: this.userContext.favoriteCategories[0] || 'exploring',
            recentMood: this.userContext.recentMood
        };
    }

    updatePerformanceMetrics(responseTime) {
        const currentAvg = this.responseMetrics.averageResponseTime;
        const total = this.responseMetrics.totalRequests;
        
        this.responseMetrics.averageResponseTime = 
            ((currentAvg * (total - 1)) + responseTime) / total;
    }

    /**
     * Storage methods
     */
    async loadConversationHistory() {
        try {
            const saved = localStorage.getItem('lifestream_ai_conversations');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load conversation history:', error);
        }
    }

    async saveConversationHistory() {
        try {
            localStorage.setItem('lifestream_ai_conversations', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.warn('Failed to save conversation history:', error);
        }
    }

    async loadUserContext() {
        try {
            const saved = localStorage.getItem('lifestream_ai_context');
            if (saved) {
                this.userContext = { ...this.userContext, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load user context:', error);
        }
    }

    async saveUserContext() {
        try {
            localStorage.setItem('lifestream_ai_context', JSON.stringify(this.userContext));
        } catch (error) {
            console.warn('Failed to save user context:', error);
        }
    }

    /**
     * Get AI status and performance metrics
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isApiAvailable: this.isApiAvailable,
            conversationLength: this.conversationHistory.length,
            userContext: this.userContext,
            performance: this.responseMetrics
        };
    }

    /**
     * Test method for development
     */
    async testAI(message = "Hello, this is a test message") {
        console.log('🧪 Testing AI with message:', message);
        const response = await this.generateResponse(message);
        console.log('🤖 AI Response:', response);
        return response;
    }
}

// Export for use in other modules
window.LifeStreamAIEnhanced = LifeStreamAIEnhanced;

console.log('🤖 LifeStream AI Enhanced module loaded');
