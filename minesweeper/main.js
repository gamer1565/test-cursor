/* Démineur — jeu complet en JavaScript, sans dépendances */

/** @typedef {{ row:number, col:number, isMine:boolean, isRevealed:boolean, isFlagged:boolean, adjacentMines:number }} Cell */

const difficultyPresets = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

const boardElement = document.getElementById("board");
const difficultySelect = document.getElementById("difficulty");
const customSettings = document.getElementById("custom-settings");
const inputRows = document.getElementById("rows");
const inputCols = document.getElementById("cols");
const inputMines = document.getElementById("mines");
const applyCustomButton = document.getElementById("apply-custom");
const resetButton = document.getElementById("reset-btn");
const timerElement = document.getElementById("timer");
const mineCounterElement = document.getElementById("mine-counter");
const flagToggleButton = document.getElementById("flag-toggle");

let cells = /** @type {Cell[]} */([]);
let rows = difficultyPresets.beginner.rows;
let cols = difficultyPresets.beginner.cols;
let totalMines = difficultyPresets.beginner.mines;
let remainingMines = totalMines;
let firstRevealPending = true;
let gameOver = false;
let revealedSafeCellCount = 0;
let flagMode = false; // mobile toggle

let timerId = null;
let elapsedSeconds = 0;

function formatCounter(value) {
  const clamped = Math.max(0, Math.min(999, value | 0));
  return clamped.toString().padStart(3, "0");
}

function indexOf(row, col) {
  return row * cols + col;
}

function inBounds(row, col) {
  return row >= 0 && row < rows && col >= 0 && col < cols;
}

function forEachNeighbor(row, col, fn) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (inBounds(nr, nc)) fn(nr, nc);
    }
  }
}

function resetTimer() {
  stopTimer();
  elapsedSeconds = 0;
  timerElement.textContent = formatCounter(0);
}

function startTimer() {
  if (timerId) return;
  timerId = setInterval(() => {
    elapsedSeconds += 1;
    timerElement.textContent = formatCounter(elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function updateMineCounter() {
  mineCounterElement.textContent = formatCounter(remainingMines);
}

function createEmptyBoard() {
  cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      });
    }
  }
}

function placeMinesExcluding(excludedRow, excludedCol) {
  const excluded = new Set();
  excluded.add(indexOf(excludedRow, excludedCol));
  forEachNeighbor(excludedRow, excludedCol, (nr, nc) => {
    excluded.add(indexOf(nr, nc));
  });

  let placed = 0;
  const availableIndices = [];
  for (let i = 0; i < cells.length; i++) {
    if (!excluded.has(i)) availableIndices.push(i);
  }

  if (totalMines >= availableIndices.length) {
    totalMines = Math.max(1, availableIndices.length - 1);
  }

  // Fisher-Yates shuffle for first totalMines picks
  for (let i = availableIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
  }

  for (let i = 0; i < totalMines; i++) {
    const idx = availableIndices[i];
    cells[idx].isMine = true;
    placed++;
  }
  // Ensure the displayed remaining mines matches the actual total after any adjustments
  remainingMines = totalMines;
}

function computeAdjacencyCounts() {
  for (const cell of cells) {
    if (cell.isMine) {
      cell.adjacentMines = 0;
      continue;
    }
    let count = 0;
    forEachNeighbor(cell.row, cell.col, (nr, nc) => {
      if (cells[indexOf(nr, nc)].isMine) count++;
    });
    cell.adjacentMines = count;
  }
}

function setBoardDimensions() {
  boardElement.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;
}

function renderBoard() {
  boardElement.innerHTML = "";
  setBoardDimensions();
  for (const cell of cells) {
    const button = document.createElement("button");
    button.className = "cell";
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", "Case non révélée");
    button.dataset.row = String(cell.row);
    button.dataset.col = String(cell.col);

    button.addEventListener("click", onCellPrimary);
    button.addEventListener("contextmenu", onCellSecondary);
    button.addEventListener("auxclick", (e) => {
      if (e.button === 1) onCellChord(e); // middle click chord
    });

    boardElement.appendChild(button);
  }
  syncAllCellViews();
}

