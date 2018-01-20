let canvas;
let tankPos, triPos, tankLevel;
let tankDiagram, triDiagram;
let currentFrame, frameCount;
let once = true;
let startValueSlider, impulseGainSlider, impulseFrequencySlider,lossSlider;

function setup() {
	if (once) {
		let isRunning = true;
		frameRate(120);

		createDiv('').id('menu-strip');
		createDiv('').id('button-wrapper').parent('menu-strip').style('width', '120px').style('display', 'inline-block');
		createDiv('').id('slider-wrapper').parent('menu-strip').style('display', 'inline-block');
		createDiv('').id('slider-wrapper2').parent('menu-strip').style('display', 'inline-block');

		canvas = createCanvas(screen.width * 0.98, screen.height)
			.style('z-index', -1)
			.position(0, 125);

		 createButton('Stop')
			.size(100, 50)
			.style('font-size', '1em')
			.parent('button-wrapper')
			.mouseClicked(function () {
				if (isRunning) {
					noLoop();
					this.elt.textContent = 'Start';
				}
				else {
					loop();
					this.elt.textContent = 'Stop'
				}
				isRunning = !isRunning;
			});

		 createButton('Újraindítás')
			.size(100, 50)
			.style('font-size', '1em')
			.parent('button-wrapper')
			.mouseClicked(function () {
				isRunning = true;
				loop();
				setup();
			});

		createDiv('Kezdő szint').parent('slider-wrapper');
		startValueSlider = createSlider(0, 1, 1, 0).parent('slider-wrapper');
		createDiv('Impulzus nagyság').parent('slider-wrapper');
		impulseGainSlider = createSlider(0, 100, 90).parent('slider-wrapper');

		createDiv('Impulzus gyakoriság').parent('slider-wrapper2');
		impulseFrequencySlider = createSlider(1, 300, 150, 5).parent('slider-wrapper2');
		createDiv('Veszteség').parent('slider-wrapper2');
		lossSlider=createSlider(0, 1, 0.5,0).parent('slider-wrapper2');


		once = false
	}

	clear();
	background(230);
	tankDiagram = new Array(1500);
	triDiagram = new Array(1500);
	currentFrame = 0;
	frameCount = 0;

	tankPos = {x1: 150, y1: 50, x2: 250, y2: 300};
	tankLevel = {x1: 150, y1: 50 + (tankPos.y2 - tankPos.y1) * (1 - startValueSlider.value()), x2: 250, y2: 300};
	triPos = {x: 500, y: 300, h: 250, fi: Math.PI / 8};
	triLevel = {x: 500, y: 300, h: 250, fi: Math.PI / 8};

	stroke(150);
	for (let i = 0; i < 7; i++) {
		line(tankPos.x2, tankPos.y1 + (tankPos.y2 - tankPos.y1) / 6 * i, screen.width, tankPos.y1 + (tankPos.y2 - tankPos.y1) / 6 * i)
	}
}


function draw() {
	//clear();
	fill(200);
	rectMode(CORNERS);
	stroke(25);
	rect(tankPos.x1, tankPos.y1, tankPos.x2, tankPos.y2, 2);
	fill(0, 0, 255);
	rect(tankLevel.x1, tankLevel.y1, tankLevel.x2, tankLevel.y2, 2);
	//if (tankLevel.y1 !== tankLevel.y2) tankLevel.y1++;
	if (tankLevel.y1 <= tankLevel.y2) loss(tankLevel,lossSlider.value() , 'RECT');
	tankDiagram[currentFrame] = {val: tankLevel.y1 - tankPos.y1, t: currentFrame};
	drawGraph(tankPos.x2 + 25, tankPos.y1, 500, 400, tankDiagram);
	/*fill(200);
	drawTriangle(triPos.x, triPos.y, triPos.h, triPos.fi);
	fill(0, 255, 0);
	drawTriangle(triLevel.x, triLevel.y, triLevel.h, triLevel.fi);
	if (triLevel.y <= triPos.y) loss(triLevel, 0.5, 'TRIANGLE');
*/
	currentFrame++;

	frameCount++;
	if (frameCount >= impulseFrequencySlider.value()) {
		impulse(impulseGainSlider.value() / 100);
		frameCount = 0;
	}
}


function impulse(gain) {
	//if (tankPos.y2 - (tankPos.y2 - tankPos.y1) * gain < tankLevel.y1) tankLevel.y1 = tankPos.y2 - (tankPos.y2 - tankPos.y1) * gain

	tankLevel.y1 -= (tankPos.y2 - tankPos.y1) * gain;
	if (tankLevel.y1 < tankPos.y1) tankLevel.y1 = tankPos.y1
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
	stroke(255, 0, 0);
	if (currentFrame > 1) {
		line(arr[currentFrame].t + x, arr[currentFrame].val + y, arr[currentFrame - 1].t + x, arr[currentFrame - 1].val + y);
		if (arr[currentFrame].t + x >= screen.width || currentFrame === 1499) setup();
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