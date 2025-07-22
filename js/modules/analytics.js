/**
 * LifeStream v2.0 - Analytics Module
 * Visual progress analytics engine focused on making data addictive and motivating
 * 
 * Key Philosophy: Transform data into dopamine - every chart should make users feel proud
 * Every visualization should answer: "Am I getting better?" with a resounding "YES!"
 */

class AnalyticsModule {
    constructor() {
        this.initialized = false;
        this.rawData = {
            activities: [],
            goals: [],
            achievements: []
        };
        this.processedData = {};
        this.chartInstances = new Map();
        this.updateQueue = [];
        
        // Performance optimization
        this.dataCache = new Map();
        this.lastCacheTime = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        // Bind methods
        this.handleDataUpdate = this.handleDataUpdate.bind(this);
        this.refreshAnalytics = this.refreshAnalytics.bind(this);
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('📊 Initializing Analytics Module...');
            
            // Load all data sources
            await this.loadAllData();
            
            // Set up real-time data listeners
            this.setupDataListeners();
            
            // Process initial analytics
            await this.processAllAnalytics();
            
            // Set up periodic updates
            this.setupPeriodicUpdates();
            
            this.initialized = true;
            console.log('✅ Analytics Module initialized successfully');
            
        } catch (error) {
            console.error('❌ Analytics Module initialization failed:', error);
        }
    }

    async loadAllData() {
        try {
            // Load raw data from storage
            const [activities, goals, totalPoints, achievements] = await Promise.all([
                window.LifeStream.Storage.getData('chatHistory') || [],
                window.LifeStream.Storage.getData('goals') || [],
                window.LifeStream.Storage.getData('totalPoints') || 0,
                window.LifeStream.Storage.getData('achievements') || []
            ]);
            
            // Extract activities from chat history
            this.rawData.activities = this.extractActivitiesFromChat(activities);
            this.rawData.goals = goals;
            this.rawData.achievements = achievements;
            this.rawData.totalPoints = totalPoints;
            
            console.log(`📈 Loaded ${this.rawData.activities.length} activities, ${goals.length} goals`);
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
            this.rawData = { activities: [], goals: [], achievements: [] };
        }
    }

    extractActivitiesFromChat(chatHistory) {
        const activities = [];
        
        chatHistory.forEach(message => {
            if (message.sender === 'user' && message.activities) {
                message.activities.forEach(activity => {
                    activities.push({
                        ...activity,
                        timestamp: message.timestamp,
                        date: new Date(message.timestamp).toISOString().split('T')[0],
                        messageId: message.id
                    });
                });
            }
        });
        
        // Sort by timestamp for time series analysis
        return activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    setupDataListeners() {
        if (window.LifeStream?.eventBus) {
            window.LifeStream.eventBus.on('activityLogged', this.handleDataUpdate);
            window.LifeStream.eventBus.on('goalProgressUpdate', this.handleDataUpdate);
            window.LifeStream.eventBus.on('achievementUnlocked', this.handleDataUpdate);
        }
    }

    async handleDataUpdate(eventData) {
        // Add to update queue for batch processing
        this.updateQueue.push({
            type: eventData.type || 'activity',
            data: eventData,
            timestamp: Date.now()
        });
        
        // Clear cache to force refresh
        this.clearCache();
        
        // Debounced refresh (wait 1 second for more updates)
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(this.refreshAnalytics, 1000);
    }

    async refreshAnalytics() {
        try {
            await this.loadAllData();
            await this.processAllAnalytics();
            
            // Emit update event for UI
            if (window.LifeStream?.eventBus) {
                window.LifeStream.eventBus.emit('analyticsUpdated', this.processedData);
            }
            
            console.log('📊 Analytics refreshed');
        } catch (error) {
            console.error('Error refreshing analytics:', error);
        }
    }

    async processAllAnalytics() {
        const startTime = performance.now();
        
        // Process all analytics in parallel where possible
        const [
            timeSeriesData,
            categoryBreakdown,
            streakAnalysis,
            goalAnalysis,
            achievementData,
            weeklyPatterns,
            monthlyTrends,
            insightData
        ] = await Promise.all([
            this.processTimeSeriesData(),
            this.processCategoryBreakdown(),
            this.processStreakAnalysis(),
            this.processGoalAnalysis(),
            this.processAchievementData(),
            this.processWeeklyPatterns(),
            this.processMonthlyTrends(),
            this.processInsightData()
        ]);
        
        this.processedData = {
            timeSeries: timeSeriesData,
            categories: categoryBreakdown,
            streaks: streakAnalysis,
            goals: goalAnalysis,
            achievements: achievementData,
            patterns: {
                weekly: weeklyPatterns,
                monthly: monthlyTrends
            },
            insights: insightData,
            summary: this.generateSummaryStats(),
            lastUpdated: Date.now()
        };
        
        const processingTime = performance.now() - startTime;
        console.log(`📊 Analytics processed in ${Math.round(processingTime)}ms`);
    }

    processTimeSeriesData() {
        const cacheKey = 'timeSeries';
        if (this.isCacheValid(cacheKey)) {
            return this.dataCache.get(cacheKey);
        }
        
        const activities = this.rawData.activities;
        if (activities.length === 0) return { daily: [], weekly: [], monthly: [] };
        
        // Generate date range from first activity to today
        const firstDate = new Date(activities[0].date);
        const today = new Date();
        const dateRange = this.generateDateRange(firstDate, today);
        
        // Daily activity counts and durations
        const dailyData = dateRange.map(date => {
            const dayActivities = activities.filter(a => a.date === date);
            
            const stats = {
                date,
                count: dayActivities.length,
                totalDuration: dayActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
                categories: this.groupByCategory(dayActivities),
                mood: this.calculateAverageMood(dayActivities),
                productivity: this.calculateProductivityScore(dayActivities)
            };
            
            return stats;
        });
        
        // Weekly aggregation
        const weeklyData = this.aggregateByWeek(dailyData);
        
        // Monthly aggregation  
        const monthlyData = this.aggregateByMonth(dailyData);
        
        const result = {
            daily: dailyData,
            weekly: weeklyData,
            monthly: monthlyData
        };
        
        this.dataCache.set(cacheKey, result);
        return result;
    }

    processCategoryBreakdown() {
        const cacheKey = 'categories';
        if (this.isCacheValid(cacheKey)) {
            return this.dataCache.get(cacheKey);
        }
        
        const activities = this.rawData.activities;
        const categories = {};
        
        // Process each activity
        activities.forEach(activity => {
            const category = activity.category || 'other';
            
            if (!categories[category]) {
                categories[category] = {
                    name: category,
                    count: 0,
                    totalDuration: 0,
                    averageDuration: 0,
                    activities: [],
                    emoji: this.getCategoryEmoji(category),
                    color: this.getCategoryColor(category),
                    trend: 'stable',
                    weeklyChange: 0
                };
            }
            
            categories[category].count++;
            categories[category].totalDuration += activity.duration || 0;
            categories[category].activities.push(activity);
        });
        
        // Calculate averages and trends
        Object.keys(categories).forEach(cat => {
            const categoryData = categories[cat];
            categoryData.averageDuration = categoryData.totalDuration / categoryData.count;
            
            // Calculate weekly trend
            const recentWeek = this.getRecentActivities(categoryData.activities, 7);
            const previousWeek = this.getActivitiesInRange(categoryData.activities, 14, 7);
            
            const recentCount = recentWeek.length;
            const previousCount = previousWeek.length;
            
            if (previousCount > 0) {
                categoryData.weeklyChange = ((recentCount - previousCount) / previousCount) * 100;
                categoryData.trend = categoryData.weeklyChange > 10 ? 'up' : 
                                   categoryData.weeklyChange < -10 ? 'down' : 'stable';
            }
        });
        
        // Sort by total duration
        const sortedCategories = Object.values(categories)
            .sort((a, b) => b.totalDuration - a.totalDuration);
        
        const result = {
            breakdown: sortedCategories,
            topCategory: sortedCategories[0]?.name || 'none',
            totalCategories: sortedCategories.length,
            distribution: this.calculateDistribution(sortedCategories)
        };
        
        this.dataCache.set(cacheKey, result);
        return result;
    }

    processStreakAnalysis() {
        const cacheKey = 'streaks';
        if (this.isCacheValid(cacheKey)) {
            return this.dataCache.get(cacheKey);
        }
        
        const activities = this.rawData.activities;
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate current streak
        let currentStreak = 0;
        let date = new Date();
        
        while (true) {
            const dateStr = date.toISOString().split('T')[0];
            const hasActivity = activities.some(a => a.date === dateStr);
            
            if (hasActivity || dateStr === today) {
                if (hasActivity) currentStreak++;
            } else {
                break;
            }
            
            date.setDate(date.getDate() - 1);
            if (currentStreak > 365) break; // Prevent infinite loop
        }
        
        // Find longest streak
        let longestStreak = 0;
        let currentCount = 0;
        const allDates = [...new Set(activities.map(a => a.date))].sort();
        
        for (let i = 0; i < allDates.length; i++) {
            if (i === 0 || this.isConsecutiveDay(allDates[i-1], allDates[i])) {
                currentCount++;
                longestStreak = Math.max(longestStreak, currentCount);
            } else {
                currentCount = 1;
            }
        }
        
        // Generate streak calendar (last 30 days)
        const calendar = this.generateStreakCalendar(activities, 30);
        
        const result = {
            current: currentStreak,
            longest: longestStreak,
            calendar: calendar,
            streakLevel: this.getStreakLevel(currentStreak),
            daysWithActivity: allDates.length,
            activePercentage: this.calculateActivePercentage(activities)
        };
        
        this.dataCache.set(cacheKey, result);
        return result;
    }

    processGoalAnalysis() {
        const goals = this.rawData.goals;
        if (goals.length === 0) return { goals: [], summary: {} };
        
        const today = new Date().toISOString().split('T')[0];
        
        const processedGoals = goals.map(goal => {
            // Get today's progress from Goals module if available
            const todaysProgress = window.LifeStream?.Goals?.getTodaysProgress()?.[goal.id] || 0;
            const completionPercent = Math.min((todaysProgress / goal.target) * 100, 100);
            
            // Calculate historical performance
            const completionRate = this.calculateGoalCompletionRate(goal);
            const averageProgress = this.calculateAverageGoalProgress(goal);
            const bestStreak = goal.bestStreak || 0;
            
            return {
                ...goal,
                todaysProgress,
                completionPercent,
                completionRate,
                averageProgress,
                bestStreak,
                status: completionPercent >= 100 ? 'completed' : 
                       completionPercent >= 50 ? 'progress' : 'starting',
                motivation: this.generateGoalMotivation(goal, completionPercent)
            };
        });
        
        const summary = {
            totalGoals: goals.length,
            activeGoals: goals.filter(g => g.isActive).length,
            completedToday: processedGoals.filter(g => g.status === 'completed').length,
            averageCompletion: processedGoals.reduce((sum, g) => sum + g.completionRate, 0) / goals.length,
            totalAchievements: goals.reduce((sum, g) => sum + (g.totalAchievements || 0), 0)
        };
        
        return { goals: processedGoals, summary };
    }

    processAchievementData() {
        const achievements = this.rawData.achievements || [];
        const totalPoints = this.rawData.totalPoints || 0;
        const activities = this.rawData.activities;
        
        // Calculate achievement stats
        const unlockedCount = achievements.filter(a => a.unlocked).length;
        const totalPossible = this.getTotalPossibleAchievements();
        
        // Generate progress rings data
        const progressRings = [
            {
                name: 'Daily Goal',
                current: window.LifeStream?.Goals?.getGoalStats()?.completedToday || 0,
                target: window.LifeStream?.Goals?.getGoalStats()?.totalGoals || 1,
                color: '#00d4ff',
                emoji: '🎯'
            },
            {
                name: 'Weekly Activities',
                current: this.getRecentActivities(activities, 7).length,
                target: 21, // 3 per day target
                color: '#4ecdc4',
                emoji: '📈'
            },
            {
                name: 'Achievement Progress',
                current: unlockedCount,
                target: Math.max(totalPossible, 10),
                color: '#ff6b6b',
                emoji: '🏆'
            }
        ];
        
        // Calculate user level
        const userLevel = this.calculateUserLevel(totalPoints);
        
        return {
            achievements: achievements,
            totalPoints: totalPoints,
            userLevel: userLevel,
            progressRings: progressRings,
            unlockedCount: unlockedCount,
            completionRate: (unlockedCount / Math.max(totalPossible, 1)) * 100
        };
    }

    processWeeklyPatterns() {
        const activities = this.rawData.activities;
        const weeklyStats = {};
        
        // Initialize days of week
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        daysOfWeek.forEach(day => {
            weeklyStats[day] = {
                name: day,
                count: 0,
                totalDuration: 0,
                averageDuration: 0,
                activities: [],
                bestHour: 0,
                mood: 0
            };
        });
        
        // Process activities
        activities.forEach(activity => {
            const date = new Date(activity.timestamp);
            const dayName = daysOfWeek[date.getDay()];
            const hour = date.getHours();
            
            weeklyStats[dayName].count++;
            weeklyStats[dayName].totalDuration += activity.duration || 0;
            weeklyStats[dayName].activities.push(activity);
            
            // Track peak hours
            if (!weeklyStats[dayName].hours) weeklyStats[dayName].hours = {};
            weeklyStats[dayName].hours[hour] = (weeklyStats[dayName].hours[hour] || 0) + 1;
        });
        
        // Calculate averages and find patterns
        Object.keys(weeklyStats).forEach(day => {
            const dayData = weeklyStats[day];
            if (dayData.count > 0) {
                dayData.averageDuration = dayData.totalDuration / dayData.count;
                dayData.mood = this.calculateAverageMood(dayData.activities);
                
                // Find best hour
                if (dayData.hours) {
                    dayData.bestHour = parseInt(Object.keys(dayData.hours)
                        .reduce((a, b) => dayData.hours[a] > dayData.hours[b] ? a : b));
                }
            }
        });
        
        return {
            byDay: Object.values(weeklyStats),
            mostActiveDay: Object.values(weeklyStats).reduce((max, day) => 
                day.count > max.count ? day : max, weeklyStats.Sunday),
            weekendVsWeekday: this.compareWeekendVsWeekday(weeklyStats)
        };
    }

    processMonthlyTrends() {
        const activities = this.rawData.activities;
        const monthlyData = {};
        
        activities.forEach(activity => {
            const date = new Date(activity.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: monthKey,
                    count: 0,
                    totalDuration: 0,
                    categories: {},
                    activities: []
                };
            }
            
            monthlyData[monthKey].count++;
            monthlyData[monthKey].totalDuration += activity.duration || 0;
            monthlyData[monthKey].activities.push(activity);
            
            // Category breakdown
            const category = activity.category || 'other';
            if (!monthlyData[monthKey].categories[category]) {
                monthlyData[monthKey].categories[category] = 0;
            }
            monthlyData[monthKey].categories[category]++;
        });
        
        const sortedMonths = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
        
        return {
            byMonth: sortedMonths,
            growth: this.calculateGrowthTrend(sortedMonths),
            totalMonths: sortedMonths.length
        };
    }

    processInsightData() {
        const activities = this.rawData.activities;
        const goals = this.rawData.goals;
        
        const insights = [];
        
        // Activity patterns
        const recentActivities = this.getRecentActivities(activities, 7);
        const previousActivities = this.getActivitiesInRange(activities, 14, 7);
        
        if (recentActivities.length > previousActivities.length) {
            insights.push({
                type: 'positive',
                title: 'Activity Increasing!',
                message: `You've logged ${recentActivities.length} activities this week, up from ${previousActivities.length} last week!`,
                emoji: '📈',
                impact: 'high'
            });
        }
        
        // Goal performance
        const activeGoals = goals.filter(g => g.isActive);
        const completedGoals = activeGoals.filter(g => {
            const todaysProgress = window.LifeStream?.Goals?.getTodaysProgress()?.[g.id] || 0;
            return todaysProgress >= g.target;
        });
        
        if (completedGoals.length > 0) {
            insights.push({
                type: 'achievement',
                title: 'Goal Crusher!',
                message: `You've completed ${completedGoals.length} goals today! Keep the momentum going!`,
                emoji: '🎯',
                impact: 'high'
            });
        }
        
        // Category insights
        const categoryData = this.processCategoryBreakdown();
        const topCategory = categoryData.breakdown[0];
        if (topCategory && topCategory.weeklyChange > 20) {
            insights.push({
                type: 'trend',
                title: `${topCategory.name} is Trending Up!`,
                message: `Your ${topCategory.name} activities increased by ${Math.round(topCategory.weeklyChange)}% this week!`,
                emoji: topCategory.emoji,
                impact: 'medium'
            });
        }
        
        // Streak insights
        const streakData = this.processStreakAnalysis();
        if (streakData.current >= 3) {
            insights.push({
                type: 'streak',
                title: `${streakData.current}-Day Streak!`,
                message: `You're building incredible consistency! Your longest streak is ${streakData.longest} days.`,
                emoji: '🔥',
                impact: 'high'
            });
        }
        
        return {
            insights: insights,
            totalInsights: insights.length,
            lastGenerated: Date.now()
        };
    }

    // Chart Data Generation Methods

    getChartData(chartType, options = {}) {
        switch (chartType) {
            case 'activityTrend':
                return this.generateActivityTrendData(options);
            case 'categoryBreakdown':
                return this.generateCategoryChartData();
            case 'streakCalendar':
                return this.generateStreakCalendarData(options);
            case 'goalProgress':
                return this.generateGoalProgressData();
            case 'weeklyPattern':
                return this.generateWeeklyPatternData();
            case 'monthlyTrend':
                return this.generateMonthlyTrendData();
            default:
                return null;
        }
    }

    generateActivityTrendData(options = {}) {
        const { period = 'daily', days = 30 } = options;
        const timeSeriesData = this.processedData.timeSeries;
        
        if (period === 'daily') {
            const recentData = timeSeriesData.daily.slice(-days);
            return {
                labels: recentData.map(d => this.formatDateLabel(d.date)),
                datasets: [{
                    label: 'Daily Activities',
                    data: recentData.map(d => d.count),
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Duration (hours)',
                    data: recentData.map(d => Math.round(d.totalDuration / 60 * 100) / 100),
                    borderColor: '#4ecdc4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    tension: 0.4,
                    yAxisID: 'duration'
                }]
            };
        }
        
        return null;
    }

    generateCategoryChartData() {
        const categories = this.processedData.categories.breakdown;
        
        return {
            labels: categories.map(c => c.name),
            datasets: [{
                data: categories.map(c => c.totalDuration),
                backgroundColor: categories.map(c => c.color),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    }

    generateStreakCalendarData(options = {}) {
        const { days = 30 } = options;
        const calendar = this.processedData.streaks.calendar;
        
        return calendar.slice(-days).map(day => ({
            date: day.date,
            value: day.hasActivity ? 1 : 0,
            count: day.activityCount,
            level: Math.min(Math.floor(day.activityCount / 2), 4) // 0-4 intensity levels
        }));
    }

    generateGoalProgressData() {
        const goals = this.processedData.goals.goals;
        
        return goals.map(goal => ({
            id: goal.id,
            name: goal.title,
            progress: goal.completionPercent,
            target: 100,
            color: this.getCategoryColor(goal.category),
            status: goal.status,
            emoji: goal.emoji
        }));
    }

    generateWeeklyPatternData() {
        const weeklyData = this.processedData.patterns.weekly.byDay;
        
        return {
            labels: weeklyData.map(d => d.name.slice(0, 3)), // Mon, Tue, etc
            datasets: [{
                label: 'Activities per Day',
                data: weeklyData.map(d => d.count),
                backgroundColor: '#00d4ff',
                borderRadius: 4
            }]
        };
    }

    // Utility Methods

    generateDateRange(startDate, endDate) {
        const dates = [];
        const current = new Date(startDate);
        
        while (current <= endDate) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    }

    groupByCategory(activities) {
        const categories = {};
        activities.forEach(activity => {
            const cat = activity.category || 'other';
            categories[cat] = (categories[cat] || 0) + 1;
        });
        return categories;
    }

    calculateAverageMood(activities) {
        const moodActivities = activities.filter(a => a.mood && a.mood !== 'neutral');
        if (moodActivities.length === 0) return null;
        
        const moodValues = { great: 5, good: 4, okay: 3, tired: 2, stressed: 1 };
        const total = moodActivities.reduce((sum, a) => sum + (moodValues[a.mood] || 3), 0);
        return Math.round(total / moodActivities.length * 100) / 100;
    }

    calculateProductivityScore(activities) {
        const productiveCategories = ['work', 'learning', 'productivity'];
        const productiveActivities = activities.filter(a => 
            productiveCategories.includes(a.category)
        );
        
        return productiveActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
    }

    getRecentActivities(activities, days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return activities.filter(activity => 
            new Date(activity.timestamp) >= cutoffDate
        );
    }

    getActivitiesInRange(activities, startDaysAgo, endDaysAgo) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDaysAgo);
        
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - endDaysAgo);
        
        return activities.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            return activityDate >= endDate && activityDate < startDate;
        });
    }

    getCategoryEmoji(category) {
        const emojis = {
            fitness: '💪',
            wellness: '🧘‍♂️',
            learning: '📚',
            work: '💼',
            productivity: '⚡',
            social: '👥',
            entertainment: '🎮',
            other: '📊'
        };
        return emojis[category] || '📊';
    }

    getCategoryColor(category) {
        const colors = {
            fitness: '#ff6b6b',
            wellness: '#4ecdc4',
            learning: '#45b7d1',
            work: '#96ceb4',
            productivity: '#feca57',
            social: '#ff9ff3',
            entertainment: '#54a0ff',
            other: '#5f27cd'
        };
        return colors[category] || '#5f27cd';
    }

    generateSummaryStats() {
        const activities = this.rawData.activities;
        const goals = this.rawData.goals;
        
        return {
            totalActivities: activities.length,
            totalHours: Math.round(activities.reduce((sum, a) => sum + (a.duration || 0), 0) / 60 * 10) / 10,
            activeGoals: goals.filter(g => g.isActive).length,
            currentStreak: this.processedData.streaks?.current || 0,
            totalPoints: this.rawData.totalPoints || 0,
            activeDays: [...new Set(activities.map(a => a.date))].length,
            favoriteCategory: this.processedData.categories?.topCategory || 'none'
        };
    }

    // Cache Management

    isCacheValid(key) {
        if (!this.lastCacheTime || Date.now() - this.lastCacheTime > this.cacheTimeout) {
            return false;
        }
        return this.dataCache.has(key);
    }

    clearCache() {
        this.dataCache.clear();
        this.lastCacheTime = null;
    }

    // Public API Methods

    getProcessedData() {
        return this.processedData;
    }

    getSummaryStats() {
        return this.processedData.summary || {};
    }

    getInsights() {
        return this.processedData.insights?.insights || [];
    }

    async exportData(format = 'json') {
        const exportData = {
            summary: this.processedData.summary,
            activities: this.rawData.activities,
            goals: this.rawData.goals,
            analytics: this.processedData,
            exportedAt: new Date().toISOString()
        };
        
        if (format === 'json') {
            return JSON.stringify(exportData, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(this.rawData.activities);
        }
        
        return exportData;
    }

    convertToCSV(activities) {
        if (activities.length === 0) return '';
        
        const headers = ['Date', 'Time', 'Activity', 'Category', 'Duration (min)', 'Mood'];
        const rows = activities.map(activity => [
            activity.date,
            new Date(activity.timestamp).toLocaleTimeString(),
            activity.type || 'activity',
            activity.category || 'other',
            activity.duration || 0,
            activity.mood || ''
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Advanced Analytics Utility Methods

    aggregateByWeek(dailyData) {
        const weeks = [];
        let currentWeek = [];
        
        dailyData.forEach((day, index) => {
            const date = new Date(day.date);
            const dayOfWeek = date.getDay();
            
            // Start new week on Monday (1) or if current week has 7 days
            if ((dayOfWeek === 1 && currentWeek.length > 0) || currentWeek.length === 7) {
                if (currentWeek.length > 0) {
                    weeks.push(this.summarizeWeek(currentWeek));
                    currentWeek = [];
                }
            }
            
            currentWeek.push(day);
        });
        
        // Add final week if it exists
        if (currentWeek.length > 0) {
            weeks.push(this.summarizeWeek(currentWeek));
        }
        
        return weeks;
    }

    summarizeWeek(weekDays) {
        const startDate = weekDays[0].date;
        const endDate = weekDays[weekDays.length - 1].date;
        
        return {
            startDate,
            endDate,
            totalCount: weekDays.reduce((sum, day) => sum + day.count, 0),
            totalDuration: weekDays.reduce((sum, day) => sum + day.totalDuration, 0),
            averageDaily: weekDays.reduce((sum, day) => sum + day.count, 0) / weekDays.length,
            activeDays: weekDays.filter(day => day.count > 0).length,
            categories: this.mergeCategories(weekDays.map(day => day.categories))
        };
    }

    aggregateByMonth(dailyData) {
        const months = {};
        
        dailyData.forEach(day => {
            const date = new Date(day.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!months[monthKey]) {
                months[monthKey] = {
                    month: monthKey,
                    days: [],
                    totalCount: 0,
                    totalDuration: 0,
                    activeDays: 0
                };
            }
            
            months[monthKey].days.push(day);
            months[monthKey].totalCount += day.count;
            months[monthKey].totalDuration += day.totalDuration;
            if (day.count > 0) months[monthKey].activeDays++;
        });
        
        return Object.values(months).map(month => ({
            ...month,
            averageDaily: month.totalCount / month.days.length,
            activityRate: month.activeDays / month.days.length
        }));
    }

    mergeCategories(categoriesArray) {
        const merged = {};
        
        categoriesArray.forEach(categories => {
            Object.keys(categories).forEach(cat => {
                merged[cat] = (merged[cat] || 0) + categories[cat];
            });
        });
        
        return merged;
    }

    calculateDistribution(categories) {
        const total = categories.reduce((sum, cat) => sum + cat.totalDuration, 0);
        
        return categories.map(cat => ({
            ...cat,
            percentage: total > 0 ? Math.round((cat.totalDuration / total) * 100) : 0
        }));
    }

    isConsecutiveDay(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
    }

    generateStreakCalendar(activities, days) {
        const calendar = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayActivities = activities.filter(a => a.date === dateStr);
            
            calendar.push({
                date: dateStr,
                hasActivity: dayActivities.length > 0,
                activityCount: dayActivities.length,
                totalDuration: dayActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
                categories: this.groupByCategory(dayActivities)
            });
        }
        
        return calendar;
    }

    getStreakLevel(streakDays) {
        if (streakDays >= 100) return { name: 'Legendary', emoji: '👑', color: '#ffd700' };
        if (streakDays >= 60) return { name: 'Master', emoji: '🏆', color: '#ff6b6b' };
        if (streakDays >= 30) return { name: 'Champion', emoji: '🚀', color: '#4ecdc4' };
        if (streakDays >= 14) return { name: 'Habit Former', emoji: '💪', color: '#45b7d1' };
        if (streakDays >= 7) return { name: 'Week Warrior', emoji: '⚡', color: '#feca57' };
        if (streakDays >= 3) return { name: 'Building Momentum', emoji: '🔥', color: '#ff9ff3' };
        if (streakDays >= 1) return { name: 'Getting Started', emoji: '🌱', color: '#96ceb4' };
        return { name: 'New Journey', emoji: '🎯', color: '#5f27cd' };
    }

    calculateActivePercentage(activities) {
        if (activities.length === 0) return 0;
        
        const firstActivity = new Date(activities[0].timestamp);
        const today = new Date();
        const totalDays = Math.ceil((today - firstActivity) / (1000 * 60 * 60 * 24)) + 1;
        const activeDays = [...new Set(activities.map(a => a.date))].length;
        
        return Math.round((activeDays / totalDays) * 100);
    }

    calculateGoalCompletionRate(goal) {
        if (!goal.completedDays || goal.completedDays.length === 0) return 0;
        
        const daysSinceCreated = Math.ceil(
            (new Date() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24)
        ) + 1;
        
        return Math.round((goal.completedDays.length / daysSinceCreated) * 100);
    }

    calculateAverageGoalProgress(goal) {
        // This would require historical progress data
        // For now, return current completion rate as approximation
        return this.calculateGoalCompletionRate(goal);
    }

    generateGoalMotivation(goal, completionPercent) {
        if (completionPercent >= 100) {
            return `🎉 ${goal.title} completed! You're crushing it!`;
        } else if (completionPercent >= 75) {
            return `🔥 Almost there! ${Math.round(100 - completionPercent)}% to go!`;
        } else if (completionPercent >= 50) {
            return `💪 Halfway done with ${goal.title}! Keep going!`;
        } else if (completionPercent >= 25) {
            return `🌱 Making progress on ${goal.title}! Every step counts!`;
        } else {
            return `🎯 Ready to make progress on ${goal.title}? You've got this!`;
        }
    }

    getTotalPossibleAchievements() {
        // This should match the achievements defined in constants.js
        return 15; // Base achievements count
    }

    calculateUserLevel(totalPoints) {
        const levels = [
            { name: 'Beginner', emoji: '🌱', min: 0, max: 99 },
            { name: 'Explorer', emoji: '🗺️', min: 100, max: 249 },
            { name: 'Tracker', emoji: '📈', min: 250, max: 499 },
            { name: 'Optimizer', emoji: '⚡', min: 500, max: 999 },
            { name: 'Master', emoji: '🏆', min: 1000, max: 1999 },
            { name: 'Legend', emoji: '👑', min: 2000, max: 4999 },
            { name: 'Life Guru', emoji: '🧘‍♂️', min: 5000, max: Infinity }
        ];
        
        const currentLevel = levels.find(level => 
            totalPoints >= level.min && totalPoints <= level.max
        ) || levels[0];
        
        const nextLevel = levels[levels.indexOf(currentLevel) + 1];
        const progressToNext = nextLevel ? 
            Math.round(((totalPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100) : 100;
        
        return {
            ...currentLevel,
            number: levels.indexOf(currentLevel) + 1,
            totalPoints,
            nextLevel,
            progressToNext: Math.min(progressToNext, 100)
        };
    }

    compareWeekendVsWeekday(weeklyStats) {
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const weekends = ['Saturday', 'Sunday'];
        
        const weekdayTotal = weekdays.reduce((sum, day) => sum + weeklyStats[day].count, 0);
        const weekendTotal = weekends.reduce((sum, day) => sum + weeklyStats[day].count, 0);
        
        const weekdayAverage = weekdayTotal / weekdays.length;
        const weekendAverage = weekendTotal / weekends.length;
        
        return {
            weekdayAverage: Math.round(weekdayAverage * 100) / 100,
            weekendAverage: Math.round(weekendAverage * 100) / 100,
            difference: Math.round((weekendAverage - weekdayAverage) * 100) / 100,
            preference: weekendAverage > weekdayAverage ? 'weekend' : 'weekday'
        };
    }

    calculateGrowthTrend(monthlyData) {
        if (monthlyData.length < 2) return { trend: 'stable', change: 0 };
        
        const recent = monthlyData[monthlyData.length - 1];
        const previous = monthlyData[monthlyData.length - 2];
        
        const change = ((recent.count - previous.count) / previous.count) * 100;
        
        return {
            trend: change > 10 ? 'up' : change < -10 ? 'down' : 'stable',
            change: Math.round(change),
            recentCount: recent.count,
            previousCount: previous.count
        };
    }

    formatDateLabel(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    setupPeriodicUpdates() {
        // Refresh analytics every 5 minutes for live data
        setInterval(() => {
            if (this.updateQueue.length > 0) {
                this.refreshAnalytics();
                this.updateQueue = [];
            }
        }, 5 * 60 * 1000);
        
        // Clear cache every hour to prevent stale data
        setInterval(() => {
            this.clearCache();
        }, 60 * 60 * 1000);
    }

    // Chart Integration Methods for Popular Libraries

    getChartJSConfig(chartType, options = {}) {
        const data = this.getChartData(chartType, options);
        if (!data) return null;
        
        const baseConfig = {
            type: this.getChartJSType(chartType),
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            color: '#64748b'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(100, 116, 139, 0.1)'
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(100, 116, 139, 0.1)'
                        },
                        ticks: {
                            color: '#64748b'
                        }
                    }
                }
            }
        };
        
        // Customize based on chart type
        switch (chartType) {
            case 'categoryBreakdown':
                baseConfig.type = 'doughnut';
                baseConfig.options.plugins.legend.position = 'right';
                delete baseConfig.options.scales;
                break;
            case 'activityTrend':
                baseConfig.options.scales.duration = {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        color: '#64748b'
                    }
                };
                break;
        }
        
        return baseConfig;
    }

    getChartJSType(chartType) {
        const typeMap = {
            'activityTrend': 'line',
            'categoryBreakdown': 'doughnut',
            'weeklyPattern': 'bar',
            'monthlyTrend': 'line',
            'goalProgress': 'bar'
        };
        return typeMap[chartType] || 'line';
    }

    // Real-time Updates and Performance

    async updateSingleChart(chartType, chartInstance) {
        try {
            const newData = this.getChartData(chartType);
            if (newData && chartInstance) {
                chartInstance.data = newData;
                chartInstance.update('none'); // No animation for performance
            }
        } catch (error) {
            console.error(`Error updating chart ${chartType}:`, error);
        }
    }

    registerChartInstance(chartType, instance) {
        this.chartInstances.set(chartType, instance);
    }

    updateAllCharts() {
        this.chartInstances.forEach(async (instance, chartType) => {
            await this.updateSingleChart(chartType, instance);
        });
    }

    // Cleanup and Teardown

    cleanup() {
        // Clear intervals
        if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
        
        // Remove event listeners
        if (window.LifeStream?.eventBus) {
            window.LifeStream.eventBus.off('activityLogged', this.handleDataUpdate);
            window.LifeStream.eventBus.off('goalProgressUpdate', this.handleDataUpdate);
            window.LifeStream.eventBus.off('achievementUnlocked', this.handleDataUpdate);
        }
        
        // Clear cache and chart instances
        this.clearCache();
        this.chartInstances.clear();
        
        this.initialized = false;
        console.log('📊 Analytics Module cleaned up');
    }
}

// Initialize and expose the module
if (typeof window !== 'undefined') {
    window.LifeStream = window.LifeStream || {};
    window.LifeStream.Analytics = new AnalyticsModule();
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.LifeStream.Analytics.initialize();
        });
    } else {
        window.LifeStream.Analytics.initialize();
    }
}

export default AnalyticsModule;
