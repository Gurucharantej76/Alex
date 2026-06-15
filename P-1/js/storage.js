/**
 * Storage Module
 * Handles all LocalStorage operations for the Diary App.
 */

const STORAGE_KEY = 'my_diary_entries';
const THEME_KEY = 'my_diary_theme';

class Storage {
    /**
     * Get all diary entries from LocalStorage
     * @returns {Array} Array of entry objects
     */
    static getEntries() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error parsing diary entries:", e);
            return [];
        }
    }

    /**
     * Save all entries to LocalStorage
     * @param {Array} entries 
     */
    static saveEntries(entries) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }

    /**
     * Save or update a single entry
     * @param {Object} entry 
     */
    static saveEntry(entry) {
        const entries = this.getEntries();
        const index = entries.findIndex(e => e.id === entry.id);
        
        if (index !== -1) {
            entries[index] = entry; // Update
        } else {
            entries.push(entry); // Add new
        }
        
        // Sort entries by date descending (newest first)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.saveEntries(entries);
    }

    /**
     * Delete an entry by ID
     * @param {string} id 
     */
    static deleteEntry(id) {
        let entries = this.getEntries();
        entries = entries.filter(e => e.id !== id);
        this.saveEntries(entries);
    }

    /**
     * Export data to JSON string
     */
    static exportData() {
        return JSON.stringify(this.getEntries(), null, 2);
    }

    /**
     * Import data from JSON string
     * @param {string} jsonString
     * @returns {boolean} success
     */
    static importData(jsonString) {
        try {
            const newEntries = JSON.parse(jsonString);
            if (!Array.isArray(newEntries)) return false;
            
            const existingEntries = this.getEntries();
            const existingIds = new Set(existingEntries.map(e => e.id));
            
            let added = false;
            newEntries.forEach(entry => {
                if (entry.id && !existingIds.has(entry.id)) {
                    existingEntries.push(entry);
                    added = true;
                }
            });
            
            if (added) {
                existingEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
                this.saveEntries(existingEntries);
            }
            return true;
        } catch (e) {
            console.error("Import failed:", e);
            return false;
        }
    }

    /**
     * Clear all diary entries
     */
    static clearData() {
        localStorage.removeItem(STORAGE_KEY);
    }

    /**
     * Get theme preference
     * @returns {string} 'light' or 'dark'
     */
    static getTheme() {
        return localStorage.getItem(THEME_KEY) || 'light';
    }

    /**
     * Save theme preference
     * @param {string} theme 
     */
    static saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }
}
