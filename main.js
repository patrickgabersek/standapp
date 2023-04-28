class Timer {
  // Fields, properties

  hours;
  minutes;
  seconds;
  element;
  clockInterval;
  howFast;
  initalMinutes;
  title = document.querySelector(".title");
  beep = new Audio();
  beep2 = new Audio();
  beep3 = new Audio();
  defaultminutes;
  timeX;
  timeLeftX;

  // Constructor
  constructor(minutes, element, howFast) {
    minutes = minutes < 1 ? 1 : minutes;
    this.hours = 0;
    this.minutes = minutes;
    this.defaultminutes = minutes;
    this.seconds = 0;
    this.element = element;
    this.howFast = howFast;
    this.beep.src = "sound.mp3";
    this.beep2.src = "sound2.mp3";
    this.beep3.src = "sound3.mp3";
  }

  // Behaviour, methods

  clockFunctionality() {
    this.displayMinutesSeconds();

    // Time in X amount in the future
    this.timeX = new Date(
      new Date().getTime() + this.defaultminutes * 60000 + 1 * 1000
    );

    return new Promise((resolve, reject) => {
      switch (this.howFast) {
        // Clock goes normal speed
        case 1000:
          // Reset timer to default minutes
          this.resetTheObject(this.defaultminutes);

          this.clockInterval = setInterval(() => {
            // Get difference in milliseconds, x amount of time in the future - current time
            var now = new Date().getTime();
            this.timeLeftX = this.timeX - now;

            // Convert from milliseconds to minutes and seconds
            this.minutes = Math.floor(this.timeLeftX / 1000 / 60);
            this.seconds = Math.floor((this.timeLeftX / 1000) % 60);

            this.displayMinutesSeconds();

            // When timer ends
            if (
              (this.seconds == 0 && this.minutes == 0) ||
              this.minutes < 0 ||
              this.seconds < 0
            ) {
              this.resetTheObject(this.initalMinutes);
              this.element.innerHTML = "00:00:00";
              this.title.innerHTML = "00:00:00";
              this.beep.play();
              clearInterval(this.clockInterval);
              resolve();
            }
          }, this.howFast);
          break;

        // Clock goes fast
        case 1:
          this.clockInterval = setInterval(() => {
            if (this.seconds == 0) {
              this.seconds = 60;
              this.minutes--;
            }

            // Control the speed
            if (this.seconds >= 2) {
              this.seconds -= 2;
            } else {
              this.seconds--;
            }

            this.displayMinutesSeconds();

            // When the timer hits zero
            if (
              (this.seconds == 0 && this.minutes == 0) ||
              this.minutes < 0 ||
              this.seconds < 0
            ) {
              this.resetTheObject(this.initalMinutes);
              this.element.innerHTML = "00:00:00";
              this.title.innerHTML = "00:00:00";
              this.beep.play();
              clearInterval(this.clockInterval);
              resolve();
            }
          }, this.howFast);
          break;
      }
    });
  }

  displayMinutesSeconds() {
    let minutes = this.minutes < 10 ? `0${this.minutes}` : `${this.minutes}`;
    let seconds = this.seconds < 10 ? `0${this.seconds}` : `${this.seconds}`;

    this.element.innerHTML = `00:${minutes}:${seconds}`;
    this.title.innerHTML = `00:${minutes}:${seconds}`;
  }

  setInitalMinutesAmount(amount) {
    this.initalMinutes = amount;
    return this.initalMinutes;
  }

  changeSpeed(newSpeed) {
    this.howFast = newSpeed;
  }

  resetTheObject(currentFocusAmount) {
    clearInterval(this.clockInterval);
    this.hours = 0;
    this.minutes = currentFocusAmount;
    this.defaultminutes = currentFocusAmount;
    this.seconds = 0;
    this.displayMinutesSeconds();
  }

  clearInterval() {
    clearInterval(this.clockInterval);
  }
}

class LocalStorage {
  save(storageName, data) {
    let getStorage = this.check(storageName);
    let test = false;

    for (let i = 0; i < getStorage.length; i++) {
      if (getStorage[i].date == data.date) {
        getStorage[i] = data;
        test = true;
      }
    }

    if (!test) {
      getStorage.push(data);
    }

    localStorage.setItem(storageName, JSON.stringify(getStorage));
  }

