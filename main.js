const canv = document.getElementById('canv');
const canv_w = canv.width;
const canv_h = canv.height;

const ctx = document.getElementById('canv').getContext('2d');

const circlee = {
	direction: [0, 0],
	x: 100,
	y: 100,
	radius: 7,
	speed: 10
};
const squaree = {
	direction: [0, 0],
	x: 100,
	y: 100,
	size: 14,
	speed: 5
};

function gridConvert(coordinates, fromG = true, center = false) {
	if (fromG) {
		if (center) {
			return [coordinates[0] * wall_w,
			coordinates[1] * wall_h];
		} else {
			return [coordinates[0] * wall_w + (wall_w / 2),
			coordinates[1] * wall_h + (wall_h / 2)];
		}
	} else {
		return [(coordinates[0] - coordinates[0] % (canv_w / cols)) / (canv_w / cols),
		(coordinates[1] - coordinates[1] % (canv_h / rows)) / (canv_h / rows)];
	}
}

const game = {
	randomizeMaze_1: () => {
		for (let n = 0; n < rows; n++) {
			for (let m = 0; m < cols; m++) {
				maze[n][m] = -1;
			}
		}
		let x = 0;
		let y = 0;

		maze[0][0] = 0;

		do {
			let pd = [true, true, true, true];
			// possible directions - order: up, right, down, left
			if (x == 0 || maze[y][x - 1] != -1) {
				pd[3] = false;
			}
			if (x == cols - 1 || maze[y][x + 1] != -1) {
				pd[1] = false;
			}
			if (y == 0 || maze[y - 1][x] != -1) {
				pd[0] = false;
			}
			if (y == rows - 1 || maze[y + 1][x] != -1) {
				pd[2] = false;
			}
			console.log(pd);
			console.log(maze);
			let l_pd = [];
			for (n in pd) {
				if (pd[n]) {
					l_pd.push(n);
				}
			}
			if (l_pd.length == 0) {
				break;
			}
			let d = l_pd[Math.floor(Math.random() * l_pd.length)];
			console.log(d);
			for (n in l_pd) {
				if (l_pd[n] == 0) {
					maze[y - 1][x] = 1;
				} else if (l_pd[n] == 1) {
					maze[y][x + 1] = 1;
				} else if (l_pd[n] == 2) {
					maze[y + 1][x] = 1;
				} else if (l_pd[n] == 3) {
					maze[y][x - 1] = 1;
				} else {
					console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
				}
			}
			if (d == 0) {
				y--;
			} else if (d == 1) {
				x++;
			} else if (d == 2) {
				y++;
			} else if (d == 3) {
				x--;
			} else {
				console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
			}
			maze[y][x] = 0;
		} while (x < cols - 1 || y < rows - 1);
	},
	randomizeMaze_2: () => {
		for (let n = 0; n < rows; n++) {
			for (let m = 0; m < cols; m++) {
				maze[n][m] = 0;
			}
		}
		for (let m = 1; m < cols; m++) {
			maze[0][m] = Math.round(Math.random());
		}
		for (let m = 0; m < cols; m++) {
			if (!(maze[rows - 2][m] == 0 && (maze[rows - 2][m - 1] == 1 || maze[rows - 2][m + 1] == 1)) && !(maze[rows - 1][m - 1] == 0 && maze[rows - 2][m - 1] == 1)) {
				maze[rows - 1][m] = Math.round(Math.random());
			}
		}
		for (let n = 1; n < rows - 1; n++) {
			for (let m = 0; m < cols; m++) {
				if (!(maze[n - 1][m] == 0 && (maze[n - 1][m - 1] == 1 || maze[n - 1][m + 1] == 1)) && !(maze[n][m - 1] == 0 && (maze[n - 1][m - 1] == 1 || maze[n + 1][m + 1] == 1))) {
					maze[n][m] = Math.round(Math.random());
				}
			}
		}
	},
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
					// ctx.fillRect(m * wall_w, n * wall_h, wall_w, wall_h);
					ctx.fillRect(Math.floor(m * wall_w), Math.floor(n * wall_h), Math.ceil(wall_w), Math.ceil(wall_h));
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
	drawSquare: () => {
		ctx.fillStyle = '#d80';
		ctx.fillRect(squaree.x - squaree.size / 2, squaree.y - squaree.size / 2, squaree.size, squaree.size);
	},
	idk_how_to_name_this_function: () => {
		let dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
		let min_dist = 999999999999999999999999;
		let min_dir = 0;
		let sq_grid_pos = gridConvert([squaree.x, squaree.y], fromG = false);
		for (n in dirs) {
			if (maze[sq_grid_pos[1] + dirs[n][1]] == undefined) {
				continue;
			}
			if (maze[sq_grid_pos[1] + dirs[n][1]][sq_grid_pos[0] + dirs[n][0]] == 0) {
				let dist = gridConvert([sq_grid_pos[0] + dirs[n][0], sq_grid_pos[1] + dirs[n][1]], center=true);
				dist[0] -= circlee.x;
				dist[1] -= circlee.y;
				dist[0] = Math.abs(dist[0]);
				dist[1] = Math.abs(dist[1]);
				// console.log(dist);
				if (min_dist > Math.sqrt(dist[0]*dist[0] + dist[1]*dist[1])) {
					min_dist = Math.sqrt(dist[0]*dist[0] + dist[1]*dist[1]);
					min_dir = n;
				}
			}
		}
		squaree.direction = dirs[min_dir];
	},
	frame: () => {
		ctx.clearRect(0, 0, canv_w, canv_h);
		game.drawMaze();
		game.drawCircle();
		game.drawSquare();
	}
};

let maze = [
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
let rows, cols, wall_w, wall_h;
game.updateMaze();
let spawnPos = gridConvert([0, 0], center=true);
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
	game.idk_how_to_name_this_function();
	squaree.x += (squaree.speed / 100 * el) * squaree.direction[0];
	squaree.y += (squaree.speed / 100 * el) * squaree.direction[1];
	if (!collCheck(ch_x, ch_y)) {
		circlee.x += ch_x;
		circlee.y += ch_y;
		requestAnimationFrame(gameLoop);
	}
}
game.randomizeMaze_2();
squaree.y = wall_h / 2;
for (let m = 1; m < cols; m++) {
	if (maze[0][m] == 0) {
		squaree.x = wall_w * m + (wall_w / 2);
		console.log(m);
		console.log(squaree.x);
		break;
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
