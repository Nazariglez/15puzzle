export default class Random {
    static _instance: Random = new Random(Date.now());

    static getNumber(): number {
        return Random._instance.get();
    }

    private _initialSeed: number = 0;
    private _seed: number = 0;
    private _inc: number = 0;

    constructor(seed: number) {
        this._seed = seed;
        this._initialSeed = this._seed;
        (window as any).Random = Random;
    }

    get(): number {
        this._inc++;
        let value = ((987654321 * this._seed + (this._inc ** this._inc)) % 645) / 645;
        this._seed = value;
        return value;
    }
}