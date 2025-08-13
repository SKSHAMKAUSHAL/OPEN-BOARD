// ===== DOM & Canvas =====
const canvas = document.querySelector("canvas");
const tool = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const pencilColor = document.querySelectorAll(".pencil-color");
const pencilWidthElem = document.querySelector(".pencil-width");
const eraserWidthElem = document.querySelector(".eraser-width");
const download = document.querySelector(".download");
const redo = document.querySelector(".redo");
const undo = document.querySelector(".undo");

// ===== Drawing State =====
let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = []; // data URLs
let track = 0;            // current index in history
let mouseDown = false;

// init tool style
tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

// save an initial blank state so Undo has a floor
(function initBlankState() {
  const blank = canvas.toDataURL();
  undoRedoTracker.push(blank);
  track = 0;
})();

// ===== Helpers =====
function saveState() {
  const url = canvas.toDataURL();
  if (undoRedoTracker[track] === url) return; // avoid duplicates
  // trim forward history if we draw after undo
  undoRedoTracker = undoRedoTracker.slice(0, track + 1);
  undoRedoTracker.push(url);
  track = undoRedoTracker.length - 1;
}

function restoreFromHistory(targetTrack, tracker) {
  track = targetTrack;
  undoRedoTracker = tracker;

  const url = undoRedoTracker[track];
  if (!url) return;

  const img = new Image();
  img.src = url;
  img.onload = () => {
    tool.clearRect(0, 0, canvas.width, canvas.height);
    tool.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}

function beginPath(strokeObj) {
  tool.beginPath();
  tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj) {
  tool.strokeStyle = strokeObj.color;
  tool.lineWidth = strokeObj.width;
  tool.lineTo(strokeObj.x, strokeObj.y);
  tool.stroke();
}

// ===== Mouse events =====
canvas.addEventListener("mousedown", (e) => {
  mouseDown = true;
  const data = { x: e.clientX, y: e.clientY };
  socket.emit("beginPath", data);
});

canvas.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;
  const data = {
    x: e.clientX,
    y: e.clientY,
    color: eraserFlag ? eraserColor : penColor,
    width: eraserFlag ? eraserWidth : penWidth
  };
  socket.emit("drawStroke", data);
});

canvas.addEventListener("mouseup", () => {
  mouseDown = false;
  saveState();
});

// ===== Undo / Redo =====
undo.addEventListener("click", () => {
  if (track <= 0) return;
  const nextTrack = track - 1;
  const data = { trackValue: nextTrack, undoRedoTracker };
  socket.emit("redoUndo", data);
  restoreFromHistory(nextTrack, undoRedoTracker);
});

redo.addEventListener("click", () => {
  if (track >= undoRedoTracker.length - 1) return;
  const nextTrack = track + 1;
  const data = { trackValue: nextTrack, undoRedoTracker };
  socket.emit("redoUndo", data);
  restoreFromHistory(nextTrack, undoRedoTracker);
});

// ===== UI Controls =====
pencilColor.forEach((colorElem) => {
  colorElem.addEventListener("click", () => {
    const color = colorElem.classList[0];
    penColor = color;
    tool.strokeStyle = penColor;
  });
});

pencilWidthElem.addEventListener("change", () => {
  penWidth = pencilWidthElem.value;
  tool.lineWidth = penWidth;
});

eraserWidthElem.addEventListener("change", () => {
  eraserWidth = eraserWidthElem.value;
  tool.lineWidth = eraserWidth;
});

eraser.addEventListener("click", () => {
  if (eraserFlag) {
    tool.strokeStyle = eraserColor;
    tool.lineWidth = eraserWidth;
  } else {
    tool.strokeStyle = penColor;
    tool.lineWidth = penWidth;
  }
});

download.addEventListener("click", () => {
  const url = canvas.toDataURL();
  const a = document.createElement("a");
  a.href = url;
  a.download = "board.jpg";
  a.click();
});

// ===== Socket listeners =====
socket.on("beginPath", beginPath);
socket.on("drawStroke", drawStroke);
socket.on("redoUndo", (data) => restoreFromHistory(data.trackValue, data.undoRedoTracker));



















