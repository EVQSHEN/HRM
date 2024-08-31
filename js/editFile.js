import { storage, dbRef, db } from "./firebase.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
import { ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";
import("https://unpkg.com/gridjs/dist/gridjs.umd.js")
import("https://cdn.jsdelivr.net/npm/exceljs@1.13.0/dist/exceljs.min.js")



firebase.auth().onAuthStateChanged(updateUser);
function updateUser(user) {
   const currentUser = user ? user.uid : null;
   get((ref(db, `users/${currentUser}`))).then(querySnapshot => {
      const typeProfile = querySnapshot.val().profile
      createHTML()
      if (typeProfile === "admin") {
         renderTable()
         const table = document.querySelector(".table")
         // edit file btn
         table.addEventListener('click', (event) => {
            if (event.target.classList.contains('btnEditFile')) {
               BoxToCreatePerson("editBtn", "Замінити файл")
               const personID = event.target.id
               const editBtn = document.querySelector(".editBtn")
               const messege = document.querySelector(".messege")

               editBtn.addEventListener('click', () => {
                  const file = document.getElementById('pdfFileInput').files[0];
                  const imagesRef = sRef(storage, `${personID}/` + file.name);
                  get(ref(db, 'employees/' + personID)).then((snapshot) => {
                     const arr = Object(snapshot.val())
                     const fileRef = sRef(storage, `${personID}/${arr.pdfFileName}`);
                     deleteObject(fileRef)
                        .catch((error) => {
                           console.error('Error deleting file', error);
                        });
                  })
                  uploadBytesResumable(imagesRef, file)
                     .then((snapshot) => {
                        getDownloadURL(snapshot.ref).then((url) => {
                           update(ref(db, 'employees/' + personID), {
                              pdfFileName: file.name,
                              pdfURL: url,
                           });
                           messege.remove()
                           updtDbTable()
                        }
                        )
                     })
               })
            }
         })
      }
      else {
         renderTableGuest()
      }
   })
}
// HTMLElement

let grid
function createHTML() {
   const navContainer = document.querySelector('.nav');
   const div = document.createElement('div');
   div.classList.add('wrapper');
   div.innerHTML = `<div class="pageTitle">Редагування файлів</div>
<div id="table" , class="table table_noBtn"></div>`;
   navContainer.after(div);
}

// Read database
function readDB() {
   const response = get(dbRef).then((
      querySnapshot) => {
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
         columns: ["№", "ПIБ",
            "Файл", "Дії", "Користувач"],
         data: data.map((row) => (
            [
               row.personID, row.fullName,
               gridjs.html(`
         <a href="${row.pdfURL}" target="_blank">${row.pdfFileName}</a>
         `),
               gridjs.html(`
               <i class="fa-regular fa-pen-to-square fa-lg btnEditFile"  id="${row.personID}" title="Редагувати" data-action="edit style="color: #555658;""></i>
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
         columns: ["№", "ПIБ",
            "Файл", "Користувач"],
         data: data.map((row) => (
            [
               row.personID, row.fullName,
               gridjs.html(`
         <a href="${row.pdfURL}" target="_blank">${row.pdfFileName}</a>
         `), row.avtor]))
      }).render(document.getElementById("table"));
      pagination()
   })
}

// Update db
function updtDbTable() {
   readDB().then((querySnapshot) => {
      let data = querySnapshot.map((val) => { return val })
      if (data.length > 0) {
         grid.updateConfig({
            pagination: { limit: localStorage.pagination },
            data: data.map((row) => ([
               row.personID, row.fullName,
               gridjs.html(`
            <a href="${row.pdfURL}" target="_blank">${row.pdfFileName}</a>`),
               gridjs.html(`
               <i class="fa-regular fa-pen-to-square fa-lg btnEditFile"  id="${row.personID}" title="Редагувати" data-action="edit style="color: #555658;""></i>
          `)]))
         }).forceRender();
         pagination()
      }
      else location.reload()

   });
}


function BoxToCreatePerson(nameBtn, valueBtn) {
   const newDiv = document.createElement('div');
   newDiv.classList.add('messege');
   newDiv.innerHTML = ` 
   <div class="messege_content">   
   <h3>Оновити файл</h3>
<div class="input_container">
<div class="inpFile input_container_flex">
   <p>Копія документів</p>
   <input type="file" id="pdfFileInput" accept="application/pdf" class="inpFileStr">
</div>
</div>
<div class="inputBtnMenu">
<input class="${nameBtn}" type="button" value="${valueBtn}">
<input class="closeMessage" type="button" value="Відмінити">
</div></div>`;
   const navContainer = document.querySelector('.nav');
   navContainer.insertAdjacentElement('afterend', newDiv);
   const closeMessage = document.querySelector(".closeMessage")
   closeMessage.addEventListener("click", () => {
      newDiv.remove()
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



