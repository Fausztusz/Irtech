let canvas;

function setup() {
	canvas = createCanvas(screen.width * 0.98, screen.height)
		.style('z-index', -1);
	background(200);

	let isRunning = true;
	let stopButton = createButton('Stop').size(100, 75).mouseClicked(function () {
		if (isRunning) noLoop();
		else loop();
		isRunning = !isRunning;
	})


}

let tankPos, triPos, tankLevel;
let tankDiagram = [], triDiagram = [];
tankPos = {x1: 150, y1: 50, x2: 250, y2: 300};
tankLevel = {x1: 150, y1: 50, x2: 250, y2: 300};
triPos = {x: 500, y: 300, h: 250, fi: Math.PI / 8};
triLevel = {x: 500, y: 300, h: 250, fi: Math.PI / 8};
let start = Date.now();
let frameCount = 0;


//setInterval(impulse, 3000);

function draw() {
	clear();
	fill(200);
	rectMode(CORNERS);
	stroke(25);
	rect(tankPos.x1, tankPos.y1, tankPos.x2, tankPos.y2, 2);
	fill(0, 0, 255);
	rect(tankLevel.x1, tankLevel.y1, tankLevel.x2, tankLevel.y2, 2);
	//if (tankLevel.y1 !== tankLevel.y2) tankLevel.y1++;
	if (tankLevel.y1 <= tankLevel.y2) loss(tankLevel, 0.5, 'RECT');
	/*fill(200);
	drawTriangle(triPos.x, triPos.y, triPos.h, triPos.fi);
	fill(0, 255, 0);
	drawTriangle(triLevel.x, triLevel.y, triLevel.h, triLevel.fi);
	if (triLevel.y <= triPos.y) loss(triLevel, 0.5, 'TRIANGLE');
*/
	tankDiagram.push({val: tankLevel.y1 - tankPos.y1, t: Date.now() - start});
	drawGraph(tankPos.x2 + 200, tankPos.y1, 500, 400, tankDiagram);

	frameCount++;
	if (frameCount === 150) {
		impulse();
		frameCount = 0;
	}
}


function impulse() {
	tankLevel.y1 = tankPos.y1;
}


/**
 * Decrement the value of the tanks
 * @param pos The position array
 * @param rate The rate of decrement in percentage
 * @param type The shape type of the tank
 */
function loss(pos, rate, type) {
	let area = undefined;
	if (type === 'RECT') {
		area = (pos.x2 - pos.x1) * (pos.y2 - pos.y1);
		area *= (1 - rate / 100);
		pos.y1 = pos.y2 - area / (pos.x2 - pos.x1)
	}
	if (type === 'TRIANGLE') {
		let z = pos.h * Math.tan(pos.fi);
		area = z * pos.h;
		area *= (1 - rate / 100);
		z *= Math.sqrt(1 - rate / 100);
		pos.h = area / z;
	}
}

function drawGraph(x, y, w, h, arr) {

	stroke(230);
	for (let i = 0; i < 6; i++) {
		line(tankPos.x2, tankPos.y1 + (tankPos.y2 - tankPos.y1) / 5 * i, screen.width, tankPos.y1 + (tankPos.y2 - tankPos.y1) / 5 * i)
	}
	rectMode(CENTER);
	fill(130);
	//rect(x,y,w,h);
	stroke(255, 0, 0);
	if (arr.length >= 2) {
		for (let i = 0; i < arr.length - 1; i++) {
			line(arr[i].t / 10 + x, arr[i].val + y, arr[i + 1].t / 10 + x, arr[i + 1].val + y);
		}
		if (arr[arr.length - 1].t / 10 + x >= screen.width) {
			tankDiagram = [];
			start = Date.now();
		}
	}


}


/**
 * @param x A középső pont X koordinátája
 * @param y    A középső pont X koordinátája
 * @param h    A háromszög magassága
 * @param fi A háromszög félcsúcsszöge
 */
function drawTriangle(x, y, h, fi) {
	triangle(x - h * Math.tan(fi), y - h, x + h * Math.tan(fi), y - h, x, y)
}