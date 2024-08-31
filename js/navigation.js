
const navImg = document.querySelector(".navImg")
const navP = document.querySelectorAll(".navP")
const navContainer = document.querySelector(".nav")
const navPImg = document.querySelector(".navP_img")
const navLogoOpen = document.querySelector(".navLogoOpen")
const navLogoClose = document.querySelector(".navLogoClose")
const imgLeft = document.querySelector(".fa-arrow-left")
const imgRight = document.querySelector(".fa-arrow-right")
const signOut = document.querySelector(".signOut")

imgRight.addEventListener("click", () => {
   navLogoOpen.style.display = ""
   navLogoClose.style.display = "none"
   navContainer.style.width = "220px"
   setTimeout(() => {
      imgRight.style.display = "none"
      imgLeft.style.display = ""
   }, 50)
   setTimeout(() => {
      for (let i = 0; i < navP.length; i++) {
         navP[i].style.display = "block";
      }
   }, 150)

})

imgLeft.addEventListener("click", () => {
   imgLeft.style.display = "none"
   imgRight.style.display = ""
   navLogoOpen.style.display = "none"
   navLogoClose.style.display = ""
   navContainer.style.width = "45px"
   for (let i = 0; i < navP.length; i++) {
      navP[i].style.display = "none";
   }
})

// hower arrow
navImg.addEventListener("mouseover", function () {
   imgRight.style.color = "#ffc043";
   imgLeft.style.color = "#ffc043";
});

navImg.addEventListener("mouseout", function () {
   imgRight.style.color = "#E8E8E8";
   imgLeft.style.color = "#E8E8E8";
});


