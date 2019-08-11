import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    const className = 'square' + (props.highlight ? ' highlight' : '');
    return (
        <button
            className={className}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

function Board(props) {
    const boardSize = 3;
    let renderSquare = i => {
        const winnerLine = props.winnerLine;
        return (
            <Square
                key={i}
                value={props.squares[i]}
                onClick={() => props.onClick(i)}
                highlight={winnerLine && winnerLine.includes(i)}
            />
        );
    };

    let generateRow = (i) => {
        let row = [];
        for (let j = 0; j < boardSize; j++) {
            row.push(renderSquare(i * boardSize + j));
        }
        return row
    }

    let generateBoard = () => {
        let board = [];
        for (let i = 0; i < boardSize; i++) {
            board.push(<div key={i} className="board-row">{generateRow(i)}</div>);
        }
        return board;
    }

    return (
        <div>
            {generateBoard()}
        </div>
    );

}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            xIsNext: true,
            stepNumber: 0,
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: [...history, { squares: squares, latestMovedSquare: i }],
            xIsNext: !this.state.xIsNext,
            stepNumber: history.length,
            ascending: true,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    changeMoveListSortOrder() {
        this.setState({
            ascending: !this.state.ascending
        });
    }


    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winInfo = calculateWinner(current.squares);
        const winner = winInfo.winner;


        const moves = history.map((step, move) => {
            const col = 1 + step.latestMovedSquare % 3;
            const row = 1 + Math.floor(step.latestMovedSquare / 3);
            const desc = move ?
                '(' + col + ',' + row + ') => move #' + move :
                'Go to game start';
            return (
                <li key={move}>
                    <button
                        className={
                            move === this.state.stepNumber && move !== 0 ? 'move-list-item-selected' : ''
                        }
                        onClick={() => this.jumpTo(move)}>{desc}
                    </button>
                </li>
            )
        });

        const orderMoveList = (() => {
            return (
                <button
                    onClick={() => this.changeMoveListSortOrder()}
                >
                    Order Moves List
                    </button>
            );
        })();

        const ascending = this.state.ascending;
        if (!ascending) {
            moves.reverse();
        }

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            if (calculateDraw(current.squares)) status = 'Draw';
            else status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        };

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winnerLine={winInfo.winnerLine}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>{orderMoveList}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                winnerLine: lines[i],
            }
        }
    }
    return {
        winner: null,
        winnerLine: null,
    };
}

function calculateDraw(squares) {
    return !squares.includes(null) ? true : false;
}