/**
 * Dashboard Module
 * Handles analytics, streaks, and smart highlight generation.
 */

class Dashboard {
    static getStats() {
        const entries = Storage.getEntries();
        
        let totalWords = 0;
        const moodCounts = {};

        entries.forEach(entry => {
            totalWords += Diary.getWordCount(entry.content);
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });

        // Calculate top mood
        let topMoodKey = '-';
        let maxMoodCount = 0;
        for (const [mood, count] of Object.entries(moodCounts)) {
            if (count > maxMoodCount) {
                maxMoodCount = count;
                topMoodKey = mood;
            }
        }

        return {
            totalEntries: entries.length,
            totalWords: totalWords,
            topMood: topMoodKey !== '-' ? `${Diary.getMoodEmoji(topMoodKey)} ${topMoodKey}` : '-',
            streak: this.calculateStreak(entries)
        };
    }

    static calculateStreak(entries) {
        if (entries.length === 0) return 0;
        
        // Extract unique dates as YYYY-MM-DD
        const entryDates = [...new Set(entries.map(e => e.date))].sort((a, b) => new Date(b) - new Date(a));
        
        let streak = 0;
        const today = new Date();
        today.setHours(0,0,0,0);

        let currentDate = new Date(today);

        // Check if there is an entry today or yesterday to start the streak
        const firstEntryDate = new Date(entryDates[0]);
        firstEntryDate.setHours(0,0,0,0);
        
        const diffDays = Math.floor((today - firstEntryDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
            // Streak broken
            return 0;
        }

        // Calculate streak
        currentDate = new Date(firstEntryDate);
        streak = 1;

        for (let i = 1; i < entryDates.length; i++) {
            const date = new Date(entryDates[i]);
            date.setHours(0,0,0,0);
            
            const expectedPrevDate = new Date(currentDate);
            expectedPrevDate.setDate(currentDate.getDate() - 1);

            if (date.getTime() === expectedPrevDate.getTime()) {
                streak++;
                currentDate = date;
            } else {
                break;
            }
        }

        return streak;
    }

    static getOnThisDay() {
        const entries = Storage.getEntries();
        const today = new Date();
        const month = today.getMonth();
        const day = today.getDate();
        const year = today.getFullYear();

        const onThisDayEntries = entries.filter(e => {
            const entryDate = new Date(e.date);
            return entryDate.getMonth() === month && 
                   entryDate.getDate() === day && 
                   entryDate.getFullYear() < year;
        });

        return onThisDayEntries;
    }
}
