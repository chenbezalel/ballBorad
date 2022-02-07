'use strict'

const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';

const GAMER_IMG = '<img src="img/gamer.png">';
const BALL_IMG = '<img src="img/ball.png">';
const GLUE_IMG = '<img src="img/glue.png">';

// Model:
var gBoard;
var gGamerPos;
var gCollectedCounter;
var gBallsCounter;
var gBallInterval;
var gGlueInterval;
var gIsCanMove;

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	gCollectedCounter = 0;
	gBallsCounter = 2;
	gIsCanMove = 'True';
	renderBoard(gBoard);
	gBallInterval = setInterval(addBall, 2000);
	gGlueInterval = setInterval(addGlue, 5000);
}

function addGlue() {
	var randomI = getRandomInt(1, gBoard.length - 2);
	var randomJ = getRandomInt(1, gBoard[0].length - 2);
	var randomCell = gBoard[randomI][randomJ];
	if (randomCell.gameElement) {
		var randomI = getRandomInt(1, gBoard.length - 2);
		var randomJ = getRandomInt(1, gBoard.length - 2);
		randomCell = gBoard[randomI][randomJ];
	}
	var gluePos = { i: randomI, j: randomJ };
	randomCell.gameElement = GLUE;
	renderCell(gluePos, GLUE_IMG);
	setTimeout(function () {
		randomCell.gameElement = null;
		renderCell(gluePos, '');
	}, 3000)
}

function addBall() {
	var randomI = getRandomInt(1, gBoard.length - 2);
	var randomJ = getRandomInt(1, gBoard[0].length - 2);
	var randomCell = gBoard[randomI][randomJ];
	if (randomCell.gameElement) {
		var randomI = getRandomInt(1, gBoard.length - 2);
		var randomJ = getRandomInt(1, gBoard.length - 2);
		randomCell = gBoard[randomI][randomJ];
	}
	var ballPos = { i: randomI, j: randomJ };
	randomCell.gameElement = BALL;
	renderCell(ballPos, BALL_IMG);
	gBallsCounter++
}

function buildBoard() {
	// Create the Matrix 10 * 12 
	var board = createMat(10, 12);
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var cell = { type: FLOOR, gameElement: null };
			if (i === 0 && j !== 5 || j === 0 && i !== 5 ||
				i === board.length - 1 && j !== 5 ||
				j === board[0].length - 1 && i !== 5) {
				cell.type = WALL;
			}
			board[i][j] = cell;
		}
	}
	// Place the gamer and two balls
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	board[2][6].gameElement = BALL;
	board[3][3].gameElement = BALL;
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var elBtn = document.querySelector('button');
	elBtn.style.display = 'none';

	var elH2 = document.querySelector('h2');
	elH2.style.display = 'none';

	var elBoard = document.querySelector('.board');
	var strHTML = '';

	var elH3 = document.querySelector('h3');
	elH3.innerHTML = `Number of balls collected: ${gCollectedCounter}`

	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j }); // cell-i-j

			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})" >\n`;


			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			} else if (currCell.gameElement === GLUE) {
				strHTML += GLUE_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	// console.log('strHTML is:');
	// console.log(strHTML);
	elBoard.innerHTML = strHTML;
}

function isCanMove(i, j) {
	if (gBoard[i][j].gameElement === GLUE) {
		gIsCanMove = false;
		setTimeout(function () { gIsCanMove = true }, 3000)
	}
}

// Move the player to a specific location
function moveTo(i, j) {

	// { type:WALL, gameElement:null }

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i); // 1-2 = -1 === 1
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	var collectBallSound = new Audio('sound/collectBall.wav');

	// If the clicked Cell is one of the four allowed

	if (gIsCanMove) {
		if (((iAbsDiff === 1 || iAbsDiff === 9) && jAbsDiff === 0) ||
			((jAbsDiff === 1 || jAbsDiff === 11) && iAbsDiff === 0)) {
			if (targetCell.gameElement === BALL) {
				collectBallSound.play();
				gCollectedCounter++;
				var elH3 = document.querySelector('h3');
				elH3.innerHTML = `Number of balls collected: ${gCollectedCounter}`
				gBallsCounter--;
				if (gBallsCounter === 0) gameOver();
			} else if (targetCell.gameElement === GLUE) {
				isCanMove(i, j);
			}

			// TODO: Move the gamer

			// MODEL
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;

			// DOM
			renderCell(gGamerPos, '');

			// update game pos
			gGamerPos = { i: i, j: j };

			// MODEL
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

			// DOM
			renderCell(gGamerPos, GAMER_IMG);

		} else console.log('TOO FAR', iAbsDiff, jAbsDiff);

	}
}

function gameOver() {
	clearInterval(gBallInterval);
	clearInterval(gGlueInterval);
	gIsCanMove = false;
	var elH2 = document.querySelector('h2');
	elH2.style.display = 'block';
	var elBtn = document.querySelector('button');
	elBtn.style.display = 'inline';
}

// Convert a location object {i, j} to a selector and render a value in that element

// .cell-0-0
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location);
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (event.key) {
		case 'ArrowLeft':
			if (i === 5 && j === 0) moveTo(5, 11);
			else moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			if (i === 5 && j === 11) moveTo(5, 0);
			else moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			if (j === 5 && i === 0) moveTo(9, 5);
			else moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			if (j === 5 && i === 9) moveTo(0, 5);
			moveTo(i + 1, j);
			break;
	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

