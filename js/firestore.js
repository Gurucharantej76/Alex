import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export async function saveEntryToFirestore(entry) {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in");
  }

  // Create user document first
  await setDoc(
    doc(db, "users", user.uid),
    {
      name: user.displayName,
      email: user.email
    },
    { merge: true }
  );

  // Create diary entry
  const docRef = await addDoc(
    collection(
      db,
      "users",
      user.uid,
      "entries"
    ),
    entry
  );

  console.log("Entry saved:", docRef.id);
}

window.saveEntryToFirestore = saveEntryToFirestore;