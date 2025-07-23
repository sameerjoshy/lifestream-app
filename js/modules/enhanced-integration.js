/**
 * LifeStream Phase A Integration
 * Connects Enhanced Chat Module with existing app
 * Replace your current sendMessage() function with this enhanced version
 */

// Override the existing sendMessage function in your index.html
function sendMessage() {
    if (window.LifeStream?.chatModule) {
        // Use enhanced chat module
        window.LifeStream.chatModule.sendEnhancedMessage();
    } else {
        // Fallback to existing functionality
        if (window.app) {
            window.app.sendMessage();
        }
    }
}

// Enhanced initialization function for main app
function initializeMainApp() {
    try {
        console.log('🚀 Initializing LifeStream with Enhanced AI...');
        
        // Initialize the main app
        window.app = new LifeStreamApp();
        
        // Initialize enhanced chat module
        if (window.LifeStream?.EnhancedChatModule) {
            window.LifeStream.chatModule = new window.LifeStream.EnhancedChatModule();
            window.LifeStream.chatModule.initialize();
        }
        
        console.log('✅ Enhanced LifeStream initialized successfully');
        
        // Show success message
        showStatusMessage('🤖 AI-powered LifeStream ready!', 'success');
        
    } catch (error) {
        console.warn('Enhanced initialization failed, using basic mode:', error);
        
        // Fallback to basic app
        window.app = new LifeStreamApp();
        showStatusMessage('⚠️ Started in basic mode', 'error');
    }
}

// Enhanced switchToChat function
function switchToChat() {
    if (window.app) {
        window.app.switchTab('chat');
        
        // Initialize enhanced chat if not already done
        if (window.LifeStream?.chatModule && !window.LifeStream.chatModule.initialized) {
            window.LifeStream.chatModule.initialize();
        }
    }
}

// Auto-enhance existing chat interface when tab is switched
function enhanceExistingChat() {
    const chatContainer = document.querySelector('#chatTab .chat-container');
    if (chatContainer && !chatContainer.classList.contains('enhanced')) {
        console.log('🔧 Enhancing existing chat interface...');
        
        // Add enhanced styling
        chatContainer.classList.add('enhanced');
        
        // Add AI status indicator
        const aiStatus = document.createElement('div');
        aiStatus.className = 'ai-status-bar';
        aiStatus.innerHTML = `
            <div class="ai-status-indicator connected">
                <span class="status-icon">🤖</span>
                <span class="status-text">AI Connected</span>
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

// Enhanced event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all modules to load
    setTimeout(() => {
        // Enhance chat when switching to chat tab
        const chatNavItems = document.querySelectorAll('[data-tab="chat"]');
        chatNavItems.forEach(item => {
            item.addEventListener('click', () => {
                setTimeout(enhanceExistingChat, 100);
            });
        });
        
        // Auto-enhance if chat is already visible
        const activeChatTab = document.querySelector('#chatTab.active');
        if (activeChatTab) {
            enhanceExistingChat();
        }
    }, 1000);
});

// Enhanced CSS for integration (add this to your existing styles)
const enhancedChatStyles = `
<style>
/* Enhanced Chat Integration Styles */
.ai-status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(0, 212, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-md);
}

.ai-status-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--primary);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.ai-status-indicator.connected {
    color: var(--success);
}

.ai-status-indicator.fallback {
    color: var(--accent);
}

.status-icon {
    font-size: var(--font-size-lg);
}

.enhanced-stats-header {
    display: flex;
    gap: var(--spacing-md);
}

.enhanced-stats-header .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.enhanced-stats-header .stat-value {
    font-size: var(--font-size-sm);
    font-weight: 700;
    color: var(--text-primary);
}

.enhanced-stats-header .stat-label {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
}

.chat-container.enhanced {
    background: linear-gradient(135deg, rgba(26, 31, 46, 0.9), rgba(42, 52, 65, 0.9));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 212, 255, 0.2);
}

.message.enhanced {
    margin-bottom: var(--spacing-lg);
}

.message-content.enhanced {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    max-width: 85%;
}

.message-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
    flex-shrink: 0;
}

.message-body {
    flex: 1;
    background: var(--surface);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
}

.user-message .message-body {
    background: var(--primary);
}

.message-text {
    line-height: 1.5;
    margin-bottom: var(--spacing-xs);
}

.message-time {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    text-align: right;
}

.activities-badges.enhanced {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
}

.activity-badge.enhanced {
    background: rgba(0, 212, 255, 0.15);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 20px;
    padding: 4px var(--spacing-sm);
    font-size: var(--font-size-xs);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
}

.activity-badge .duration {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 10px;
}

.ai-typing-indicator {
    display: flex;
    align-items: center;
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.typing-bubble.enhanced {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    background: var(--surface);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
}

.ai-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
}

.typing-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.typing-dots {
    display: flex;
    gap: 4px;
}

.typing-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--primary);
    animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
    30% { opacity: 1; transform: scale(1); }
}

.typing-text {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
}

.chat-input-container.enhanced {
    background: rgba(26, 31, 46, 0.8);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.send-btn.enhanced {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    border: none;
    border-radius: 50%;
    width: var(--touch-target-min);
    height: var(--touch-target-min);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
}

.send-btn.enhanced:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
}

.send-btn.enhanced:active {
    transform: scale(0.95);
}

.smart-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
}

.smart-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 6px var(--spacing-sm);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
    touch-action: manipulation;
}

.smart-btn:hover {
    background: rgba(0, 212, 255, 0.2);
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-1px);
}

.voice-btn {
    background: var(--accent);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
    margin-left: var(--spacing-xs);
}

.voice-btn:hover {
    transform: scale(1.1);
}

/* Responsive Enhancements */
@media (max-width: 768px) {
    .ai-status-bar {
        flex-direction: column;
        gap: var(--spacing-sm);
        text-align: center;
    }
    
    .enhanced-stats-header {
        justify-content: center;
    }
    
    .message-content.enhanced {
        max-width: 95%;
    }
    
    .smart-actions {
        justify-content: center;
    }
}

/* Animation enhancements */
.message.enhanced {
    animation: messageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes messageSlideIn {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Activity category colors */
.activity-badge.fitness { border-color: #ff6b6b; background: rgba(255, 107, 107, 0.15); }
.activity-badge.wellness { border-color: #4ecdc4; background: rgba(78, 205, 196, 0.15); }
.activity-badge.learning { border-color: #45b7d1; background: rgba(69, 183, 209, 0.15); }
.activity-badge.productivity { border-color: #96ceb4; background: rgba(150, 206, 180, 0.15); }
.activity-badge.social { border-color: #feca57; background: rgba(254, 202, 87, 0.15); }
.activity-badge.creative { border-color: #fd79a8; background: rgba(253, 121, 168, 0.15); }
</style>
`;

// Inject enhanced styles
document.head.insertAdjacentHTML('beforeend', enhancedChatStyles);

console.log('🎯 LifeStream Phase A Integration loaded - Enhanced Chat ready!');
