import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
function Square(props) {
  return (
    <button className='square' onClick={props.onClick}>
      {props.value}
    </button>

  )
}

class Board extends React.Component {
  renderSquare(i) {
    return <Square value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)} />;
  }

  rendCol(i){
    let col = [];
    for(let j = 0; j < this.props.col; j++){
      col.push(this.renderSquare(i * this.props.col + j));
    }
    return col
  }
  rendRow(){
    let row = [];
    for(let i = 0; i < this.props.row; i++){
      row.push(<div className='board-row'>{this.rendCol(i)}</div>); 
    }
    return row;
  }

  render() {
    return (
      <div>
        {this.rendRow()}
      </div>
    );
  }
}
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
          {squares: Array(props.row * props.col).fill(null),
          rowData: Array(props.row * props.col).fill(0),
          colData: Array(props.row * props.col).fill(0),
          leftUpData: Array(props.row * props.col).fill(0),
          leftDownData: Array(props.row * props.col).fill(0)
        }
        ],
      stepNumber: 0,
      xIsNext: true,
      winner: null,
      row: Number(props.row),
      col: Number(props.col),
    };
  }

  getCurrentNum(newIndex, oldIndex, squares, numData) {
    if(oldIndex < 0 || oldIndex >= this.state.row * this.state.col) {
      return 0;
    }
    if(squares[newIndex] === squares[oldIndex]) {
      return numData[oldIndex];
    }
    return 0;
  }

  updateRow(i, squares, rowData) {
    let leftNum = 0;
    let rightNum = 0;
    if((i % this.state.col ) !== 0){
      leftNum = this.getCurrentNum(i, i-1, squares, rowData);
    }

    if ((i % this.state.col) !== (this.state.col - 1)) {
      rightNum = this.getCurrentNum(i, i+1, squares, rowData);
    }

    let totalNum = leftNum + rightNum + 1;
    rowData[i] = totalNum;
    for(let a = 1; a <= leftNum; a++) {
      rowData[i-1] = totalNum;
    }
    for(let a = 1; a <= rightNum; a++) {
      rowData[i+1] = totalNum;
    }
  }

  updateCol(i, squares, colData) {
    let upNum = 0;
    let downNum = 0;
    if (Math.floor(i / this.state.col) !== 0) {
      upNum = this.getCurrentNum(i, i-this.state.col, squares, colData);
    }
    if(Math.floor(i / this.state.col) !== (this.state.row - 1)) {
      downNum = this.getCurrentNum(i, i+this.state.col, squares, colData);
    }
    let totalNum = upNum + downNum + 1;
    colData[i] = totalNum;
    for(let a = 1; a <= upNum; a++) {
      colData[i - a * this.state.col] = totalNum;
    }
    for(let a = 1; a <= downNum; a++) {
      colData[i + a * this.state.col] = totalNum;
    }
  }

  updataLeftUp(i, squares, leftUpData) {
    let upNum = 0;
    let downNum = 0;
    if(i % this.state.col > 0 ) {
      upNum = this.getCurrentNum(i, i - this.state.col - 1, squares, leftUpData);
    }
    if(i % this.state.col < this.state.col - 1) {
      downNum = this.getCurrentNum(i, i + this.state.col + 1, squares, leftUpData);
    }
    let totalNum = upNum + downNum + 1;
    leftUpData[i] = totalNum;
    for(let a = 1; a <= upNum; a++){
      leftUpData[i - a*this.state.col - a] = totalNum;
    }
    for(let a = 1; a <= downNum; a++) {
      leftUpData[i + a*this.state.col + a] = totalNum;
    }
  }

  updateLeftDown(i, squares, leftDownData){
    let upNum = 0;
    let downNum = 0;
    if(i % this.state.col < this.state.col - 1){
      upNum = this.getCurrentNum(i, i - this.state.col + 1, squares, leftDownData);
    }
    if(i % this.state.col > 0) {
      downNum = this.getCurrentNum(i, i + this.state.col - 1, squares, leftDownData);
    }
    let totalNum = upNum + downNum + 1;
    leftDownData[i] = totalNum;
    for(let a = 1; a <= upNum; a++){
      leftDownData[i - a*this.state.col + a] = totalNum;
    }
    for(let a = 1; a <= downNum; a++) {
      leftDownData[i + a*this.state.col - a] = totalNum;
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber+1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const rowData = current.rowData.slice();
    const colData = current.colData.slice();
    const leftUpData = current.leftUpData.slice();
    const leftDownData = current.leftDownData.slice();
    let winner = this.state.winner;

    if (squares[i] || winner != null) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'Y';
    this.updateRow(i, squares, rowData);
    this.updateCol(i, squares, colData);
    this.updataLeftUp(i, squares, leftUpData);
    this.updateLeftDown(i, squares, leftDownData);
    
    if(rowData[i] >= 5 || colData[i] >= 5 || leftUpData[i] >=5 || leftDownData[i] >= 5) {
     winner = squares[i];
    }
    this.setState({
      history: history.concat([{ squares: squares, rowData:rowData, 
        colData: colData, leftUpData: leftUpData, leftDownData: leftDownData }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      winner: winner
    });
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      winner: null
    });
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.state.winner;
    const moves = history.map((step, move) => {
      const desc = move ?
        '回到第' + move + '步' :
        '我要耍赖，重新来';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    let status;
    if (winner != null) {
      status = '赢家是: ' + winner;
    } else {
      status = '玩家: ' + (this.state.xIsNext ? 'X' : 'Y');
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} row={this.state.row} col={this.state.col}
            onClick={(i) => this.handleClick(i)} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game row='20' col='20' />);
