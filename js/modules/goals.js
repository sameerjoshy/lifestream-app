/**
 * LifeStream v2.0 - Goals Module
 * Customer-obsessed goal management system focused on motivation and emotional engagement
 * 
 * Key Philosophy: Transform tracking from "journaling" into "life improvement"
 * Every goal interaction should make users feel accomplished and motivated
 */

class GoalsModule {
    constructor() {
        this.initialized = false;
        this.goals = [];
        this.currentStreak = 0;
        this.todaysProgress = {};
        this.celebrationQueue = [];
        this.motivationEngine = new MotivationEngine();
        
        // Bind methods to preserve context
        this.handleGoalProgress = this.handleGoalProgress.bind(this);
        this.checkGoalAchievements = this.checkGoalAchievements.bind(this);
        this.triggerCelebration = this.triggerCelebration.bind(this);
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🎯 Initializing Goals Module...');
            
            // Load existing goals and progress
            await this.loadGoalsData();
            
            // Set up daily reset check
            this.setupDailyReset();
            
            // Set up activity listeners for progress tracking
            this.setupActivityListeners();
            
            // Check for any achievements from previous sessions
            this.checkPendingAchievements();
            
            this.initialized = true;
            console.log('✅ Goals Module initialized successfully');
            
        } catch (error) {
            console.error('❌ Goals Module initialization failed:', error);
        }
    }

    async loadGoalsData() {
        try {
            // Load goals from storage
            this.goals = await window.LifeStream.Storage.getData('goals') || [];
            this.todaysProgress = await window.LifeStream.Storage.getData('todaysProgress') || {};
            this.currentStreak = await window.LifeStream.Storage.getData('goalStreak') || 0;
            
            // If no goals exist, suggest starter goals
            if (this.goals.length === 0) {
                this.suggestStarterGoals();
            }
            
            // Clean up old progress data
            this.cleanupOldProgress();
            
        } catch (error) {
            console.error('Error loading goals data:', error);
            this.goals = [];
            this.todaysProgress = {};
        }
    }

    suggestStarterGoals() {
        // Customer-obsessed: Suggest goals that are achievable and motivating
        const starterGoals = [
            {
                id: 'daily_activity',
                title: 'Stay Active Daily',
                description: 'Log any physical activity each day',
                type: 'habit',
                category: 'fitness',
                target: 1,
                unit: 'activity',
                period: 'daily',
                difficulty: 'easy',
                emoji: '💪',
                motivationalMessages: [
                    "Every step counts! You're building a stronger you! 🌟",
                    "Movement is medicine - you're taking care of yourself! 💝",
                    "Your future self will thank you for this! 🚀"
                ]
            },
            {
                id: 'sleep_consistency',
                title: 'Get Quality Sleep',
                description: 'Track your sleep to build better habits',
                type: 'habit',
                category: 'wellness',
                target: 7,
                unit: 'hours',
                period: 'daily',
                difficulty: 'medium',
                emoji: '😴',
                motivationalMessages: [
                    "Rest is productive! You're investing in tomorrow! 🌙",
                    "Quality sleep = quality life! Sweet dreams! ✨",
                    "Your brain thanks you for this recovery time! 🧠"
                ]
            },
            {
                id: 'learning_habit',
                title: 'Learn Something New',
                description: 'Read, study, or explore new topics',
                type: 'habit',
                category: 'learning',
                target: 30,
                unit: 'minutes',
                period: 'daily',
                difficulty: 'easy',
                emoji: '📚',
                motivationalMessages: [
                    "Knowledge is power! You're growing every day! 🌱",
                    "Curiosity is your superpower! Keep learning! 🔥",
                    "30 minutes today, lifetime of wisdom! 🎓"
                ]
            }
        ];

        // Add creation date and initial progress
        const today = new Date().toISOString().split('T')[0];
        this.goals = starterGoals.map(goal => ({
            ...goal,
            createdAt: today,
            progress: 0,
            streak: 0,
            bestStreak: 0,
            completedDays: [],
            lastUpdated: today,
            isActive: true,
            totalAchievements: 0
        }));

        this.saveGoalsData();
    }

    setupDailyReset() {
        // Check if we need to reset daily progress
        const lastResetDate = localStorage.getItem('lastGoalsReset');
        const today = new Date().toISOString().split('T')[0];
        
        if (lastResetDate !== today) {
            this.resetDailyProgress();
            localStorage.setItem('lastGoalsReset', today);
        }
    }

    resetDailyProgress() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Check if yesterday's goals were completed for streak tracking
        const yesterdaysGoals = this.checkYesterdaysCompletion();
        
        if (yesterdaysGoals.allCompleted && yesterdaysGoals.hadGoals) {
            this.currentStreak++;
            this.celebrationQueue.push({
                type: 'streak',
                message: `🔥 ${this.currentStreak} day streak! You're unstoppable!`,
                points: this.currentStreak * 10
            });
        } else if (yesterdaysGoals.hadGoals) {
            // Reset streak but don't punish - stay positive!
            this.currentStreak = 0;
        }
        
        // Reset today's progress
        this.todaysProgress = {};
        this.saveGoalsData();
        
        console.log('📅 Daily goals progress reset');
    }

    setupActivityListeners() {
        // Listen for new activities from chat module
        if (window.LifeStream && window.LifeStream.eventBus) {
            window.LifeStream.eventBus.on('activityLogged', this.handleGoalProgress);
        }
    }

    async handleGoalProgress(activityData) {
        // Customer-obsessed: Every activity should feel meaningful toward goals
        const matchingGoals = this.findMatchingGoals(activityData);
        
        for (const goal of matchingGoals) {
            const progress = this.calculateProgress(goal, activityData);
            await this.updateGoalProgress(goal.id, progress);
        }
    }

    findMatchingGoals(activityData) {
        const { type, duration, category } = activityData;
        
        return this.goals.filter(goal => {
            if (!goal.isActive) return false;
            
            // Match by category
            if (goal.category === category) return true;
            
            // Special matching logic for different goal types
            switch (goal.category) {
                case 'fitness':
                    return ['workout', 'exercise', 'walk', 'run', 'sport'].includes(type);
                case 'wellness':
                    return ['sleep', 'meditation', 'relaxation'].includes(type);
                case 'learning':
                    return ['read', 'study', 'course', 'research'].includes(type);
                case 'productivity':
                    return ['work', 'project', 'task'].includes(type);
                case 'social':
                    return ['social', 'family', 'friends'].includes(type);
                default:
                    return false;
            }
        });
    }

    calculateProgress(goal, activityData) {
        const { duration, value } = activityData;
        
        switch (goal.unit) {
            case 'minutes':
            case 'hours':
                return goal.unit === 'hours' ? duration / 60 : duration;
            case 'activity':
                return 1; // Each activity counts as 1
            case 'times':
                return value || 1;
            default:
                return duration || 1;
        }
    }

    async updateGoalProgress(goalId, progressAmount) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        // Update today's progress
        if (!this.todaysProgress[goalId]) {
            this.todaysProgress[goalId] = 0;
        }
        this.todaysProgress[goalId] += progressAmount;
        
        // Calculate completion percentage
        const completionPercent = Math.min((this.todaysProgress[goalId] / goal.target) * 100, 100);
        const wasCompleted = goal.completedDays.includes(today);
        const isNowCompleted = this.todaysProgress[goalId] >= goal.target;
        
        // Update goal stats
        goal.progress = completionPercent;
        goal.lastUpdated = today;
        
        // Handle goal completion
        if (isNowCompleted && !wasCompleted) {
            await this.handleGoalCompletion(goal, today);
        }
        
        // Save progress
        await this.saveGoalsData();
        
        // Trigger UI updates
        this.triggerProgressUpdate(goal, progressAmount);
    }

    async handleGoalCompletion(goal, date) {
        // Customer-obsessed: Make goal completion feel AMAZING
        goal.completedDays.push(date);
        goal.totalAchievements++;
        
        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (goal.completedDays.includes(yesterdayStr)) {
            goal.streak++;
        } else {
            goal.streak = 1;
        }
        
        // Track best streak
        if (goal.streak > goal.bestStreak) {
            goal.bestStreak = goal.streak;
        }
        
        // Generate celebration
        const celebration = this.motivationEngine.generateCelebration(goal);
        this.celebrationQueue.push(celebration);
        
        // Award points
        const points = this.calculateGoalPoints(goal);
        await this.awardPoints(points, goal.title);
        
        // Check for milestone achievements
        this.checkMilestoneAchievements(goal);
        
        console.log(`🎉 Goal completed: ${goal.title}`);
    }

    calculateGoalPoints(goal) {
        let basePoints = 25; // Base completion points
        
        // Difficulty multiplier
        const difficultyMultiplier = {
            'easy': 1,
            'medium': 1.5,
            'hard': 2
        };
        basePoints *= difficultyMultiplier[goal.difficulty] || 1;
        
        // Streak bonus
        if (goal.streak > 1) {
            basePoints += goal.streak * 5;
        }
        
        // Special milestone bonuses
        if (goal.streak === 7) basePoints += 50; // Week bonus
        if (goal.streak === 30) basePoints += 200; // Month bonus
        if (goal.totalAchievements === 10) basePoints += 100; // 10th completion
        
        return Math.floor(basePoints);
    }

    async awardPoints(points, reason) {
        try {
            const currentPoints = await window.LifeStream.Storage.getData('totalPoints') || 0;
            const newPoints = currentPoints + points;
            await window.LifeStream.Storage.saveData('totalPoints', newPoints);
            
            // Trigger points animation
            if (window.LifeStream.eventBus) {
                window.LifeStream.eventBus.emit('pointsAwarded', {
                    points: points,
                    total: newPoints,
                    reason: reason
                });
            }
        } catch (error) {
            console.error('Error awarding points:', error);
        }
    }

    checkMilestoneAchievements(goal) {
        const milestones = [
            { streak: 3, message: '🔥 3-day streak! Building momentum!', points: 30 },
            { streak: 7, message: '⭐ Week warrior! You\'re on fire!', points: 100 },
            { streak: 14, message: '💪 Habit forming! Two weeks strong!', points: 200 },
            { streak: 30, message: '🏆 30-day legend! You\'re transformed!', points: 500 },
            { achievements: 5, message: '🌟 5 completions! You\'re consistent!', points: 50 },
            { achievements: 20, message: '🚀 20 completions! You\'re dedicated!', points: 150 },
            { achievements: 50, message: '👑 50 completions! You\'re a champion!', points: 300 }
        ];
        
        for (const milestone of milestones) {
            if (milestone.streak && goal.streak === milestone.streak) {
                this.celebrationQueue.push({
                    type: 'milestone',
                    message: milestone.message,
                    points: milestone.points
                });
            }
            if (milestone.achievements && goal.totalAchievements === milestone.achievements) {
                this.celebrationQueue.push({
                    type: 'milestone',
                    message: milestone.message,
                    points: milestone.points
                });
            }
        }
    }

    // API Methods for UI Integration

    async createGoal(goalData) {
        const newGoal = {
            id: `goal_${Date.now()}`,
            ...goalData,
            createdAt: new Date().toISOString().split('T')[0],
            progress: 0,
            streak: 0,
            bestStreak: 0,
            completedDays: [],
            lastUpdated: new Date().toISOString().split('T')[0],
            isActive: true,
            totalAchievements: 0
        };
        
        this.goals.push(newGoal);
        await this.saveGoalsData();
        
        // Welcome message for new goal
        this.celebrationQueue.push({
            type: 'newGoal',
            message: `🎯 New goal set: "${newGoal.title}"! Let's make it happen!`,
            points: 10
        });
        
        return newGoal;
    }

    async updateGoal(goalId, updates) {
        const goalIndex = this.goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) return null;
        
        this.goals[goalIndex] = {
            ...this.goals[goalIndex],
            ...updates,
            lastUpdated: new Date().toISOString().split('T')[0]
        };
        
        await this.saveGoalsData();
        return this.goals[goalIndex];
    }

    async deleteGoal(goalId) {
        this.goals = this.goals.filter(g => g.id !== goalId);
        delete this.todaysProgress[goalId];
        await this.saveGoalsData();
    }

    getActiveGoals() {
        return this.goals.filter(g => g.isActive);
    }

    getTodaysProgress() {
        return this.todaysProgress;
    }

    getGoalStats() {
        const activeGoals = this.getActiveGoals();
        const today = new Date().toISOString().split('T')[0];
        
        const completedToday = activeGoals.filter(goal => 
            this.todaysProgress[goal.id] >= goal.target
        ).length;
        
        const totalProgress = activeGoals.reduce((sum, goal) => {
            const progress = (this.todaysProgress[goal.id] || 0) / goal.target;
            return sum + Math.min(progress, 1);
        }, 0);
        
        const averageProgress = activeGoals.length > 0 ? 
            Math.round((totalProgress / activeGoals.length) * 100) : 0;
        
        return {
            totalGoals: activeGoals.length,
            completedToday,
            currentStreak: this.currentStreak,
            averageProgress,
            pendingCelebrations: this.celebrationQueue.length
        };
    }

    getPendingCelebrations() {
        const celebrations = [...this.celebrationQueue];
        this.celebrationQueue = []; // Clear the queue
        return celebrations;
    }

    // Utility Methods

    async saveGoalsData() {
        try {
            await window.LifeStream.Storage.saveData('goals', this.goals);
            await window.LifeStream.Storage.saveData('todaysProgress', this.todaysProgress);
            await window.LifeStream.Storage.saveData('goalStreak', this.currentStreak);
        } catch (error) {
            console.error('Error saving goals data:', error);
        }
    }

    checkYesterdaysCompletion() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const activeGoals = this.goals.filter(g => g.isActive && g.createdAt <= yesterdayStr);
        
        if (activeGoals.length === 0) {
            return { allCompleted: false, hadGoals: false };
        }
        
        const completedYesterday = activeGoals.filter(goal => 
            goal.completedDays.includes(yesterdayStr)
        );
        
        return {
            allCompleted: completedYesterday.length === activeGoals.length,
            hadGoals: true,
            completedCount: completedYesterday.length,
            totalCount: activeGoals.length
        };
    }

    cleanupOldProgress() {
        // Keep only last 30 days of progress for performance
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];
        
        this.goals.forEach(goal => {
            goal.completedDays = goal.completedDays.filter(date => date >= cutoffStr);
        });
    }

    checkPendingAchievements() {
        // Check if there are any achievements that should be celebrated from previous sessions
        const today = new Date().toISOString().split('T')[0];
        
        this.goals.forEach(goal => {
            if (goal.completedDays.includes(today)) {
                // Today's goal was already completed, might need celebration
                const celebration = this.motivationEngine.generateCompletionReminder(goal);
                if (celebration) {
                    this.celebrationQueue.push(celebration);
                }
            }
        });
    }

    triggerProgressUpdate(goal, progressAmount) {
        if (window.LifeStream.eventBus) {
            window.LifeStream.eventBus.emit('goalProgressUpdate', {
                goalId: goal.id,
                goal: goal,
                progressAmount: progressAmount,
                currentProgress: this.todaysProgress[goal.id],
                completionPercent: goal.progress
            });
        }
    }

    triggerCelebration(celebration) {
        if (window.LifeStream.eventBus) {
            window.LifeStream.eventBus.emit('goalCelebration', celebration);
        }
    }

    cleanup() {
        // Remove event listeners
        if (window.LifeStream && window.LifeStream.eventBus) {
            window.LifeStream.eventBus.off('activityLogged', this.handleGoalProgress);
        }
        
        this.initialized = false;
    }
}

