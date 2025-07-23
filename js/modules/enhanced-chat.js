/**
 * LifeStream Enhanced Chat Module - Browser Compatible Version
 * Fixed for direct browser usage without ES6 modules
 */

(function() {
    'use strict';

    class EnhancedChatModule {
        constructor() {
            this.messages = [];
            this.isTyping = false;
            this.currentStreak = 0;
            this.dailyLogs = 0;
            this.messageQueue = [];
            this.isProcessing = false;
            
            // AI Integration - Real Gemini AI
            this.aiEngine = null;
            this.aiInitialized = false;
            
            // Enhanced engagement metrics
            this.sessionStats = {
                logsToday: 0,
                streakDays: 0,
                totalActivities: 0,
                lastLogTime: null,
                favoriteCategories: [],
                avgResponseTime: 0
            };
            
            // Advanced activity parsing with AI
            this.activityCategories = {
                fitness: ['workout', 'exercise', 'gym', 'run', 'jog', 'walk', 'yoga', 'pilates', 'swim', 'bike', 'hike', 'dance', 'martial arts', 'sports'],
                wellness: ['meditate', 'meditation', 'mindful', 'breathe', 'relax', 'spa', 'massage', 'sleep', 'rest', 'nap', 'therapy'],
                learning: ['read', 'study', 'learn', 'course', 'book', 'research', 'practice', 'skill', 'language', 'tutorial', 'class'],
                productivity: ['work', 'project', 'task', 'meeting', 'call', 'email', 'write', 'plan', 'organize', 'code', 'develop'],
                social: ['friends', 'family', 'dinner', 'party', 'date', 'call', 'text', 'visit', 'hangout', 'network', 'volunteer'],
                creative: ['art', 'draw', 'paint', 'music', 'sing', 'play', 'write', 'create', 'design', 'craft', 'photo']
            };
            
            this.initialized = false;
        }

        async initialize() {
            if (this.initialized) return;
            
            try {
                console.log('🚀 Initializing Enhanced Chat with Real AI...');
                
                // Initialize AI Engine
                await this.initializeAI();
                
                // Setup enhanced chat functionality
                this.setupEnhancedChat();
                this.loadSessionStats();
                
                this.initialized = true;
                console.log('✅ Enhanced Chat Ready - AI-Powered Life Coaching Activated!');
            } catch (error) {
                console.error('❌ Enhanced chat initialization failed:', error);
                // Continue with basic functionality
                this.setupBasicEnhancement();
            }
        }

        async initializeAI() {
            try {
                console.log('🤖 Initializing Real AI Engine...');
                
                // Check if AI module is available
                if (window.LifeStreamAIEnhanced) {
                    this.aiEngine = new window.LifeStreamAIEnhanced();
                    
                    // Get API key from config
                    const apiKey = window.LIFESTREAM_CONFIG?.GEMINI_API_KEY;
                    if (!apiKey || apiKey.includes('XXXX')) {
                        throw new Error('Please update your API key in js/config/api-keys.js');
                    }
                    
                    // Initialize AI with error handling
                    const initResult = await this.aiEngine.initialize(apiKey);
                    
                    if (initResult.success) {
                        this.aiInitialized = true;
                        console.log('✅ Real AI Engine Ready!', initResult.aiAvailable ? '(Gemini Connected)' : '(Enhanced Fallback)');
                    } else {
                        throw new Error(initResult.error || 'AI initialization failed');
                    }
                    
                } else {
                    throw new Error('AI module not loaded - using advanced fallback');
                }
                
            } catch (error) {
                console.warn('⚠️ AI initialization failed, using advanced fallback:', error.message);
                this.aiInitialized = false;
            }
        }

        setupEnhancedChat() {
            // Enhance existing chat interface
            this.enhanceExistingChatInterface();
            this.setupEnhancedEventListeners();
        }

        enhanceExistingChatInterface() {
            const chatContainer = document.querySelector('#chatTab .chat-container');
            if (chatContainer && !chatContainer.classList.contains('enhanced')) {
                console.log('🔧 Enhancing existing chat interface...');
                
                // Add enhanced styling
                chatContainer.classList.add('enhanced');
                
                // Add AI status indicator
                const aiStatus = document.createElement('div');
                aiStatus.className = 'ai-status-bar';
                aiStatus.innerHTML = `
                    <div class="ai-status-indicator ${this.aiInitialized ? 'connected' : 'fallback'}">
                        <span class="status-icon">${this.aiInitialized ? '🤖' : '⚡'}</span>
                        <span class="status-text">${this.aiInitialized ? 'Real AI Connected' : 'Smart Mode Active'}</span>
                    </div>
                `;
                
                const chatMessages = chatContainer.querySelector('.chat-messages');
                if (chatMessages) {
                    chatContainer.insertBefore(aiStatus, chatMessages);
                }
                
                // Enhance input placeholder
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.placeholder = "Tell me about your day... 'I worked out for 45 minutes, then read for 30 minutes. Feeling great!'";
                }
            }
        }

        setupEnhancedEventListeners() {
            // Override the global sendMessage function
            const originalSendMessage = window.sendMessage;
            window.sendMessage = () => {
                this.sendEnhancedMessage();
            };

            // Enhance input behavior
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                // Remove existing listeners and add enhanced ones
                chatInput.addEventListener('input', (e) => {
                    this.autoResizeTextarea(e.target);
                });

                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendEnhancedMessage();
                    }
                });
            }
        }

        async sendEnhancedMessage() {
            const chatInput = document.getElementById('chatInput');
            const message = chatInput?.value?.trim();
            
            if (!message) return;

            const startTime = performance.now();

            try {
                // Add user message
                this.addEnhancedMessage('user', message);
                chatInput.value = '';
                
                // Update engagement stats
                this.updateEngagementStats();

                // Show typing indicator
                this.showEnhancedTypingIndicator();

                // Parse activities with AI enhancement
                const activities = await this.parseActivitiesWithAI(message);
                
                // Generate AI response
                let aiResponse;
                if (this.aiInitialized && this.aiEngine) {
                    console.log('🤖 Using Real AI for response...');
                    try {
                        aiResponse = await this.aiEngine.generateResponse(
                            message, 
                            activities.length > 0 ? activities[0] : null,
                            { temperature: 0.7, maxTokens: 250 }
                        );
                    } catch (aiError) {
                        console.warn('AI response failed, using fallback:', aiError);
                        aiResponse = this.generateAdvancedFallbackResponse(message, activities);
                    }
                } else {
                    console.log('⚡ Using Advanced Fallback...');
                    aiResponse = this.generateAdvancedFallbackResponse(message, activities);
                }
                
                // Hide typing indicator and show response
                this.hideEnhancedTypingIndicator();
                
                const responseText = typeof aiResponse === 'string' ? aiResponse : 
                                   (aiResponse.message || aiResponse);
                
                this.addEnhancedMessage('ai', responseText, activities);

                // Log activities
                if (activities.length > 0) {
                    await this.logActivitiesWithInsights(activities);
                }

                // Update UI and save data
                this.updateStats();
                
                // Performance tracking
                const responseTime = performance.now() - startTime;
                console.log(`📊 Response time: ${Math.round(responseTime)}ms`);

                // Mobile feedback
                if (window.innerWidth < 768 && navigator.vibrate) {
                    navigator.vibrate([50, 30, 50]);
                }
                
            } catch (error) {
                console.error('❌ Enhanced message send failed:', error);
                this.hideEnhancedTypingIndicator();
                this.addEnhancedMessage('ai', "I'm having a moment! 😅 But I'm still here to help you track your amazing progress! Try again?", []);
            }
        }

        async parseActivitiesWithAI(message) {
            const activities = [];
            const timestamp = new Date();

            try {
                // Enhanced fallback parsing (always works)
                const enhancedActivities = this.enhancedActivityParsing(message, timestamp);
                activities.push(...enhancedActivities);
                
            } catch (error) {
                console.warn('Activity parsing error:', error);
            }

            return activities;
        }

        enhancedActivityParsing(message, timestamp) {
            const activities = [];
            const msg = message.toLowerCase();

            // Enhanced pattern matching
            for (const [category, keywords] of Object.entries(this.activityCategories)) {
                for (const keyword of keywords) {
                    if (msg.includes(keyword)) {
                        const duration = this.extractDurationFromContext(msg, keyword);
                        
                        activities.push({
                            id: this.generateActivityId(),
                            type: keyword,
                            category,
                            duration: duration || this.getDefaultDuration(category),
                            description: this.extractDescription(msg, keyword),
                            timestamp,
                            source: 'enhanced_parsing'
                        });
                        
                        break; // One activity per category to avoid duplicates
                    }
                }
            }

            return activities;
        }

        generateAdvancedFallbackResponse(message, activities) {
            const responses = [];
            const timeOfDay = this.getContextualTimeOfDay();
            const userName = this.getUserName() || 'Champion';

            // Contextual greeting based on time
            const greetings = {
                morning: ['Good morning', 'Rise and shine', 'Morning'],
                afternoon: ['Good afternoon', 'Hope your day is going well', 'Afternoon'],
                evening: ['Good evening', 'Hope you had a great day', 'Evening'],
                night: ['Good night', 'Winding down nicely', 'Night']
            };

            const greeting = greetings[timeOfDay][Math.floor(Math.random() * greetings[timeOfDay].length)];
            
            // Personalized encouragement
            const encouragements = [
                `${greeting}, ${userName}! 🌟`,
                `Amazing progress, ${userName}! 🚀`,
                `You're crushing it, ${userName}! 💪`,
                `Love this consistency, ${userName}! ⭐`,
                `This is how winners think, ${userName}! 🏆`
            ];
            
            responses.push(encouragements[Math.floor(Math.random() * encouragements.length)]);

            // Activity-specific intelligent responses
            if (activities.length > 0) {
                activities.forEach(activity => {
                    const categoryResponses = this.getIntelligentCategoryResponse(activity);
                    responses.push(categoryResponses[Math.floor(Math.random() * categoryResponses.length)]);
                });

                // Add pattern recognition insights
                const insights = this.generateInstantInsights(activities);
                if (insights) {
                    responses.push(insights);
                }
            } else {
                // No activities detected, but still encouraging
                const generalEncouragement = [
                    "Thanks for sharing! Every moment you track builds a clearer picture of your incredible journey! 📊✨",
                    "I love hearing about your progress! Your consistency is building something amazing! 🌱💪",
                    "Keep me posted on your wins! I'm here to celebrate every step of your growth! 🎉📈"
                ];
                responses.push(generalEncouragement[Math.floor(Math.random() * generalEncouragement.length)]);
            }

            // Add motivational close with context
            const motivationalCloses = [
                `Your ${this.sessionStats.streakDays}-day streak shows real commitment! 🔥`,
                "This consistency is building lasting change! 🌟",
                "You're 1% better than yesterday! 📈",
                "Your future self is thanking you right now! 🙏",
                "Every log makes you unstoppable! ⚡"
            ];
            
            responses.push(motivationalCloses[Math.floor(Math.random() * motivationalCloses.length)]);

            return responses.join(' ');
        }

        getIntelligentCategoryResponse(activity) {
            const responses = {
                fitness: [
                    `That ${activity.duration}-minute ${activity.type} session is building real strength! Your body is thanking you right now! 💪🔥`,
                    `${activity.duration} minutes of ${activity.type}? That's dedication in action! You're getting stronger every day! 🏋️‍♂️✨`,
                    `Love the ${activity.type} session! ${activity.duration} minutes of pure power! Your fitness journey is inspiring! 🚀💪`
                ],
                wellness: [
                    `${activity.duration} minutes of ${activity.type} is investing in your inner peace! Beautiful self-care! 🧘‍♂️✨`,
                    `That ${activity.type} practice is powerful! ${activity.duration} minutes of mindfulness builds mental strength! 🌸💚`,
                    `Love the wellness focus! ${activity.duration} minutes of ${activity.type} creates lasting inner strength! 🙏⚡`
                ],
                learning: [
                    `${activity.duration} minutes of ${activity.type}? Your brain is literally growing stronger! Knowledge is power! 📚🧠`,
                    `That learning session is incredible! ${activity.duration} minutes of ${activity.type} builds lasting wisdom! 📖✨`,
                    `Love the growth mindset! ${activity.duration} minutes of ${activity.type} creates unlimited potential! 🌱🚀`
                ],
                productivity: [
                    `${activity.duration} minutes of focused ${activity.type}! You're making things happen! Goals are getting closer! 💼⚡`,
                    `That productivity is impressive! ${activity.duration} minutes of ${activity.type} builds real progress! 🎯📈`,
                    `Getting things done like a champion! ${activity.duration} minutes of ${activity.type} creates unstoppable momentum! 🚀💪`
                ],
                social: [
                    `${activity.duration} minutes of ${activity.type}! Human connection fuels the soul! Beautiful priorities! 👥💙`,
                    `Love the social investment! ${activity.duration} minutes of ${activity.type} builds lasting relationships! 🤝✨`,
                    `That ${activity.type} time is so valuable! ${activity.duration} minutes of connection enriches everything! 💕🌟`
                ],
                creative: [
                    `${activity.duration} minutes of ${activity.type}! Your creativity is unlimited! Keep expressing your unique gifts! 🎨✨`,
                    `That creative flow is beautiful! ${activity.duration} minutes of ${activity.type} feeds the soul! 🌈💫`,
                    `Love the artistic energy! ${activity.duration} minutes of ${activity.type} creates magic! Keep creating! 🎭🚀`
                ]
            };
            
            return responses[activity.category] || responses.fitness;
        }

        addEnhancedMessage(sender, content, activities = []) {
            const message = {
                id: Date.now() + Math.random(),
                sender,
                content,
                activities,
                timestamp: new Date(),
                enhanced: true
            };

            this.messages.push(message);
            this.renderEnhancedMessage(message);
        }

        renderEnhancedMessage(message) {
            const messagesContainer = document.getElementById('chatMessages');
            if (!messagesContainer) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${message.sender}-message enhanced`;

            const time = message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // Activity badges
            let activitiesBadges = '';
            if (message.activities && message.activities.length > 0) {
                activitiesBadges = message.activities.map(activity => {
                    const emoji = this.getActivityEmoji(activity.type);
                    return `<span class="activity-badge ${activity.category}">
                        ${emoji} ${activity.type} ${activity.duration ? activity.duration + 'm' : ''}
                    </span>`;
                }).join('');
            }

            messageDiv.innerHTML = `
                <div class="message-content enhanced">
                    <span class="message-emoji">${message.sender === 'ai' ? '🤖' : '👤'}</span>
                    <div class="message-body">
                        <span class="message-text">${this.formatMessageContent(message.content)}</span>
                        ${activitiesBadges ? `<div class="activities-badges">${activitiesBadges}</div>` : ''}
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            `;

            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        showEnhancedTypingIndicator() {
            const messagesContainer = document.getElementById('chatMessages');
            if (!messagesContainer) return;

            // Remove existing typing indicator
            const existing = messagesContainer.querySelector('.enhanced-typing-indicator');
            if (existing) existing.remove();

            const typingDiv = document.createElement('div');
            typingDiv.className = 'chat-message ai-message enhanced-typing-indicator';
            typingDiv.innerHTML = `
                <div class="message-content enhanced">
                    <span class="message-emoji">🤖</span>
                    <div class="message-body">
                        <span class="typing-dots">
                            <span>●</span><span>●</span><span>●</span>
                        </span>
                        <div class="typing-text">LifeStream AI is thinking...</div>
                    </div>
                </div>
            `;

            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        hideEnhancedTypingIndicator() {
            const typingIndicator = document.querySelector('.enhanced-typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        // Utility methods
        getContextualTimeOfDay() {
            const hour = new Date().getHours();
            if (hour < 6) return 'night';
            if (hour < 12) return 'morning';
            if (hour < 17) return 'afternoon';
            if (hour < 21) return 'evening';
            return 'night';
        }

        getUserName() {
            try {
                if (window.googleAuth && window.googleAuth.getUserInfo) {
                    const userInfo = window.googleAuth.getUserInfo();
                    return userInfo?.firstName || userInfo?.name;
                }
            } catch (error) {
                // Ignore errors
            }
            return null;
        }

        getActivityEmoji(type) {
            const emojis = {
                workout: '💪', exercise: '🏃‍♂️', gym: '🏋️‍♂️', run: '🏃‍♂️', jog: '🚶‍♂️',
                walk: '🚶‍♂️', yoga: '🧘‍♀️', swim: '🏊‍♂️', bike: '🚴‍♂️', hike: '🥾',
                meditate: '🧘‍♂️', meditation: '🧘‍♂️', sleep: '😴', rest: '😌',
                read: '📚', study: '📖', learn: '🎓', work: '💼', project: '📋',
                friends: '👥', family: '👨‍👩‍👧‍👦', dinner: '🍽️', call: '📞',
                art: '🎨', music: '🎵', write: '✍️', create: '🎭'
            };
            return emojis[type] || '⭐';
        }

        formatMessageContent(content) {
            return content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
        }

        generateActivityId() {
            return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        extractDurationFromContext(message, keyword) {
            const patterns = [
                new RegExp(`${keyword}[\\s\\w]*?(\\d+)\\s*(?:min|minute|minutes|hour|hours|hr|hrs)`, 'i'),
                new RegExp(`(\\d+)\\s*(?:min|minute|minutes|hour|hours|hr|hrs)[\\s\\w]*?${keyword}`, 'i')
            ];
            
            for (const pattern of patterns) {
                const match = message.match(pattern);
                if (match) {
                    const value = parseInt(match[1]);
                    const unit = match[0].toLowerCase();
                    return unit.includes('hour') || unit.includes('hr') ? value * 60 : value;
                }
            }
            
            return null;
        }

        getDefaultDuration(category) {
            const defaults = {
                fitness: 30,
                wellness: 15,
                learning: 30,
                productivity: 60,
                social: 45,
                creative: 30
            };
            return defaults[category] || 30;
        }

        extractDescription(message, keyword) {
            const sentences = message.split(/[.!?]/);
            for (const sentence of sentences) {
                if (sentence.toLowerCase().includes(keyword)) {
                    return sentence.trim();
                }
            }
            return `${keyword} activity`;
        }

        generateInstantInsights(activities) {
            if (activities.length === 0) return null;
            
            const categories = activities.map(a => a.category);
            const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
            
            const insights = [];
            
            if (totalDuration > 60) {
                insights.push(`🔥 ${totalDuration} minutes of focused activities! You're building serious momentum!`);
            }
            
            if (categories.includes('fitness') && categories.includes('wellness')) {
                insights.push(`💪🧘 Perfect balance of physical and mental wellness! This is how optimal humans live!`);
            }
            
            if (categories.includes('learning') && categories.includes('productivity')) {
                insights.push(`📚💼 Learning + doing = unstoppable growth! Your future self is already thanking you!`);
            }
            
            return insights.length > 0 ? insights[0] : null;
        }

        updateEngagementStats() {
            this.sessionStats.logsToday++;
            this.sessionStats.totalActivities++;
            this.sessionStats.lastLogTime = new Date();
            
            const today = new Date().toDateString();
            const lastLog = localStorage.getItem('lastLogDate');
            
            if (lastLog !== today) {
                this.sessionStats.streakDays++;
                localStorage.setItem('lastLogDate', today);
            }
        }

        updateStats() {
            // Update main app stats if available
            if (window.app?.updateStats) {
                window.app.updateStats();
            }
        }

        async logActivitiesWithInsights(activities) {
            try {
                for (const activity of activities) {
                    if (!this.sessionStats.favoriteCategories.includes(activity.category)) {
                        this.sessionStats.favoriteCategories.push(activity.category);
                    }
                    
                    if (window.app?.logActivity) {
                        await window.app.logActivity(activity);
                    }
                }
                
                console.log('✅ Activities logged with insights:', activities.length);
            } catch (error) {
                console.warn('Failed to log activities:', error);
            }
        }

        autoResizeTextarea(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }

        loadSessionStats() {
            try {
                const saved = localStorage.getItem('lifestream_enhanced_session_stats');
                if (saved) {
                    this.sessionStats = { ...this.sessionStats, ...JSON.parse(saved) };
                }
            } catch (error) {
                console.warn('Could not load session stats:', error);
            }
        }

        setupBasicEnhancement() {
            console.log('🔧 Setting up basic enhancement mode...');
            this.enhanceExistingChatInterface();
            this.setupEnhancedEventListeners();
        }
    }

    // Make available globally
    window.LifeStream = window.LifeStream || {};
    window.LifeStream.EnhancedChatModule = EnhancedChatModule;

    console.log('🚀 LifeStream Enhanced Chat Module loaded - Phase A ready!');

})();
