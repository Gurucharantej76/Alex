/**
 * App initialization
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the UI
    UI.init();
    
    // Check if it's the user's first time (add a dummy entry if completely empty)
    if (Storage.getEntries().length === 0 && !localStorage.getItem('my_diary_initialized')) {
        const welcomeEntry = Diary.createEntry({
            title: "Welcome to MyDiary! 📖",
            content: "This is your personal space to record your thoughts, memories, and daily life.\n\nYou can:\n- Write new entries\n- Track your mood\n- View your writing streak\n- Organize by categories\n\nEnjoy journaling!",
            mood: "excited",
            category: "personal",
            date: new Date().toISOString().split('T')[0]
        });
        
        Storage.saveEntry(welcomeEntry);
        localStorage.setItem('my_diary_initialized', 'true');
        UI.updateDashboard(); // refresh dashboard with the new entry
    }
});
