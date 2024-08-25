function GameBoard(){
    const rows = 3;
    const columns = 3;
    let board = [];
    let disabled = false;

    // Create a 2d array that will represent the state of the game board
    // For this 2d array, row 0 will represent the top row and
    // column 0 will represent the left-most column.
    const resetBoard = () => {
        for (let i = 0; i < rows; i++) {
            board[i] = []
            for (let j = 0; j < columns; j++) {
                board[i].push(Cell())
            }
        }
    }
    resetBoard();

    // board value getter
    const getBoard = () => board;

    // addToken function
    const addToken = (row,column,token) => {
        board[row][column].addValue(token)
    }

    // disabled value getter and setter
    const getDisabled = () => disabled;
    const setDisabled = () => disabled = !disabled



    return { getBoard, addToken, resetBoard, getDisabled, setDisabled }

};
function Cell(){
    let value = "";

    // cell value getter
    const getValue = () => value

    // add cell value
    const addValue = (token) => {
        value = token
    }

    return { getValue, addValue }
}


function GameController(){
    let gameBoard = GameBoard()
    let turnsCount = 0;
    
    let players = [
        {
            playerName: "player 1", token: "x"
        },
        {
            playerName: "player 2", token: "o"
        }
    ]

    // let default it to player 1
    let activePlayer = players[0]

    // players getter
    const getPlayers = () => players

    // activePlayer value getter
    const getActivePlayer = () => activePlayer

    // turnsCount getter and reseter
    const getTurnsCount = () => turnsCount
    const resetTurnsCount = () => turnsCount = 0


    const addToken = (tokens) => {
        players[0].token = tokens.firstPlayer
        players[1].token = tokens.secondPlayer
    }

    switchActivePlayer = () => {
        activePlayer = activePlayer == players[0] ? players[1] : players[0]
    }

    playRound = (row,column) => {
        gameBoard.addToken(row,column,activePlayer.token)
    }

    checkWinner = (row,column) => {
        // check if there is a row filled with same token
        let winnningRow = gameBoard.getBoard()[row].filter((cell) => cell.getValue() === getActivePlayer().token)
        // check if there is a column filled with same token
        let transposedboard = []
        for (let i = 0; i < gameBoard.getBoard().length; i++) {
            
            for (let j = 0; j < gameBoard.getBoard()[i].length; j++) {
                if(!transposedboard[j]) transposedboard[j] = []
                transposedboard[j].push(gameBoard.getBoard()[i][j]) 
            }
        }
        let winningColumn = transposedboard[column].filter((cell) => cell.getValue() === getActivePlayer().token)
        // check diagonal win
        const diagonalWin =  (gameBoard.getBoard()[0][0].getValue() == gameBoard.getBoard()[1][1].getValue()) && (gameBoard.getBoard()[1][1].getValue() == gameBoard.getBoard()[2][2].getValue()) &&  (gameBoard.getBoard()[2][2].getValue() == getActivePlayer().token)
                          || (gameBoard.getBoard()[0][2].getValue() == gameBoard.getBoard()[1][1].getValue()) && (gameBoard.getBoard()[1][1].getValue() == gameBoard.getBoard()[2][0].getValue()) &&  (gameBoard.getBoard()[2][0].getValue() == getActivePlayer().token)       
        
        
        
        // check the game winner
        if(winnningRow.length == 3 || winningColumn.length == 3 || diagonalWin) {
            gameBoard.setDisabled()
        }
        else{
            turnsCount++;
            switchActivePlayer();
        }
    }

    return { playRound, board: gameBoard.getBoard() ,getTurnsCount,resetTurnsCount, checkWinner, addToken, getPlayers, resetBoard: gameBoard.resetBoard, getDisabled: gameBoard.getDisabled, setDisabled: gameBoard.setDisabled, getActivePlayer}
}



function displayController(){
    const game = GameController();
    // the board div
    const boardDiv = document.querySelector(".boardDiv")

    // the choose token modal divs
    const tokenModal = document.querySelector("#tokenChoice")
    const form = document.querySelector("#tokenchoice-form");
    
    // divs to showcase the tokens chosen by the players
    const firstPlayerToken = document.querySelector(".first-player-token")
    const secondPlayerToken = document.querySelector(".second-player-token")
    
    const restartButton = document.querySelector(".restart")

    // progress bar where i tell which player turn it is or the winner identity
    const progress = document.querySelector(".progress")

    // updating the screen and the board function
    const updateScreen = () => {  
        // fill progress div with the specific player turn and also reset the turn count if a draw happens
        if (!game.getDisabled() && game.getTurnsCount() != 9) progress.textContent = game.getActivePlayer().playerName + " turn"
        else game.resetTurnsCount()

        // emptying the board
        boardDiv.textContent = ""

        game.board.forEach((row,rowIndex) => {
            row.forEach((cell,index) => {
                let button = document.createElement("button")
                button.className = "cell"
                button.dataset.column = index
                button.dataset.row = rowIndex
                button.textContent = cell.getValue()
                // check if button is full disable it to stop user from rechanging the content of an already marked cell
                if(button.textContent != ""){
                    button.disabled = true
                }
                boardDiv.appendChild(button)
            });
        });

    }

    // show modal function
    const showModal = () => {
        tokenModal.showModal();
    }

    // updating token divs content
    const updateTokenDivs = () => {
        // adding to the players divs content
        firstPlayerToken.textContent = game.getPlayers()[0].token
        secondPlayerToken.textContent = game.getPlayers()[1].token
    }


    // clicking the board handler
    const clickHandler = (e) => {
        let selectedColumn = e.target.dataset.column
        let selectedRow = e.target.dataset.row
        game.playRound(selectedRow,selectedColumn);
        game.checkWinner(selectedRow,selectedColumn)
        if (game.getDisabled()) {
                progress.textContent = game.getActivePlayer().playerName + " is the winner!!"
                boardDiv.classList.add('disabled');
        }
        // if the board is full means draw
        if(game.getTurnsCount() == 9) {
            progress.textContent = "Oh! It's a draw!!!"
            game.setDisabled()
            boardDiv.classList.add('disabled');
        }
        updateScreen();
    }
    
    // the modal click handler
    const modalClickHandler = (e) => {
        if(e.target.id == "confirmBtn"){
             // creating a form data to get input values
            let formData = new FormData(form);
            if(Object.fromEntries(formData).firstPlayer != "" && Object.fromEntries(formData).secondPlayer != ""){
                e.preventDefault()
                game.addToken(Object.fromEntries(formData))
                tokenModal.close()
                updateTokenDivs();
                
            }
        } 
    }
    
    // the board and the modal event listners
    tokenModal.addEventListener("click",modalClickHandler);
    boardDiv.addEventListener("click",clickHandler);
    restartButton.addEventListener("click",() => {
        game.resetBoard();
        boardDiv.classList.remove('disabled');
        game.setDisabled()
        updateScreen();
        showModal();
    });

    showModal();
    updateScreen();

}

displayController();