  onlySaveOneData(storageName, data) {
    let array = [];
    array[0] = data;
    localStorage.setItem(storageName, JSON.stringify(array));
  }
  // add new Records here
  saveCollection(storageNames, collection) {
    collection.forEach((cur) => {
      for (let i = 0; i < storageNames.length; i++) {
        let current = 0;
        switch (storageNames[i]) {
          case "dailyDateAndTime":
            current = cur.focusTime;
            break;
          case "recordRead":
            current = cur.read;
            break;
          case "recordWorkout":
            current = cur.workout;
            break;
          case "recordNut":
            current = cur.nut;
            break;
          case "recordSleep":
            current = cur.sleep;
            break;
        }
        this.save(storageNames[i], adminCreateObject(current, cur.date));
        this.orderDatesFromHighToLow(storageNames[i]);
      }
    });
  }

  checkIfExists(storageName, date) {
    let database = this.check(storageName);
    for (let i = 0; i < database.length; i++) {
      if (database[i].date == date) {
        return database[i].time;
      }
    }
    return "no";
  }

  remove(storageName, data, activityName) {
    let getStorage = this.check(storageName);
    let copyOfStorage = [];
    let test = false;

    for (let i = 0; i < getStorage.length; i++) {
      if (getStorage[i].date != data.date) {
        copyOfStorage.push(getStorage[i]);
      }
    }

    if (getStorage.length == copyOfStorage.length) {
      console.log(`No data found, for ${activityName} activity!`);
    } else {
      console.log(`Data for ${activityName} was deleted!`);
    }

    localStorage.setItem(storageName, JSON.stringify(copyOfStorage));
  }

  set(storageName, date, amount) {
    let storage = this.check(storageName);
    for (let i = 0; i < storage.length; i++) {
      if (storage[i].date == date) {
        storage[i].time = amount;
        this.save(storageName, storage[i]);
        return true;
      }
    }

    let newObject = {
      time: amount,
      date: date,
    };
    this.save(storageName, newObject);
  }

  addToTotalFocusAmount(storageName, data, reset) {
    let getStorage = this.check(storageName);
    let firstElement = getStorage[0];
    if (getStorage[0] == null) {
      firstElement = 0;
    }

    getStorage[0] = reset == true ? data : firstElement + parseInt(data);
    localStorage.setItem(storageName, JSON.stringify(getStorage));
    return getStorage;
  }

  findItem(storageName, date) {
    let getStorage = this.check(storageName);

    for (let i = 0; i < getStorage.length; i++) {
      if (getStorage[i].date == date) {
        return getStorage[i];
      }
    }

    return null;
  }

  check(storageName) {
    let array = [];
    let getStorage = JSON.parse(localStorage.getItem(storageName));
    if (getStorage == null) {
      localStorage.setItem(storageName, JSON.stringify(array));
    }
    return JSON.parse(localStorage.getItem(storageName));
  }

  orderDatesFromHighToLow(storageName) {
    let getStorage = this.check(storageName);
    let order = [];
    let flag = true;
    let placeholder;

    // Get all the dates from the localStorage in miliseconds
    for (let i = 0; i < getStorage.length; i++) {
      let d = new Date(getStorage[i].date);
      let object = {
        time: getStorage[i].time,
        date: d.getTime(),
      };
      order.push(object);
    }

    let format = new Date(order[0].date);

    // Order the miliseconds from highest to lowest
    while (flag) {
      flag = false;

      for (let i = 0; i < order.length - 1; i++) {
        if (order[i + 1].date > order[i].date) {
          placeholder = order[i];
          order[i] = order[i + 1];
          order[i + 1] = placeholder;
          flag = true;
        }
      }
    }

    // Turn the miliseconds back to dates
    for (let i = 0; i < order.length; i++) {
      let format = new Date(order[i].date);
      let year = format.getUTCFullYear();
      if (format.getMonth() + 1 == 1 && format.getDate() == 1) {
        year = format.getUTCFullYear() + 1;
      }
      order[i].date =
        format.getMonth() + 1 + "." + format.getDate() + "." + year;
    }
    localStorage.setItem(storageName, JSON.stringify(order));
  }
}

