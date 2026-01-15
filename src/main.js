import Game from './game.js';
import Renderer from './renderer.js';

const game = new Game();
const renderer = new Renderer(game);
game.renderer = renderer;

let last = performance.now();
function loop(now) {
	let dt = Math.min((now - last) / 1000, 0.033); //Clamp dt to 33ms | ~30fps
	last = now;

	game.update(dt);
	renderer.render();

	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
