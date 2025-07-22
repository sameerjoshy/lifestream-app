/**
 * LifeStream Chat Module - World-Class Conversational Interface
 * Handles real-time messaging, activity logging, and AI integration
 * Features: Smart parsing, typing indicators, engagement gamification
 */

class ChatModule {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.currentStreak = 0;
        this.dailyLogs = 0;
        this.aiProvider = 'gemini'; // Primary: Google Gemini, Fallback: Hugging Face
        this.messageQueue = [];
        this.isProcessing = false;
        
        // Game-like engagement metrics
        this.sessionStats = {
            logsToday: 0,
            streakDays: 0,
            totalActivities: 0,
            lastLogTime: null
        };
        
        // Activity parsing patterns for intelligent extraction
        this.activityPatterns = {
            workout: /(?:worked out|exercise|gym|ran|running|lifted|yoga|cardio|fitness)[\s\w]*?(\d+)?\s*(?:min|minute|minutes|hour|hours|hr|hrs)?/gi,
            sleep: /(?:slept|sleep|sleeping)[\s\w]*?(\d+(?:\.\d+)?)?\s*(?:hour|hours|hr|hrs)/gi,
            work: /(?:worked|work|working|studied|studying|coded|coding)[\s\w]*?(\d+(?:\.\d+)?)?\s*(?:hour|hours|hr|hrs|min|minute|minutes)/gi,
            read: /(?:read|reading)[\s\w]*?(\d+)?\s*(?:min|minute|minutes|hour|hours|hr|hrs|pages?|chapters?)/gi,
            mood: /(?:feeling|felt|mood|energy)[\s\w]*?(great|good|okay|bad|tired|energized|motivated|stressed|happy|sad|anxious|excited)/gi
        };
        
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🚀 Initializing World-Class Chat Interface...');
            
            await this.loadChatHistory();
            this.createChatInterface();
            this.setupEventListeners();
            this.loadSessionStats();
            this.showWelcomeMessage();
            