class Display {
  displayAmounts(element, currentTotalAmount) {
    let calcInHours = (currentTotalAmount / 60).toFixed(1);

    if (element != totalFocusAmountText) {
      // Display this if this is the focus in a day
      element.innerHTML =
        currentTotalAmount + " minutes  or " + calcInHours + " hours";
    } else {
      // Execute this if it is the total focus amount display
      const local = new LocalStorage();
      let data = local.check("dailyDateAndTime");
      let totalWorkAmount = currentTotalAmount[0];
      if (data.length == 0) {
        // Fixing the problem with deviding with a 0, which return infinity
        data = 1;
      } else {
        data = data.length;
      }

      if (totalWorkAmount == undefined) {
        totalWorkAmount = 1;
      }

      // dont include the current day if the day didnt end
      let fixingTotalCalc = local.check(totalCalculationFix)[0];
      let currentDayElement = local.findItem(
        storageNameFocusDateAndTime,
        getCurrentDate()
      );
      if (fixingTotalCalc == false) {
        if (currentDayElement == null) {
          let dailyTotalFocus = local.check(storageNameDailyTotalFocus)[0];
          if (dailyTotalFocus == null) {
            dailyTotalFocus = 0;
          }

          totalWorkAmount = totalWorkAmount - dailyTotalFocus;
        }
      }

      let calculate = (totalWorkAmount / data).toFixed(2);
      element.innerHTML =
        currentTotalAmount +
        " minutes  or " +
        calcInHours +
        " hours == " +
        calculate +
        " minutes per day";
    }
  }
  // add new Records here
  displayArrays(element, array, type) {
    element.innerHTML = "";

    if (array.length != 0) {
      for (let i = 0; i < array.length; i++) {
        switch (type.toLowerCase()) {
          case "focus":
            element.innerHTML += ` date ${this.dateFormat(array[i].date)} __ ${
              array[i].time
            } minutes <br>`;
            break;
          // add new Records here
          case "workout":
            element.innerHTML += ` date ${this.dateFormat(array[i].date)} __ ${
              array[i].time
            } <br>`;
            break;
          case "read":
            element.innerHTML += ` date ${this.dateFormat(array[i].date)} __ ${
              array[i].time
            } <br>`;
            break;
          case "nut":
            element.innerHTML += ` date ${this.dateFormat(array[i].date)} __ ${
              array[i].time
            } <br>`;
            break;
          case "sleep":
            element.innerHTML += ` date ${this.dateFormat(array[i].date)} __ ${
              array[i].time
            } <br>`;
            break;
        }
      }
    } else {
      element.innerHTML = `
            <p> no records </p>
            `;
    }
  }

  dateFormat(date) {
    let format = new Date(date);
    return formatDateNicely(format);
  }
}

// Variables
let firstInit = true;
let wasTheDayReset = false;

let timeleftDisplay = document.querySelector(".timer__focus-timer__timeLeft");
let breakTimerTimeleftDisplay = document.querySelector(
  ".timer__break-timer__timeLeft"
);
let timeLeftDispayReset = document.querySelector(".timer__btn__reset");
let breakTimerTimeLeftDispayReset = document.querySelector(
  ".timer__break__btn__reset"
);
let changeMinutesAmount = document.querySelector(
  ".timer__focus-timer__changeMinutesAmount"
);
let changeMinutesAmountBreakTimer = document.querySelector(
  ".timer__break-timer__changeMinutesAmount"
);

// add new Records here
let recordWorkoutBtnYes = document.querySelector(
  ".control-panel__buttons__workout--yes"
);
let recordWorkoutBtnNo = document.querySelector(
  ".control-panel__buttons__workout--no"
);

let recordReadBtnYes = document.querySelector(
  ".control-panel__buttons__read--yes"
);
let recordReadBtnNo = document.querySelector(
  ".control-panel__buttons__read--no"
);

let recordNutBtnYes = document.querySelector(
  ".control-panel__buttons__nut--yes"
);
let recordNutBtnNo = document.querySelector(".control-panel__buttons__nut--no");