/**
 * Motivation Engine - Generates personalized encouragement and celebrations
 * Customer-obsessed: Every interaction should make users feel good about themselves
 */
class MotivationEngine {
    constructor() {
        this.celebrationTemplates = {
            fitness: [
                "💪 Your body is thanking you right now!",
                "🔥 You're building strength with every move!",
                "⚡ Energy invested, energy returned!",
                "🏃‍♂️ Every step makes you stronger!",
                "🌟 You're glowing with that post-workout energy!"
            ],
            wellness: [
                "🧘‍♂️ Self-care is the best care!",
                "💆‍♀️ You're investing in your peace of mind!",
                "🌸 Taking care of yourself = taking care of everything!",
                "✨ Your future self feels this kindness!",
                "🌙 Rest and recharge, you deserve it!"
            ],
            learning: [
                "🧠 Your brain is growing stronger!",
                "📚 Knowledge is your superpower!",
                "🌱 Every lesson plants a seed of wisdom!",
                "🎓 You're becoming more awesome every day!",
                "💡 Curiosity is your secret weapon!"
            ],
            productivity: [
                "🚀 You're making things happen!",
                "✅ Progress over perfection, always!",
                "⚡ You're building momentum!",
                "🎯 Focused energy creates magic!",
                "💼 Your dedication is inspiring!"
            ]
        };

        this.streakMessages = {
            3: "🔥 3 days strong! You're building something beautiful!",
            7: "⭐ One week! You're proving to yourself what's possible!",
            14: "💪 Two weeks! This is becoming part of who you are!",
            21: "🌟 21 days! Scientists say habits form around now!",
            30: "🏆 30 days! You've officially transformed your life!",
            60: "👑 60 days! You're not just consistent, you're legendary!",
            100: "🚀 100 days! You've achieved something truly extraordinary!"
        };
    }

