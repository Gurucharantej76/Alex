/**
 * Diary Module
 * Handles business logic for diary entries, searching, filtering, and mood mapping.
 */

class Diary {
    static MOOD_EMOJIS = {
        happy: '😊',
        sad: '😢',
        excited: '🤩',
        calm: '😌',
        anxious: '😬',
        angry: '😠'
    };

    /**
     * Create a new entry object
     * @param {Object} data {title, content, mood, category, date}
     * @returns {Object} Validated entry object
     */
    static createEntry(data) {
        return {
            id: data.id || 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: data.title.trim(),
            content: data.content.trim(),
            mood: data.mood,
            category: data.category,
            tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [],
            date: data.date,
            createdAt: data.createdAt || new Date().toISOString(),
            isFavorite: data.isFavorite || false
        };
    }

    /**
     * Get an entry by ID
     * @param {string} id 
     * @returns {Object|null}
     */
    static getEntryById(id) {
        const entries = Storage.getEntries();
        return entries.find(e => e.id === id) || null;
    }

    /**
     * Filter entries by search term, mood, category, and date
     */
    static filterEntries(searchTerm = '', moodFilter = 'all', categoryFilter = 'all', filterDate = '') {
        let entries = Storage.getEntries();
        const term = searchTerm.toLowerCase();

        return entries.filter(entry => {
            const matchesSearch = term === '' || 
                                  entry.title.toLowerCase().includes(term) || 
                                  entry.content.toLowerCase().includes(term) ||
                                  (entry.tags && entry.tags.some(t => t.toLowerCase().includes(term))) ||
                                  entry.date === term;

            const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
            const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;

            const matchesDate = filterDate === '' || entry.date === filterDate;

            return matchesSearch && matchesMood && matchesCategory && matchesDate;
        });
    }

    /**
     * Toggle favorite status
     * @param {string} id 
     * @returns {boolean} new favorite status
     */
    static toggleFavorite(id) {
        const entry = this.getEntryById(id);
        if (entry) {
            entry.isFavorite = !entry.isFavorite;
            Storage.saveEntry(entry);
            return entry.isFavorite;
        }
        return false;
    }

    /**
     * Calculate word count for content
     * @param {string} content 
     * @returns {number}
     */
    static getWordCount(content) {
        return content.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    static getMoodEmoji(moodKey) {
        return this.MOOD_EMOJIS[moodKey] || '😐';
    }
}
