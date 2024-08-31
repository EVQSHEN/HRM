import { db } from "./firebase.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import("https://unpkg.com/gridjs/dist/gridjs.umd.js")
let grid


firebase.auth().onAuthStateChanged(updateUser);
function updateUser(user) {
   const currentUser = user ? user.uid : null;
   const userDb = (ref(db, `users/${currentUser}`))

   // create html document
   get(userDb).then(querySnapshot => {
      const profile = querySnapshot.val()
      const typeProfile = querySnapshot.val().profile
      createHTMLProfile(profile)
      // create table users
      if (typeProfile === "admin") {
         renderTable()
      }
   })
}
function createHTMLProfile(profile) {
   const navContainer = document.querySelector('.nav');
   const newDiv = document.createElement("div");
   newDiv.classList.add("wrapperProfile");
   newDiv.innerHTML = `      <div class="profile">
   <img class="profileAvatar" src="./img/profile/avatar.png">
   <div class="profileBox">
   <div class="profileName">
   <p>ПІБ</p>
   <P>${profile.name}</P>
</div>
<div class="profilEmail">
   <p>Email</p>
   <P>${profile.email}</P>
</div>
<div class="profilRole">
   <p>Статус</p>
   <P>${profile.profile === "admin" ? "Админістратор" : "Читач"}</P>
</div>
</div>
   </div>
   <div id="tableProfile" class="tableProfile"></div>
   `
   navContainer.after(newDiv);
}

// Read database
function readDB() {
   const response = get(ref(db, `users/`)).then((
      querySnapshot) => {
      const arr = Object.values(querySnapshot.val())
      let data = arr.reduce((acc, curr) => {
         if (curr.email) {
            acc.push(curr);
         }
         return acc;
      }, []);
      return data
   })
      .catch((error) => {
         console.error(error);
      });
   return response
}

// Render table profile ADMIN 
function renderTable() {
   readDB().then((data) => {
      grid = new gridjs.Grid({
         resizable: true,
         sort: true,
         pagination: { limit: 10 },
         language: {
            'pagination': {
               'previous': 'Попередня',
               'next': 'Наступна',
               "showing": "Показано від",
               "of": "з",
               "to": "до",
               'results': () => 'результатів'
            }
         },
         columns: ["ПIБ", "Email",
            "Статус", "Тип обликового запису", "Дії"],
         data: data.map((row) => (
            [
               row.name, row.email, gridjs.html(`
               <input ${row.verified ? "checked = true" : ""} type = "checkbox" name = "" disabled>
      `), row.profile === "admin" ? "Админістратор" : "Читач",
               gridjs.html(`
      <i class="fa-regular fa-pen-to-square fa-lg btnEdit"  id="${row.uid}" title="Редагувати" data-action="edit" style="color: #555658;"></i>
      `)]))
      }).render(document.getElementById("tableProfile"));
   })
   editAllProfile()
}

// Update db
function updtDbTable() {
   readDB().then((querySnapshot) => {
      let data = querySnapshot.map((val) => { return val })
      if (data.length > 0) {
         grid.updateConfig({
            data: data.map((row) => (
               [
                  row.name, row.email, gridjs.html(`
                  <input ${row.verified ? "checked = true" : ""} type = "checkbox" name = "" disabled>
         `), row.profile === "admin" ? "Админістратор" : "Читач",
                  gridjs.html(`
                  <i class="fa-regular fa-pen-to-square fa-lg btnEdit"  id="${row.uid}" title="Редагувати" data-action="edit" style="color: #555658;"></i>
                  `)]))
         }).forceRender();
      }
      else location.reload()
   });
}

// Edit all users ADMIN
function editAllProfile() {
   const tableProfile = document.getElementById("tableProfile")
   tableProfile.addEventListener('click', (event) => {
      if (event.target.classList.contains('btnEdit')) {
         BoxToCreatePerson("editBtn", "Редагувати")
         const UserUID = event.target.id
         const editBtn = document.querySelector(".editBtn")
         const userName = document.querySelector(".userName")
         const UserVerifiedCheckBox = document.querySelector(".UserVerifiedCheckBox")
         const userRoleSelect = document.querySelector(".userRoleSelect")
         const ArrUsers = (ref(db, `users/${UserUID}/`))
         get(ArrUsers).then((snapshot) => {
            const values = Object(snapshot.val())
            userName.value = values.name
            UserVerifiedCheckBox.checked = values.verified
            userRoleSelect.value = values.profile
         })
         editBtn.addEventListener("click", () => {
            const messege = document.querySelector(".messege")
            const ArrUsers = (ref(db, `users/${UserUID}/`))
            update(ArrUsers, {
               name: userName.value,
               verified: UserVerifiedCheckBox.checked,
               profile: userRoleSelect.value
            })

            messege.remove()
            updtDbTable()
         })
      }
   })
}

// render input message to / edit user / edit users
function BoxToCreatePerson(nameBtn, valueBtn) {
   const newDiv = document.createElement("div");
   newDiv.classList.add("messege");
   newDiv.innerHTML = `
   <div class="messege_content">    
<h3>Редагувати дані</h3>
<div class="input_container">
<div class="input_container_flex">
<p>ПІБ</p>
<input class="userName messege_input" type="text">
</div>
<div class=" UserVerified input_container_flex">
<p>Статус верифікації</p>
<input class = "UserVerifiedCheckBox " type = "checkbox" name = "" >
</div>
<div class="userRole input_container_flex">
<p>Тип облікового запису</p>
<select class = "userRoleSelect messege_input" id="userRoleSelect" name="userRole">
  <option value="admin">Адміністратор</option>
  <option value="guest">Читач</option>
</select>
</div>
</div>
<div class="inputBtnMenu">
<input class="${nameBtn}" type="button" value="${valueBtn}">
<input class="closeMessage" type="button" value="Відмінити">
</div>
</div>`;
   const profilRole = document.querySelector(".profilRole")
   profilRole.insertAdjacentElement("afterend", newDiv);
   const closeMessage = document.querySelector(".closeMessage")
   closeMessage.addEventListener("click", () => {
      newDiv.remove()
   })
}


