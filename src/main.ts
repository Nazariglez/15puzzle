import Game from './Game';

(function () {
    const game = new Game();
    game.start();

    (window as any).game = game;
})();