import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export async function saveEntryToFirestore(entry) {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in");
  }

  await addDoc(
    collection(
      db,
      "users",
      user.uid,
      "entries"
    ),
    entry
  );
  window.saveEntryToFirestore = saveEntryToFirestore;

}