let recordSleepBtnYes = document.querySelector(
  ".control-panel__buttons__sleep--yes"
);
let recordSleepBtnNo = document.querySelector(
  ".control-panel__buttons__sleep--no"
);

// add new Records here
let workoutTimeTable = document.querySelector(".stats__workout__time-table");
let readTimeTable = document.querySelector(".stats__read__time-table");
let nutTimeTable = document.querySelector(".stats__nut__time-table");
let sleepTimeTable = document.querySelector(".stats__sleep__time-table");

let speedControlBtn = document.querySelector(
  ".control-panel__buttons__speed__btn"
);
let focusTimeTable = document.querySelector(".stats__creativity__time-table");

let expressingTotalText = document.querySelector(
  ".dailyInformation__box__expressing__focusData"
);
let totalFocusAmountText = document.querySelector(
  ".dailyInformation__box__expressing-total__totalData"
);

let timerEndDay = document.querySelector(
  ".control-panel__buttons__kill__endDay"
);
let clockStartBtn = document.querySelector(".timer__btn__onoff");
let breakClockStartBtn = document.querySelector(".timer__break__btn__onoff");

let defaultMinutes = 20;
if (defaultMinutes < 1) {
  defaultMinutes = 1;
}
let defaultBreakMinutes = 5;
if (defaultBreakMinutes < 1) {
  defaultBreakMinutes = 1;
}
let howFast = 1000;
let speed = false;
let started = false;
let breakTimerStarted = false;
let clockIsRunning = false;
let breakClockRunning = false;
let timer = new Timer(defaultMinutes, timeleftDisplay, howFast); // clock object
let breakTimer = new Timer(
  defaultBreakMinutes,
  breakTimerTimeleftDisplay,
  howFast
); // break timer object

//Data storage names
let storageNameFocus = "creativityStats";
let storageNameDailyTotalFocus = "dailyTotalTime";
let storageNameAllTimeTotalFocus = "allTotalTime";
let storageNameFocusDateAndTime = "dailyDateAndTime";
let storageNameDailyReset = "dailyReset";
let totalCalculationFix = "totalCalculationFix";

// add new Records here
let storageNameRecordWorkout = "recordWorkout";
let storageNameRecordRead = "recordRead";
let storageNameRecordNut = "recordNut";
let storageNameRecordSleep = "recordSleep";

// Events

clockStartBtn.addEventListener("click", clockStart);
breakClockStartBtn.addEventListener("click", breakClockStart);
timeleftDisplay.addEventListener("click", changeTheAmountOfMinutes);
breakTimerTimeleftDisplay.addEventListener(
  "click",
  breakTimerChangeTheAmountOfMinutes
);
timeLeftDispayReset.addEventListener("click", clockReset);
breakTimerTimeLeftDispayReset.addEventListener("click", breakClockReset);
timerEndDay.addEventListener("click", endTheDay);
speedControlBtn.addEventListener("click", controlTheSpeed);

// Add additional records here
recordWorkoutBtnYes.addEventListener("click", () => {
  recordWorkout("yes");
});
recordWorkoutBtnNo.addEventListener("click", () => {
  recordWorkout("no");
});

recordReadBtnYes.addEventListener("click", () => {
  recordRead("yes");
});
recordReadBtnNo.addEventListener("click", () => {
  recordRead("no");
});

recordNutBtnYes.addEventListener("click", () => {
  recordNut("yes");
});
recordNutBtnNo.addEventListener("click", () => {
  recordNut("no");
});

recordSleepBtnYes.addEventListener("click", () => {
  recordSleep("yes");
});
recordSleepBtnNo.addEventListener("click", () => {
  recordSleep("no");
});

// Methods

