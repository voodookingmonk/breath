const messages = {
  initial: "Click on this<br/>circle to start",
  stop: "Stopped.<br/>Press ESC to exit fullscreen.<br/>Click again to start over.",
  breathIn: "Breath in",
  breathOut: "Breath out",
  holdBreath: "Hold breath"
}

const header = document.querySelector("header");
const footer = document.querySelector("footer");
const circleWrapper = document.querySelector("#circle");
const body = document.querySelector("body");
const circle = document.querySelector(".circle");
const text = document.querySelector("#text");
const timeouts = {
  hold: null,
  out: null
}
let interval = null;
let time = null;
let pause = null;

text.innerHTML = messages.initial;
let storageTimer = localStorage.getItem("breath-timer");
let storagePause = localStorage.getItem("breath-pause");
if (storageTimer) document.querySelector("#timer").value = storageTimer;
if (storagePause) document.querySelector("#pause").value = storagePause;

circleWrapper.addEventListener("click", () => { 
  toggleElementVisiblity(header);
  toggleElementVisiblity(footer);
  interval ? stop() : start(); 
})

const start = () => {
  updateTime();
  circle.style.transition = `all ${time}ms linear`;

  const timeCombined = time * 2 + pause;

  fullscreen.open();
  interval = setInterval((() => {
    breathing();
    return breathing; 
  })(), timeCombined);
}

const stop = () => {
  circle.style.transition = `none`;

  text.innerHTML = messages.stop;
  if (circle.classList.contains("grow")) circle.classList.remove("grow");

  clearInterval(interval);
  interval = null;
  clearTimeout(timeouts.hold);
  timeouts.hold = null;
  clearTimeout(timeouts.out);
  timeouts.out = null;
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
  circle.classList.add("grow");
  text.innerHTML = messages.breathIn;

  timeouts.hold = setTimeout(() => {
    if (pause) text.innerHTML = messages.holdBreath;

    timeouts.out = setTimeout(() => {
      circle.classList.remove("grow");
      text.innerHTML = messages.breathOut;
    }, pause)
  }, time)
}

const fullscreen = {
  open: () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) { /* Firefox */
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      docElm.webkitRequestFullscreen();
    } else if (docElm.msRequestFullscreen) { /* IE/Edge */
      docElm.msRequestFullscreen();
    }
  },
  close: () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  }
}