const goToSignUp = document.querySelector(".goToSignUp")
const goToSignIn = document.querySelector(".goToSignIn")
const menuRegister = document.querySelector(".menuRegister")
const menuAuth = document.querySelector(".menuAuth")
const colorColumn = document.querySelector(".colorColumn")
const signIn = document.querySelector(".signIn")
const signUp = document.querySelector(".signUp")

// Firebase 
import { ref, set, get } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import { firebaseConfig, db } from "./firebase.js";
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();


// SignIn module
goToSignUp.addEventListener("click", () => {
   menuAuth.style.display = "none"
   menuRegister.style.display = ""
   colorColumn.style.backgroundColor = "#EB7A00"
})

signIn.onclick = () => { signInFunc() }

// SignUp module
goToSignIn.addEventListener("click", () => {
   menuRegister.style.display = "none"
   menuAuth.style.display = ""
   colorColumn.style.background = "#18A0FB"
})

signUp.onclick = () => { signUpFunc() }

// Create new user Firebase Auth
function signUpFunc() {
   const email = document.querySelector(".emailRegisterInp").value
   const password = document.querySelector(".passwordRegisterInp").value;
   const nameRegisterInp = document.querySelector(".nameRegisterInp").value

   auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
         const user = userCredential.user
         user.updateProfile({
            displayName: nameRegisterInp
         })
         set(ref(db, 'users/' + user.uid), {
            uid: user.uid,
            name: nameRegisterInp,
            email: email,
            profile: "guest",
            verified: false
         });
         menuRegister.style.display = "none"
         menuAuth.style.display = ""
         colorColumn.style.background = "#18A0FB"
      })
      .catch(function (error) {
         var errorMessage = error.message;
         alert(errorMessage);
      });
}


function signInFunc() {
   var email = document.querySelector(".emailLoginInp").value
   var password = document.querySelector(".passworslLoginInp").value;

   firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(function () {
         firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function (userCredential) {

               const currentUser = userCredential.user.uid

               get((ref(db, `users/${currentUser}`))).then(querySnapshot => {
                  const verifiedAcc = querySnapshot.val().verified
                  if (verifiedAcc) { window.location.href = "index.html"; }
                  else alert("Чекайте підтвердження облікового запису")
               })
            })
            .catch(function (error) {
               var errorMessage = error.message;
               console.error("Ошибка авторизации:", errorMessage);
            });
      })
      .catch(function (error) {
         var errorMessage = error.message;
         console.error("Ошибка установки типа сохранения:", errorMessage);
      });
}

