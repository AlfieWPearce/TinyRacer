import { TILE_PROPS } from '../config/track.js';

export class Level {
	constructor(tileSize, start, finishLine, asciiMap) {
		this.tileSize = tileSize;
		this.start = { ...start };
		this.finishLine = { ...finishLine };
		this.finishLine.x = finishLine.x * tileSize;
		this.finishLine.y = finishLine.y * tileSize;
		const tiles = this.parseAsciiMap(asciiMap);
		this.tiles = [...tiles];
	}

	parseAsciiMap(str) {
		return str
			.trim()
			.split('\n')
			.map((row) => row.split(''));
	}

	worldToTile(x, y) {
		return {
			tx: Math.floor(x / this.tileSize),
			ty: Math.floor(y / this.tileSize),
		};
	}

	getTileAtWorld(x, y) {
		const { tx, ty } = this.worldToTile(x, y);

		if (ty < 0 || ty >= this.height || tx < 0 || tx >= this.width) {
			return null;
		}

		return this.tiles[ty][tx];
	}

	getTilePropsAtWorld(x, y) {
		const tile = this.getTileAtWorld(x, y);
		if (tile === null) return TILE_PROPS[2]; // default: wall
		return TILE_PROPS[tile];
	}

	isWallAtWorld(x, y) {
		return this.getTilePropsAtWorld(x, y).wall;
	}
}
