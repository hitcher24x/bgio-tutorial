import { Client } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer'
import { TicTacToe } from './Game';

class TicTacToeClient {
  constructor(rootElement, { playerID } = {}) {
    this.client = Client({ game: TicTacToe,
        multiplayer: SocketIO({persist: true,
            storageKey: 'bgio',
            server: 'localhost:8000'
        }),
        playerID,
     });
    this.client.start();
    this.rootElement = rootElement;
    this.createBoard();
    this.attachListeners();
    this.client.subscribe(state => this.update(state));
  }

  createBoard() {
    // Create cells in rows for the Tic-Tac-Toe board.
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const cells = [];
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;
        cells.push(`<td class="cell" data-id="${id}"></td>`);
      }
      rows.push(`<tr>${cells.join('')}</tr>`);
    }

    // Add the HTML to our app <div>.
    // We’ll use the empty <p> to display the game winner later.
    this.rootElement.innerHTML = `
      <table>${rows.join('')}</table>
      <p class="winner"></p>
    `;
  }

  attachListeners() {
    // This event handler will read the cell id from a cell’s
    // `data-id` attribute and make the `clickCell` move.
    const handleCellClick = event => {
      const id = parseInt(event.target.dataset.id);
      this.client.moves.clickCell(id);
    };
    // Attach the event listener to each of the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.onclick = handleCellClick;
    });
  }
  update(state) {
      if (state === null) return;
      const cells = this.rootElement.querySelectorAll('.cell');
      cells.forEach(cell =>{
          const cellId = parseInt(cell.dataset.id)
          const cellValue = state.G.cells[cellId];
          cell.textContent = cellValue !== null ? cellValue : '';
      });
      const messageEl = this.rootElement.querySelector('.winner');
      if (state.ctx.gameover) {
          messageEl.textContent =
            state.ctx.gameover.winner !== undefined
              ? 'Winner :' + state.ctx.gameover.winner
              : 'Draw!';
      } else {
          messageEl.textContent = '';
      }
  }
}

const appElement = document.getElementById('app');
const playerIDs = ['0','1'];
const clients = playerIDs.map(playerID => {
    const rootElement= document.createElement('div');
    appElement.append(rootElement);
    return new TicTacToeClient(rootElement, { playerID })
});