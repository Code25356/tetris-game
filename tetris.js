// Canvas setup
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('next-piece');
const nextPieceCtx = nextPieceCanvas.getContext('2d');

// Game constants
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const NEXT_BLOCK_SIZE = 20;
const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

// Game variables
let board = createBoard();
let score = 0;
let lines = 0;
let level = 1;
let dropInterval = 1000; // milliseconds
let lastTime = 0;
let dropCounter = 0;
let gameOver = false;
let isPaused = true;
let animationId = null;

// Tetromino shapes
const SHAPES = [
    null,
    // I
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // J
    [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    // L
    [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    // O
    [
        [4, 4],
        [4, 4]
    ],
    // S
    [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    // T
    [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    // Z
    [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
];

// Player object
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    nextPiece: null
};

// DOM elements
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const levelElement = document.getElementById('level');
const startButton = document.getElementById('start-button');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// Create empty game board
function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// Create a random tetromino
function createPiece() {
    const pieces = 'IJLOSTZ';
    const randPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const index = pieces.indexOf(randPiece) + 1;
    return SHAPES[index];
}

// Draw a single block
function drawBlock(x, y, color, context, blockSize) {
    context.fillStyle = color;
    context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    context.strokeStyle = '#000';
    context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

// Draw the game board
function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(x, y, COLORS[value], ctx, BLOCK_SIZE);
            }
        });
    });
}

// Draw the current tetromino
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(
                    x + offset.x,
                    y + offset.y,
                    COLORS[value],
                    ctx,
                    BLOCK_SIZE
                );
            }
        });
    });
}

// Draw the next piece preview
function drawNextPiece() {
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    if (!player.nextPiece) return;
    
    // Center the piece in the preview canvas
    const offset = {
        x: Math.floor((5 - player.nextPiece[0].length) / 2),
        y: Math.floor((5 - player.nextPiece.length) / 2)
    };
    
    player.nextPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(
                    x + offset.x,
                    y + offset.y,
                    COLORS[value],
                    nextPieceCtx,
                    NEXT_BLOCK_SIZE
                );
            }
        });
    });
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawMatrix(player.matrix, player.pos);
    drawNextPiece();
}

// Check for collision
function collide(board, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (board[y + o.y] === undefined ||
                 board[y + o.y][x + o.x] === undefined ||
                 board[y + o.y][x + o.x] !== 0)) {
                return true;
            }
        }
    }
    return false;
}

// Merge the tetromino with the board
function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Rotate the tetromino
function rotate(matrix, dir) {
    // Transpose the matrix
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    
    // Reverse each row to get a rotated matrix
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Player rotation with collision detection
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    
    // Handle collision during rotation
    while (collide(board, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// Move the tetromino down
function playerDrop() {
    player.pos.y++;
    if (collide(board, player)) {
        player.pos.y--;
        merge(board, player);
        playerReset();
        clearLines();
        updateScore();
    }
    dropCounter = 0;
}

// Hard drop the tetromino
function playerHardDrop() {
    while (!collide(board, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(board, player);
    playerReset();
    clearLines();
    updateScore();
    dropCounter = 0;
}

// Move the tetromino left or right
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(board, player)) {
        player.pos.x -= dir;
    }
}

// Reset player after a tetromino is placed
function playerReset() {
    // Set the current piece to the next piece or create a new one
    player.matrix = player.nextPiece || createPiece();
    player.nextPiece = createPiece();
    
    // Position the piece at the top-center of the board
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
    
    // Check for game over
    if (collide(board, player)) {
        gameOver = true;
        finalScoreElement.textContent = score;
        gameOverElement.classList.remove('hidden');
        cancelAnimationFrame(animationId);
    }
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    outer: for (let y = board.length - 1; y >= 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        
        // Remove the completed line
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        ++y; // Check the same row again
        
        linesCleared++;
    }
    
    if (linesCleared > 0) {
        // Update lines and level
        lines += linesCleared;
        level = Math.floor(lines / 10) + 1;
        
        // Calculate score based on number of lines cleared
        const linePoints = [40, 100, 300, 1200]; // Points for 1, 2, 3, 4 lines
        score += linePoints[linesCleared - 1] * level;
        
        // Update drop speed based on level
        dropInterval = 1000 * Math.pow(0.8, level - 1);
    }
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;
    linesElement.textContent = lines;
    levelElement.textContent = level;
}

// Main game loop
function update(time = 0) {
    if (gameOver || isPaused) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    
    draw();
    animationId = requestAnimationFrame(update);
}

// Handle keyboard controls
document.addEventListener('keydown', event => {
    if (gameOver || isPaused) return;
    
    switch (event.key) {
        case 'ArrowLeft': // Left arrow
            playerMove(-1);
            break;
        case 'ArrowRight': // Right arrow
            playerMove(1);
            break;
        case 'ArrowDown': // Down arrow
            playerDrop();
            break;
        case 'ArrowUp': // Up arrow
            playerRotate(1);
            break;
        case ' ': // Space
            playerHardDrop();
            break;
    }
});

// Start/Pause button
startButton.addEventListener('click', () => {
    if (gameOver) {
        resetGame();
    } else {
        isPaused = !isPaused;
        if (!isPaused) {
            lastTime = 0;
            update();
        }
    }
});

// Restart button
restartButton.addEventListener('click', () => {
    resetGame();
    gameOverElement.classList.add('hidden');
});

// Reset the game
function resetGame() {
    board = createBoard();
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 1000;
    gameOver = false;
    isPaused = false;
    updateScore();
    
    player.nextPiece = createPiece();
    playerReset();
    
    lastTime = 0;
    update();
}

// Initialize the game
player.nextPiece = createPiece();
playerReset();
draw();
