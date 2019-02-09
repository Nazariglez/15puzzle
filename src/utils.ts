///<reference path="../typings/pixi-tween.d.ts" />
import * as tweenManager from 'pixi-tween';

export interface Point {
    x: number,
    y: number
}

export enum Direction {
    NONE,
    LEFT,
    RIGHT,
    UP,
    DOWN
}

//avoid dead-code
export const Plugins = {
    tweenManager: tweenManager
}