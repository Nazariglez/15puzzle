import { Point, Direction } from './utils';
import Random from './Random';

class Board {
    private _grid: number[];
    readonly size: number;

    private _randomGenerator: Random;

    constructor(size: number = 4, seed: number = Date.now()) {
        this._randomGenerator = new Random(seed);
        this.size = size;
        this._generate();
    }

    each(cb: (x: number, y: number, value: number) => void) {
        this._grid.forEach((value, index) => {
            let point = this.getPointFromIndex(index);
            cb(point.x, point.y, value);
        });
    }

    toTable() {//for debug purposes
        let table = [];
        this._grid.forEach((value, i) => {
            let pos = this.getPointFromIndex(i);
            if (!table[pos.y]) { table[pos.y] = []; }
            table[pos.y][pos.x] = value;
        });
        return table;
    }

    setToZero() {
        for (let i = 0; i < this._grid.length; i++) {
            this._grid[i] = 0;
        }
    }

    getPointFromIndex(index: number): Point {
        return {
            x: index % this.size,
            y: Math.floor(index / this.size)
        };
    }

    getIndexFromCoords(x: number, y: number): number {
        if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) { return -1; }
        let row = y * this.size;
        return row + x;
    }

    getValue(x: number, y: number): number {
        let index = this.getIndexFromCoords(x, y);
        return this._grid[index];
    }

    setValue(x: number, y: number, value: number) {
        let index = this.getIndexFromCoords(x, y);
        this._grid[index] = value;
    }

    getCellsToMove(x: number, y: number, dir: Direction): Point[] {
        let cells = [];
        switch (dir) {
            case Direction.LEFT:
                if (x >= 1) {
                    for (let i = x; i >= 0; i--) {
                        if (this.getValue(i, y) === 0) { break; }
                        cells.push({ x: i, y: y });
                    }
                }
                break;
            case Direction.RIGHT:
                if (x <= this.size - 2) {
                    for (let i = x; i < this.size; i++) {
                        if (this.getValue(i, y) === 0) { break; }
                        cells.push({ x: i, y: y });
                    }
                }
                break;
            case Direction.UP:
                if (y >= 1) {
                    for (let i = y; i >= 0; i--) {
                        if (this.getValue(x, i) === 0) { break; }
                        cells.push({ x: x, y: i });
                    }
                }
                break;
            case Direction.DOWN:
                if (y <= this.size - 2) {
                    for (let i = y; i < this.size; i++) {
                        if (this.getValue(x, i) === 0) { break; }
                        cells.push({ x: x, y: i });
                    }
                }
                break;
        }

        return cells;
    }

    canMove(x: number, y: number): Direction {
        let moveNext = this.canMoveNext(x, y);
        if (moveNext !== Direction.NONE) { return moveNext; }
        return this.canMoveRowColumn(x, y);
    }

    swapCells(p1: Point, p2: Point) {
        let v1 = this.getValue(p1.x, p1.y);
        let v2 = this.getValue(p2.x, p2.y);

        this.setValue(p1.x, p1.y, v2);
        this.setValue(p2.x, p2.y, v1);
    }

    canMoveRowColumn(x: number, y: number): Direction {
        if (x >= 1) {
            for (let i = x - 1; i >= 0; i--) {
                if (this.getValue(i, y) === 0) { return Direction.LEFT; }
            }
        }

        if (x <= this.size - 2) {
            for (let i = x + 1; i < this.size; i++) {
                if (this.getValue(i, y) === 0) { return Direction.RIGHT; }
            }
        }

        if (y >= 1) {
            for (let i = y - 1; i >= 0; i--) {
                if (this.getValue(x, i) === 0) { return Direction.UP; }
            }
        }

        if (y <= this.size - 2) {
            for (let i = y + 1; i < this.size; i++) {
                if (this.getValue(x, i) === 0) { return Direction.DOWN; }
            }
        }

        return Direction.NONE;
    }

    canMoveNext(x: number, y: number): Direction {
        if (x >= 1 && this.getValue(x - 1, y) === 0) { return Direction.LEFT; }
        if (x <= this.size - 2 && this.getValue(x + 1, y) === 0) { return Direction.RIGHT; }
        if (y >= 1 && this.getValue(x, y - 1) === 0) { return Direction.UP; }
        if (y <= this.size - 2 && this.getValue(x, y + 1) === 0) { return Direction.DOWN; }
        return Direction.NONE;
    }

    isSolved(): boolean {
        let isSolved = true;
        //from arr[0] to arr[arr.length-1] must be i
        for (let i = 0; i < this._grid.length - 1; i++) {
            if (this._grid[i] !== i + 1) {
                isSolved = false;
                break;
            }
        }

        return isSolved;
    }

    private _generate() {
        let grid: number[] = [];
        let total = this.size * this.size;
        for (let i = 0; i < total; i++) {
            grid.push(i);
        }

        this._grid = grid;
        // grid.sort((a, b) => {
        //    return 0.5 - Math.random();
        // });
        for (let i = 0; i < 1000; i++) {
            this._randomMove();
        }

    }

    private _randomMove() {
        let index = -1;
        for (let i = 0; i < this._grid.length; i++) {
            if (this._grid[i] === 0) {
                index = i;
                break;
            }
        }

        if (index !== -1) {
            let pos = this.getPointFromIndex(index);
            let dirs = [Direction.LEFT, Direction.RIGHT, Direction.UP, Direction.DOWN];
            let canBeMoved = false;
            let dir = Direction.NONE;
            let point = { x: pos.x, y: pos.y };
            while (!canBeMoved && dirs.length) {
                let rng = this._randomGenerator.get();
                let indexOfDirs = Math.floor(rng * dirs.length);
                let value: Direction = dirs.splice(indexOfDirs, 1)[0];

                switch (value) {
                    case Direction.LEFT:
                        point.x--;
                        break;
                    case Direction.RIGHT:
                        point.x++;
                        break;
                    case Direction.UP:
                        point.y--;
                        break;
                    case Direction.DOWN:
                        point.y++;
                        break;
                }

                let n = this.getIndexFromCoords(point.x, point.y);
                if (n !== -1) {
                    canBeMoved = true;
                    dir = value;
                }
            }

            if (canBeMoved) {
                this.swapCells(pos, point);
            }

        }
    }

}

export default Board;