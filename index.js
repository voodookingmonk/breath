/* 
    Was planning to use arrow functions inside classes, 
    but latest Edge seems to have a problem with them, 
    so used functions instead and bound them to the class.
*/

class MyStorage {
  constructor(id, settings){
    this.id = id;
    this.settings = settings;

    this.storage = null;

    this.getStorage = this.getStorage.bind(this);
    this.updateStorage = this.updateStorage.bind(this);

    this.init();
  }

  init(){
    this.getStorage();
    if (!this.storage){
      this.updateStorage();
    }
  }

  getStorage(){
    this.storage = JSON.parse(localStorage.getItem(this.id));
    return this.storage;
  }

  normalize(type, input){ 
    let value = Math.abs(parseInt(input));
    if (type === "timer"){
      if (!value || value < 1) value = 1;
    } else {
      if (!value) value = 0;
    }

    return value * 1000;
  }

  updateStorage(){
    const object = {
      times: {
        breathInTime: this.normalize("timer", this.settings.breathInTime.value),
        breathOutTime: this.normalize("timer", this.settings.breathOutTime.value),
        holdBetweenTime: this.normalize("hold", this.settings.holdBetweenTime.value),
        holdEndTime: this.normalize("hold", this.settings.holdEndTime.value),
      },
      locks: {
        breathLock: this.settings.breathLock.checked,
        holdLock: this.settings.holdLock.checked,
      },
      misc: {
        fullscreen: this.settings.enterFullscreen.checked,
        audio: this.settings.audio.checked,
        timeRemaining: this.settings.timeRemaining.checked
      }
    }

    localStorage.setItem(this.id, JSON.stringify(object));
  }
}

class Breath {
  constructor(storage, elements){
    this.storage = storage;
    this.message = {
      initialMsg: "Click on<br/> this circle <br/> to start",
      stopMsg: "Stopped.<br/>Click again<br/>to start over.",
      breathInMsg: "Breath in",
      breathOutMsg: "Breath out",
      holdBreathMsg: "Hold breath"
    }
    this.time = {
      breathInTime: 0,
      breathOutTime: 0,
      holdBetweenTime: 0,
      holdEndTime: 0
    }

    this.intervals = {
      breath: null,
      countdown: null
    }
    this.timeouts = {
      holdBetweenTimeout: null,
      holdEndTimeout: null,
      breathOutTimeout: null
    }
    this.elements = elements;

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.breathing = this.breathing.bind(this);
  }

  updateTime(){
    const { breathInTime, breathOutTime, holdBetweenTime, holdEndTime } = this.storage.getStorage().times;
    this.time = { breathInTime, breathOutTime, holdBetweenTime, holdEndTime };
  }

  start(){
    this.updateTime();
    const { breathInTime, breathOutTime, holdBetweenTime, holdEndTime } = this.time;

    let timeCombined = breathInTime + holdBetweenTime + breathOutTime + holdEndTime;

    this.intervals.breath = setInterval((() => {
      this.breathing();
      return this.breathing; 
    })(), timeCombined);
  }

  stop(){
    const { innerCircle, text } = this.elements;
    const { stopMsg } = this.message;

    innerCircle.style = "";
    text.innerHTML = stopMsg;
    if (innerCircle.classList.contains("grow")) innerCircle.classList.remove("grow");

    for (const [key, value] of Object.entries(this.intervals)){
      clearInterval(value);
      this.intervals[key] = null;
    }

    for (const [key, value] of Object.entries(this.timeouts)){
      clearTimeout(value);
      this.timeouts[key] = null;
    }
  }

  breathing(){
    const { innerCircle, text } = this.elements;
    const { breathInMsg, breathOutMsg, holdBreathMsg } = this.message;
    const { breathInTime, breathOutTime, holdBetweenTime, holdEndTime } = this.time;

    innerCircle.classList.add("grow");
    innerCircle.style.animation = `grow ${breathInTime}ms linear forwards`;

    this.countDownText(breathInTime, breathInMsg);

    this.timeouts.holdBetweenTimeout = setTimeout(() => {
      if (holdBetweenTime) this.countDownText(holdBetweenTime, holdBreathMsg);

      this.timeouts.breathOutTimeout = setTimeout(() => {
        innerCircle.classList.remove("grow");
        innerCircle.style.animation = `shrink ${breathOutTime}ms linear forwards`;
        this.countDownText(breathOutTime, breathOutMsg);

        this.timeouts.holdEndTimeout = setTimeout(() => {
          if (holdEndTime) this.countDownText(holdEndTime, holdBreathMsg);
        }, breathOutTime);
      }, holdBetweenTime)
    }, breathInTime)
  }

  countDownText(start, initialText){
    const { text } = this.elements;

    let showTimeRemaining = myStorage.getStorage().misc.timeRemaining;
    let timeRemaining = (start / 1000) + 1;

    if (showTimeRemaining && timeRemaining > 2){
      const logic = () => {
        timeRemaining--;
        text.innerHTML = `${initialText} <br> ${timeRemaining}`;

        if (timeRemaining === 1){
          clearInterval(this.intervals.countdown);
          this.intervals.countdown = null;
        }
      }

      if (!this.intervals.countdown){
        this.intervals.countdown = setInterval((() => {
            logic();
            return logic;
        })(), 1000)
      }
    } else if (showTimeRemaining && timeRemaining === 2) {
      text.innerHTML = `${initialText} <br> ${timeRemaining-1}`;
    } else {
      text.innerHTML = initialText;
    }
  }
}

