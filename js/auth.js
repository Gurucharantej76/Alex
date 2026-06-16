import { auth, provider } from "./firebase.js";

import {
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const btn = document.getElementById("googleLogin");

btn.addEventListener("click", async () => {

    try {

        const result = await signInWithPopup(
            auth,
            provider
        );

        alert(
            "Welcome " +
            result.user.displayName
        );

        window.location.href = "index.html";

    } catch (error) {

        console.log(error);

    }

});