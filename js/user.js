import { auth } from "./firebase.js";
import { fetchEntriesForCurrentUser } from "./firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

window.getCurrentUserStorageKey = () => {
    const user = auth.currentUser;

    if (!user) {
        return "guest_entries";
    }

    return `diary_entries_${user.uid}`;
};

async function loadUserEntries() {
    try {
        const entries = await fetchEntriesForCurrentUser();
        window.pendingFirestoreEntries = entries;
    } catch (error) {
        console.error("Error loading user entries from Firestore:", error);
        window.pendingFirestoreEntries = [];
    }
}

async function handleAuthState(user) {
    window.authResolved = true;
    window.currentUserId = user ? user.uid : null;

    if (!user) {
        window.currentUserId = null;
        window.location.href = "login.html";
        return;
    }

    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
        userNameElement.textContent = "Welcome, " + user.displayName;
    }

    await loadUserEntries();

    if (window.startApp) {
        window.startApp();
    } else {
        window._pendingStartApp = true;
    }
}

onAuthStateChanged(auth, handleAuthState);