    generateCelebration(goal) {
        const categoryMessages = this.celebrationTemplates[goal.category] || 
                                this.celebrationTemplates.productivity;
        
        const randomMessage = categoryMessages[
            Math.floor(Math.random() * categoryMessages.length)
        ];

        let celebration = {
            type: 'goalComplete',
            message: randomMessage,
            points: this.calculateCelebrationPoints(goal),
            emoji: goal.emoji,
            goalTitle: goal.title
        };

        // Add streak message if applicable
        if (goal.streak > 1 && this.streakMessages[goal.streak]) {
            celebration.streakMessage = this.streakMessages[goal.streak];
            celebration.points += goal.streak * 5;
        }

        return celebration;
    }

    generateCompletionReminder(goal) {
        // Generate a gentle reminder celebration for goals completed earlier
        if (Math.random() < 0.3) { // 30% chance to avoid spam
            return {
                type: 'reminder',
                message: `✨ Don't forget - you crushed "${goal.title}" today! ${goal.emoji}`,
                points: 0,
                goalTitle: goal.title
            };
        }
        return null;
    }

    calculateCelebrationPoints(goal) {
        let points = 25; // Base points
        
        // Difficulty bonus
        const difficultyBonus = { easy: 0, medium: 10, hard: 20 };
        points += difficultyBonus[goal.difficulty] || 0;
        
        // Streak bonus
        if (goal.streak > 1) {
            points += Math.min(goal.streak * 3, 50); // Cap streak bonus
        }
        
        return points;
    }