async function clockStart() {
  // End the break timer
  breakClockStartBtn.innerHTML = "break off";
  breakTimer.clearInterval();
  breakClockRunning = false;
  breakTimer.resetTheObject(defaultBreakMinutes);
  changeMinutesAmountBreakTimer.value = "";

  timeleftDisplay.hidden = false;
  changeMinutesAmount.hidden = true;
  breakTimerTimeleftDisplay.hidden = false;
  changeMinutesAmountBreakTimer.hidden = true;

  // If the user changed the minutes amount
  if (changeMinutesAmount.value != "") {
    // Validate correct input from user
    if (
      isNaN(changeMinutesAmount.value) ||
      changeMinutesAmount.value <= 0 ||
      changeMinutesAmount.value > 60 ||
      changeMinutesAmount.value.split(".").length == 2
    ) {
      changeMinutesAmount.value = defaultMinutes;
    }

    timer.resetTheObject(changeMinutesAmount.value);
    defaultMinutes = changeMinutesAmount.value;
    changeMinutesAmount.value = "";
  }

  // Save the inital amount of minutes
  timer.setInitalMinutesAmount(defaultMinutes);

  // Stopping and starting the timer
  if (!clockIsRunning) {
    clockIsRunning = !clockIsRunning;
    clockStartBtn.innerHTML = "focus on";
    await timer.clockFunctionality(); // waiting till the clock stops

    const storage = initializeObject("localstorage");
    storage.check(storageNameDailyTotalFocus); // check if null storage
    storage.addToTotalFocusAmount(
      storageNameDailyTotalFocus,
      defaultMinutes,
      false
    ); // save focus amount to the total in localstorage
    storage.check(storageNameAllTimeTotalFocus);
    storage.addToTotalFocusAmount(
      storageNameAllTimeTotalFocus,
      parseInt(defaultMinutes),
      false
    );

    onInit();
  } else {
    timer.clearInterval();
    clockStartBtn.innerHTML = "focus off";
  }

  clockIsRunning = false;
}

async function breakClockStart() {
  // End the focus timer
  clockIsRunning = false;
  clockStartBtn.innerHTML = "focus off";
  timer.resetTheObject(defaultMinutes);
  timer.clearInterval();
  changeMinutesAmount.value = "";

  // Show input for changing default minutes
  breakTimerTimeleftDisplay.hidden = false;
  changeMinutesAmountBreakTimer.hidden = true;
  timeleftDisplay.hidden = false;
  changeMinutesAmount.hidden = true;

  if (changeMinutesAmountBreakTimer.value != "") {
    // Validate correct input from user
    if (
      isNaN(changeMinutesAmountBreakTimer.value) ||
      changeMinutesAmountBreakTimer.value <= 0 ||
      changeMinutesAmountBreakTimer.value > 60 ||
      changeMinutesAmountBreakTimer.value.split(".").length == 2
    ) {
      changeMinutesAmountBreakTimer.value = defaultBreakMinutes;
    }

    breakTimer.resetTheObject(changeMinutesAmountBreakTimer.value);
    defaultBreakMinutes = changeMinutesAmountBreakTimer.value;
    changeMinutesAmountBreakTimer.value = "";
  }

  // Save the inital amount of minutes
  breakTimer.setInitalMinutesAmount(defaultBreakMinutes);

  if (!breakClockRunning) {
    breakClockRunning = !breakClockRunning;
    breakClockStartBtn.innerHTML = "break on";
    await breakTimer.clockFunctionality();
    breakClockStartBtn.innerHTML = "break off";
    breakTimer.resetTheObject(defaultBreakMinutes);
  } else {
    breakClockStartBtn.innerHTML = "break off";
    breakTimer.clearInterval();
  }
  breakClockRunning = false;
}

function endTheDay() {
  /*
        1. get date
        2. get minutes
        3. make an object
        4. reset timer
        5. display
    */
  const storage = initializeObject("localstorage");
  let totalMinutes = storage.check(storageNameDailyTotalFocus);
  if (totalMinutes == null) {
    totalMinutes = 0;
  } else if (totalMinutes == 0) {
    totalMinutes = 0;
  } else {
    totalMinutes = totalMinutes[0];
  }

  let dataObject = {
    time: totalMinutes,
    date: getCurrentDate(),
  };

  storage.save(storageNameFocusDateAndTime, dataObject);
  storage.orderDatesFromHighToLow(storageNameFocusDateAndTime);
  storage.onlySaveOneData(totalCalculationFix, true);
  storage.check(totalCalculationFix);
  onInit();
}

