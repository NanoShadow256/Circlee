const canv = document.getElementById('canv');
const canv_w = canv.width;
const canv_h = canv.height;

let ctx = document.getElementById('canv').getContext('2d');

let circlee = {
	direction: [1, 0],
	x: 100,
	y: 100,
	radius: 10,
	speed: 10
};

function collCheck() {
	let a = false;
	if (circlee.x < circlee.radius) {
		circlee.x = circlee.radius;
		a = true;
	}
	if (circlee.y < circlee.radius) {
		circlee.y = circlee.radius;
		a = true;
	}
	if (circlee.x > canv_w - circlee.radius) {
		circlee.x = canv_w - circlee.radius;
		a = true;
	}
	if (circlee.y > canv_h - circlee.radius) {
		circlee.y = canv_h - circlee.radius;
		a = true;
	}
	if (a) {
		drawF();
	}
	return a;
}

let t1;
let t2 = performance.now();
function drawF() {
	t1 = performance.now();
	let el = t1 - t2;
	t2 = t1;
	ctx.clearRect(0, 0, 500, 500);
	ctx.fillStyle = '#00c';
	ctx.beginPath();
	ctx.arc(circlee.x, circlee.y, circlee.radius, 0, 2 * Math.PI);
	ctx.fill();
	circlee.x += (circlee.speed / 100 * el) * circlee.direction[0];
	circlee.y += (circlee.speed / 100 * el) * circlee.direction[1];
	if (!collCheck()) {
		requestAnimationFrame(drawF);
	}
}
requestAnimationFrame(drawF);

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
