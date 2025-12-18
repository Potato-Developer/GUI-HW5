# HW5 – Scrabble Drag-and-Drop Game  
**Author:** Obadah Shikh Khamis 
**Course:** UMass Lowell – COMP 4610 GUI Programming I  

---

## Live Demo (GitHub Pages)
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/

## Source Code Repository
https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME

---

## Overview
This project is a simplified Scrabble game implemented using HTML, CSS, JavaScript, jQuery, and jQuery-UI.  
The game allows the player to drag tiles from a rack onto a one-row Scrabble board, form words, validate them through a dictionary API, and earn points with Scrabble-style scoring and bonus squares.

---

## Features Implemented (Fully Working)

### **Tile System**
- Random tile draw respecting real Scrabble letter distributions  
- Tile bag count updates and displays remaining tiles  
- Rack refills to 7 letters when requested  
- Tile images dynamically loaded  

### **Board + Drag/Drop**
- 15-square Scrabble row with bonus squares  
- Tiles draggable via jQuery-UI  
- Board cells droppable; rejects collisions  
- Rack droppable (tiles return properly)

### **Scoring**
- Letter score calculation  
- Double-word squares applied correctly  
- Running total score  
- Highest score tracking  

### **Word Validation**
- API validation (dictionaryapi.dev)  
- Fallback offline dictionary for 2-letter words  
- Prevents scoring the same word twice  

### **UI / UX**
- Modal pop-ups for success/errors  
- Clear Board, Refresh Letters, and Start Over buttons  
- Proper game reset including tile bag  
- Responsive layout and polished UI  

---

## Known Issues
Example:
- Dragging tiles too quickly may cause small visual misalignment.
- The board currently supports only a single row (by assignment design).

---

## File Structure
