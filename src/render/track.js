export function drawOvalBackground(ctx, TRACK, START_LINE) {
	//Outer grass
	ctx.fillStyle = '#2f6b3c';
	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.x,
		TRACK.outer.rx + TRACK.edge,
		TRACK.outer.ry + TRACK.edge,
		0,
		0,
		Math.PI * 2
	);
	ctx.fill();

	//Tarmac
	ctx.fillStyle = '#555';
	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.y,
		TRACK.outer.rx,
		TRACK.outer.ry,
		0,
		0,
		Math.PI * 2
	);
	ctx.fill();

	//Inner Grass
	ctx.fillStyle = '#2f6b3c';

	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.x,
		TRACK.inner.rx,
		TRACK.inner.ry,
		0,
		0,
		Math.PI * 2
	);
	ctx.fill();

	//Start line
	ctx.fillStyle = '#ddd';
	ctx.fillRect(
		START_LINE.x,
		START_LINE.y,
		START_LINE.width,
		START_LINE.height
	);

	//Barriers
	ctx.strokeStyle = '#777';
	ctx.lineWidth = 2;
	//Outer
	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.x,
		TRACK.outer.rx + TRACK.edge,
		TRACK.outer.ry + TRACK.edge,
		0,
		0,
		Math.PI * 2
	);
	ctx.stroke();
	//Inner
	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.x,
		TRACK.inner.rx - TRACK.edge,
		TRACK.inner.ry - TRACK.edge,
		0,
		0,
		Math.PI * 2
	);
	ctx.stroke();

	//Background inner
	ctx.fillStyle = '#bbb';
	ctx.beginPath();
	ctx.ellipse(
		TRACK.centre.x,
		TRACK.centre.x,
		TRACK.inner.rx - TRACK.edge - 1,
		TRACK.inner.ry - TRACK.edge - 1,
		0,
		0,
		Math.PI * 2
	);
	ctx.fill();
}

const TILE_SIZE = 40;
/**
 * @deprecated
 */
export function drawCheckerBoardBackground() {
	const startX =
		Math.floor((camera.pos.x - canvas.width / 2) / TILE_SIZE) *
		TILE_SIZE;
	const startY =
		Math.floor((camera.pos.y - canvas.height / 2) / TILE_SIZE) *
		TILE_SIZE;

	for (
		let y = startY;
		y < startY + canvas.height + TILE_SIZE;
		y += TILE_SIZE
	) {
		for (
			let x = startX;
			x < startX + canvas.width + TILE_SIZE;
			x += TILE_SIZE
		) {
			const isDark = (x / TILE_SIZE + y / TILE_SIZE) & 1;
			ctx.fillStyle = isDark ? '#2a2a2a' : '#333';

			ctx.fillRect(
				x - camera.pos.x + canvas.width / 2,
				y - camera.pos.y + canvas.height / 2,
				TILE_SIZE,
				TILE_SIZE
			);
		}
	}
}
