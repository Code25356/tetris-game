# Simple Tetris Game

A web-based Tetris game that can be easily run on your local machine.

## Features

- Classic Tetris gameplay
- Score tracking
- Level progression
- Next piece preview
- Responsive design for different screen sizes

## How to Run

There are two simple ways to run this game:

### Method 1: Open the HTML file directly

1. Download or clone this repository to your local machine
2. Open the `index.html` file in your web browser

### Method 2: Use a local server

If you have Python installed:

1. Open a terminal/command prompt
2. Navigate to the directory containing the game files
3. Run one of the following commands:
   - Python 3: `python -m http.server`
   - Python 2: `python -m SimpleHTTPServer`
4. Open your web browser and go to `http://localhost:8000`

## Game Controls

- **Left/Right Arrow Keys**: Move the tetromino left or right
- **Down Arrow Key**: Move the tetromino down faster
- **Up Arrow Key**: Rotate the tetromino
- **Space Bar**: Hard drop (instantly drop the tetromino)
- **Start/Pause Button**: Start or pause the game

## Game Rules

- The game ends when the pieces stack up to the top of the board
- Complete a horizontal line to clear it and earn points
- Points increase with the number of lines cleared simultaneously
- The game speed increases as you level up

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- HTML5 Canvas for rendering

Enjoy playing!