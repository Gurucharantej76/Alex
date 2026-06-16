/**
 * App initialization
 */

function mergeEntries(existingEntries, fetchedEntries) {
    const entryMap = new Map();

    existingEntries.forEach(entry => {
        if (entry && entry.id) {
            entryMap.set(entry.id, entry);
        }
    });

    fetchedEntries.forEach(entry => {
        if (entry && entry.id) {
            entryMap.set(entry.id, entry);
        }
    });

    return Array.from(entryMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function applyPendingFirestoreEntries() {
    const fetchedEntries = window.pendingFirestoreEntries;
    if (!Array.isArray(fetchedEntries) || fetchedEntries.length === 0) {
        return;
    }

    const existingEntries = Storage.getEntries();
    const merged = mergeEntries(existingEntries, fetchedEntries);
    Storage.saveEntries(merged);
    window.pendingFirestoreEntries = [];
}

window.startApp = async () => {
    if (window.appStarted) {
        return;
    }

    window.appStarted = true;

    await applyPendingFirestoreEntries();
    UI.init();
    UI.refreshCurrentView();

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
        UI.updateDashboard();
    }
};

if (window._pendingStartApp && window.authResolved) {
    window.startApp();
}