function clockReset() {
  timer.resetTheObject(defaultMinutes);
  clockStartBtn.innerHTML = "focus off";
  clockIsRunning = false;
}

function breakClockReset() {
  breakClockStartBtn.innerHTML = "break off";
  breakTimer.resetTheObject(defaultBreakMinutes);
  breakClockRunning = false;
}

function changeTheAmountOfMinutes() {
  timeleftDisplay.hidden = true;
  changeMinutesAmount.hidden = false;
  clockIsRunning = false;
  clockStartBtn.innerHTML = "focus off";
  timer.resetTheObject(defaultMinutes);
  breakClockRunning = false;
}

function breakTimerChangeTheAmountOfMinutes() {
  breakTimerTimeleftDisplay.hidden = true;
  changeMinutesAmountBreakTimer.hidden = false;
  breakClockRunning = false;
  breakClockStartBtn.innerHTML = "break off";
  breakTimer.resetTheObject(defaultBreakMinutes);
  clockIsRunning = false;
}

function getCurrentDate() {
  let format = new Date();
  // ADMIN control date test tool: format month/day/year etc. 4.6.2022, 6th of April 2022
  // return "11.4.2022";
  return (
    format.getMonth() +
    1 +
    "." +
    format.getDate() +
    "." +
    format.getUTCFullYear()
  );
}

function formatDateNicely(format) {
  if (format == null) {
    format = new Date();
  }

  let year = format.getUTCFullYear();
  if (format.getMonth() + 1 == 1 && format.getDate() == 1) {
    year = format.getUTCFullYear() + 1;
  }

  let day = format.getDate() < 10 ? "0" + format.getDate() : format.getDate();
  let month =
    format.getMonth() + 1 < 10
      ? "0" + (format.getMonth() + 1)
      : format.getMonth() + 1;
  return day + "." + month + "." + year;
}

function controlTheSpeed() {
  speed = !speed;

  if (speed) {
    howFast = 1;
  } else {
    howFast = 1000;
  }
  speedControlBtn.innerHTML = howFast == 1 ? "going fast" : "going slow";
  timer.clearInterval();
  timer.changeSpeed(howFast);
  breakTimer.clearInterval();
  breakTimer.changeSpeed(howFast);
  clockIsRunning = false;
  breakClockRunning = false;
  clockStartBtn.innerHTML = "focus off";
  breakClockStartBtn.innerHTML = "break off";
}

// add new Records here
function recordWorkout(type) {
  let dataObject = {
    time: type.toLowerCase(),
    date: getCurrentDate(),
  };

  const storage = initializeObject("localstorage");
  storage.check(storageNameRecordWorkout);
  storage.save(storageNameRecordWorkout, dataObject);
  storage.orderDatesFromHighToLow(storageNameRecordWorkout);
  const display = initializeObject("display");

  display.displayArrays(
    workoutTimeTable,
    storage.check(storageNameRecordWorkout),
    "workout"
  );
}

function recordRead(type) {
  let dataObject = {
    time: type.toLowerCase(),
    date: getCurrentDate(),
  };

  const storage = initializeObject("localstorage");
  storage.check(storageNameRecordRead);
  storage.save(storageNameRecordRead, dataObject);
  storage.orderDatesFromHighToLow(storageNameRecordRead);
  const display = initializeObject("display");

  display.displayArrays(
    readTimeTable,
    storage.check(storageNameRecordRead),
    "read"
  );
}

function recordNut(type) {
  let dataObject = {
    time: type.toLowerCase(),
    date: getCurrentDate(),
  };

  const storage = initializeObject("localstorage");
  storage.check(storageNameRecordNut);
  storage.save(storageNameRecordNut, dataObject);
  storage.orderDatesFromHighToLow(storageNameRecordNut);
  const display = initializeObject("display");

  display.displayArrays(
    nutTimeTable,
    storage.check(storageNameRecordNut),
    "nut"
  );
}

function recordSleep(type) {
  let dataObject = {
    time: type.toLowerCase(),
    date: getCurrentDate(),
  };

  const storage = initializeObject("localstorage");
  storage.check(storageNameRecordSleep);
  storage.save(storageNameRecordSleep, dataObject);
  storage.orderDatesFromHighToLow(storageNameRecordSleep);
  const display = initializeObject("display");

  display.displayArrays(
    sleepTimeTable,
    storage.check(storageNameRecordSleep),
    "sleep"
  );
}

