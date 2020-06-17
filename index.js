const messages = {
  initial: "Click on this<br/>circle to start",
  stop: "Stopped.<br/>Click again to start over",
  breathIn: "Breath in",
  breathOut: "Breath out"
}

const header = document.querySelector("header");
const footer = document.querySelector("footer");
const content = document.querySelector(".content");
const box = document.querySelector(".box");
const text = document.querySelector("#text");
let interval = null;
let time = null;
let breathingInAnimation = null;

text.innerHTML = messages.initial;
let storageTimer = localStorage.getItem("breath-timer");
if (storageTimer) document.querySelector("#timer").value = storageTimer;

content.addEventListener("click", () => { 
  toggleElementVisiblity(header);
  toggleElementVisiblity(footer);
  interval ? stop() : start(); 
})

const start = () => {
  updateTime();

  init();

  interval = setInterval(breathHelper, time);
}

const init = () => {
  breathHelper();
  box.style.transition = `all ${time}ms linear`;
}

const stop = () => {
  box.style.transition = `none`;
  clearTimeout(interval);
  interval = null;
  text.innerHTML = messages.stop;
  if (box.classList.contains("grow")) box.classList.remove("grow");
  breathingInAnimation = null;
}

const updateTime = () => {
  const timeInSeconds = document.querySelector("#timer").value;
  let timeInMilliSeconds = null;
  
  if (isNaN(timeInSeconds) || timeInSeconds < 0){
    console.error("Entered time is not a number or below 0");
    return;
  }
  
  localStorage.setItem("breath-timer", timeInSeconds);

  timeInMilliSeconds = timeInSeconds * 1000;
  time = timeInMilliSeconds;
}

const toggleElementVisiblity = (element) => {
  const hideClass = "hide-element";
  element.classList.contains(hideClass) ? element.classList.remove(hideClass) : element.classList.add(hideClass);
}

const breathHelper = () => {
  if (!breathingInAnimation){
      box.classList.add("grow")
      text.innerText = messages.breathIn;
      breathingInAnimation = true;
  } else if (breathingInAnimation){
      box.classList.remove("grow")
      text.innerText = messages.breathOut;
      breathingInAnimation = false;
  }
}