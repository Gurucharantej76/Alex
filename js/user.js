import { auth } from "./firebase.js";

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

onAuthStateChanged(auth, (user) => {

    if (user) {

        const userNameElement = document.getElementById("userName");

        if (userNameElement) {
            userNameElement.textContent =
                "Welcome, " + user.displayName;
        }
         // Refresh app after auth loads
        if (window.UI) {
            UI.refreshCurrentView();
    }


    }

});