// ************* ADMIN TOOLS *************
// 3 functions, add, add a collection of, remove entries
// remove function added by dev on sep 6 2020.
function adminRemove() {
  const storage = initializeObject("localstorage");

  let removeObject = {
    time: 0,
    date: "1.24.2021", // format needs to be month/day/year, ect. 11.5.2022
  };

  // add new Records here
  storage.remove(storageNameFocusDateAndTime, removeObject, "focus");
  storage.remove(storageNameRecordRead, removeObject, "read");
  storage.remove(storageNameRecordWorkout, removeObject, "workout");

  if (removeObject.date == getCurrentDate()) {
    storage.onlySaveOneData(totalCalculationFix, false);
    storage.onlySaveOneData(storageNameDailyTotalFocus, 0);
  }

  let currentDayCheck = storage.findItem(
    storageNameFocusDateAndTime,
    getCurrentDate()
  );

  if (currentDayCheck != null) {
    storage.onlySaveOneData(totalCalculationFix, true);
    storage.onlySaveOneData(storageNameDailyTotalFocus, currentDayCheck.time);
  }

  // Fix total focus time
  onInit();
}

function adminAdd() {
  const storage = initializeObject("localstorage");

  // Add additional records here
  let date = "1.8.2023";
  let focusTime = 120;
  let workout = "no";
  let read = "yes";
  let nut = "yes";

  // Add additional records here
  // Save the focus
  storage.save(storageNameFocusDateAndTime, adminCreateObject(focusTime, date));
  storage.orderDatesFromHighToLow(storageNameFocusDateAndTime);
  // Save workout
  storage.save(storageNameRecordWorkout, adminCreateObject(workout, date));
  storage.orderDatesFromHighToLow(storageNameRecordWorkout);
  //Save read
  storage.save(storageNameRecordRead, adminCreateObject(read, date));
  storage.orderDatesFromHighToLow(storageNameRecordRead);

  // Check if today was already recorded
  let currentDayCheck = storage.findItem(
    storageNameFocusDateAndTime,
    getCurrentDate()
  );
  if (currentDayCheck != null) {
    storage.onlySaveOneData(totalCalculationFix, true);
    storage.onlySaveOneData(storageNameDailyTotalFocus, currentDayCheck.time);
  }
  onInit();
}

// add a collection added by dev on dec 30 2020.
function adminAddCollection() {
  // Add additional records here
  let collection = [
    {
      date: "1.6.2023",
      focusTime: 120,
      read: "yes",
      workout: "no",
    },
    {
      date: "1.5.2023",
      focusTime: 15,
      read: "yes",
      workout: "yes",
    },
  ];

  // Add additional records here
  let storageNames = ["dailyDateAndTime", "recordRead", "recordWorkout"];

  const storage = initializeObject("localstorage");
  storage.saveCollection(storageNames, collection);
}

//ADMIN TOOLS NEW - Initializers
//   adminAdd();
//   adminRemove();
//   adminAddCollection();

// ***************************************

function adminCreateObject(time, date) {
  return (newObject = {
    time: time,
    date: date,
  });
}

function adminSetTotalFocusTime() {
  const storage = initializeObject("localstorage");
  let database = storage.check(storageNameFocusDateAndTime);
  let total = 0;
  for (let i = 0; i < database.length; i++) {
    total += database[i].time;
  }

  let currentDay = storage.findItem(
    storageNameFocusDateAndTime,
    getCurrentDate()
  );
  let totalToday = storage.check(storageNameDailyTotalFocus);

  if (currentDay == null) {
    currentDay = {
      time: 0,
    };
  }
  if (totalToday.length == 0) {
    totalToday = 0;
  }

  let result = 0;

  if (wasTheDayReset) {
    wasTheDayReset = false;
  } else {
    result = totalToday[0] - currentDay.time;
  }

  total += result;
  storage.onlySaveOneData(storageNameAllTimeTotalFocus, total);
}

