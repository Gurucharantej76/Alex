import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBV9Z1FLXT0xot2OwGv8PYRnoNYfmLnC_Y",
  authDomain: "alexdiary-f7dbb.firebaseapp.com",
  projectId: "alexdiary-f7dbb",
  storageBucket: "alexdiary-f7dbb.firebasestorage.app",
  messagingSenderId: "395617744018",
  appId: "1:395617744018:web:3e25abad34fbfe9116a24b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();