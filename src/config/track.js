import { Level } from '../class/level.js';

const LEVEL_1 = new Level(
	32,
	{ x: 22.5, y: 6.5, angle: -Math.PI / 2 },
	{ x: 21, y: 6.1, width: 96, height: 5, normal: { x: 0, y: -1 } },
	`
#########################
#,,,,,,,,,,,,,,,,,,,,,,,#
#,,..............+....,,#
#,...+.................,#
#,...###############...,#
#,..#################..,#
#,..#################..,#
#,..#################..,#
#,..#################..,#
#,...###############...,#
#,......+.~............,#
#,,.......~~..........,,#
#,,,,,,,,,,,,,,,,,,,,,,,#
#########################
`
);

const LEVEL_2 = new Level(
	32,
	{ x: 9.5, y: 13, angle: -Math.PI / 2 },
	{ x: 8, y: 12.5, width: 64, height: 5, normal: { x: 0, y: -1 } },
	`
###########
#####,,,,,#
####,,,,,,#
####,,...,#
####,.....#
####~.....#
#####..#..#
#####..#+.#
#####..#..#
####...#..#
###...~#..#
###..#~#..#
###....#..#
####,..#..#
####,..#..#
####,..#++#
##,,,..#..#
##,....#..#
##,....#..#
##,.####..#
##,.......#
##,,,,,,,,#
###########
`
);

const LEVEL_3 = new Level(
	32,
	{ x: 1.5, y: 18, angle: -Math.PI / 2 },
	{ x: 1, y: 17.5, width: 96, height: 5, normal: { x: 0, y: -1 } },
	`
######################
#########,.....+...,,#
########,...........,#
##,,,,,,,..,#####...,#
#,,...+....#######..,#
#,....+...,#######..,#
#...,#############+.,#
#..,##############..,#
#..,#########,......,#
#..,########,......,##
#..,,#######,..#######
#....,######,++#######
#,.+..,#####,..#######
####..,#####,..#######
#,....,#####,..#######
#....,######,..#######
#..,,#######,..#######
#..,########,.+#######
#..,########,..#######
#.+,########,..#######
#..,########,..#######
#..,########,..#######
#..,########,++#######
#..,########,..#######
#..,########,..#######
#..,########,..#######
#..,########..,#######
#,..,######,..,#######
#,.....++.....,#######
#,,..........,,#######
##,,,,,,,,,,,,########
######################
`
);

export const TILE_PROPS = {
	'.': { grip: 1, drag: 0.5, maxSpeed: 1, wall: false, colour: '#555' }, //road
	'+': {
		grip: 0.9,
		drag: 0.2,
		maxSpeed: 1,
		boost: 3,
		wall: false,
		colour: '#444',
	}, //boost
	',': {
		grip: 0.4,
		drag: 3,
		maxSpeed: 0.35,
		wall: false,
		colour: '#2f6b3c',
	}, //grass
	'~': {
		grip: 0.2,
		drag: 6,
		maxSpeed: 0.05,
		wall: false,
		colour: '#3366aa',
	}, //water
	'#': { grip: 0, drag: 1, maxSpeed: 0, wall: true, colour: '#777' }, //wall
};

export const TRACKS = [
	{
		id: `oval_50`,
		name: `Copper Ring`,
		cc: 50,
		laps: 2,
		level: LEVEL_1,
		unlocksAfter: null,
	},
	{
		id: `city_50`,
		name: `Old Town Loop`,
		cc: 50,
		laps: 3,
		level: LEVEL_2,
		unlocksAfter: null,
	},
	{
		id: `oval_100`,
		name: `Silver Ring`,
		cc: 100,
		laps: 3,
		level: LEVEL_1,
		unlocksAfter: 50,
	},
	{
		id: `city_100`,
		name: `Midnight Run`,
		cc: 100,
		laps: 3,
		level: LEVEL_2,
		unlocksAfter: 50,
	},
	{
		id: `oval_150`,
		name: `Gold Ring`,
		cc: 150,
		laps: 5,
		level: LEVEL_1,
		unlocksAfter: 100,
	},
	{
		id: `city_150`,
		name: `City Sprint`,
		cc: 150,
		laps: 5,
		level: LEVEL_2,
		unlocksAfter: 100,
	},
	{
		id: `speed_200`,
		name: `Autodromo Velocità`,
		cc: 200,
		laps: 3,
		level: LEVEL_3,
		unlocksAfter: 150,
	},
];

export const CC_PROFILES = {
	50: {
		acc: 0.75,
		maxSpeed: 0.75,
		grip: 1.15,
		turn: 1.1,
	},
	100: {
		acc: 1,
		maxSpeed: 1,
		grip: 1,
		turn: 1,
	},
	150: {
		acc: 1.25,
		maxSpeed: 1.25,
		grip: 0.9,
		turn: 0.95,
	},
	200: {
		acc: 1.5,
		maxSpeed: 1.5,
		grip: 0.8,
		turn: 0.9,
	},
};