            this.initialized = true;
            console.log('✅ Chat Module Ready - Let\'s transform lives!');
        } catch (error) {
            console.error('❌ Chat initialization failed:', error);
        }
    }

    createChatInterface() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="chat-container">
                <!-- Game-like Stats Header -->
                <div class="stats-header">
                    <div class="stat-item">
                        <span class="stat-icon">🔥</span>
                        <span class="stat-value">${this.sessionStats.streakDays}</span>
                        <span class="stat-label">Day Streak</span>
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

                <!-- Messages Container -->
                <div class="messages-container" id="messagesContainer">
                    <!-- Messages dynamically inserted here -->
                </div>

                <!-- Typing Indicator -->
                <div class="typing-indicator" id="typingIndicator" style="display: none;">
                    <div class="typing-bubble">
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span class="typing-text">LifeStream is thinking...</span>
                    </div>
                </div>

                <!-- Chat Input -->
                <div class="chat-input-container">
                    <div class="input-wrapper">
                        <textarea 
                            id="chatInput" 
                            placeholder="What did you do? 'Worked out 45 mins, read for 30 mins...'" 
                            rows="1"
                            maxlength="1000"></textarea>
                        <button id="sendButton" class="send-btn" disabled>
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Quick Action Buttons -->
                    <div class="quick-actions">
                        <button class="quick-btn" data-action="workout">💪 Workout</button>
                        <button class="quick-btn" data-action="work">💼 Work</button>
                        <button class="quick-btn" data-action="sleep">😴 Sleep</button>
                        <button class="quick-btn" data-action="mood">😊 Mood</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const messagesContainer = document.getElementById('messagesContainer');

        if (!chatInput || !sendButton) return;

        // Auto-resize textarea
        chatInput.addEventListener('input', (e) => {
            this.autoResizeInput(e.target);
            this.toggleSendButton(e.target.value.trim());
        });

        // Send message on Enter (Shift+Enter for new line)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send button click
        sendButton.addEventListener('click', () => this.sendMessage());

        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.target.dataset.action);
            });
        });

        // Auto-scroll on new messages
        if (messagesContainer) {
            messagesContainer.addEventListener('DOMNodeInserted', () => {
                this.scrollToBottom();
            });
        }
    }

    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;

        // Add user message immediately
        this.addMessage('user', message);
        chatInput.value = '';
        this.autoResizeInput(chatInput);
        this.toggleSendButton('');

        // Update engagement stats
        this.updateEngagementStats();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Parse activities from message
            const activities = this.parseActivities(message);
            
            // Generate AI response
            const aiResponse = await this.generateAIResponse(message, activities);
            
            // Hide typing indicator and show response
            this.hideTypingIndicator();
            this.addMessage('ai', aiResponse, activities);

            // Save to storage
            await this.saveChatHistory();

        } catch (error) {
            console.error('Error processing message:', error);
            this.hideTypingIndicator();
            this.addMessage('ai', "I'm having trouble processing that right now. Could you try again? I'm here to help track your amazing progress! 💪");
        }
    }

    parseActivities(message) {
        const activities = [];
        const timestamp = new Date();

        // Parse different activity types
        for (const [type, pattern] of Object.entries(this.activityPatterns)) {
            const matches = message.matchAll(pattern);
            
            for (const match of matches) {
                const duration = this.extractDuration(match[1], match[0]);
                const activity = {
                    id: `${type}_${timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
                    type,
                    duration,
                    rawText: match[0],
                    timestamp,
                    value: match[1] || duration
                };
                
                activities.push(activity);
            }
        }

        return activities;
    }

    extractDuration(captured, fullMatch) {
        // Smart duration extraction and normalization
        if (!captured) {
            // Try to extract from full match
            const timeMatch = fullMatch.match(/(\d+(?:\.\d+)?)/);
            captured = timeMatch ? timeMatch[1] : null;
        }

        if (!captured) return 0;

        const num = parseFloat(captured);
        
        // Convert to minutes for consistency
        if (fullMatch.includes('hour') || fullMatch.includes('hr')) {
            return num * 60;
        }
        
        return num; // Assume minutes if no unit specified
    }

    async generateAIResponse(message, activities) {
        try {
            // First try Google Gemini
            if (this.aiProvider === 'gemini') {
                return await this.callGeminiAPI(message, activities);
            }
        } catch (error) {
            console.warn('Gemini failed, falling back to Hugging Face:', error);
            this.aiProvider = 'huggingface';
        }

        // Fallback to Hugging Face
        try {
            return await this.callHuggingFaceAPI(message, activities);
        } catch (error) {
            console.error('Both AI providers failed:', error);
            return this.generateFallbackResponse(activities);
        }
    }

    async callGeminiAPI(message, activities) {
        // Note: This would require a proper API key and endpoint
        // For now, we'll use a sophisticated local response generator
        return this.generateAdvancedResponse(message, activities);
    }

    async callHuggingFaceAPI(message, activities) {
        // Note: This would require Hugging Face API integration
        // For now, we'll use local intelligence
        return this.generateAdvancedResponse(message, activities);
    }

    generateAdvancedResponse(message, activities) {
        const responses = [];
        
        // Celebrate the logging activity
        const encouragements = [
            "Amazing progress! 🚀",
            "You're crushing it! 💪",
            "Love seeing this consistency! ⭐",
            "This is how winners think! 🏆",
            "Your dedication is inspiring! 🔥"
        ];
        
        responses.push(encouragements[Math.floor(Math.random() * encouragements.length)]);

        // Activity-specific insights
        if (activities.length > 0) {
            activities.forEach(activity => {
                switch (activity.type) {
                    case 'workout':
                        responses.push(`That ${activity.duration} min workout is building your strength! Your body is thanking you right now. 💪`);
                        break;
                    case 'work':
                        responses.push(`${activity.duration} minutes of focused work - your goals are getting closer! 🎯`);
                        break;
                    case 'sleep':
                        responses.push(`${activity.value} hours of sleep is investing in tomorrow's energy! 😴✨`);
                        break;
                    case 'read':
                        responses.push(`Reading for ${activity.duration} minutes is expanding your mind! Knowledge is power! 📚`);
                        break;
                    case 'mood':
                        responses.push(`Thanks for sharing how you're feeling. Awareness is the first step to optimization! 🧠`);
                        break;
                }
            });
        }

        // Add personalized insights based on patterns
        const insights = this.generatePersonalizedInsights(activities);
        if (insights) responses.push(insights);

        // Add motivational close
        const motivational = [
            "Keep this momentum going! 🌟",
            "You're building incredible habits! 🏗️",
            "Every log makes you 1% better! 📈",
            "Your future self will thank you! 🙏",
            "This consistency is everything! ⚡"
        ];
        
        responses.push(motivational[Math.floor(Math.random() * motivational.length)]);

        return responses.join(' ');
    }

    generatePersonalizedInsights(activities) {
        // Analyze recent patterns for insights
        const recentMessages = this.messages.slice(-10);
        const workoutCount = recentMessages.filter(m => m.activities?.some(a => a.type === 'workout')).length;
        
        if (workoutCount >= 3) {
            return "I'm noticing a strong workout pattern - you're building a fantastic fitness habit! 💪📊";
        }
        
        return null;
    }

    generateFallbackResponse(activities) {
        if (activities.length > 0) {
            return `Logged! I see ${activities.length} activities tracked. You're building amazing habits - keep this incredible momentum going! 🚀✨`;
        }
        
        return "Thanks for sharing! Every moment you track is a step toward your best life. What else did you accomplish today? 🌟";
    }

    addMessage(sender, content, activities = []) {
        const message = {
            id: Date.now() + Math.random(),
            sender,
            content,
            activities,
            timestamp: new Date()
        };

        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender}-message`;
        messageDiv.dataset.messageId = message.id;

        const time = message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let activitiesBadges = '';
        if (message.activities && message.activities.length > 0) {
            activitiesBadges = message.activities.map(activity => {
                const emoji = this.getActivityEmoji(activity.type);
                return `<span class="activity-badge ${activity.type}">${emoji} ${activity.type} ${activity.duration ? activity.duration + 'm' : ''}</span>`;
            }).join('');
        }

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.formatMessageContent(message.content)}</div>
                ${activitiesBadges ? `<div class="activities-badges">${activitiesBadges}</div>` : ''}
                <div class="message-time">${time}</div>
            </div>
        `;

        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        messagesContainer.appendChild(messageDiv);
        
        // Trigger animation
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.3s ease-out';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
    }

    getActivityEmoji(type) {
        const emojis = {
            workout: '💪',
            sleep: '😴',
            work: '💼',
            read: '📚',
            mood: '😊'
        };
        return emojis[type] || '⭐';
    }

    formatMessageContent(content) {
        // Add basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    handleQuickAction(action) {
        const prompts = {
            workout: "I worked out for ",
            work: "I worked for ",
            sleep: "I slept for ",
            mood: "I'm feeling "
        };

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = prompts[action] || "";
            chatInput.focus();
            this.autoResizeInput(chatInput);
        }
    }

    updateEngagementStats() {
        this.sessionStats.logsToday++;
        this.sessionStats.totalActivities++;
        this.sessionStats.lastLogTime = new Date();
        
        // Update streak (simplified logic)
        const today = new Date().toDateString();
        const lastLog = localStorage.getItem('lastLogDate');
        
        if (lastLog !== today) {
            this.sessionStats.streakDays++;
            localStorage.setItem('lastLogDate', today);
        }

        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = this.sessionStats.streakDays;
            statValues[1].textContent = this.sessionStats.logsToday;
            statValues[2].textContent = this.sessionStats.totalActivities;
            
            // Add celebration animation for milestones
            if (this.sessionStats.logsToday % 5 === 0) {
                this.celebrateAchievement();
            }
        }
    }

    celebrateAchievement() {
        // Add confetti effect or achievement badge
        console.log('🎉 Achievement unlocked!');
        // Could integrate celebration animations here
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.display = 'block';
            this.scrollToBottom();
        }
        this.isTyping = true;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
        this.isTyping = false;
    }

    autoResizeInput(textarea) {
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

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    showWelcomeMessage() {
        if (this.messages.length === 0) {
            const welcomeMessages = [
                "Welcome to LifeStream! 🌊✨",
                "I'm your AI life coach, ready to help you track everything and optimize your life!",
                "Just tell me what you did: 'Worked out 30 mins, read for 20 mins, feeling great!' and I'll help you build incredible habits. 🚀"
            ];
            
            welcomeMessages.forEach((msg, index) => {
                setTimeout(() => {
                    this.addMessage('ai', msg);
                }, index * 1000);
            });
        }
    }

    async loadChatHistory() {
        try {
            const history = await window.LifeStream.Storage.getData('chatHistory');
            if (history && Array.isArray(history)) {
                this.messages = history;
            }
        } catch (error) {
            console.warn('Could not load chat history:', error);
        }
    }

    async saveChatHistory() {
        try {
            await window.LifeStream.Storage.saveData('chatHistory', this.messages);
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    loadSessionStats() {
        try {
            const saved = localStorage.getItem('lifestream_session_stats');
            if (saved) {
                this.sessionStats = { ...this.sessionStats, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Could not load session stats:', error);
        }
    }

    // Public API methods
    clearChat() {
        this.messages = [];
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.innerHTML = '';
        }
        this.saveChatHistory();
    }

    exportChatData() {
        return {
            messages: this.messages,
            stats: this.sessionStats,
            timestamp: new Date()
        };
    }

    cleanup() {
        // Save current state before cleanup
        this.saveChatHistory();
        localStorage.setItem('lifestream_session_stats', JSON.stringify(this.sessionStats));
        
        this.initialized = false;
        console.log('🧹 Chat module cleaned up');
    }
}

// Export for module system
window.LifeStream = window.LifeStream || {};
window.LifeStream.ChatModule = ChatModule;
