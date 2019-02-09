import Board from "../board";
import { Direction, Point } from "../utils";

enum State {
    Starting,
    Idle,
    Playing,
    Animating,
    Checking,
    Ended
}

export default class BoardView extends PIXI.Container {
    private _cellTexture: PIXI.Texture;
    private _boardSize: number = 0;
    private _cellSize: number = 0;

    cachedPositions: Point[] = [];
    cells: BoardCell[] = [];
    boardData: Board;

    dragging: boolean = false;
    draggingDir: Direction = Direction.NONE;
    draggingCells: BoardCell[];
    dragStartPoint: Point;

    state: State = State.Starting;
    private _onEndedCb: () => void = () => { };

    constructor(pxSize: number, data: Board) {
        super();
        this.boardData = data;

        this._boardSize = pxSize;
        this._cellSize = Math.floor(pxSize / data.size);
        this._cellTexture = new PIXI.Graphics()
            .beginFill(0xffffff)
            .drawRoundedRect(0, 0, this._cellSize, this._cellSize, 5)
            .endFill()
            .lineStyle(5, 0x00ffff, 1)
            .drawRoundedRect(0, 0, this._cellSize, this._cellSize, 5)
            .generateCanvasTexture();

        this.boardData.each(this.addCell);
        this.interactive = true;
        this.on("pointermove", this._onMouseMove);

        this.setState(State.Idle);
    }

    setState(state: State) {
        this.state = state;
    }

    isState(state: State): boolean {
        return state === this.state;
    }

    addCell = (x: number, y: number, value: number) => {
        let pos = this.getPositionFor(x, y);
        this.cachedPositions.push(pos);

        if (value === 0) { return; }

        let cell = this._createCell(value);
        cell.setCoords(x, y);

        cell.position.set(pos.x, pos.y);

        this.cells.push(cell);
        this.addChild(cell);
    };

    getPositionFor(x: number, y: number): Point {
        return {
            x: x * this._cellSize - this._boardSize * 0.5 + this._cellSize * 0.5,
            y: y * this._cellSize - this._boardSize * 0.5 + this._cellSize * 0.5
        };
    }

    private _createCell(index: number): BoardCell {
        let cell = new BoardCell(this._cellTexture, index);
        cell.value = index;
        cell.interactive = true;
        cell.on("pointerdown", this._onCellMouseDown);
        cell.on("pointerup", this._onCellMouseUp);
        cell.on("pointerupoutside", this._onCellMouseUp);
        return cell;
    }

    private _onMouseMove = (evt: any) => {
        if (!this.isState(State.Playing)) { return; }
        if (this.dragging) {
            let pos = this.toLocal(evt.data.global);
            let offsetX = pos.x - this.dragStartPoint.x;
            let offsetY = pos.y - this.dragStartPoint.y;

            switch (this.draggingDir) {
                case Direction.LEFT:
                    offsetX = Math.min(0, Math.max(offsetX, -this._cellSize));
                    break;
                case Direction.RIGHT:
                    offsetX = Math.max(0, Math.min(offsetX, this._cellSize));
                    break;
                case Direction.UP:
                    offsetY = Math.min(0, Math.max(offsetY, -this._cellSize));
                    break;
                case Direction.DOWN:
                    offsetY = Math.max(0, Math.min(offsetY, this._cellSize));
                    break;
            }

            this.draggingCells.forEach((cell) => {
                let origin = this.getPositionFor(cell.boardX, cell.boardY);
                if (this.draggingDir === Direction.LEFT || this.draggingDir === Direction.RIGHT) {
                    cell.position.x = origin.x + offsetX;
                }

                if (this.draggingDir === Direction.UP || this.draggingDir === Direction.DOWN) {
                    cell.position.y = origin.y + offsetY;
                }

            });
        }
    };

    private _onCellMouseDown = (evt: any) => {
        if (!this.isState(State.Idle)) { return; }
        let obj = evt.currentTarget as BoardCell;
        let dir = this.boardData.canMove(obj.boardX, obj.boardY);
        if (dir !== Direction.NONE) {
            this.dragging = true;
            this.draggingDir = dir;
            this.draggingCells = this.getCellsFromPoints(this.boardData.getCellsToMove(obj.boardX, obj.boardY, dir));
            this.dragStartPoint = this.toLocal(evt.data.global);
            this.setState(State.Playing);
        }
    };