function getCellButton(row, col) {
  return boardElement.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function syncCellView(cell) {
  const btn = getCellButton(cell.row, cell.col);
  if (!btn) return;

  btn.classList.toggle("revealed", cell.isRevealed);
  btn.classList.toggle("flagged", cell.isFlagged);
  btn.classList.toggle("mine", cell.isMine);

  if (cell.isRevealed) {
    btn.setAttribute("aria-label", cell.isMine ? "Mine" : `${cell.adjacentMines} mines adjacentes`);
    if (cell.isMine) {
      btn.textContent = "💣";
    } else if (cell.adjacentMines > 0) {
      btn.textContent = String(cell.adjacentMines);
      btn.classList.add(`n${cell.adjacentMines}`);
    } else {
      btn.textContent = "";
    }
  } else {
    btn.setAttribute("aria-label", cell.isFlagged ? "Drapeau" : "Case non révélée");
    btn.textContent = cell.isFlagged ? "🚩" : "";
    for (let n = 1; n <= 8; n++) btn.classList.remove(`n${n}`);
  }
}

function syncAllCellViews() {
  for (const cell of cells) syncCellView(cell);
  updateMineCounter();
}

function neighborsList(row, col) {
  const result = [];
  forEachNeighbor(row, col, (nr, nc) => result.push(cells[indexOf(nr, nc)]));
  return result;
}

function floodReveal(startRow, startCol) {
  const stack = [[startRow, startCol]];
  const visited = new Set();

  while (stack.length) {
    const [r, c] = stack.pop();
    const idx = indexOf(r, c);
    if (visited.has(idx)) continue;
    visited.add(idx);

    const cell = cells[idx];
    if (cell.isRevealed || cell.isFlagged) continue;
    cell.isRevealed = true;
    revealedSafeCellCount++;
    syncCellView(cell);

    if (cell.adjacentMines === 0) {
      forEachNeighbor(r, c, (nr, nc) => {
        const nIdx = indexOf(nr, nc);
        const nCell = cells[nIdx];
        if (!nCell.isRevealed && !nCell.isFlagged && !nCell.isMine) {
          stack.push([nr, nc]);
        }
      });
    }
  }
}

function revealAllMines() {
  for (const cell of cells) {
    if (cell.isMine) {
      cell.isRevealed = true;
      syncCellView(cell);
    }
  }
}

function checkWin() {
  const totalSafeCells = rows * cols - totalMines;
  if (revealedSafeCellCount >= totalSafeCells) {
    // Auto-flag remaining mines for satisfaction
    for (const cell of cells) {
      if (cell.isMine && !cell.isFlagged) {
        cell.isFlagged = true;
      }
    }
    gameOver = true;
    stopTimer();
    remainingMines = 0;
    updateMineCounter();
    resetButton.textContent = "😎";
    syncAllCellViews();
  }
}

function loseGame() {
  gameOver = true;
  stopTimer();
  revealAllMines();
  resetButton.textContent = "💥";
}

function onCellPrimary(event) {
  if (gameOver) return;
  const target = event.currentTarget;
  const r = Number(target.dataset.row);
  const c = Number(target.dataset.col);

  if (flagMode) {
    toggleFlag(r, c);
    return;
  }

  const cell = cells[indexOf(r, c)];
  if (cell.isFlagged || cell.isRevealed) return;

  if (firstRevealPending) {
    firstRevealPending = false;
    // Ensure first click is safe and pleasant
    placeMinesExcluding(r, c);
    computeAdjacencyCounts();
    startTimer();
  }

  if (cell.isMine) {
    // First click will never be a mine due to exclusion, but keep check for completeness
    loseGame();
    return;
  }

  if (cell.adjacentMines > 0) {
    cell.isRevealed = true;
    revealedSafeCellCount++;
    syncCellView(cell);
  } else {
    floodReveal(r, c);
  }
  checkWin();
}

function onCellSecondary(event) {
  event.preventDefault();
  if (gameOver) return;
  const target = event.currentTarget;
  const r = Number(target.dataset.row);
  const c = Number(target.dataset.col);
  toggleFlag(r, c);
}

function onCellChord(event) {
  if (gameOver) return;
  const target = event.currentTarget;
  const r = Number(target.dataset.row);
  const c = Number(target.dataset.col);
  const center = cells[indexOf(r, c)];
  if (!center.isRevealed || center.isMine) return;
  const neighbors = neighborsList(r, c);
  const flagsAround = neighbors.filter(n => n.isFlagged).length;
  if (flagsAround === center.adjacentMines) {
    for (const n of neighbors) {
      if (!n.isFlagged && !n.isRevealed) {
        if (n.isMine) {
          loseGame();
          return;
        }
      }
    }
    for (const n of neighbors) {
      if (!n.isFlagged && !n.isRevealed && !n.isMine) {
        if (n.adjacentMines === 0) floodReveal(n.row, n.col);
        else {
          n.isRevealed = true;
          revealedSafeCellCount++;
          syncCellView(n);
        }
      }
    }
    checkWin();
  }
}

function toggleFlag(row, col) {
  const cell = cells[indexOf(row, col)];
  if (cell.isRevealed) return;
  cell.isFlagged = !cell.isFlagged;
  remainingMines += cell.isFlagged ? -1 : 1;
  syncCellView(cell);
  updateMineCounter();
}

function validateCustomSettings(r, c, m) {
  const minSize = 5;
  const maxSize = 50;
  const rowsValid = Number.isFinite(r) && r >= minSize && r <= maxSize;
  const colsValid = Number.isFinite(c) && c >= minSize && c <= maxSize;
  const maxMines = r * c - 9; // keep first click area clear
  const minesValid = Number.isFinite(m) && m >= 1 && m <= Math.max(1, maxMines);
  return rowsValid && colsValid && minesValid;
}

function newGame(newRows, newCols, newMines) {
  rows = newRows;
  cols = newCols;
  totalMines = newMines;
  remainingMines = totalMines;
  firstRevealPending = true;
  gameOver = false;
  revealedSafeCellCount = 0;
  flagMode = false;
  flagToggleButton.setAttribute("aria-pressed", "false");
  resetButton.textContent = "🙂";
  resetTimer();
  createEmptyBoard();
  renderBoard();
  updateMineCounter();
}

function applyPreset(name) {
  const preset = difficultyPresets[name];
  if (!preset) return;
  newGame(preset.rows, preset.cols, preset.mines);
}

function initUI() {
  difficultySelect.addEventListener("change", () => {
    const val = difficultySelect.value;
    if (val === "custom") {
      customSettings.hidden = false;
    } else {
      customSettings.hidden = true;
      applyPreset(val);
    }
  });

  applyCustomButton.addEventListener("click", () => {
    const r = Number(inputRows.value);
    const c = Number(inputCols.value);
    const m = Number(inputMines.value);
    if (!validateCustomSettings(r, c, m)) {
      alert("Valeurs invalides. Tailles 5–50 et mines raisonnables.");
      return;
    }
    difficultySelect.value = "custom";
    customSettings.hidden = false;
    newGame(r, c, m);
  });

  resetButton.addEventListener("click", () => {
    const mode = difficultySelect.value;
    if (mode === "custom") {
      const r = Number(inputRows.value);
      const c = Number(inputCols.value);
      const m = Number(inputMines.value);
      if (!validateCustomSettings(r, c, m)) {
        applyPreset("beginner");
      } else {
        newGame(r, c, m);
      }
    } else {
      applyPreset(mode);
    }
  });

  flagToggleButton.addEventListener("click", () => {
    flagMode = !flagMode;
    flagToggleButton.setAttribute("aria-pressed", flagMode ? "true" : "false");
    flagToggleButton.textContent = flagMode ? "🚩 Mode drapeau (ON)" : "🚩 Mode drapeau";
  });
}

function bootstrap() {
  initUI();
  applyPreset("beginner");
}

bootstrap();