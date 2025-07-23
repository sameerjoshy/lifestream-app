/**
 * LifeStream Phase A Integration - Browser Compatible
 * Safely integrates enhanced chat without conflicts
 */

(function() {
    'use strict';

    // Enhanced initialization function for main app
    function initializeEnhancedLifeStream() {
        try {
            console.log('🚀 Initializing LifeStream with Enhanced AI...');
            
            // Initialize enhanced chat module if available
            if (window.LifeStream?.EnhancedChatModule) {
                window.LifeStream.chatModule = new window.LifeStream.EnhancedChatModule();
                
                // Initialize when chat tab is accessed
                const initChat = () => {
                    if (!window.LifeStream.chatModule.initialized) {
                        window.LifeStream.chatModule.initialize();
                    }
                };

                // Auto-initialize on chat tab switch
                const chatNavItems = document.querySelectorAll('[data-tab="chat"]');
                chatNavItems.forEach(item => {
                    item.addEventListener('click', () => {
                        setTimeout(initChat, 100);
                    });
                });

                // Auto-initialize if chat is already visible
                setTimeout(() => {
                    const activeChatTab = document.querySelector('#chatTab.active');
                    if (activeChatTab) {
                        initChat();
                    }
                }, 1000);
            }
            
            console.log('✅ Enhanced LifeStream integration ready');
            
        } catch (error) {
            console.warn('Enhanced integration failed, using basic mode:', error);
        }
    }

    // Enhanced CSS for integration
    const enhancedStyles = `
        /* Enhanced Chat Integration Styles */
        .ai-status-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 16px;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 12px;
            margin-bottom: 16px;
        }

        .ai-status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #00d4ff;
            font-size: 14px;
            font-weight: 600;
        }

        .ai-status-indicator.connected {
            color: #00e676;
        }

        .ai-status-indicator.fallback {
            color: #ff6b6b;
        }

        .status-icon {
            font-size: 18px;
        }

        .chat-container.enhanced {
            background: linear-gradient(135deg, rgba(26, 31, 46, 0.9), rgba(42, 52, 65, 0.9));
            backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 212, 255, 0.2);
        }

        .chat-message.enhanced {
            margin-bottom: 20px;
        }

        .message-content.enhanced {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            max-width: 85%;
        }

        .message-emoji {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
        }

        .message-body {
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 12px;
        }

        .user-message .message-body {
            background: #00d4ff;
            color: white;
        }

        .message-text {
            line-height: 1.5;
            margin-bottom: 8px;
        }

        .message-time {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            text-align: right;
        }

        .activities-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
        }

        .activity-badge {
            background: rgba(0, 212, 255, 0.15);
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .activity-badge.fitness { border-color: #ff6b6b; background: rgba(255, 107, 107, 0.15); }
        .activity-badge.wellness { border-color: #4ecdc4; background: rgba(78, 205, 196, 0.15); }
        .activity-badge.learning { border-color: #45b7d1; background: rgba(69, 183, 209, 0.15); }
        .activity-badge.productivity { border-color: #96ceb4; background: rgba(150, 206, 180, 0.15); }
        .activity-badge.social { border-color: #feca57; background: rgba(254, 202, 87, 0.15); }
        .activity-badge.creative { border-color: #fd79a8; background: rgba(253, 121, 168, 0.15); }

        .enhanced-typing-indicator .typing-dots {
            display: flex;
            gap: 4px;
            margin-bottom: 4px;
        }

        .enhanced-typing-indicator .typing-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #00d4ff;
            animation: typing 1.4s infinite;
        }

        .enhanced-typing-indicator .typing-dots span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .enhanced-typing-indicator .typing-dots span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
            30% { opacity: 1; transform: scale(1); }
        }

        .typing-text {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .ai-status-bar {
                flex-direction: column;
                gap: 8px;
                text-align: center;
            }
            
            .message-content.enhanced {
                max-width: 95%;
            }
        }
    `;

    // Inject enhanced styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = enhancedStyles;
    document.head.appendChild(styleSheet);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEnhancedLifeStream);
    } else {
        // DOM already loaded
        setTimeout(initializeEnhancedLifeStream, 100);
    }

    // Also initialize when authentication completes
    const originalInitializeMainApp = window.initializeMainApp;
    window.initializeMainApp = function() {
        if (originalInitializeMainApp) {
            originalInitializeMainApp();
        }
        
        setTimeout(initializeEnhancedLifeStream, 500);
    };

    console.log('🎯 LifeStream Phase A Integration loaded - Enhanced Chat ready!');

})();
