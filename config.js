import firebase from "firebase";
require("@firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDmedFX33x_odi3xHA2XwkQzSXasxcd_JE",
  authDomain: "my-library-5b5bf.firebaseapp.com",
  projectId: "my-library-5b5bf",
  storageBucket: "my-library-5b5bf.appspot.com",
  messagingSenderId: "392575032987",
  appId: "1:392575032987:web:3cada5b595ea7ca0c8303e"
};

if(!firebase.apps.length)
{
firebase.initializeApp(firebaseConfig);
}
export default firebase.firestore();
