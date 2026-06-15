import { db } from "./firebase.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

console.log("firestoreTest loaded");

window.firestoreTest = async () => {

  try {

    await setDoc(
      doc(db, "test", "guru"),
      {
        name: "Guru",
        createdAt: new Date().toISOString()
      }
    );

    alert("Firestore Working!");

  } catch (err) {

    console.error("FIRESTORE ERROR:", err);

    alert(err.message);

  }

};