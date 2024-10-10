const canv = document.getElementById('canv');
const canv_w = canv.width;
const canv_h = canv.height;

const ctx = document.getElementById('canv').getContext('2d');

const circlee = {
	direction: [1, 0],
	x: 100,
	y: 100,
	radius: 10,
	speed: 10
};

const game = {
	updateMaze: () => {
		rows = maze.length;
		cols = maze[0].length;
		wall_w = canv_w / cols;
		wall_h = canv_h / rows;
	},
	drawMaze: () => {
		ctx.fillStyle = '#a0c';
		for (let n = 0; n < rows; n++) {
			for (let m = 0; m < cols; m++) {
				if (maze[n][m]) {
					ctx.fillRect(m * wall_w, n * wall_h, wall_w, wall_h);
				}
			}
		}
	},
	drawCircle: () => {
		ctx.fillStyle = '#00c';
		ctx.beginPath();
		ctx.arc(circlee.x, circlee.y, circlee.radius, 0, 2 * Math.PI);
		ctx.fill();
	},
	frame: () => {
		ctx.clearRect(0, 0, canv_w, canv_h);
		game.drawMaze();
		game.drawCircle();
	}
};

let maze = [
[1, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 1, 0],
[1, 0, 1, 0, 0, 1, 0],
[0, 0, 1, 0, 1, 0, 0],
[0, 0, 0, 0, 1, 0, 1]
];
let rows, cols, wall_w, wall_h;
game.updateMaze();
let grid_spawnPos = [0, 4];
let spawnPos = [grid_spawnPos[0] * wall_w + (wall_w / 2),
grid_spawnPos[1] * wall_h + (wall_h / 2)];
circlee.x = spawnPos[0];
circlee.y = spawnPos[1];

function collCheck(ch_x, ch_y) {
	let next_x = circlee.x + ch_x;
	let next_y = circlee.y + ch_y;

	let b_up, b_dn, b_l, b_r;
	let grid_x = (circlee.x - circlee.x % (canv_w / cols)) / (canv_w / cols);
	let grid_y = (circlee.y - circlee.y % (canv_h / rows)) / (canv_h / rows);
	
	if (grid_x == 0) {
		b_l = 0;
	} else {
		if (maze[grid_y][grid_x - 1]) {
			b_l = (grid_x) * wall_w;
		} else {
			b_l = 0;
		}
	}
	if (grid_y == 0) {
		b_up = 0;
	} else {
		if (maze[grid_y - 1][grid_x]) {
			b_up = (grid_y) * wall_h;
		} else {
			b_up = 0;
		}
	}
	if (grid_x == cols - 1) {
		b_r = cols * wall_w;
	} else {
		if (maze[grid_y][grid_x + 1]) {
			b_r = (grid_x + 1) * wall_w;
		} else {
			b_r = cols * wall_w;
		}
	}
	if (grid_y == rows - 1) {
		b_dn = rows * wall_h;
	} else {
		if (maze[grid_y + 1][grid_x]) {
			b_dn = (grid_y + 1) * wall_h;
		} else {
			b_dn = rows * wall_h;
		}
	}

	let a = false;
	if (next_x < b_l + circlee.radius) {
		circlee.x = b_l + circlee.radius;
		a = true;
	}
	if (next_y < b_up + circlee.radius) {
		circlee.y = b_up + circlee.radius;
		a = true;
	}
	if (next_x > b_r - circlee.radius) {
		circlee.x = b_r - circlee.radius;
		a = true;
	}
	if (next_y > b_dn - circlee.radius) {
		circlee.y = b_dn - circlee.radius;
		a = true;
	}
	if (a) {
		game.frame();
	}
	return a;
}

let t1;
let t2 = performance.now();
function gameLoop() {
	t1 = performance.now();
	let el = t1 - t2;
	t2 = t1;
	game.frame();
	let ch_x = (circlee.speed / 100 * el) * circlee.direction[0]; // change of x position
	let ch_y = (circlee.speed / 100 * el) * circlee.direction[1]; // change of y position
	if (!collCheck(ch_x, ch_y)) {
		circlee.x += ch_x;
		circlee.y += ch_y;
		requestAnimationFrame(gameLoop);
	}
}
requestAnimationFrame(gameLoop);

window.addEventListener('keydown', (evt) => {
	switch(evt.key) {
	case 'ArrowUp':
		circlee.direction = [0, -1];
		break;
	case 'ArrowLeft':
		circlee.direction = [-1, 0];
		break;
	case 'ArrowDown':
		circlee.direction = [0, 1];
		break;
	case 'ArrowRight':
		circlee.direction = [1, 0];
	}
});