    getCellsFromPoints(points: Point[]): BoardCell[] {
        let copyPoint = points.slice();
        let cells = [];
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < copyPoint.length; j++) {
                if (copyPoint[j].x === this.cells[i].boardX && copyPoint[j].y === this.cells[i].boardY) {
                    copyPoint.splice(j, 1);
                    cells.push(this.cells[i]);
                    break;
                }
            }
        }
        return cells;
    }

    fitsCells() {
        this.setState(State.Animating);

        let addedCb = false;
        this.draggingCells.forEach((cell) => {
            let coords = this._getNearCoordsForPosition(cell.position.x, cell.position.y);
            let pos = this.getPositionFor(coords.x, coords.y);
            cell.boardX = coords.x;
            cell.boardY = coords.y;

            let tween = PIXI.tweenManager.createTween(cell.position);
            tween.time = 150;
            tween.easing = PIXI.tween.Easing.outQuad();
            tween.to(pos);

            if (!addedCb) {
                addedCb = true;
                tween.once("end", this._onStopAnimating);
            }

            tween.start();
        });

        this.boardData.setToZero();
        this.cells.forEach((cell) => {
            this.boardData.setValue(cell.boardX, cell.boardY, cell.value);
        });
    }

    private _onStopAnimating = () => {
        this.setState(State.Checking);
        if (this.boardData.isSolved()) {
            this._onEnded();
        } else {
            this.setState(State.Idle);
        }
    };

    listenOnEnded(cb: () => void) {
        this._onEndedCb = cb;
    }

    private _onEnded() {
        this.setState(State.Ended);
        let scale = 1.4;
        let time = 500;

        let addedCb = false;
        this.cells.forEach((cell) => {
            if (!addedCb) {
                addedCb = true;
                cell.winAnimation(time, scale, this._onEndedCb);
            } else {
                cell.winAnimation(time, scale);
            }
        });
    }

    private _getNearCoordsForPosition(x: number, y: number): Point {
        var index = -1;
        var min = Number.MAX_VALUE;
        this.cachedPositions.forEach((pos, i) => {
            let xx = Math.abs(x - pos.x);
            let yy = Math.abs(y - pos.y);
            let val = xx + yy;
            if (val < min) {
                index = i;
                min = val;
            }
        });
        return this.boardData.getPointFromIndex(index);
    }

    private _onCellMouseUp = (evt: any) => {
        if (!this.isState(State.Playing)) { return; }
        if (this.dragging) {
            this.dragging = false;
            this.draggingDir = Direction.NONE;
            this.fitsCells();
            this.draggingCells = [];
        }
    };
}

class BoardCell extends PIXI.Sprite {
    text: PIXI.Text;
    boardX: number = -1;
    boardY: number = -1;
    value: number = -1;

    dragging: boolean = false;
    draggingDir: Direction = Direction.NONE;

    draggingFrom: Point = { x: 0, y: 0 };
    draggingTo: Point = { x: 0, y: 0 };

    constructor(texture: PIXI.Texture, index: number) {
        super(texture);
        this.text = new PIXI.Text(index.toString(), {
            align: "center",
            fontFamily: "Helvetica, Arial",
            fontSize: "100px",
        });

        let scale = this.height * 0.8 / this.text.height;
        this.text.scale.set(scale, scale);
        this.text.anchor.set(0.5, 0.5);
        this.text.pivot.set(0.5, 0.5);
        this.addChild(this.text);

        this.anchor.set(0.5, 0.5);
        this.pivot.set(0.5, 0.5);
    }

    setCoords(x: number, y: number) {
        this.boardX = x;
        this.boardY = y;
    }

    winAnimation(time: number, scale: number, cb?: () => void) {
        let tween = PIXI.tweenManager.createTween(this.text.scale);
        tween.time = time;
        tween.pingPong = true;
        tween.easing = PIXI.tween.Easing.inOutQuad();
        tween.to({
            x: scale,
            y: scale
        });

        if (cb) {
            tween.on("end", cb);
        }
        tween.start();

    }
}