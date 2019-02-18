import Board from './Board';
import GameView from './ui/GameView';

class Game {
    private _raf: number = -1;
    private _board: Board;
    private _view: GameView;

    private _running: boolean = false;
    private _lastUpdate: number = 0;
    private _time: number = 0;

    private _size: number;
    private _seed: number;

    constructor(size?: number, seed: number = Date.now()) {
        this._size = size;
        this._view = new GameView();
        this._seed = seed;
        this.reset();
        window.addEventListener("resize", this._view.onResize);
    }

    start() {
        if (this._running) { return; }
        this._lastUpdate = Date.now();
        this._raf = requestAnimationFrame(this._tick);
    }

    stop() {
        if (!this._running) { return; }
        cancelAnimationFrame(this._raf);
    }

    reset(seed?: number) {
        this._board = new Board(this._size, seed || this._seed);
        this._view.clear();
        this._view.init(this._board);
        this._view.onClickReset = () => {
            this.reset();
        };
        this._view.onClickNewGame = () => {
            this._seed = Date.now();
            this.reset(this._seed);
        };
    }

    update(dt: number) {
        this._view.update(dt);
    }

    private _tick = () => {
        let now = Date.now();
        let lastTime = this._time;
        this._time += (now - this._lastUpdate) / 1000;
        this._lastUpdate = now;

        let delta = this._time - lastTime;
        this.update(delta);
        this._raf = requestAnimationFrame(this._tick);
    };
}

export default Game;