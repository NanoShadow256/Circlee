const canv = document.getElementById('canv');
const canv_w = canv.width;
const canv_h = canv.height;

const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];

const ctx = document.getElementById('canv').getContext('2d');

let min_dir = 0;


const U = 'w_up';
const R = 'w_right';
const D = 'w_down';
const L = 'w_left';
const C = 'tp_ci';
const S = 'tp_sq';

const theme = {
	'game_bg': '',
	'circlee': '#00c',
	'circlee_border': '#56f',
	'squaree': '#e90',
	'squaree_border':'#940',
	'border_w': 1,
	'wall': '#72b',
	'wall_border': '#308',
	'circlee_tp': ['#025', '#14a', '#07e'], // outside to inside
	'squaree_tp': ['#520', '#950', '#d60'],
	'slow': ['#f2a', '#fff'],
	'speedy': ['#9f96', '#4f4f'], // start (lower opacity) to end
	'speedy_arr': '#085'
};

const circlee = {
	direction: [0, 0],
	x: 100,
	y: 100,
	size: 7,
	speed: 10,
	base_speed: 10,
	last_x: 100,
	last_y: 100,
	do_not_tp: false
};

const squaree = {
	direction: [0, 0],
	x: 100,
	y: 100,
	size: 7,
	speed: 5,
	base_speed: 5,
	last_x: 100,
	last_y: 100,
	do_not_tp: false
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

function spark4(x, y, w, h, a) {
	ctx.moveTo(x, y - h / 2);
	ctx.quadraticCurveTo(x + w * a,	y - h * a, x + w / 2, y);
	ctx.quadraticCurveTo(x + w * a,	y + h * a, x, y + h / 2);
	ctx.quadraticCurveTo(x - w * a,	y + h * a, x - w / 2, y);
	ctx.quadraticCurveTo(x - w * a,	y - h * a, x, y - h / 2);
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
		for (let m = 0; m < cols - 1; m++) {
			if (!(maze[rows - 2][m] == 0 && (maze[rows - 2][m - 1] == 1 || maze[rows - 2][m + 1] == 1)) && !(maze[rows - 1][m - 1] == 0 && maze[rows - 2][m - 1] == 1)) {
				maze[rows - 1][m] = Math.round(Math.random());
			}
		}
		for (let n = 1; n < rows - 2; n++) {
			for (let m = 0; m < cols; m++) {
				if (!(maze[n - 1][m] == 0 && (maze[n - 1][m - 1] == 1 || maze[n - 1][m + 1] == 1)) && !(maze[n][m - 1] == 0 && (maze[n - 1][m - 1] == 1 || maze[n + 1][m + 1] == 1))) {
					maze[n][m] = Math.round(Math.random());
				}
			}
		}
		for (let m = 0; m < cols - 3; m++) {
			maze[rows - 1][m] = Math.round(Math.random());
		}
	},
	updateMaze: () => {
		rows = maze.length;
		cols = maze[0].length;
		wall_w = canv_w / cols;
		wall_h = canv_h / rows;
	},
	drawMaze: () => {
		for (let n = 0; n < rows; n++) {
			for (let m = 0; m < cols; m++) {
				if (maze[n][m] == 1) {
					// ctx.fillRect(m * wall_w, n * wall_h, wall_w, wall_h);
					// ctx.fillStyle = theme['wall'];
					// ctx.fillRect(Math.floor(m * wall_w), Math.floor(n * wall_h), Math.ceil(wall_w), Math.ceil(wall_h));
					ctx.fillStyle = theme['wall'];
					ctx.fillRect(Math.floor(m * wall_w), Math.floor(n * wall_h), Math.ceil(wall_w), Math.ceil(wall_h));
					ctx.fillStyle = theme['wall_border'];
					if (maze[n][m + 1] != 1) {
						ctx.fillRect(Math.ceil(m * wall_w + wall_w) - 2, Math.floor(n * wall_h), 2, Math.ceil(wall_h));
					}
					if (maze[n][m - 1] != 1) {
						ctx.fillRect(Math.floor(m * wall_w), Math.floor(n * wall_h), 2, Math.ceil(wall_h));
					}
					if (!maze[n + 1] || maze[n + 1][m] != 1) {
						ctx.fillRect(Math.floor(m * wall_w), Math.ceil(n * wall_h + wall_h) - 2, Math.ceil(wall_w), 2);
					}
					if (!maze[n - 1] || maze[n - 1][m] != 1) {
						ctx.fillRect(Math.floor(m * wall_w), Math.floor(n * wall_h), Math.ceil(wall_w), 2);
					}
					if (maze[n + 1]) {
						if (maze[n + 1][m + 1] != 1) {
							ctx.fillRect(Math.ceil(m * wall_w + wall_w) - 2, Math.ceil(n * wall_h + wall_h) - 2, 2, 2);
						}
						if (maze[n + 1][m - 1] != 1) {
							ctx.fillRect(Math.floor(m * wall_w), Math.ceil(n * wall_h + wall_h) - 2, 2, 2)
						}
					}
					if (maze[n - 1]) {
						if (maze[n - 1][m + 1] != 1) {
							ctx.fillRect(Math.ceil(m * wall_w + wall_w) - 2, Math.floor(n * wall_h), 2, 2);
						}
						if (maze[n - 1][m - 1] != 1) {
							ctx.fillRect(Math.floor(m * wall_w), Math.floor(n * wall_h), 2, 2)
						}
					}
				} else if (maze[n][m] == 2) {
					const grad1 = ctx.createRadialGradient(Math.floor(m * wall_w + wall_w / 2), Math.floor(n * wall_h + wall_h / 2), 0, Math.floor(m * wall_w + wall_w / 2), Math.floor(n * wall_h + wall_h / 2), Math.max(wall_w, wall_h) / 2);
					grad1.addColorStop(0, theme['slow'][1]);
					grad1.addColorStop(1, theme['slow'][0]);
					ctx.fillStyle = grad1;
					ctx.fillRect(Math.floor(m * wall_w), Math.floor(n * wall_h), Math.ceil(wall_w), Math.ceil(wall_h));
				} else if (maze[n][m] == 3) {
					ctx.fillStyle = '#000';
					ctx.fillRect(Math.floor(m * wall_w), Math.floor(n * wall_h), Math.ceil(wall_w), Math.ceil(wall_h));
					let xx = 2;
					let xx2 = 10;
					ctx.fillStyle = '#666';
					ctx.beginPath();
					spark4(m * wall_w + wall_w / 2, n * wall_h + wall_h / 2, wall_w - 2, wall_h - 2, 0.1);
					ctx.fill();
					ctx.fillStyle = '#fff';
					ctx.beginPath();
					spark4(m * wall_w + wall_w / 2, n * wall_h + wall_h / 2, wall_w - wall_w / 4, wall_h - wall_h / 4, 0);
					ctx.fill();
				} else if (maze[n][m] == C) {
					ctx.fillStyle = theme['circlee_tp'][0];
					ctx.fillRect(Math.floor(m * wall_w), Math.floor(n * wall_h), Math.ceil(wall_w), Math.ceil(wall_h));
					ctx.fillStyle = theme['circlee_tp'][1]; ctx.beginPath();
					ctx.ellipse(m * wall_w + wall_w / 2, n * wall_h + wall_h / 2, wall_w / 2, wall_h / 2, 0, 0, 2 * Math.PI); ctx.fill();
					ctx.fillStyle = theme['circlee_tp'][2]; ctx.beginPath();
					ctx.arc(m * wall_w + wall_w / 2, n * wall_h + wall_h / 2, Math.min(wall_w, wall_h) / 3, 0, 2 * Math.PI); ctx.fill();
				} else if (maze[n][m] == S) {
					ctx.fillStyle = theme['squaree_tp'][0];
					ctx.fillRect(Math.floor(m * wall_w), Math.floor(n * wall_h), Math.ceil(wall_w), Math.ceil(wall_h));					
					ctx.fillStyle = theme['squaree_tp'][1]; ctx.beginPath();
					ctx.moveTo(m * wall_w + wall_w / 2, n * wall_h);
					ctx.lineTo(m * wall_w + wall_w, n * wall_h + wall_h / 2);
					ctx.lineTo(m * wall_w + wall_w / 2, n * wall_h + wall_h);
					ctx.lineTo(m * wall_w, n * wall_h + wall_h / 2);
					ctx.lineTo(m * wall_w + wall_w / 2, n * wall_h);
					ctx.fill();
					ctx.fillStyle = theme['squaree_tp'][2];
					ctx.fillRect(m * wall_w + wall_w / 4, n * wall_h + wall_h / 4, wall_w - (wall_w / 2), wall_h - (wall_h / 2));
				} else if (maze[n][m] == L) {
					const grad1 = ctx.createLinearGradient(Math.floor(m * wall_w), 0, Math.ceil(m * wall_w + wall_w), 0);
					grad1.addColorStop(0, theme['speedy'][1]);
					grad1.addColorStop(1, theme['speedy'][0]);
					ctx.fillStyle = grad1;
					ctx.fillRect(Math.ceil(m * wall_w), Math.ceil(n * wall_h), Math.floor(wall_w), Math.floor(wall_h));
					ctx.fillStyle = theme['speedy_arr'];
					ctx.beginPath();
					ctx.moveTo(m * wall_w + wall_w / 10, n * wall_h + wall_h / 2);
					ctx.lineTo(m * wall_w + wall_w - wall_w / 4, n * wall_h + wall_h - wall_h / 10);
					ctx.lineTo(m * wall_w + wall_w - wall_w / 4, n * wall_h + wall_h - wall_h / 5);
					ctx.lineTo(m * wall_w + wall_w / 2.5, n * wall_h + wall_h / 2);
					ctx.lineTo(m * wall_w + wall_w - wall_w / 4, n * wall_h + wall_h / 5);
					ctx.lineTo(m * wall_w + wall_w - wall_w / 4, n * wall_h + wall_h / 10);
					ctx.closePath();
					ctx.fill();
				} else if (maze[n][m] == R) {
					const grad1 = ctx.createLinearGradient(Math.floor(m * wall_w), 0, Math.ceil(m * wall_w + wall_w), 0);
					grad1.addColorStop(0, theme['speedy'][0]);
					grad1.addColorStop(1, theme['speedy'][1]);
					ctx.fillStyle = grad1;
					ctx.fillRect(Math.ceil(m * wall_w), Math.ceil(n * wall_h), Math.floor(wall_w), Math.floor(wall_h));
					ctx.fillStyle = theme['speedy_arr'];
					ctx.beginPath();
					ctx.moveTo(m * wall_w + wall_w - wall_w / 10, n * wall_h + wall_h / 2);
					ctx.lineTo(m * wall_w + wall_w / 4, n * wall_h + wall_h - wall_h / 10);
					ctx.lineTo(m * wall_w + wall_w / 4, n * wall_h + wall_h - wall_h / 5);
					ctx.lineTo(m * wall_w + wall_w - wall_w / 2.5, n * wall_h + wall_h / 2);
					ctx.lineTo(m * wall_w + wall_w / 4, n * wall_h + wall_h / 5);
					ctx.lineTo(m * wall_w + wall_w / 4, n * wall_h + wall_h / 10);
					ctx.closePath();
					ctx.fill();
				} else if (maze[n][m] == U) {
					const grad1 = ctx.createLinearGradient(0, Math.floor(n * wall_h), 0, Math.ceil(n * wall_h + wall_h));
					grad1.addColorStop(0, theme['speedy'][1]);
					grad1.addColorStop(1, theme['speedy'][0]);
					ctx.fillStyle = grad1;
					ctx.fillRect(Math.ceil(m * wall_w), Math.ceil(n * wall_h), Math.floor(wall_w), Math.floor(wall_h));
					ctx.fillStyle = theme['speedy_arr'];
					ctx.beginPath();
					ctx.moveTo(m * wall_w + wall_w / 2, n * wall_h + wall_h / 10);
					ctx.lineTo(m * wall_w + wall_w - wall_w / 10, n * wall_h + wall_h - wall_h / 4);
					ctx.lineTo(m * wall_w + wall_w - wall_w / 5, n * wall_h + wall_h - wall_h / 4);
					ctx.lineTo(m * wall_w + wall_w / 2, n * wall_h + wall_h / 2.5);
					ctx.lineTo(m * wall_w + wall_w / 5, n * wall_h + wall_h - wall_h / 4);
					ctx.lineTo(m * wall_w + wall_w / 10, n * wall_h + wall_h - wall_h / 4);
					ctx.closePath();
					ctx.fill();
				} else if (maze[n][m] == D) {
					const grad1 = ctx.createLinearGradient(0, Math.floor(n * wall_h), 0, Math.ceil(n * wall_h + wall_h));
					grad1.addColorStop(0, theme['speedy'][0]);
					grad1.addColorStop(1, theme['speedy'][1]);
					ctx.fillStyle = grad1;
					ctx.fillRect(Math.ceil(m * wall_w), Math.ceil(n * wall_h), Math.floor(wall_w), Math.floor(wall_h));
					ctx.fillStyle = theme['speedy_arr'];
					ctx.beginPath();
					ctx.moveTo(m * wall_w + wall_w / 2, n * wall_h + wall_h - wall_h / 10);
					ctx.lineTo(m * wall_w + wall_w - wall_w / 10, n * wall_h + wall_h / 4);
					ctx.lineTo(m * wall_w + wall_w - wall_w / 5, n * wall_h + wall_h / 4);
					ctx.lineTo(m * wall_w + wall_w / 2, n * wall_h + wall_h - wall_h / 2.5);
					ctx.lineTo(m * wall_w + wall_w / 5, n * wall_h + wall_h / 4);
					ctx.lineTo(m * wall_w + wall_w / 10, n * wall_h + wall_h / 4);
					ctx.closePath();
					ctx.fill();
				}
			}
		}
	},
	drawCircle: () => {
		ctx.fillStyle = theme['circlee'];
		ctx.strokeStyle = theme['circlee_border'];
		ctx.lineWidth = 1.3;
		ctx.beginPath();
		ctx.arc(circlee.x, circlee.y, circlee.size, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	},
	drawSquare: () => {
		ctx.fillStyle = theme['squaree'];
		ctx.fillRect(squaree.x - squaree.size, squaree.y - squaree.size, squaree.size * 2, squaree.size * 2);
		ctx.strokeStyle = theme['squaree_border'];
		ctx.lineWidth = 1.3;
		ctx.strokeRect(squaree.x - squaree.size, squaree.y - squaree.size, squaree.size * 2, squaree.size * 2);
	},
	findSqPath: () => {
		let ci_grid_pos = gridConvert([circlee.x, circlee.y], fromG=false);
		let sq_grid_pos = gridConvert([squaree.x, squaree.y], fromG=false);
		if (ci_grid_pos[0] == gridConvert([circlee.last_x, circlee.last_y], fromG=false)[0]
			&& ci_grid_pos[1] == gridConvert([circlee.last_x, circlee.last_y], fromG=false)[1]
			&& sq_grid_pos[0] == gridConvert([squaree.last_x, squaree.last_y], fromG=false)[0]
			&& sq_grid_pos[1] == gridConvert([squaree.last_x, squaree.last_y], fromG=false)[1]) {
			// console.log('baaaaaaaaaaaaaaaaaaaaa');
			return;
		}
		// console.log('ci: ' + ci+ wall_h / 2), 0, Math.floor(m * wall_w + wall_w / 2), Math.floor(n * wall_h + wall_h / 2_grid_pos);
		// console.log('ci_l: ' + gridConvert([circlee.last_x, circlee.last_y], fromG=false));
		// console.log(ci_grid_pos == gridConvert([circlee.last_x, circlee.last_y], fromG=false));
		// console.log('ci_l_raw: ' + [circlee.last_x, circlee.last_y]);
		// console.log('sq: ' + sq_grid_pos);
		let to_an = [ci_grid_pos];
		let ta2 = [];
		let visited = [];
		for (let n = 0; n < rows; n++) {
			visited.push([]);
			for (let m = 0; m < cols; m++) {
				visited[n].push(false);
			}
		}
		let layer = 0;
		if (to_an[0][0] == sq_grid_pos[0] && to_an[0][1] == sq_grid_pos[1]) {
			squaree.direction = [0, 0];
			return;
		}
		layer++;
		do {
			let cur_node = to_an[0];
			if (cur_node[0] == tp2_grid_pos[0][0] && cur_node[1] == tp2_grid_pos[0][1]) {
				cur_node = JSON.parse(JSON.stringify(tp2_grid_pos[1]));
			} else if (cur_node[0] == tp2_grid_pos[1][0] && cur_node[1] == tp2_grid_pos[1][1]) {
				cur_node = JSON.parse(JSON.stringify(tp2_grid_pos[0]));
			}
			// console.log('cn: ' + cur_node);
			for (d in dirs) {
				if (maze[cur_node[1] + dirs[d][1]] == undefined
					|| visited[cur_node[1] + dirs[d][1]][cur_node[0] + dirs[d][0]]
					|| maze[cur_node[1] + dirs[d][1]][cur_node[0] + dirs[d][0]] == 1
					|| maze[cur_node[1] + dirs[d][1]][cur_node[0] + dirs[d][0]] == undefined) {
					// console.log(maze[cur_node[1] + dirs[d][1]] == undefined);
					// if (maze[cur_node[1] + dirs[d][1]] != undefined) {
						// console.log(
						// ' ' + visited[cur_node[1] + dirs[d][1]][cur_node[0] + dirs[d][0]] == true +
						// ' ' + maze[cur_node[1] + dirs[d][1]][cur_node[0] + dirs[d][0]] != 0);
					// }
					continue;
				}
				if (cur_node[0] + dirs[d][0] == sq_grid_pos[0] && cur_node[1] + dirs[d][1] == sq_grid_pos[1]) {
					// console.log(dirs[d]);

					// final direction!!!
					
					// let ch_x = (squaree.speed / 100 * el) * dirs[d][0] * -1;
					// let ch_y = (squaree.speed / 100 * el) * dirs[d][1] * -1;

					let next_x = squaree.x; //+ ch_x;
					let next_y = squaree.y; //+ ch_y;

					let b_up, b_dn, b_l, b_r;
					let grid_x = (squaree.x - squaree.x % (canv_w / cols)) / (canv_w / cols);
					let grid_y = (squaree.y - squaree.y % (canv_h / rows)) / (canv_h / rows);
					
					if (dirs[d][0]) {
						b_l = 0;
						b_r = cols * wall_w;
					} else {
						b_l = (grid_x) * wall_w;
						b_r = (grid_x + 1) * wall_w;
					}
					if (dirs[d][1]) {
						b_up = 0;
						b_dn = rows * wall_h;
					} else {
						b_up = (grid_y) * wall_h;
						b_dn = (grid_y + 1) * wall_h;
					}

					if (next_x < b_l + squaree.size) {
						squaree.direction = [1, 0];
					} else if (next_y < b_up + squaree.size) {
						squaree.direction = [0, 1];
					} else if (next_x > b_r - squaree.size) {
						squaree.direction = [-1, 0];
					} else if (next_y > b_dn - squaree.size) {
						squaree.direction = [0, -1];
					} else {
						squaree.direction = [dirs[d][0] * -1, dirs[d][1] * -1];
					}

					to_an = [];
					ta2 = [];
					break;
				}
				visited[cur_node[1] + dirs[d][1]][cur_node[0] + dirs[d][0]] = true;
				ta2.push([cur_node[0] + dirs[d][0], cur_node[1] + dirs[d][1]]);
				// console.log(ta2);
			}
			to_an.shift();
			if (to_an.length == 0) {
				if (ta2.length == 0) {
					break;
				}
				// console.log('to_an: ' + to_an);
				// console.log('ta2: ' + ta2);
				to_an = JSON.parse(JSON.stringify(ta2));
				ta2 = [];
				layer++;
			}
		} while (to_an != []);
		// console.log('aaaaaaaaaaaaaaaaa');
		// console.log('layer: ' + layer);
	},
	frame: () => {
		ctx.clearRect(0, 0, canv_w, canv_h);
		game.drawMaze();
		game.drawCircle();
		game.drawSquare();
	}
};

let maze = [
[0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
[1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, S, 0, 1, 0, 1, 0, 0],
[0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
[0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0],
[0, 0, 0, 1, 0, 2, 2, 2, 0, 0, 0, 0, 0, C, 0, 0, 0, 3, 0, 0],
[0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
[0, 0, R, R, R, R, R, R, R, R, R, R, R, 0, 0, 0, 0, 1, 0, 0],
[0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0],
[0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 3, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, C, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0],
[0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, L, 0, 0, 0, 0, 0, 0],
[S, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
];

// let maze = [[5]];

// let maze = [
// [0, 0, 0, 0, 0, 0, 0],
// [0, 0, 0, 0, 0, 0, 0],
// [0, 0, 0, 0, 0, 0, 0],
// [0, 0, 0, 0, 0, 0, 0],
// [0, 0, 0, 0, 0, 0, 0]
// ];

let rows, cols, wall_w, wall_h;
game.updateMaze();

let tp_grid_pos = [[7, 10], [13, 5]];
let tp_pos = [gridConvert(tp_grid_pos[0], center=true), gridConvert(tp_grid_pos[1], center=true)];

let tp2_grid_pos = [[0, 12], [13, 2]];
let tp2_pos = [gridConvert(tp2_grid_pos[0], center=true), gridConvert(tp2_grid_pos[1], center=true)];

let spawnPos = gridConvert([0, 0], center=true);
circlee.x = spawnPos[0];
circlee.y = spawnPos[1];
circlee.last_x = spawnPos[0];
circlee.last_y = spawnPos[1];

function collCheck(ch_x, ch_y, obj, setPos=true) {
	let next_x = obj.x + ch_x;
	let next_y = obj.y + ch_y;

	let b_up, b_dn, b_l, b_r;
	let grid_x = (obj.x - obj.x % (canv_w / cols)) / (canv_w / cols);
	let grid_y = (obj.y - obj.y % (canv_h / rows)) / (canv_h / rows);

	if (maze[grid_y][grid_x] == 2) {
		obj.speed = obj.base_speed / 2;
	} else if (maze[grid_y][grid_x] == L) {
		if (obj.direction[0] == -1) {
			obj.speed = obj.base_speed * 3;
		} else if (obj.direction[0] == 1) {
			obj.speed = obj.base_speed / 3;
		} else {
			obj.speed = obj.base_speed;
		}
	} else if (maze[grid_y][grid_x] == R) {
		if (obj.direction[0] == 1) {
			obj.speed = obj.base_speed * 3;
		} else if (obj.direction[0] == -1) {
			obj.speed = obj.base_speed / 3;
		} else {
			obj.speed = obj.base_speed;
		}
	} else if (maze[grid_y][grid_x] == U) {
		if (obj.direction[1] == -1) {
			obj.speed = obj.base_speed * 3;
		} else if (obj.direction[1] == 1) {
			obj.speed = obj.base_speed / 3;
		} else {
			obj.speed = obj.base_speed;
		}
	} else if (maze[grid_y][grid_x] == D) {
		if (obj.direction[1] == 1) {
			obj.speed = obj.base_speed * 3;
		} else if (obj.direction[1] == -1) {
			obj.speed = obj.base_speed / 3;
		} else {
			obj.speed = obj.base_speed;
		}
	} else {
		obj.speed = obj.base_speed;
	}

	if (maze[grid_y][grid_x] == C && obj == circlee) {
		if (!obj.do_not_tp) {
			if (grid_x == tp_grid_pos[0][0] && grid_y == tp_grid_pos[0][1]) {
				obj.x = tp_pos[1][0];
				obj.y = tp_pos[1][1];
			} else {
				obj.x = tp_pos[0][0];
				obj.y = tp_pos[0][1];
			}
			obj.direction = [0, 0];
			obj.do_not_tp = true;
		}
	} else if (obj == circlee) {
		obj.do_not_tp = false;
	}
	if (maze[grid_y][grid_x] == S && obj == squaree) {
		if (!obj.do_not_tp) {
			if (grid_x == tp2_grid_pos[0][0] && grid_y == tp2_grid_pos[0][1]) {
				obj.x = tp2_pos[1][0];
				obj.y = tp2_pos[1][1];
			} else {
				obj.x = tp2_pos[0][0];
				obj.y = tp2_pos[0][1];
			}
			obj.direction = [0, 0];
			obj.do_not_tp = true;
		}
	} else if (obj == squaree) {
		obj.do_not_tp = false;
	}

	if (grid_x == 0) {
		b_l = 0;
	} else {
		if (maze[grid_y][grid_x - 1] == 1) {
			b_l = (grid_x) * wall_w;
		} else {
			b_l = 0;
		}
	}
	if (grid_y == 0) {
		b_up = 0;
	} else {
		if (maze[grid_y - 1][grid_x] == 1) {
			b_up = (grid_y) * wall_h;
		} else {
			b_up = 0;
		}
	}
	if (grid_x == cols - 1) {
		b_r = cols * wall_w;
	} else {
		if (maze[grid_y][grid_x + 1] == 1) {
			b_r = (grid_x + 1) * wall_w;
		} else {
			b_r = cols * wall_w;
		}
	}
	if (grid_y == rows - 1) {
		b_dn = rows * wall_h;
	} else {
		if (maze[grid_y + 1][grid_x] == 1) {
			b_dn = (grid_y + 1) * wall_h;
		} else {
			b_dn = rows * wall_h;
		}
	}

	let a = false;
	if (next_x < b_l + obj.size) {
		if (setPos) obj.x = b_l + obj.size;
		a = true;
	}
	if (next_y < b_up + obj.size) {
		if (setPos) obj.y = b_up + obj.size;
		a = true;
	}
	if (next_x > b_r - obj.size) {
		if (setPos) obj.x = b_r - obj.size;
		a = true;
	}
	if (next_y > b_dn - obj.size) {
		if (setPos) obj.y = b_dn - obj.size;
		a = true;
	}
	return a;
}

let t1;
let t2 = performance.now();
let el;
function gameLoop() {
	t1 = performance.now();
	el = t1 - t2;
	t2 = t1;
	game.frame();
	let ch_x = (circlee.speed / 100 * el) * circlee.direction[0]; // change of x position
	let ch_y = (circlee.speed / 100 * el) * circlee.direction[1]; // change of y position
	let ch_x2 = (squaree.speed / 100 * el) * squaree.direction[0]; // change of x position
	let ch_y2 = (squaree.speed / 100 * el) * squaree.direction[1]; // change of y position
	game.findSqPath();
	// if (!collCheck(ch_x2, ch_y2, squaree)) {
	// 	squaree.x += ch_x2;
	// 	squaree.y += ch_y2;
	// }
	squaree.x += ch_x2;
	squaree.y += ch_y2;
	collCheck(ch_x2, ch_y2, squaree, setPos = true);
	if (!collCheck(ch_x, ch_y, circlee)) {
		circlee.last_x = circlee.x;
		circlee.last_y = circlee.y;
		circlee.x += ch_x;
		circlee.y += ch_y;
		requestAnimationFrame(gameLoop);
	} else {
		game.frame();
	}
}
// game.randomizeMaze_2();
squaree.y = canv_h - wall_h / 2;
for (let m = cols - 1; m >= 0; m--) {
	if (maze[rows - 1][m] == 0) {
		squaree.x = wall_w * m + (wall_w / 2);
		// console.log(m);
		// console.log(squaree.x);
		break;
	}
}
squaree.last_x = squaree.x;
squaree.last_y = squaree.y;
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
