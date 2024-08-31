import "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.5/index.global.min.js"
import { db } from "./firebase.js";
import { ref, set, remove, onValue } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-database.js";
const calendarEl = document.getElementById('calendar');
let selectedDates = [];
let newEvent;
let calendar

const wrapperCalendar = document.querySelector(".wrapperCalendar")
document.addEventListener('DOMContentLoaded', function () {
   readDB()
   calendar = new FullCalendar.Calendar(calendarEl, {
      locale: "uk",
      selectable: true, // вибір дат
      displayEventTime: false, // показ часу при події
      buttonText: {
         today: "Сьогодні"
      },
      headerToolbar: {
         left: "prev,next today",
         center: "title",
         right: "addEventButton"
      },
      customButtons: {
         addEventButton: {
            text: "Додати подію",
         }
      },
      select: function (info) {
         if (selectedDates = 2) {
            selectedDates = [];
         }
         selectedDates.push(info.start);
         selectedDates.push(info.end);
      },
      eventClick: function (info) {
         if (confirm("Ви впевнені що хочете видалити запис '" + info.event.title + "'?")) {
            remove(ref(db, `calendar/${info.event.title}`))
            info.event.remove();
            calendar.removeAllEvents();
            readDB()
         }
      },
   });
   calendar.render();

   const addEventButton = document.querySelector(".fc-addEventButton-button")

   addEventButton.onclick = function () {
      BoxToCreatePerson()
      const addEvent = document.querySelector(".addEvent");
      const eventTitleStr = document.querySelector(".eventTitleStr")
      const messege = document.querySelector(".messege")
      addEvent.onclick = function () {
         if (selectedDates.length > 0) {
            if (eventTitleStr.value) {
               const color = getRandomColor()
               const eventObj = {
                  title: eventTitleStr.value,
                  start: selectedDates[0].toISOString(),
                  end: selectedDates[1].toISOString(),
                  backgroundColor: color,
                  borderColor: color,
               };
               set(ref(db, 'calendar/' + eventTitleStr.value), eventObj)
                  .catch((error) => console.log("Error adding event to database: ", error));
               calendar.removeAllEvents();
               selectedDates = [];
               readDB()
            }
         } else {
            alert("Оберіть дату для створення події");
         }
         messege.remove()
      }
   }
});


function getRandomColor() {
   const red = Math.floor(Math.random() * 150) + 80;
   const green = Math.floor(Math.random() * 150) + 80;
   const blue = Math.floor(Math.random() * 150) + 80;
   return `rgb(${red}, ${green}, ${blue})`;
}

function readDB() {
   const calendarRef = ref(db, "calendar");
   onValue(calendarRef, (snapshot) => {
      const data = snapshot.val();
      for (const id in data) {
         const eventDataStart = data[id];
         const eventObj = {
            title: eventDataStart.title,
            start: eventDataStart.start,
            end: eventDataStart.end,
            backgroundColor: eventDataStart.backgroundColor,
            borderColor: eventDataStart.borderColor,
         };
         newEvent = calendar.addEvent(eventObj);
      }
   });
}

function BoxToCreatePerson() {
   const newDiv = document.createElement("div");
   newDiv.classList.add("messege");
   newDiv.innerHTML = `  
      <div class="messege_content">
<h3>Створити новую подію</h3>
<div class="input_container">
<div class="eventTitle input_container_flex">
<p>Подія</p>
<input class="eventTitleStr messege_input" type="text">
</div>
<div class="inputBtnMenu">
<input class="addEvent" type="button" value="Створити">
<input class="closeMessage" type="button" value="Відмінити">
</div>
</div> `;
   wrapperCalendar.insertAdjacentElement("afterend", newDiv);
   const closeMessage = document.querySelector(".closeMessage")
   closeMessage.addEventListener("click", () => {
      newDiv.remove()
   })
}