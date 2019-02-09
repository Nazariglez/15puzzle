import * as utils from '../utils';
import * as PIXI from 'pixi.js';
import BoardView from './BoardView';
import Board from '../board';

const WIDTH = 600;
const HEIGHT = 800;

export default class GameView {
    app: PIXI.Application;
    mainContainer: PIXI.Container;
    board: BoardView;
    resetButton: PIXI.Sprite;
    winScreen: WinScreen;
    resetTween: PIXI.tween.Tween;

    onClickReset: () => void = () => { };

    constructor() {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight
        });
        document.body.appendChild(this.app.view);
        this.mainContainer = new PIXI.Container();
        this.app.stage.addChild(this.mainContainer);
        this.resize();

        this.resetButton = this._createResetButton();
        this.resetButton.position.set(0, HEIGHT * 0.5 - 20 - this.resetButton.height * 0.5);
        this.mainContainer.addChild(this.resetButton);
        this.resetButton.on("pointertap", this._onReset);
    }

    init(board: Board) {
        this.board = new BoardView(WIDTH * 0.98, board);
        this.board.position.set(0, -60);
        this.board.listenOnEnded(this._onGameOver);
        this.mainContainer.addChild(this.board);

        this.winScreen = this._createWinWindow();
        this.winScreen.visible = false;
        this.mainContainer.addChild(this.winScreen);
    }

    clear() {
        this.mainContainer.removeChild(this.board);
        this.board = null;
        this.mainContainer.removeChild(this.winScreen);
        this.winScreen = null;

        if (this.resetTween) {
            this.resetTween.stop();
            this.resetTween.reset();
            this.resetButton.scale.set(1, 1);
        }
    }

    update(dt: number) {
        PIXI.tweenManager.update(dt);
    }

    onResize = (evt) => {
        this.resize();
    };

    resize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        let scale = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
        this.mainContainer.scale.set(scale, scale);
        this.mainContainer.position.set(window.innerWidth * 0.5, window.innerHeight * 0.5);
    }

    private _createWinWindow(): WinScreen {
        let win = new WinScreen(WIDTH, HEIGHT);
        return win;
    };

    private _onReset = () => {
        this.onClickReset();
    };

    private _onGameOver = () => {
        this.winScreen.visible = true;
        this.winScreen.winAnimation(1500);
        this.mainContainer.removeChild(this.resetButton);
        this.mainContainer.addChild(this.resetButton);
        this.resetTween.start();
    };

    private _createResetButton(): PIXI.Sprite {
        let texture = new PIXI.Graphics()
            .beginFill(0x203010)
            .drawCircle(0, 0, 50)
            .endFill()
            .lineStyle(6, 0xff22c0)
            .drawCircle(0, 0, 50)
            .generateCanvasTexture();

        let btn = new PIXI.Sprite(texture);
        btn.anchor.set(0.5, 0.5);
        btn.pivot.set(0.5, 0.5);

        let text = new PIXI.Text("RESET", {
            align: "center",
            fontFamily: "Helvetica, Arial",
            fontSize: "24px",
            fill: 0xffffff,
        });
        text.anchor.set(0.5, 0.5);
        text.pivot.set(0.5, 0.5);
        btn.addChild(text);

        btn.buttonMode = true;
        btn.interactive = true;

        this.resetTween = PIXI.tweenManager.createTween(btn.scale);
        this.resetTween.time = 1600;
        this.resetTween.loop = true;
        this.resetTween.pingPong = true;
        this.resetTween.easing = PIXI.tween.Easing.inOutBack();
        this.resetTween.to({
            x: 0.85,
            y: 0.85
        });

        return btn;
    }
}

class WinScreen extends PIXI.Container {
    bg: PIXI.extras.TilingSprite;
    text: PIXI.Text;

    constructor(w: number, h: number) {
        super();
        let texture = new PIXI.Graphics()
            .beginFill(0x000000, 0.8)
            .drawRect(0, 0, 10, 10)
            .endFill()
            .generateCanvasTexture();

        this.bg = new PIXI.extras.TilingSprite(texture, w, h);
        this.bg.anchor.set(0.5, 0.5);
        this.bg.pivot.set(0.5, 0.5);
        this.addChild(this.bg);

        this.text = new PIXI.Text("You\nRocks!", {
            align: "center",
            fontSize: "150px",
            fontFamily: "Helvetica, Arial",
            fontWeight: "bold",
            fill: 0xffffff,
        });

        this.text.anchor.set(0.5, 0.5);
        this.text.pivot.set(0.5, 0.5);
        this.text.position.set(0, -80);
        this.addChild(this.text);
    }

    winAnimation(time: number) {
        this.text.scale.set(0, 0);
        let tween = PIXI.tweenManager.createTween(this.text.scale);
        tween.time = time;
        tween.easing = PIXI.tween.Easing.outBack();
        tween.to({
            x: 1, y: 1
        });
        tween.start();
    }
}