    generateProgressEncouragement(goal, progressPercent) {
        if (progressPercent >= 100) return null;
        
        const encouragements = [
            `🎯 ${Math.round(progressPercent)}% there! You've got this!`,
            `⚡ Making progress on "${goal.title}"! Keep going!`,
            `🌟 Every step counts! You're ${Math.round(progressPercent)}% of the way!`,
            `💪 Building momentum on "${goal.title}"!`,
            `🔥 Progress is progress! You're doing amazing!`
        ];
        
        // Show encouragement at 25%, 50%, 75% milestones
        const milestones = [25, 50, 75];
        const milestone = milestones.find(m => 
            progressPercent >= m && progressPercent < m + 5
        );
        
        if (milestone && Math.random() < 0.6) { // 60% chance at milestones
            return {
                type: 'progress',
                message: encouragements[Math.floor(Math.random() * encouragements.length)],
                points: 0,
                goalTitle: goal.title,
                progress: Math.round(progressPercent)
            };
        }
        
        return null;
    }
}

// Initialize and expose the module
if (typeof window !== 'undefined') {
    window.LifeStream = window.LifeStream || {};
    window.LifeStream.Goals = new GoalsModule();
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.LifeStream.Goals.initialize();
        });
    } else {
        window.LifeStream.Goals.initialize();
    }
}

export default GoalsModule;
