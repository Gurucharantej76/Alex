import { db, auth } from "./firebase.js";

import {
  collection,
  setDoc,
  doc,
  deleteDoc,
  query,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export async function saveEntryToFirestore(entry) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in");
  }

  entry.userId = user.uid;

  // Create or update the user document for metadata
  await setDoc(
    doc(db, "users", user.uid),
    {
      name: user.displayName,
      email: user.email
    },
    { merge: true }
  );

  // Save diary entry under the user's entries subcollection using the entry id.
  await setDoc(
    doc(db, "users", user.uid, "entries", entry.id),
    entry
  );

  console.log("Entry saved for user:", user.uid, "entryId:", entry.id);
}

export async function fetchEntriesForCurrentUser() {
  const user = auth.currentUser;
  if (!user) {
    return [];
  }

  const entriesQuery = query(
    collection(db, "users", user.uid, "entries"),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(entriesQuery);
  const entries = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  return entries;
}

export async function deleteEntryForCurrentUser(entryId) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not logged in');
  }

  const entryDocRef = doc(db, 'users', user.uid, 'entries', entryId);
  await deleteDoc(entryDocRef);
  console.log('Entry deleted from Firestore:', entryId);
}

window.saveEntryToFirestore = saveEntryToFirestore;
window.deleteEntryFromFirestore = deleteEntryForCurrentUser;