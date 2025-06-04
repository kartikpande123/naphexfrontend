// Import necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzpxK7S__V-x7vU82Mo95qSorj00LC-YA",
  authDomain: "naphex-game.firebaseapp.com",
  projectId: "naphex-game",
  storageBucket: "naphex-game.appspot.com",
  messagingSenderId: "379483129492",
  appId: "1:379483129492:web:a51e7e0482fc0845759681",
  measurementId: "G-7809B5ECR8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let recaptchaVerifier;  // Declare the verifier globally so it doesn’t reinitialize

// Function to set up reCAPTCHA on each OTP request
const initializeRecaptcha = (elementId) => {
  if (!recaptchaVerifier) {  // Initialize only if not already set
    recaptchaVerifier = new RecaptchaVerifier(elementId, {
      size: "invisible",
      callback: (response) => {
        console.log("Recaptcha verified");
      },
    }, auth);
  }
};

export { auth, initializeRecaptcha, signInWithPhoneNumber};
