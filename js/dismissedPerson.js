import { dbRef, db } from "./firebase.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import("https://unpkg.com/gridjs/dist/gridjs.umd.js")

// HTMLElement
let grid

firebase.auth().onAuthStateChanged(updateUser);
function updateUser(user) {
   const currentUser = user ? user.uid : null;
   get((ref(db, `users/${currentUser}`))).then(querySnapshot => {
      const typeProfile = querySnapshot.val().profile
      const nameProfile = querySnapshot.val().name
      createHTML()
      if (typeProfile === "admin") {
         renderTable()
         const table = document.querySelector(".table")
         table.addEventListener('click', (event) => {
            const btnDell = document.querySelector(".btnDell")
            if (event.target.classList.contains('btnEdit')) {
               const personID = event.target.id
               console.log(personID)
               const arrPerson = (ref(db, `employees/${personID}/`))
               update(arrPerson, {
                  dateOfDismissal: " ",
                  reasonDismissal: " ",
                  status: true,
                  avtor: nameProfile
               })
               updtDbTable()
            }
         })
      }
      // else typeprofile = guest
      else {
         renderTableGuest()
      }
   })
}

// Read database
function readDB() {
   const response = get(dbRef).then((
      querySnapshot) => {
      if (querySnapshot.exists()) {
         const arr = Object.values(querySnapshot.val())
         let data = arr.reduce((acc, curr) => {
            if (curr.status === false) {
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
               row.dateOfDismissal, row.reasonDismissal,
               row.emplHistoryStr, row.commandStr, row.phoneNumbStr,
               gridjs.html(`
         <a href="${row.pdfURL}" target="_blank">${row.pdfFileName}</a>
         `),
               gridjs.html(`
               <i class="fa-solid fa-trash-can btnEdit btnDell" id="${row.personID}" data-action="edit" title="Видалити" style="color: #555658;"></i>
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
   <div class="pageTitle">Звільнені працівники</div>
<div id="table" , class="table table_noBtn"></div>`;
   navContainer.after(div);
}

// Create table ADMIN
function renderTable() {
   readDB().then((data) => {
      grid = new gridjs.Grid({
         resizable: true,
         sort: true,
         search: true,
         fixedHeader: true,
         pagination: { limit: localStorage.pagination },
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
         columns: ["№", "ПIБ", "Відділ", "Посада", "Дата початку роботи", "Дата звільнення", "Причина звільнення",
            "Трудова книжка", "Наказ", "Телефон",
            "Файл", "Дії", "Користувач"],
         data: data.map((row) => (
            [
               row.personID, row.fullName, row.department,
               row.personPosition, row.startDateStr,
               row.dateOfDismissal, row.reasonDismissal,
               row.emplHistoryStr, row.commandStr, row.phoneNumbStr,
               gridjs.html(`
         <a href="${row.pdfURL}" target="_blank">${row.pdfFileName}</a>
         `),
               gridjs.html(`
               <i class="fa-solid fa-trash-can btnEdit btnDell" id="${row.personID}" data-action="edit" title="Видалити" style="color: #555658;"></i>
       `), row.avtor]))
      }).render(document.getElementById("table"));
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
         pagination: { limit: localStorage.pagination },
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
               row.personID, row.fullName, row.startDateStr,
               row.dateOfDismissal, row.reasonDismissal,
               row.emplHistoryStr, row.commandStr, row.phoneNumbStr, row.avtor]))
      }).render(document.getElementById("table"));
      pagination()
   })
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
   if (!paginationElement.value) { paginationElement.value = 10 }
   paginationElement.addEventListener('change', (e) => {
      localStorage.pagination = e.target.value;
      updtDbTable()
   })
}