function initializeObject(name) {
  switch (name.toLowerCase()) {
    case "localstorage":
      return new LocalStorage();
    case "timer":
      return new Timer();
    case "display":
      return new Display();
  }
}

// Initializers
function dailyReset() {
  const storage = initializeObject("localstorage");
  let savedDate = storage.check(storageNameDailyReset);

  if (savedDate.length == 0) {
    savedDate = getCurrentDate();
  }

  let currentDate = getCurrentDate();
  storage.onlySaveOneData(storageNameDailyReset, currentDate);

  if (savedDate != currentDate) {
    console.log("Next day");
    // Check the dailyTotalAmount
    let dailyAmount = storage.check(storageNameDailyTotalFocus)[0];
    if (dailyAmount == undefined) {
      dailyAmount = 0;
    }

    // Create focus data object
    let dataObject = {
      time: dailyAmount,
      date: savedDate,
    };

    // add new Records here

    let workoutObject = {
      time: storage.checkIfExists(storageNameRecordWorkout, savedDate),
      date: savedDate,
    };

    let readObject = {
      time: storage.checkIfExists(storageNameRecordRead, savedDate),
      date: savedDate,
    };

    // add new Records here

    // Save a workout into data base
    storage.save(storageNameRecordWorkout, workoutObject);
    storage.orderDatesFromHighToLow(storageNameRecordWorkout);

    // Save reading into data base
    storage.save(storageNameRecordRead, readObject);
    storage.orderDatesFromHighToLow(storageNameRecordRead);

    // Save the focus object to the data base
    storage.save(storageNameFocusDateAndTime, dataObject);
    storage.orderDatesFromHighToLow(storageNameFocusDateAndTime);
    storage.onlySaveOneData(totalCalculationFix, false);

    // Set dailyTotalAmount to 0
    storage.onlySaveOneData(storageNameDailyTotalFocus, 0);
    wasTheDayReset = true;
  } else if (savedDate == currentDate) {
    console.log("Todays date: " + formatDateNicely(new Date()));
  }
}

// Add new records in here
function onInit() {
  const storage = initializeObject("localstorage");
  const display = initializeObject("display");

  // Reset clock to default
  clockStartBtn.innerHTML = "focus off";
  breakClockStartBtn.innerHTML = "break off";
  breakTimer.resetTheObject(defaultBreakMinutes);
  timer.resetTheObject(defaultMinutes);

  adminSetTotalFocusTime();
  let amount = storage.check(storageNameDailyTotalFocus);
  let totalAmount = [];
  if (firstInit) {
    let element = storage.findItem(
      storageNameFocusDateAndTime,
      getCurrentDate()
    );
    if (element != null) {
      if (element.time > amount[0]) {
        amount = element == null ? 0 : element.time;
        storage.onlySaveOneData(storageNameDailyTotalFocus, amount);
      }
    }

    firstInit = false;
  } else {
    amount = storage.check(storageNameDailyTotalFocus);
  }
  totalAmount = storage.check(storageNameAllTimeTotalFocus);

  display.displayAmounts(
    expressingTotalText,
    amount[0] == 0 || amount.length == 0 ? 0 : amount
  ); // Display total focus amount
  display.displayAmounts(
    totalFocusAmountText,
    totalAmount[0] == 0 || totalAmount.length == 0 ? 0 : totalAmount
  ); // Display total focus amount

  // add new Records here
  display.displayArrays(
    focusTimeTable,
    storage.check(storageNameFocusDateAndTime),
    "focus"
  );
  display.displayArrays(
    workoutTimeTable,
    storage.check(storageNameRecordWorkout),
    "workout"
  );
  display.displayArrays(
    readTimeTable,
    storage.check(storageNameRecordRead),
    "read"
  );
  display.displayArrays(
    nutTimeTable,
    storage.check(storageNameRecordNut),
    "nut"
  );
  display.displayArrays(
    sleepTimeTable,
    storage.check(storageNameRecordSleep),
    "sleep"
  );

  if (storage.check(totalCalculationFix).length == 0) {
    storage.onlySaveOneData(totalCalculationFix, false);
  }
}

dailyReset();
onInit();
