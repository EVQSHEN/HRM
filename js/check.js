/// DATABASE CONNECT
import "https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js"
import "https://www.gstatic.com/firebasejs/8.2.7/firebase-auth.js"
import { firebaseConfig } from "./firebase.js";
firebase.initializeApp(firebaseConfig);


firebase.auth().onAuthStateChanged(function (user) {
   if (!user) {
      window.location.href = "authentication.html";
   }
});


