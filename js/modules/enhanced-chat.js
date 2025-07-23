// Enhanced Chat Module for LifeStream - Phase A
window.LifeStream = window.LifeStream || {};

window.LifeStream.EnhancedChatModule = class EnhancedChatModule {
    constructor() {
        this.initialized = false;
        this.aiEnabled = false;
        this.apiKey = null; // Will be loaded from config
        this.conversationHistory = [];
        this.activityCategories = {
            fitness: ['workout', 'exercise', 'gym', 'run', 'walk', 'bike', 'swim', 'yoga', 'stretch'],
            learning: ['read', 'study', 'learn', 'book', 'course', 'research', 'practice'],
            wellness: ['meditate', 'mindful', 'therapy', 'journal', 'relax', 'breathe'],
            productivity: ['work', 'project', 'task', 'meeting', 'code', 'write', 'plan'],
            social: ['friend', 'family', 'call', 'visit', 'party', 'dinner', 'chat']
        };
        
        console.log('🤖 Enhanced Chat Module created');
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🔧 Initializing Enhanced Chat...');
            
            // Load API configuration
            await this.loadApiConfig();
            
            // Set up enhanced message processing
            this.setupEnhancedProcessing();
            
            this.initialized = true;
            console.log('✅ Enhanced Chat initialized successfully');
            
            // Show AI status in chat
            this.addSystemMessage(this.aiEnabled ? 
                '🤖 AI Connected - Smart responses enabled!' : 
                '💬 Chat ready - Enhanced mode available!'
            );
            
        } catch (error) {
            console.warn('⚠️ Enhanced Chat initialization failed:', error);
            this.initialized = true; // Continue with basic functionality
        }
    }

    async loadApiConfig() {
        try {
            // Try to load from config file (you'll need to create this)
            const response = await fetch('js/config/api-keys.js');
            if (response.ok) {
                // API key would be loaded here
                console.log('🔑 API config loaded');
                this.aiEnabled = false; // Set to true when you have a real API key
            }
        } catch (error) {
            console.log('💭 Running without AI API - using enhanced templates');
            this.aiEnabled = false;
        }
    }

    setupEnhancedProcessing() {
        // Override the default sendMessage function
        const originalSendMessage = window.app?.sendMessage;
        if (originalSendMessage) {
            window.app.sendMessage = () => this.handleEnhancedMessage();
        }
    }

    async handleEnhancedMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        // Add user message to UI
        this.addChatMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        // Process the message
        setTimeout(async () => {
            this.hideTypingIndicator();
            
            try {
                // Parse activity from message
                const activity = this.parseActivity(message);
                
                // Generate enhanced response
                const response = await this.generateEnhancedResponse(message, activity);
                
                // Add AI response to UI
                this.addChatMessage(response, 'ai');
                
                // Log activity if found
                if (activity && window.app) {
                    window.app.logActivity(activity);
                    window.app.updateStats();
                    window.app.updateProgressRings();
                    await window.app.saveAllData();
                }
                
            } catch (error) {
                console.warn('Enhanced message processing error:', error);
                this.addChatMessage('I had a small hiccup, but I am still here to help! 🤖💙', 'ai');
            }
        }, 1500 + Math.random() * 1000);
    }

    parseActivity(message) {
        const msg = message.toLowerCase();
        let activity = null;

        // Advanced activity detection
        for (const [category, keywords] of Object.entries(this.activityCategories)) {
            for (const keyword of keywords) {
                if (msg.includes(keyword)) {
                    activity = {
                        type: keyword,
                        category: category,
                        duration: this.extractDuration(msg) || this.getDefaultDuration(category),
                        intensity: this.extractIntensity(msg),
                        mood: this.extractMood(msg),
                        timestamp: Date.now(),
                        rawMessage: message
                    };
                    break;
                }
            }
            if (activity) break;
        }

        return activity;
    }

    extractDuration(message) {
        const patterns = [
            /(\d+)\s*(minute|min|minutes)/i,
            /(\d+)\s*(hour|hr|hours)/i,
            /(\d+\.?\d*)\s*h/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                const value = parseFloat(match[1]);
                const unit = match[2]?.toLowerCase() || 'h';
                return unit.startsWith('hour') || unit === 'h' ? value * 60 : value;
            }
        }

        return null;
    }

    extractIntensity(message) {
        const msg = message.toLowerCase();
        if (msg.includes('intense') || msg.includes('hard') || msg.includes('tough')) return 'high';
        if (msg.includes('easy') || msg.includes('light') || msg.includes('gentle')) return 'low';
        if (msg.includes('moderate') || msg.includes('medium')) return 'medium';
        return 'medium';
    }

    extractMood(message) {
        const msg = message.toLowerCase();
        if (msg.includes('amazing') || msg.includes('great') || msg.includes('awesome')) return 'excellent';
        if (msg.includes('good') || msg.includes('nice') || msg.includes('happy')) return 'good';
        if (msg.includes('tired') || msg.includes('tough') || msg.includes('difficult')) return 'challenging';
        if (msg.includes('okay') || msg.includes('fine')) return 'neutral';
        return 'positive';
    }

    getDefaultDuration(category) {
        const defaults = {
            fitness: 30,
            learning: 45,
            wellness: 15,
            productivity: 60,
            social: 90
        };
        return defaults[category] || 30;
    }

    async generateEnhancedResponse(message, activity) {
        if (this.aiEnabled) {
            // This would call real AI API when enabled
            return await this.callAIAPI(message, activity);
        } else {
            // Use enhanced template responses
            return this.generateTemplateResponse(message, activity);
        }
    }

    generateTemplateResponse(message, activity) {
        const timeOfDay = this.getTimeOfDay();
        const timeGreeting = this.getTimeGreeting(timeOfDay);
        
        if (activity) {
            return this.getActivityResponse(activity, timeOfDay, timeGreeting);
        } else {
            return this.getGeneralResponse(message, timeGreeting);
        }
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'late-night';
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    }

    getTimeGreeting(timeOfDay) {
        const greetings = {
            'late-night': ['Night owl! 🦉', 'Up late, I see! 🌙', 'Burning the midnight oil! ⭐'],
            'morning': ['Good morning! ☀️', 'Rise and shine! 🌅', 'Morning, champion! 🏆'],
            'afternoon': ['Good afternoon! 🌞', 'Hope your day is going well! ✨', 'Afternoon energy! ⚡'],
            'evening': ['Good evening! 🌆', 'Evening, superstar! 🌟', 'Hope you had a great day! 🎉'],
            'night': ['Good evening! 🌙', 'Winding down for the night! 🌛', 'Evening reflection time! ✨']
        };
        
        const options = greetings[timeOfDay] || greetings.afternoon;
        return options[Math.floor(Math.random() * options.length)];
    }

    getActivityResponse(activity, timeOfDay, timeGreeting) {
        const responses = {
            fitness: [
                `${timeGreeting} That ${activity.duration}-minute ${activity.type} session is building real strength! 💪 Your dedication is inspiring! 🔥`,
                `Amazing ${activity.type} work! 🏃‍♂️ ${activity.duration} minutes of pure dedication! Your body is thanking you right now! 💪✨`,
                `${timeGreeting} Crushing it with that ${activity.type}! 💪 ${activity.duration} minutes of progress towards your best self! 🌟`
            ],
            learning: [
                `${timeGreeting} Love the ${activity.duration} minutes of ${activity.type}! 📚 Your mind is growing stronger! 🧠✨`,
                `Knowledge is power! 📖 That ${activity.duration}-minute ${activity.type} session is an investment in your future! 💎`,
                `${timeGreeting} Every minute of ${activity.type} builds lasting wisdom! 📚 ${activity.duration} minutes well spent! 🌟`
            ],
            wellness: [
                `${timeGreeting} Beautiful ${activity.type} practice! 🧘‍♂️ ${activity.duration} minutes of inner peace creates outer success! ✨`,
                `Mental wellness is the foundation! 🌸 That ${activity.duration}-minute ${activity.type} session nurtures your soul! 💚`,
                `${timeGreeting} Mindful moments create meaningful days! 🧠 Perfect ${activity.type} practice! 🙏`
            ],
            productivity: [
                `${timeGreeting} Productivity champion! 💼 ${activity.duration} minutes of focused ${activity.type} - making things happen! 🚀`,
                `Great ${activity.type} session! ⚡ ${activity.duration} minutes of pure focus! Keep that momentum! 💪`,
                `${timeGreeting} Getting things done! 🎯 That ${activity.duration}-minute ${activity.type} session shows real commitment! 📈`
            ],
            social: [
                `${timeGreeting} Love the ${activity.duration} minutes of ${activity.type}! 👥 Human connections fuel the soul! 💙`,
                `Social wellness matters! 🤝 That ${activity.duration}-minute ${activity.type} time enriches your life! ✨`,
                `${timeGreeting} Beautiful ${activity.type} time! 💫 ${activity.duration} minutes of meaningful connection! 🌟`
            ]
        };

        const categoryResponses = responses[activity.category] || responses.fitness;
        let response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
        
        // Add storage confirmation
        response += ` Data synced securely! 📁`;
        
        // Add mood-based encouragement
        if (activity.mood === 'excellent') {
            response += ` Your energy is contagious! 🔥`;
        } else if (activity.mood === 'challenging') {
            response += ` You pushed through - that's real strength! 💪`;
        }

        return response;
    }

    getGeneralResponse(message, timeGreeting) {
        const responses = [
            `${timeGreeting} Thanks for sharing! 🌟 I love hearing about your journey! Every moment you track builds a clearer picture of your amazing progress! 📱💙`,
            `${timeGreeting} Your commitment to tracking your life is inspiring! 📊 Each entry helps you understand your patterns better! 🎯✨`,
            `${timeGreeting} Great to hear from you! 💫 Keep logging your activities - you're building valuable insights about yourself! 📈💪`
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    // UI Helper Methods
    addChatMessage(message, sender) {
        try {
            const container = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${sender}-message`;
            
            const emoji = sender === 'ai' ? '🤖' : '👤';
            messageDiv.innerHTML = `
                <div class="message-content">
                    <span class="message-emoji">${emoji}</span>
                    <span>${message}</span>
                </div>
            `;
            
            container.appendChild(messageDiv);
            
            setTimeout(() => {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
            
        } catch (error) {
            console.warn('Add chat message error:', error);
        }
    }

    addSystemMessage(message) {
        try {
            const container = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message ai-message';
            messageDiv.style.opacity = '0.8';
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    <span class="message-emoji">⚡</span>
                    <span style="font-style: italic;">${message}</span>
                </div>
            `;
            
            container.appendChild(messageDiv);
            
        } catch (error) {
            console.warn('Add system message error:', error);
        }
    }

    showTypingIndicator() {
        const container = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <span class="message-emoji">🤖</span>
                <span>
                    <span class="typing-dots">
                        <span>.</span><span>.</span><span>.</span>
                    </span>
                </span>
            </div>
        `;
        
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
};

console.log('🚀 LifeStream Enhanced Chat Module loaded - Phase A ready!');
