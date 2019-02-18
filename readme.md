15 Puzzle
=========

The classic 15 puzzle game made with Pixi.js and Typescript.
Go to https://github.com/Nazariglez/15puzzle/dist/ and play it, works great on mobile!

If you want other size, just use `new Game(N)` where N is a number which will be used to create the columns and rows, by default is 4.

## How to use
The folder dist has anything you need to play the game. But if you want to compile it just use `npm install` and `npm run dev` or `npm run build` to create the bundle. 

//TODO 
- Add a random system which uses a seed to enable a way to repeat the order in which the random numbers are generated. With this I can repeat and debug the player's gameplays. 
- Extend how the board nodes works, adding a way to set new attributes to them to be able to change the gameplay, for example, add a new state to 'freeze' a node, so this node can't be moved by the player. The system must be made thinking on future new attributes.