class MyUI {
  constructor(breath, storage, elements, settings){
    this.breath = breath;
    this.storage = storage;
    this.settingsClickable = true;
    this.elements = elements;
    this.settings = settings;
    this.fullscreen = true;

    this.init();
  }

  updateFullscreen(){
    this.fullscreen = this.storage.getStorage().misc.fullscreen;
  }
    

  init(){
    const { circle, header, footer } = this.elements;
    const { settingsButton, overlay, overlayContent, form, breathInTime, breathOutTime, holdBetweenTime, holdEndTime, breathLock, holdLock } = this.settings;

    this.updateSettings();

    form.addEventListener("change", () => {
      this.locks(breathInTime, breathOutTime, breathLock);
      this.locks(holdBetweenTime, holdEndTime, holdLock);

      this.storage.updateStorage();
      this.updateSettings();
    })

    circle.addEventListener("click", () => {
      const { intervals: { breath }, start, stop } = this.breath;
      const { audio } = this.elements;
      const canPlayMusic = this.storage.getStorage().misc.audio;
    
      this.updateFullscreen();
      if (this.fullscreen) this.enterFullscreen();

      this.toggleElementVisiblity(header);
      this.toggleElementVisiblity(footer);
      if(breath){
        stop();
        audio.pause();
        audio.currentTime = 0;
      } else {
        start();
        if (canPlayMusic) audio.play();
      }
      this.toggleSettingsClickable();
    })

    settingsButton.addEventListener("click", () => {
      if (this.settingsClickable){
        overlay.classList.contains("overlay--show") ? overlay.classList.remove("overlay--show") : overlay.classList.add("overlay--show");
        overlayContent.classList.contains("overlay--content--show") ? overlayContent.classList.remove("overlay--content--show") : overlayContent.classList.add("overlay--content--show");
      }
    });
  }

  toggleSettingsClickable(){
    this.settingsClickable = !this.settingsClickable;
  } 

  toggleElementVisiblity(element){
    const hideClass = "hide-element";
    element.classList.contains(hideClass) ? element.classList.remove(hideClass) : element.classList.add(hideClass);
  }

  enterFullscreen(){
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
  }

  updateSettings(){
    const secondsToMilliseconds = (input) => {
      if (!isNaN(input)){
        if (input) return input / 1000;
        return input;
      }
    }

    const values = this.storage.getStorage();
    const { breathInTime, breathOutTime, holdBetweenTime, holdEndTime, breathLock, holdLock, enterFullscreen, audio, timeRemaining } = this.settings;

    breathInTime.value = secondsToMilliseconds(values.times.breathInTime);
    breathOutTime.value = secondsToMilliseconds(values.times.breathOutTime);
    holdBetweenTime.value = secondsToMilliseconds(values.times.holdBetweenTime);
    holdEndTime.value = secondsToMilliseconds(values.times.holdEndTime);
    breathLock.checked = values.locks.breathLock;
    if (breathLock.checked) breathOutTime.disabled = true;
    holdLock.checked = values.locks.holdLock;
    if (holdLock.checked) holdEndTime.disabled = true;
    enterFullscreen.checked = values.misc.fullscreen;
    audio.checked = values.misc.audio;
    timeRemaining.checked = values.misc.timeRemaining;
  }

  locks(e1, e2, lock){
    if (lock.checked){
      e2.disabled = true;
      e2.value = e1.value;
    } else {
      e2.disabled = false;
    }
  }
}

const elements = {
  header: document.querySelector("header"),
  footer: document.querySelector("footer"),
  circle: document.querySelector("#circle"),
  innerCircle: document.querySelector(".circle"),
  text: document.querySelector("#text"),
  audio: document.querySelector("audio")
}

const settings = {
  settingsButton: document.querySelector("#settings--icon"),
  form: document.querySelector("#settings-form"),
  overlay: document.querySelector("#overlay"),
  overlayContent: document.querySelector("#overlay--content"),
  breathInTime: document.querySelector("#breath-in"),
  breathOutTime: document.querySelector("#breath-out"),
  holdBetweenTime: document.querySelector("#hold-between"),
  holdEndTime: document.querySelector("#hold-end"),
  breathLock: document.querySelector("#breath-lock"),
  holdLock: document.querySelector("#hold-lock"),
  enterFullscreen: document.querySelector("#enter-fullscreen"),
  audio: document.querySelector("#audio"),
  timeRemaining: document.querySelector("#time-remaining")
}

const { header, footer, innerCircle, circle, text } = elements;

const myStorage = new MyStorage("breath", settings);
const myBreath = new Breath(myStorage, { innerCircle, circle, text });
const myUI = new MyUI(myBreath, myStorage, elements, settings);

{
  let deferredPrompt;
  const addBtn = document.querySelector('.add-button');
  addBtn.style.display = 'none';

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    addBtn.style.display = 'block';

    addBtn.addEventListener('click', (e) => {
      // hide our user interface that shows our A2HS button
      addBtn.style.display = 'none';
      // Show the prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          deferredPrompt = null;
        });
    });
  });
}