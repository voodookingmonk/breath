const messages = {
  initial: "Click on this<br/>circle to start",
  stop: "Stopped.<br/>Click again to start over",
  breathIn: "Breath in",
  breathOut: "Breath out",
  holdBreath: "Hold breath"
}

const header = document.querySelector("header");
const footer = document.querySelector("footer");
const content = document.querySelector(".content");
const box = document.querySelector(".box");
const text = document.querySelector("#text");
let interval = null;
let time = null;
let pause = null;

text.innerHTML = messages.initial;
let storageTimer = localStorage.getItem("breath-timer");
let storagePause = localStorage.getItem("breath-pause");
if (storageTimer) document.querySelector("#timer").value = storageTimer;
if (storagePause) document.querySelector("#pause").value = storagePause;

content.addEventListener("click", () => { 
  toggleElementVisiblity(header);
  toggleElementVisiblity(footer);
  interval ? stop() : start(); 
})

const start = () => {
  updateTime();
  box.style.transition = `all ${time}ms linear`;

  const timeCombined = time * 2 + pause;

  interval = setInterval((() => {
    breathing();
    return breathing; 
  })(), timeCombined);
}

const stop = () => {
  box.style.transition = `none`;
  clearTimeout(interval);
  interval = null;
  text.innerHTML = messages.stop;
  if (box.classList.contains("grow")) box.classList.remove("grow");
}

const updateTime = () => {
  time = timeHelper("#timer");
  pause = timeHelper("#pause");
}

const timeHelper = (id, variable) => {
  const time = document.querySelector(id).value;
  let inMillis = null;

  if (isNaN(time) || time < 0){
    console.error("Entered time is not a number or below 0");
    return;
  }

  localStorage.setItem(`breath-${id.substr(1, id.length)}`, time);

  inMillis = time * 1000;

  return inMillis;
}

const toggleElementVisiblity = (element) => {
  const hideClass = "hide-element";
  element.classList.contains(hideClass) ? element.classList.remove(hideClass) : element.classList.add(hideClass);
}

const breathing = () => {
  box.classList.add("grow");
  text.innerHTML = messages.breathIn;

  setTimeout(() => {
    if (pause) text.innerHTML = messages.holdBreath;

    setTimeout(() => {
      box.classList.remove("grow");
      text.innerHTML = messages.breathOut;
    }, pause)
  }, time)
}