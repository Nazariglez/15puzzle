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

    constructor(size?: number) {
        this._size = size;
        this._view = new GameView();
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

    reset() {
        this._board = new Board(this._size);
        this._view.clear();
        this._view.init(this._board);
        this._view.onClickReset = () => {
            this.reset();
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