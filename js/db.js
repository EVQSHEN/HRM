import { storage, dbRef, db } from "./firebase.js";
import { ref, set, get, remove, update } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import { ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";
import("https://unpkg.com/gridjs/dist/gridjs.umd.js")

// HTMLElement
let grid

firebase.auth().onAuthStateChanged(updateUser);
function updateUser(user) {
   const currentUser = user ? user.uid : null;
   get((ref(db, `users/${currentUser}`))).then(querySnapshot => {

      const typeProfile = querySnapshot.val().profile
      const nameProfile = querySnapshot.val().name

      if (typeProfile === "admin") {
         // render page
         renderTable(nameProfile)
         createHTML()

         // HTML content
         const btnWrapper = document.querySelector('.btnWrapper');
         const table = document.querySelector(".table")
         const createPersonBtn = document.querySelector(".createPerson")
         const dismissalPerson = document.querySelector(".dismissalPerson")

         // Create new person
         createPersonBtn.onclick = () => {
            BoxToCreatePerson("addBtn", "Додати")

            const fullNameStr = document.querySelector(".fullNameStr")
            const startDateStr = document.querySelector(".startDateStr")
            const emplHistoryStr = document.querySelector(".emplHistoryStr")
            const commandStr = document.querySelector(".commandStr")
            const phoneNumbStr = document.querySelector(".phoneNumbStr")
            const personPositionStr = document.querySelector(".personPositionStr")
            const departmentStr = document.querySelector(".departmentStr")
            const messege = document.querySelector(".messege")
            const addBtn = document.querySelector(".addBtn")

            addBtn.addEventListener("click", e => {
               const file = document.getElementById("pdfFileInput").files[0];
               get(dbRef).then((snapshot) => {
                  const arr = Object.values(snapshot.val())
                  let count = 0
                  arr.forEach((name) => {
                     if (name.fullName === fullNameStr.value) { return count++ }
                  })
                  if (count === 0) {
                     if (fullNameStr.value && startDateStr.value
                        && emplHistoryStr.value && commandStr.value
                        && phoneNumbStr.value && file.name) {
                        const personID = Date.now()
                        const imagesRef = sRef(storage, `${personID}/` + file.name);
                        uploadBytesResumable(imagesRef, file)

                           .then((snapshot) => {
                              getDownloadURL(snapshot.ref).then((url) => {
                                 set(ref(db, 'employees/' + personID), {
                                    personID: personID,
                                    fullName: fullNameStr.value,
                                    startDateStr: startDateStr.value,
                                    emplHistoryStr: emplHistoryStr.value,
                                    department: departmentStr.value,
                                    personPosition: personPositionStr.value,
                                    commandStr: commandStr.value,
                                    phoneNumbStr: phoneNumbStr.value,
                                    pdfFileName: file.name,
                                    pdfURL: url,
                                    status: true,
                                    avtor: nameProfile
                                 });
                                 // Reload table
                                 messege.remove()
                                 updtDbTable()
                              });
                           })
                           .catch((error) => {
                              console.error('Upload failed', error);
                           });
                     }
                     else alert("Заповніть всі поля")
                  }
                  else alert("Даний користувач вже створений")
               })
            })
         }

         // dismissal person
         dismissalPerson.addEventListener('click', () => {
            BoxToCreatePerson("dismissalBtn", "Підтвердити")

            const dismissalBtn = document.querySelector(".dismissalBtn")
            const messege = document.querySelector(".messege")
            const dateOfDismissal = document.querySelector(".dateOfDismissal")
            const reasonDismissal = document.querySelector(".reasonDismissal")

            dismissalBtn.addEventListener("click", () => {

               const dismissalPersonId = document.querySelector(".dismissalPersonId").value
               const arrPerson = (ref(db, `employees/` + dismissalPersonId))

               get(arrPerson).then((person) => {
                  const arr = Object(person.val())
                  update(ref(db, 'employees/' + dismissalPersonId), {
                     status: false,
                     dateOfDismissal: dateOfDismissal.value,
                     reasonDismissal: reasonDismissal.value,
                     avtor: nameProfile
                  });
                  // Reload table
                  messege.remove()
                  document.body.style.overflow = "";
                  updtDbTable()
               })
            })
         })

         // delete person btn
         table.addEventListener('click', (event) => {
            if (event.target.classList.contains('btnDell')) {
               let personID = event.target.id
               get(ref(db, 'employees/' + personID)).then((snapshot) => {
                  const arr = Object(snapshot.val())
                  const fileRef = sRef(storage, `${personID}/${arr.pdfFileName}`);
                  deleteObject(fileRef)
                     .catch((error) => {
                        console.error('Error deleting file', error);
                     });
               })
               remove(ref(db, `employees/${personID}`))
               updtDbTable()
            }
         })

         // edit persone btn
         table.addEventListener('click', (event) => {
            if (event.target.classList.contains('btnEdit')) {
               BoxToCreatePerson("editBtn", "Редагувати")

               const personID = event.target.id
               const fullNameStr = document.querySelector(".fullNameStr")
               const startDateStr = document.querySelector(".startDateStr")
               const emplHistoryStr = document.querySelector(".emplHistoryStr")
               const personPositionStr = document.querySelector(".personPositionStr")
               const departmentStr = document.querySelector(".departmentStr")
               const commandStr = document.querySelector(".commandStr")
               const phoneNumbStr = document.querySelector(".phoneNumbStr")
               const editBtn = document.querySelector(".editBtn")
               const arrPerson = (ref(db, `employees/${personID}/`))

               get(arrPerson).then((snapshot) => {
                  const values = Object(snapshot.val())
                  fullNameStr.value = values.fullName
                  startDateStr.value = values.startDateStr
                  personPositionStr.value = values.personPosition
                  departmentStr.value = values.department
                  emplHistoryStr.value = values.emplHistoryStr
                  commandStr.value = values.commandStr
                  phoneNumbStr.value = values.phoneNumbStr
               })

               editBtn.addEventListener("click", () => {
                  const messege = document.querySelector(".messege")
                  const arrPerson = (ref(db, `employees/${personID}/`))
                  update(arrPerson, {
                     fullName: fullNameStr.value,
                     department: departmentStr.value,
                     personPosition: personPositionStr.value,
                     startDateStr: startDateStr.value,
                     emplHistoryStr: emplHistoryStr.value,
                     commandStr: commandStr.value,
                     phoneNumbStr: phoneNumbStr.value,
                     avtor: nameProfile
                  })

                  messege.remove()
                  document.body.style.overflow = "";
                  updtDbTable()
               })
            }
         })

         // render input message to create person / edit person / firePerson
         function BoxToCreatePerson(nameBtn, valueBtn) {
            const newDiv = document.createElement("div");
            newDiv.classList.add("messege");
            if (nameBtn === "addBtn") {
               newDiv.innerHTML = `  
               <div class="messege_content">
  <h3>Створити новий запис</h3>
<div class="input_container">
<div class="fullName input_container_flex">
  <p>ПІБ</p>
  <input class="fullNameStr messege_input" type="text">
</div>
<div class="startDate input_container_flex">
  <p>Дата початку роботи</p>
  <input class="startDateStr messege_input" type="date">
</div>
<div class="department input_container_flex">
  <p>Відділ</p>
  <input class="departmentStr messege_input" type="">
</div>
<div class="personPosition input_container_flex">
  <p>Посада</p>
  <input class="personPositionStr messege_input" type="">
</div>
<div class="emplHistory input_container_flex">
  <p>Трудова книжка</p>
  <input class="emplHistoryStr messege_input" type="text">
</div>
<div class="command input_container_flex">
  <p>Наказ</p>
  <input class="commandStr messege_input" type="text">
</div>
<div class="phoneNumb input_container_flex">
  <p>Мобільний телефон</p>
  <input class="phoneNumbStr messege_input" type="tel" 
  placeholder="+380 (__)___-__-__">
</div>
<div class="inpFile input_container_flex">
  <p>Копія документів</p>
  <input type="file" id="pdfFileInput" accept="application/pdf" class="inpFileStr">
</div>
</div>
<div class="inputBtnMenu">
<input class="${nameBtn}" type="button" value="${valueBtn}">
<input class="closeMessage" type="button" value="Відмінити">
</div></div> `;
            }
            if (nameBtn === "editBtn") {
               newDiv.innerHTML = ` 
               <div class="messege_content"> 
  <h3>Редагувати дані</h3>
<div class="input_container">
<div class="fullName input_container_flex">
  <p>ПІБ</p>
  <input class="fullNameStr messege_input" type="text">
</div>
<div class="department input_container_flex">
  <p>Відділ</p>
  <input class="departmentStr messege_input" type="">
</div>
<div class="personPosition input_container_flex">
  <p>Посада</p>
  <input class="personPositionStr messege_input" type="">
</div>
<div class="startDate input_container_flex">
  <p>Дата початку роботи</p>
  <input class="startDateStr messege_input" type="date">
</div>
<div class="emplHistory input_container_flex">
  <p>Трудова книжка</p>
  <input class="emplHistoryStr messege_input" type="text">
</div>
<div class="command input_container_flex">
  <p>Наказ</p>
  <input class="commandStr messege_input" type="text">
</div>
<div class="phoneNumb input_container_flex">
  <p>Мобільний телефон</p>
  <input class="phoneNumbStr messege_input" type="tel" 
  placeholder="+380 (__)___-__-__">
</div>
</div>
<div class="inputBtnMenu">
<input class="${nameBtn}" type="button" value="${valueBtn}">
<input class="closeMessage" type="button" value="Відмінити">
</div>`;
            }
            if (nameBtn === "dismissalBtn") {
               newDiv.innerHTML = `
               <div class="messege_content">    
  <h3>Звільнити працівника</h3>
<div class="input_container">
<div class="fullName input_container_flex">
  <p>ID працівника</p>
  <input class="dismissalPersonId messege_input" type="text">
</div>
<div class="startDate input_container_flex">
  <p>Дата звільнення</p>
  <input class="dateOfDismissal messege_input" type="date">
</div>
<div class="startDate input_container_flex">
  <p>Причина звільнення</p>
  <input class="reasonDismissal messege_input" type="text">
</div>
</div>
<div class="inputBtnMenu">
<input class="${nameBtn}" type="button" value="${valueBtn}">
<input class="closeMessage" type="button" value="Відмінити">
</div>
</div>
</div>`;
            }
            btnWrapper.insertAdjacentElement("afterend", newDiv);
            document.body.style.overflow = "hidden";
            const closeMessage = document.querySelector(".closeMessage")
            closeMessage.addEventListener("click", () => {
               document.body.style.overflow = "";
               newDiv.remove()
            })
         }
      }
      // else typeprofile = guest
      else {
         createHTMLGuest()
         renderTableGuest()
      }
      style()
   })
}

// Read database
function readDB() {
   const response = get(dbRef).then((querySnapshot) => {
      if (querySnapshot.exists()) {
         const arr = Object.values(querySnapshot.val())
         let data = arr.reduce((acc, curr) => {
            if (curr.status) {
               acc.push(curr);
            }
            return acc;
         }, []);
         return data
      }
      else {
         console.log("No data available");
      }
   })
      .catch((error) => {
         console.error(error);
      });
   return response
}

// Update db
function updtDbTable() {
   readDB().then((querySnapshot) => {
      let data = querySnapshot.map((val) => { return val })
      if (data.length > 0) {
         grid.updateConfig({
            pagination: { limit: localStorage.pagination },
            data: data.map((row) => ([
               row.personID, row.fullName, row.department,
               row.personPosition, row.startDateStr,
               row.emplHistoryStr, row.commandStr, row.phoneNumbStr,
               gridjs.html(`
            <a href="${row.pdfURL}" target="_blank">${row.pdfFileName}</a>`),
               gridjs.html(`
               <i class="fa-regular fa-pen-to-square fa-lg btnEdit"  id="${row.personID}" title="Редагувати" data-action="edit" style="color: #555658;"></i>
               <i class="fa-solid fa-trash-can btnDell" id="${row.personID}" data-action="delete" title="Видалити" style="color: #555658;"></i>      
          `), row.avtor]))
         }).forceRender();
         pagination()
      }
      else location.reload()
   });
}

// Create HTML ADMIN
function createHTML() {
   const navContainer = document.querySelector('.nav');
   const div = document.createElement('div');
   div.classList.add('wrapper');
   div.innerHTML = ` 
<div class="pageTitle">Кадровий відділ</div>
<div class="btnWrapper">
<input type="button" class="createPerson" value="Створити новий запис">
<input type="button" class="dismissalPerson" value="Звільнити працівника">
</div>
<div id="table" , class="table"></div>`;
   navContainer.after(div);
}
// Create HTML GUEST
function createHTMLGuest() {
   const navContainer = document.querySelector('.nav');
   const div = document.createElement('div');
   div.classList.add('wrapper');
   div.innerHTML = `<div class="pageTitle">Кадровий відділ</div>
   <div id="table", class="table"></div>`;
   navContainer.after(div);
}

// Create table ADMIN
function renderTable() {
   readDB().then((data) => {
      grid = new gridjs.Grid({
         resizable: true,
         sort: true,
         search: true,
         pagination: { limit: localStorage.pagination ? localStorage.pagination : localStorage.pagination = 10 },
         language: {
            'search': {
               'placeholder': 'Пошук...'
            },
            'pagination': {
               'previous': 'Попередня',
               'next': 'Наступна',
               "showing": "Показано від",
               "of": "з",
               "to": "до",
               'results': () => 'результатів'
            }
         },
         fixedHeader: true,
         columns: [
            {
               name: "ID",
               width: "120px",
               minWidth: "80px",
            },
            {
               name: "ПIБ",
               width: "220px",
               minWidth: "140px",
            },
            {
               name: "Відділ",
               width: "120px",
               minWidth: "80px",
            },
            {
               name: "Посада",
               width: "120px",
               minWidth: "80px",
            },
            {
               name: "Дата початку роботи",
               width: "120px",
               minWidth: "80px",
            },
            {
               name: "Трудова книжка",
               width: "120px",
               minWidth: "80px",
            },
            {
               name: "Наказ",
               width: "120px",
               minWidth: "80px",
            },
            {
               name: "Телефон",
               width: "120px",
               minWidth: "80px",
            },
            {
               name: "Файл",
            },
            {
               name: "Дії",
               width: "120px",
               minWidth: "80px",
            },
            {
               name: "Користувач",
               width: "120px",
               minWidth: "80px",
            },
         ],
         data: data.map((row) => (
            [
               row.personID,
               row.fullName,
               row.department,
               row.personPosition,
               row.startDateStr,
               row.emplHistoryStr,
               row.commandStr,
               row.phoneNumbStr,
               gridjs.html(`
         <a href="${row.pdfURL}" target="_blank">${row.pdfFileName}</a>
            `),
               gridjs.html(`
         <i class="fa-regular fa-pen-to-square fa-lg btnEdit"  id="${row.personID}" title="Редагувати" data-action="edit" style="color: #555658;"></i>
         <i class="fa-solid fa-trash-can btnDell" id="${row.personID}" data-action="delete" title="Видалити" style="color: #555658;"></i>
         `),
               row.avtor]))
      })
      grid.render(document.getElementById("table"));
      pagination()
   })
}

// Create table GUEST 
function renderTableGuest() {
   readDB().then((data) => {
      grid = new gridjs.Grid({
         resizable: true,
         sort: true,
         search: true,
         fixedHeader: true,
         pagination: { limit: localStorage.pagination ? localStorage.pagination : localStorage.pagination = 10 },
         language: {
            'search': {
               'placeholder': 'Пошук...'
            },
            'pagination': {
               'previous': 'Попередня',
               'next': 'Наступна',
               "showing": "Показано від",
               "of": "з",
               "to": "до",
               'results': () => 'результатів'
            }
         },
         columns: ["№", "ПIБ", "Відділ", "Посада", "Дата початку роботи",
            "Трудова книжка", "Наказ", "Телефон",
            "Файл", "Користувач"],
         data: data.map((row) => (
            [
               row.personID, row.fullName, row.department,
               row.personPosition, row.startDateStr, row.emplHistoryStr,
               row.commandStr, row.phoneNumbStr,
               gridjs.html(`
         <a href="${row.pdfURL}" target="_blank">${row.pdfFileName}</a>
         `), row.avtor]))
      }).render(document.getElementById("table"));
      pagination()
   })
}


function style() {
   const style = document.createElement("style");
   style.textContent = `@media screen and (max-width: 700px) {
   .table {
      margin-top: 101px;
   }
   .gridjs-search {
      float: none !important;
      width: 288px !important;
   }
   .gridjs-search-input {
      padding: 10px 5px !important;
      width: 100%
   }
   .createPerson {
      margin: 0px 0px 10px 0px;
      width: 144px;
   }
   .gridjs-summary{
      margin: 5px 0px 7px 0px !important;
   }
   .dismissalPerson {
      width: 144px;
      margin: 0px;
}}

@media screen and (max-width: 370px) {
   .table {
      margin-top: 153px;
   }
   .gridjs-search {
      width: 100% !important;
   }
   .btnWrapper {
      padding: 0px 20px;
      max-width: 290px;
      margin-right: 10px;
   }
   .createPerson {
      width: 100%;
   }
   .dismissalPerson {
      width: 100%;
}}`
   document.head.appendChild(style);
}


function pagination() {
   const gridjs = document.querySelector('.gridjs-pagination');
   const div = document.createElement('div');
   div.innerHTML = ` 
   <select class="paginationElement" name="pagination">
   <option value="10">10</option>
   <option value="15">15</option>
   <option value="20">20</option>
   </select>`;
   gridjs.after(div);
   const paginationElement = document.querySelector('.paginationElement');
   paginationElement.value = localStorage.pagination
   paginationElement.addEventListener('change', (e) => {
      localStorage.pagination = e.target.value;
      updtDbTable()
   })
}

