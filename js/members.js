console.log("members.js loaded");

const modal =
  document.getElementById("memberModal");

const openBtn =
  document.getElementById("openModalBtn");

const closeBtn =
  document.getElementById("closeModalBtn");

console.log(modal);
console.log(openBtn);
console.log(closeBtn);

if(openBtn){

  openBtn.addEventListener("click",()=>{

    console.log("OPENED");

    modal.style.display = "flex";

  });

}

if(closeBtn){

  closeBtn.addEventListener("click",()=>{

    modal.style.display = "none";

  });

}