// let canvas = document.querySelector("canvas");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// let pencilColor = document.querySelectorAll(".pencil-color");
// let pencilWidthElem = document.querySelector(".pencil-width");
// let eraserWidthElem = document.querySelector(".eraser-width");
// let download = document.querySelector(".download");
// let redo = document.querySelector(".redo");
// let undo = document.querySelector(".undo");

// let penColor = "red";
// let eraserColor = "white";
// let penWidth = pencilWidthElem.value;
// let eraserWidth = eraserWidthElem.value;

// let undoRedoTracker = []; //Data
// let track = 0; // Represent which action from tracker array

// let mouseDown = false;

// // API
// let tool = canvas.getContext("2d");

// tool.strokeStyle = penColor;
// tool.lineWidth = penWidth;

// // mousedown -> start new path, mousemove -> path fill (graphics)
// canvas.addEventListener("mousedown", (e) => {
//     mouseDown = true;
//     let data = {
//         x: e.clientX,
//         y: e.clientY
//     }
//     // send data to server
//     socket.emit("beginPath", data);
// })
// canvas.addEventListener("mousemove", (e) => {
//     if (mouseDown) {
//         let data = {
//             x: e.clientX,
//             y: e.clientY,
//             color: eraserFlag ? eraserColor : penColor,
//             width: eraserFlag ? eraserWidth : penWidth
//         }
//         socket.emit("drawStroke", data);
//     }
// })
// canvas.addEventListener("mouseup", (e) => {
//     mouseDown = false;

//     let url = canvas.toDataURL();
//     undoRedoTracker.push(url);
//     track = undoRedoTracker.length-1;
// })

// undo.addEventListener("click", (e) => {
//     if (track > 0) track--;
//     // track action
//     let data = {
//         trackValue: track,
//         undoRedoTracker
//     }
//     socket.emit("redoUndo", data);
// })
// redo.addEventListener("click", (e) => {
//     if (track < undoRedoTracker.length-1) track++;
//     // track action
//     let data = {
//         trackValue: track,
//         undoRedoTracker
//     }
//     socket.emit("redoUndo", data);
// })

// function undoRedoCanvas(trackObj) {
//     track = trackObj.trackValue;
//     undoRedoTracker = trackObj.undoRedoTracker;

//     let url = undoRedoTracker[track];
//     let img = new Image(); // new image reference element
//     img.src = url;
//     img.onload = (e) => {
//         tool.drawImage(img, 0, 0, canvas.width, canvas.height);
//     }
// }

// function beginPath(strokeObj) {
//     tool.beginPath();
//     tool.moveTo(strokeObj.x, strokeObj.y);
// }
// function drawStroke(strokeObj) {
//     tool.strokeStyle = strokeObj.color;
//     tool.lineWidth = strokeObj.width;
//     tool.lineTo(strokeObj.x, strokeObj.y);
//     tool.stroke();
// }

// pencilColor.forEach((colorElem) => {
//     colorElem.addEventListener("click", (e) => {
//         let color = colorElem.classList[0];
//         penColor = color;
//         tool.strokeStyle = penColor;
//     })
// })

// pencilWidthElem.addEventListener("change", (e) => {
//     penWidth = pencilWidthElem.value;
//     tool.lineWidth = penWidth;
// })
// eraserWidthElem.addEventListener("change", (e) => {
//     eraserWidth = eraserWidthElem.value;
//     tool.lineWidth = eraserWidth;
// })
// eraser.addEventListener("click", (e) => {
//     if (eraserFlag) {
//         tool.strokeStyle = eraserColor;
//         tool.lineWidth = eraserWidth;
//     } else {
//         tool.strokeStyle = penColor;
//         tool.lineWidth = penWidth;
//     }
// })

// download.addEventListener("click", (e) => {
//     let url = canvas.toDataURL();

//     let a = document.createElement("a");
//     a.href = url;
//     a.download = "board.jpg";
//     a.click();
// })


// socket.on("beginPath", (data) => {
//     // data -> data from server
//     beginPath(data);
// })
// socket.on("drawStroke", (data) => {
//     drawStroke(data);
// })
// socket.on("redoUndo", (data) => {
//     undoRedoCanvas(data);
// })