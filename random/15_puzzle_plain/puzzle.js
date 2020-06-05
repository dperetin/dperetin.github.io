let boardState = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0]
]

const solvedState = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0]
]; 

let zeroPosition = [3, 3];

let moveCounter = 0;

const board = document.querySelector('.board');

const shuffleButton = document.querySelector('.shuffle-button');

shuffleButton.addEventListener('click', function () {
    moveCounter = 0;
    updateMoveCounter();

    let solvedToast = document.querySelector('.solved_toast');
    solvedToast.classList.remove('solved_toast_visible');

    let moves = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ]

    for (let i = 0; i < 1000; i++) {

        let position = Math.floor(Math.random() * 4);

        let move = moves[position];

        if (zeroPosition[0] + move[0] >= 0 && zeroPosition[0] + move[0] < 4 && zeroPosition[1] + move[1] >= 0 && zeroPosition[1] + move[1] < 4) {
            boardState[zeroPosition[0]][zeroPosition[1]] = boardState[zeroPosition[0] + move[0]][zeroPosition[1] + move[1]];
            boardState[zeroPosition[0] + move[0]][zeroPosition[1] + move[1]] = 0;
            zeroPosition[0] = zeroPosition[0] + move[0];
            zeroPosition[1] = zeroPosition[1] + move[1];
        }
    }

    clearTheBoard();

    populateBoard(boardState);

})



function populateBoard(state) {
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            let cell = document.createElement('div');
            

            cell.setAttribute('data-x', i);
            cell.setAttribute('data-y', j);

            cell.classList.add('cell');

            cell.textContent = state[i][j];

            if (state[i][j] == 0) {
                cell.textContent = ''
                cell.classList.add('zero_cell');
                
            } else {
                cell.classList.add('number_cell');
            }


            cell.addEventListener('click', function cellClick() {
                swapElements(parseInt(cell.getAttribute('data-x')), parseInt(cell.getAttribute('data-y')));
            })

            board.insertAdjacentElement('beforeend', cell);
        }
    }

}

function isAdjecentToZero(x, y) {
    if (x - 1 == zeroPosition[0] && y == zeroPosition[1]) {
        return true;
    }

    if (x + 1 == zeroPosition[0] && y == zeroPosition[1]) {
        return true;
    }

    if (x == zeroPosition[0] && y - 1 == zeroPosition[1]) {
        return true;
    }

    if (x == zeroPosition[0] && y + 1 == zeroPosition[1]) {
        return true;
    }

    return false;
}

function swapElements(clickedX, clickedY) {
    if (!isAdjecentToZero(clickedX, clickedY)) {
        return;
    }

    moveCounter++;

    updateMoveCounter();

    boardState[zeroPosition[0]][zeroPosition[1]] = boardState[clickedX][clickedY];
    boardState[clickedX][clickedY] = 0;
    zeroPosition = [clickedX, clickedY];

    clearTheBoard();

    populateBoard(boardState);

    let solvedToast = document.querySelector('.solved_toast');

    if (eq(boardState, solvedState)) {
        solvedToast.classList.add('solved_toast_visible')
    } else {
        solvedToast.classList.remove('solved_toast_visible')
    }
}

populateBoard(boardState);

function clearTheBoard() {
    let cells = document.querySelectorAll('.cell');

    for (let i = 0; i < cells.length; i++) {
        cells[i].remove();
    }
}

function eq(a, b) {

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (a[i][j] != b[i][j]) {
                return false;
            }
        }
    }
    return true;
}

function updateMoveCounter() {
    let moveCounterElement = document.querySelector('.move_counter');

    moveCounterElement.textContent = `Moves: ${moveCounter}`;
}

