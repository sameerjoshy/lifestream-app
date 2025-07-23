/**
 * LifeStream Enhanced Chat Module - Phase A: Real AI Integration
 * World-class conversational interface with Google Gemini AI
 * Customer-first approach: Magical, intelligent, contextual responses
 */

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
            
            // Load chat history and create interface
            await this.loadChatHistory();
            this.createEnhancedChatInterface();
            this.setupAdvancedEventListeners();
            this.loadSessionStats();
            this.showIntelligentWelcome();
            
            this.initialized = true;
            console.log('✅ Enhanced Chat Ready - AI-Powered Life Coaching Activated!');
        } catch (error) {
            console.error('❌ Enhanced chat initialization failed:', error);
            // Fallback to basic functionality
            this.setupBasicFallback();
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
                if (!apiKey) {
                    throw new Error('Gemini API key not found');
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
                throw new Error('AI module not loaded');
            }
            
        } catch (error) {
            console.warn('⚠️ AI initialization failed, using advanced fallback:', error);
            this.aiInitialized = false;
            this.setupAdvancedFallback();
        }
    }

    createEnhancedChatInterface() {
        const mainContent = document.getElementById('mainContent') || document.querySelector('.main');
        if (!mainContent) return;

        // Only create interface if we're on the chat tab
        const existingChatTab = document.getElementById('chatTab');
        if (existingChatTab) {
            this.enhanceExistingChatInterface();
            return;
        }

        // Create new enhanced chat interface if needed
        mainContent.innerHTML = `
            <div class="chat-container enhanced">
                <!-- AI Status Indicator -->
                <div class="ai-status-bar">
                    <div class="ai-status-indicator ${this.aiInitialized ? 'connected' : 'fallback'}">
                        <span class="status-icon">${this.aiInitialized ? '🤖' : '⚡'}</span>
                        <span class="status-text">${this.aiInitialized ? 'AI Connected' : 'Smart Mode'}</span>
                    </div>
                    
                    <!-- Enhanced Stats Header -->
                    <div class="enhanced-stats-header">
                        <div class="stat-item">
                            <span class="stat-icon">🔥</span>
                            <span class="stat-value">${this.sessionStats.streakDays}</span>
                            <span class="stat-label">Streak</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">📝</span>
                            <span class="stat-value">${this.sessionStats.logsToday}</span>
                            <span class="stat-label">Today</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">⚡</span>
                            <span class="stat-value">${this.sessionStats.totalActivities}</span>
                            <span class="stat-label">Total</span>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Messages Container -->
                <div class="messages-container enhanced" id="messagesContainer">
                    <!-- Messages dynamically inserted here -->
                </div>

                <!-- AI Typing Indicator -->
                <div class="ai-typing-indicator" id="aiTypingIndicator" style="display: none;">
                    <div class="typing-bubble enhanced">
                        <div class="ai-avatar">🤖</div>
                        <div class="typing-content">
                            <div class="typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span class="typing-text">LifeStream AI is thinking...</span>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Chat Input -->
                <div class="chat-input-container enhanced">
                    <div class="input-wrapper">
                        <textarea 
                            id="chatInput" 
                            placeholder="Tell me about your day... 'I worked out for 45 minutes then read for 30 minutes. Feeling great!'" 
                            rows="1"
                            maxlength="2000"></textarea>
                        <button id="sendButton" class="send-btn enhanced" disabled>
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Smart Quick Actions -->
                    <div class="smart-actions">
                        <button class="smart-btn" data-action="fitness">💪 Fitness</button>
                        <button class="smart-btn" data-action="work">💼 Productivity</button>
                        <button class="smart-btn" data-action="wellness">🧘 Wellness</button>
                        <button class="smart-btn" data-action="learning">📚 Learning</button>
                        <button class="smart-btn" data-action="mood">😊 Mood Check</button>
                    </div>
                </div>
            </div>
        `;
    }

    enhanceExistingChatInterface() {
        // Enhance the existing chat interface in index.html
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
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
            
            chatContainer.insertBefore(aiStatus, chatContainer.firstChild);
        }
    }

    setupAdvancedEventListeners() {
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');

        if (!chatInput || !sendButton) return;

        // Enhanced auto-resize with mobile optimization
        chatInput.addEventListener('input', (e) => {
            this.smartResizeInput(e.target);
            this.toggleSendButton(e.target.value.trim());
            this.showSmartSuggestions(e.target.value);
        });

        // Smart send on Enter (preserves Shift+Enter for new lines)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendEnhancedMessage();
            }
        });

        // Enhanced send button
        sendButton.addEventListener('click', () => this.sendEnhancedMessage());

        // Smart action buttons with AI suggestions
        document.querySelectorAll('.smart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleSmartAction(e.target.dataset.action);
            });
        });

        // Voice input support (mobile)
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.setupVoiceInput();
        }
    }

    async sendEnhancedMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;

        const startTime = performance.now();

        try {
            // Add user message with enhanced styling
            this.addEnhancedMessage('user', message);
            chatInput.value = '';
            this.smartResizeInput(chatInput);
            this.toggleSendButton('');

            // Update engagement stats
            this.updateAdvancedEngagementStats();

            // Show intelligent typing indicator
            this.showIntelligentTypingIndicator();

            // Parse activities with AI enhancement
            const activities = await this.parseActivitiesWithAI(message);
            
            // Generate AI response
            let aiResponse;
            if (this.aiInitialized && this.aiEngine) {
                console.log('🤖 Using Real AI for response...');
                aiResponse = await this.aiEngine.generateResponse(
                    message, 
                    activities.length > 0 ? activities[0] : null,
                    { temperature: 0.7, maxTokens: 250 }
                );
            } else {
                console.log('⚡ Using Advanced Fallback...');
                aiResponse = this.generateAdvancedFallbackResponse(message, activities);
            }
            
            // Hide typing indicator and show response
            this.hideIntelligentTypingIndicator();
            this.addEnhancedMessage('ai', aiResponse.message || aiResponse, activities);

            // Log activities and update progress
            if (activities.length > 0) {
                await this.logActivitiesWithInsights(activities);
            }

            // Update UI and save data
            this.updateAdvancedStats();
            this.updateProgressVisualization();
            await this.saveChatHistory();

            // Performance tracking
            const responseTime = performance.now() - startTime;
            this.trackPerformanceMetrics(responseTime);

            // Mobile feedback
            if (window.innerWidth < 768 && navigator.vibrate) {
                navigator.vibrate([50, 30, 50]);
            }
            
        } catch (error) {
            console.error('❌ Enhanced message send failed:', error);
            this.hideIntelligentTypingIndicator();
            this.addEnhancedMessage('ai', "I'm having a moment! 😅 But I'm still here to help you track your amazing progress! Try again?", []);
        }
    }

    async parseActivitiesWithAI(message) {
        const activities = [];
        const timestamp = new Date();

        try {
            // Use AI for enhanced parsing if available
            if (this.aiInitialized && this.aiEngine) {
                // Let AI extract structured activity data
                const aiParsingPrompt = `Extract activities from this message. Return only a JSON array of activities with this exact structure:
[{"type": "activity_name", "category": "fitness|wellness|learning|productivity|social|creative", "duration": minutes_as_number, "description": "brief_description"}]

Message: "${message}"

Only return valid JSON array, no other text.`;

                try {
                    const aiResponse = await this.aiEngine.callGeminiAPI(aiParsingPrompt, { temperature: 0.3, maxTokens: 150 });
                    const parsedActivities = JSON.parse(aiResponse);
                    
                    if (Array.isArray(parsedActivities)) {
                        parsedActivities.forEach(activity => {
                            activities.push({
                                ...activity,
                                id: this.generateActivityId(),
                                timestamp,
                                source: 'ai_parsed'
                            });
                        });
                        
                        console.log('🤖 AI parsed activities:', activities);
                        return activities;
                    }
                } catch (aiError) {
                    console.warn('AI parsing failed, using fallback:', aiError);
                }
            }

            // Enhanced fallback parsing
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
                    const intensity = this.extractIntensity(msg);
                    
                    activities.push({
                        id: this.generateActivityId(),
                        type: keyword,
                        category,
                        duration: duration || this.getDefaultDuration(category),
                        intensity: intensity,
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

        return {
            message: responses.join(' '),
            type: 'advanced_fallback',
            timestamp: Date.now(),
            metadata: {
                hasActivity: activities.length > 0,
                activityCount: activities.length,
                responseComponents: responses.length,
                timeContext: timeOfDay
            }
        };
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
            content: typeof content === 'string' ? content : content.message || content,
            activities,
            timestamp: new Date(),
            enhanced: true
        };

        this.messages.push(message);
        this.renderEnhancedMessage(message);
        this.scrollToBottomSmooth();
    }

    renderEnhancedMessage(message) {
        const messagesContainer = document.getElementById('messagesContainer') || document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message enhanced ${message.sender}-message`;
        messageDiv.dataset.messageId = message.id;

        const time = message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Enhanced activity badges
        let activitiesBadges = '';
        if (message.activities && message.activities.length > 0) {
            activitiesBadges = message.activities.map(activity => {
                const emoji = this.getActivityEmoji(activity.type);
                const categoryColor = this.getCategoryColor(activity.category);
                return `<span class="activity-badge enhanced ${activity.category}" style="border-color: ${categoryColor};">
                    ${emoji} ${activity.type} 
                    ${activity.duration ? `<span class="duration">${activity.duration}m</span>` : ''}
                </span>`;
            }).join('');
        }

        // Enhanced message styling
        messageDiv.innerHTML = `
            <div class="message-content enhanced">
                <div class="message-avatar">
                    ${message.sender === 'ai' ? '🤖' : '👤'}
                </div>
                <div class="message-body">
                    <div class="message-text">${this.formatEnhancedMessageContent(message.content)}</div>
                    ${activitiesBadges ? `<div class="activities-badges enhanced">${activitiesBadges}</div>` : ''}
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;

        // Enhanced animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px) scale(0.95)';
        messagesContainer.appendChild(messageDiv);
        
        // Trigger enhanced animation
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0) scale(1)';
        });
    }

    showIntelligentWelcome() {
        if (this.messages.length === 0) {
            const userName = this.getUserName() || 'Amazing Human';
            const timeOfDay = this.getContextualTimeOfDay();
            
            const welcomeMessages = [
                {
                    content: `Good ${timeOfDay}, ${userName}! 🌊✨ Welcome to your AI-powered life companion!`,
                    delay: 0
                },
                {
                    content: `I'm powered by ${this.aiInitialized ? 'Google Gemini AI' : 'advanced algorithms'} and I'm here to help you track, understand, and optimize every aspect of your incredible journey! 🚀`,
                    delay: 1500
                },
                {
                    content: `Just tell me naturally: "I worked out for 45 minutes, then read for 30 minutes. Feeling great!" and I'll intelligently parse, celebrate, and provide insights about your progress! 💪📚✨`,
                    delay: 3000
                }
            ];
            
            welcomeMessages.forEach((msg, index) => {
                setTimeout(() => {
                    this.addEnhancedMessage('ai', msg.content);
                }, msg.delay);
            });
        }
    }

    // Enhanced utility methods
    getContextualTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'night';
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    }

    getUserName() {
        // Try to get user name from Google auth
        if (window.googleAuth && window.googleAuth.getUserInfo) {
            const userInfo = window.googleAuth.getUserInfo();
            return userInfo?.firstName || userInfo?.name;
        }
        return null;
    }

    getCategoryColor(category) {
        const colors = {
            fitness: '#ff6b6b',
            wellness: '#4ecdc4', 
            learning: '#45b7d1',
            productivity: '#96ceb4',
            social: '#feca57',
            creative: '#fd79a8'
        };
        return colors[category] || '#00d4ff';
    }

    formatEnhancedMessageContent(content) {
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

    // Additional methods for Phase A integration
    updateAdvancedEngagementStats() {
        this.sessionStats.logsToday++;
        this.sessionStats.totalActivities++;
        this.sessionStats.lastLogTime = new Date();
        
        const today = new Date().toDateString();
        const lastLog = localStorage.getItem('lastLogDate');
        
        if (lastLog !== today) {
            this.sessionStats.streakDays++;
            localStorage.setItem('lastLogDate', today);
        }

        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        // Update stats in header if they exist
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = this.sessionStats.streakDays;
            statValues[1].textContent = this.sessionStats.logsToday;
            statValues[2].textContent = this.sessionStats.totalActivities;
        }

        // Update enhanced stats header
        const enhancedStats = document.querySelectorAll('.enhanced-stats-header .stat-value');
        if (enhancedStats.length >= 3) {
            enhancedStats[0].textContent = this.sessionStats.streakDays;
            enhancedStats[1].textContent = this.sessionStats.logsToday;
            enhancedStats[2].textContent = this.sessionStats.totalActivities;
        }
    }

    // Enhanced typing indicators
    showIntelligentTypingIndicator() {
        const indicator = document.getElementById('aiTypingIndicator');
        if (indicator) {
            indicator.style.display = 'flex';
            this.scrollToBottomSmooth();
        }
        this.isTyping = true;
    }

    hideIntelligentTypingIndicator() {
        const indicator = document.getElementById('aiTypingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
        this.isTyping = false;
    }

    scrollToBottomSmooth() {
        const container = document.getElementById('messagesContainer') || document.getElementById('chatMessages');
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    smartResizeInput(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggleSendButton(value) {
        const sendButton = document.getElementById('sendButton');
        if (sendButton) {
            sendButton.disabled = !value;
            sendButton.classList.toggle('active', !!value);
        }
    }

    // Save enhanced chat history
    async saveChatHistory() {
        try {
            const chatData = {
                messages: this.messages,
                sessionStats: this.sessionStats,
                timestamp: new Date().toISOString(),
                version: '2.0'
            };

            // Save to Drive if available, otherwise localStorage
            if (window.driveStorage?.isInitialized) {
                await window.driveStorage.saveActivities(this.messages);
            } else {
                localStorage.setItem('lifestream_enhanced_chat', JSON.stringify(chatData));
            }
        } catch (error) {
            console.warn('Failed to save chat history:', error);
        }
    }

    async loadChatHistory() {
        try {
            let chatData = null;
            
            // Try loading from Drive first
            if (window.driveStorage?.isInitialized) {
                const activities = await window.driveStorage.loadActivities();
                if (activities && activities.length > 0) {
                    chatData = { messages: activities };
                }
            }
            
            // Fallback to localStorage
            if (!chatData) {
                const saved = localStorage.getItem('lifestream_enhanced_chat');
                if (saved) {
                    chatData = JSON.parse(saved);
                }
            }
            
            if (chatData) {
                this.messages = chatData.messages || [];
                this.sessionStats = { ...this.sessionStats, ...(chatData.sessionStats || {}) };
            }
        } catch (error) {
            console.warn('Could not load chat history:', error);
        }
    }

    async logActivitiesWithInsights(activities) {
        try {
            // Log each activity with enhanced data
            for (const activity of activities) {
                // Update favorite categories
                if (!this.sessionStats.favoriteCategories.includes(activity.category)) {
                    this.sessionStats.favoriteCategories.push(activity.category);
                }
                
                // Save activity to main app if available
                if (window.app?.logActivity) {
                    await window.app.logActivity(activity);
                }
            }
            
            console.log('✅ Activities logged with insights:', activities.length);
        } catch (error) {
            console.warn('Failed to log activities:', error);
        }
    }

    updateAdvancedStats() {
        // Update main app stats if available
        if (window.app?.updateStats) {
            window.app.updateStats();
        }
        
        // Update progress rings if available
        if (window.app?.updateProgressRings) {
            window.app.updateProgressRings();
        }
    }

    updateProgressVisualization() {
        // Trigger progress ring animations
        const progressRings = document.querySelectorAll('.ring-progress');
        progressRings.forEach(ring => {
            ring.style.transform = 'scale(1.05)';
            setTimeout(() => {
                ring.style.transform = 'scale(1)';
            }, 200);
        });
    }

    trackPerformanceMetrics(responseTime) {
        this.sessionStats.avgResponseTime = 
            (this.sessionStats.avgResponseTime + responseTime) / 2;
        
        console.log(`📊 Response time: ${Math.round(responseTime)}ms`);
    }

    handleSmartAction(action) {
        const prompts = {
            fitness: "I worked out for ",
            work: "I worked on my project for ",
            wellness: "I meditated for ",
            learning: "I studied for ",
            mood: "I'm feeling "
        };

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = prompts[action] || "";
            chatInput.focus();
            this.smartResizeInput(chatInput);
        }
    }

    showSmartSuggestions(value) {
        // Show contextual suggestions as user types
        if (value.length > 3) {
            // Could implement smart autocomplete here
            console.log('🔍 Smart suggestions for:', value);
        }
    }

    setupVoiceInput() {
        // Voice recognition for mobile
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            // Add voice button
            const voiceBtn = document.createElement('button');
            voiceBtn.className = 'voice-btn';
            voiceBtn.innerHTML = '🎤';
            voiceBtn.addEventListener('click', () => {
                recognition.start();
            });

            const inputWrapper = document.querySelector('.input-wrapper');
            if (inputWrapper) {
                inputWrapper.appendChild(voiceBtn);
            }

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.value = transcript;
                    this.sendEnhancedMessage();
                }
            };
        }
    }

    setupAdvancedFallback() {
        console.log('⚡ Setting up advanced fallback AI system...');
        // Enhanced fallback with more sophisticated responses
        this.aiInitialized = false;
    }

    setupBasicFallback() {
        console.log('🔧 Setting up basic fallback system...');
        // Basic functionality if everything fails
        this.createBasicChatInterface();
        this.setupBasicEventListeners();
    }

    createBasicChatInterface() {
        // Create minimal chat interface as last resort
        const mainContent = document.getElementById('mainContent') || document.querySelector('.main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="chat-container basic">
                    <div class="messages-container" id="messagesContainer">
                        <div class="message ai-message">
                            <div class="message-content">
                                <span>🌊 LifeStream is ready! Tell me about your activities!</span>
                            </div>
                        </div>
                    </div>
                    <div class="chat-input-container">
                        <input type="text" id="chatInput" placeholder="Tell me what you did...">
                        <button id="sendButton">Send</button>
                    </div>
                </div>
            `;
        }
    }

    setupBasicEventListeners() {
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');

        if (chatInput && sendButton) {
            const sendBasicMessage = () => {
                const message = chatInput.value.trim();
                if (message) {
                    this.addBasicMessage('user', message);
                    chatInput.value = '';
                    
                    setTimeout(() => {
                        this.addBasicMessage('ai', 'Thanks for sharing! Keep tracking your progress! 🌟');
                    }, 1000);
                }
            };

            sendButton.addEventListener('click', sendBasicMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendBasicMessage();
                }
            });
        }
    }

    addBasicMessage(sender, content) {
        const container = document.getElementById('messagesContainer');
        if (container) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            messageDiv.innerHTML = `
                <div class="message-content">
                    <span>${sender === 'ai' ? '🤖' : '👤'} ${content}</span>
                </div>
            `;
            container.appendChild(messageDiv);
            container.scrollTop = container.scrollHeight;
        }
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

    extractIntensity(message) {
        const intensityWords = {
            low: ['easy', 'gentle', 'light', 'casual', 'relaxed'],
            medium: ['moderate', 'normal', 'regular', 'steady'],
            high: ['intense', 'hard', 'challenging', 'difficult', 'tough', 'heavy']
        };
        
        const msg = message.toLowerCase();
        
        for (const [level, words] of Object.entries(intensityWords)) {
            if (words.some(word => msg.includes(word))) {
                return level;
            }
        }
        
        return 'medium';
    }

    extractDescription(message, keyword) {
        // Extract contextual description around the keyword
        const sentences = message.split(/[.!?]/);
        for (const sentence of sentences) {
            if (sentence.toLowerCase().includes(keyword)) {
                return sentence.trim();
            }
        }
        return `${keyword} activity`;
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

    saveSessionStats() {
        try {
            localStorage.setItem('lifestream_enhanced_session_stats', JSON.stringify(this.sessionStats));
        } catch (error) {
            console.warn('Could not save session stats:', error);
        }
    }

    // Public API methods for integration
    clearChat() {
        this.messages = [];
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.innerHTML = '';
        }
        this.saveChatHistory();
    }

    getStats() {
        return {
            messages: this.messages.length,
            activities: this.messages.reduce((count, msg) => count + (msg.activities?.length || 0), 0),
            sessionStats: this.sessionStats,
            aiStatus: this.aiInitialized ? 'connected' : 'fallback'
        };
    }

    cleanup() {
        this.saveSessionStats();
        this.saveChatHistory();
        this.initialized = false;
        console.log('🧹 Enhanced chat module cleaned up');
    }
}

// Global integration
window.LifeStream = window.LifeStream || {};
window.LifeStream.EnhancedChatModule = EnhancedChatModule;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize enhanced chat if it's the active module
    if (window.LifeStream && !window.LifeStream.chatModule) {
        window.LifeStream.chatModule = new EnhancedChatModule();
    }
});

console.log('🚀 LifeStream Enhanced Chat Module loaded - Phase A ready!');
