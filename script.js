/*
  HW5 : Scrabble Drag-and-Drop Game
  Author: Obadah Shikh Khamis
  Course:   UMass Lowell COMP 4610 GUI I
  Date: 12/17/2025

  Description:
    This file is part of Homework 5 and implements a simplified Scrabble
    drag-and-drop game. It includes tile bag management, a rack system,
    a one-row Scrabble board, scoring logic, bonus squares, word
    validation through API + fallback dictionary, and full game state
    reset functionality.

  Acknowledgements:
    • Scrabble tile distribution file: Jesse Heines (included in assignment)
    • All work is my own except for starter assets provided in HW instructions.
*/



$(function () {
  const $overlay = $("#scrabble-board-overlay");
  const $rack = $("#tile-rack");
  const $score = $("#score");
  const $word = $("#current-word");
  const $remaining = $("#remaining-tiles");
  const $high = $("#highest-score");
  const $modal = $("#modal");
  const $modalMsg = $("#modal-message");


  const BOARD_SIZE = 15;
  const BONUS_IDX = new Set([3, 11]); 
  let totalScore = 0;
  let bestScore = 0;
  let usedWords = new Set();

 
  const fallbackWords = [
    "aa","ab","ad","ae","ag","ah","ai","al","am","an","ar","as","at","aw","ax","ay",
    "ba","be","bi","bo","by",
    "da","de","do",
    "ed","ef","eh","el","em","en","er","es","et","ex",
    "fa","fe",
    "go",
    "ha","he","hi","ho",
    "id","if","in","is","it",
    "jo",
    "ka","ki",
    "la","li","lo",
    "ma","me","mi","mm","mo","mu","my",
    "na","ne","no","nu",
    "od","oe","of","oh","oi","om","on","op","or","os","ow","ox","oy",
    "pa","pe","pi",
    "qi",
    "re",
    "sh","si","so",
    "ta","te","ti","to",
    "uh","um","un","up","us","ut",
    "we","wo",
    "xi","xu",
    "ya","ye","yo",
    "za"
  ];

  
  function showModal(message, tone = "green") {
    $modalMsg.text(message);
    $modalMsg.css("color", tone);
    $modal.removeClass("hidden");
  }

  function closeModal() {
    $modal.addClass("hidden");
  }

  function tileImg(letter) {
    if (letter === "_") return "./Scrabble_Tiles/Scrabble_Tile_Blank.jpg";
    return `./Scrabble_Tiles/Scrabble_Tile_${letter}.jpg`;
  }

  function remainingCount() {
   
    let sum = 0;
    for (const k in ScrabbleTiles) {
      if (ScrabbleTiles.hasOwnProperty(k) && ScrabbleTiles[k] && typeof ScrabbleTiles[k]["number-remaining"] === "number") {
        sum += ScrabbleTiles[k]["number-remaining"];
      }
    }
    return sum;
  }

  function availableLetters() {
    
    const keys = [];
    for (const k in ScrabbleTiles) {
      if (!ScrabbleTiles.hasOwnProperty(k)) continue;
      const obj = ScrabbleTiles[k];
      if (!obj) continue;
      if (typeof obj["number-remaining"] !== "number") continue;
      if (obj["number-remaining"] > 0) keys.push(k);
    }
    return keys;
  }

  function buildBoard() {
    $overlay.empty();
    for (let i = 0; i < BOARD_SIZE; i++) {
      const bonusClass = BONUS_IDX.has(i) ? "double-word-score" : "";
      $overlay.append(`<div class="board-cell ${bonusClass}" data-cell="${i}"></div>`);
    }
    makeBoardDroppable();
  }

  function makeBoardDroppable() {
    $(".board-cell").droppable({
      accept: ".tile",
      hoverClass: "droppable-hover",
      drop: function (_event, ui) {
        const $tile = ui.draggable;
        const $cell = $(this);

    
        if ($cell.children(".tile").length > 0) {
          sendTileToRack($tile);
          showModal("That spot is taken — tile returned to rack.", "red");
          return;
        }

        
        $cell.append($tile);
        $tile.css({ top: "0", left: "0", position: "absolute" });

        $cell.data("tile", {
          letter: $tile.data("letter"),
          value: Number($tile.data("value"))
        });
      }
    });
  }


  function makeRackDroppable() {
    $rack.droppable({
      accept: ".tile",
      hoverClass: "droppable-hover",
      drop: function (_event, ui) {
        const $tile = ui.draggable;
       
        const $parentCell = $tile.parent(".board-cell");
        if ($parentCell.length) $parentCell.removeData("tile");
        sendTileToRack($tile);
      }
    });
  }

  function sendTileToRack($tile) {
    $rack.append($tile);
    $tile.css({ top: "0", left: "0", position: "relative" });
  }

  function makeTilesDraggable() {
    $(".tile").draggable({
      revert: "invalid",
      cursor: "move",
      stack: ".tile",
      containment: "document"
    });
  }

  function drawRackTiles() {
    $rack.empty();

    let pool = availableLetters();
    if (pool.length === 0) {
      $remaining.text("0");
      showModal("No tiles left in the bag.", "red");
      return;
    }

    const drawCount = Math.min(7, remainingCount());
    for (let i = 0; i < drawCount; i++) {
      pool = availableLetters();
      if (pool.length === 0) break;

      const pick = pool[Math.floor(Math.random() * pool.length)];
    
      ScrabbleTiles[pick]["number-remaining"]--;

      $rack.append(`
        <div class="tile"
             data-letter="${pick}"
             data-value="${ScrabbleTiles[pick].value}"
             style="background-image:url('${tileImg(pick)}'); width:80px; height:80px;">
        </div>
      `);
    }

    $remaining.text(remainingCount());
    makeTilesDraggable();
    makeRackDroppable();
  }


  function readWordFromBoard() {
    let out = "";
    $(".board-cell").each(function () {
      const t = $(this).data("tile");
      if (t) out += t.letter;
    });
    $word.text(out);
    return out;
  }

  function scoreCurrentBoardWord() {
    let sum = 0;
    let wordMult = 1;

    $(".board-cell").each(function () {
      const $cell = $(this);
      const t = $cell.data("tile");
      if (!t) return;

      sum += t.value;
      if ($cell.hasClass("double-word-score")) wordMult *= 2;
    });

    const wordScore = sum * wordMult;
    totalScore += wordScore;
    $score.text(totalScore);

    if (totalScore > bestScore) {
      bestScore = totalScore;
      $high.text(bestScore);
    }

    return wordScore;
  }

  // ---------- the function to validate the words ----------
  function validateWord(wordRaw) {
    const w = (wordRaw || "").trim().toLowerCase();

    if (w.length < 2) {
      showModal("Word must be at least 2 letters.", "red");
      return;
    }

    if (usedWords.has(w)) {
      showModal(`"${w.toUpperCase()}" was already validated.`, "black");
      return;
    }

    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${w}`;

    $.ajax({
      url,
      method: "GET",
      success: function () {
        usedWords.add(w);
        const earned = scoreCurrentBoardWord();
        showModal(`Valid: "${w.toUpperCase()}" (+${earned})`, "green");
      },
      error: function () {
        if (fallbackWords.includes(w)) {
          usedWords.add(w);
          const earned = scoreCurrentBoardWord();
          showModal(`Valid: "${w.toUpperCase()}" (+${earned})`, "green");
        } else {
          showModal(`Not valid: "${w.toUpperCase()}".`, "red");
        }
      }
    });
  }

  // ---------- this functions clears the board ----------
  function clearBoardToRack() {
    $(".board-cell").each(function () {
      const $cell = $(this);
      const $tile = $cell.children(".tile");
      if ($tile.length) sendTileToRack($tile);
      $cell.removeData("tile");
    });
  }

  function resetGameFully() {
   
    for (const k in ScrabbleTiles) {
      if (!ScrabbleTiles.hasOwnProperty(k)) continue;
      const obj = ScrabbleTiles[k];
      if (!obj) continue;
      if (typeof obj["original-distribution"] === "number") {
        obj["number-remaining"] = obj["original-distribution"];
      }
    }

    usedWords.clear();
    totalScore = 0;
    $score.text("0");
    $word.text("");
    $remaining.text(remainingCount());

    buildBoard();
    drawRackTiles();
  }

  
  $("#close-modal").on("click", closeModal);

  $("#validate-word").on("click", function () {
    const w = readWordFromBoard();
    validateWord(w);
  });

  $("#refresh-letters").on("click", function () {
    clearBoardToRack();
    usedWords.clear();
    drawRackTiles();
    showModal("New rack tiles drawn.", "white");
  });

  $("#clear-board").on("click", function () {
    clearBoardToRack();
    showModal("Board cleared.", "white");
  });

  $("#new-game").on("click", function () {
    resetGameFully();
    showModal("New game started.", "white");
  });

  
  buildBoard();
  
  $remaining.text(remainingCount());
  $high.text(bestScore ? bestScore : "–");
  drawRackTiles();
});
