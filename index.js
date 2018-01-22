let canvas;
let tankPos, triPos, tankLevel;
let tankDiagram, triLevel, triDiagram;
let currentFrame, frameCount;
let once = true;
let radioButton, startValueSlider, impulseGainSlider, impulseFrequencySlider, lossSlider;
let wrapper1, wrapper2;
let options = [], selectedOption = 0;


function setup() {
	if (once) {
		let isRunning = true;
		frameRate(120);

		createDiv('').id('menu-strip');
		createDiv('').id('button-wrapper').parent('menu-strip').style('width', '120px').style('display', 'inline-block');
		createDiv('').id('options-wrapper').parent('menu-strip').style('width', '600px').style('display', 'inline-block');
		wrapper1 = createDiv('').id('slider-wrapper').parent('menu-strip').style('display', 'inline-block');
		wrapper2 = createDiv('').id('slider-wrapper2').parent('menu-strip').style('display', 'inline-block');

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

		createDiv('Opciók:').parent('options-wrapper');
		radioButton = createRadio()
			.parent('options-wrapper')
			.style('display', 'inline-block')
			.style('align-items', 'middle')
			.style('flex-direction', 'column')
			.style('-moz-user-select', 'none')
			.style('-webkit-user-select', 'none')
			.style('user-select', 'none')
			.changed(function (ev) {
				switch (ev.target) {
					case options[0]:
						selectedOption = 0;
						setup();
						break;
					case options[1]:
						selectedOption = 1;
						setup();
						break;
					case options[2]:
						selectedOption = 2;
						setup();
						break;
					case options[3]:
						selectedOption = 3;
						setup();
						break;
					default:
						console.log('Error!')
				}

			});

		options.push(radioButton.option('Egységválasz'));
		options.push(radioButton.option('Kétszeres válasz'));
		options.push(radioButton.option('Időben eltolt gerjesztés'));
		options.push(radioButton.option('Interaktív'));
		options[0].checked = true;
		textAlign(CENTER);


		createDiv('Kezdő szint').parent('slider-wrapper');
		startValueSlider = createSlider(0, 100, 100).parent('slider-wrapper');
		createDiv('Impulzus nagyság').parent('slider-wrapper');
		impulseGainSlider = createSlider(0, 100, 90).parent('slider-wrapper');

		createDiv('Impulzus ciklusidő').parent('slider-wrapper2');
		impulseFrequencySlider = createSlider(0, 300, 150, 5).parent('slider-wrapper2');
		createDiv('Veszteség').parent('slider-wrapper2');
		lossSlider = createSlider(0, 1, 0.5, 0).parent('slider-wrapper2');

		once = false
	}

	clear();
	background(230);
	tankDiagram = new Array(1500);
	triDiagram = new Array(1500);

	//A resetelés miatt kell -1 ről indítani, mert nem a draw() végén inkrementálni, vagy elveszik a 0. elem
	currentFrame = -1;
	frameCount = -1;


	modes(selectedOption);
	tankPos = {x1: 150, y1: 50, x2: 250, y2: 300};
	tankLevel = {x1: 150, y1: 50 + (tankPos.y2 - tankPos.y1) * (1 - startValueSlider.value() / 100), x2: 250, y2: 300};

	triPos = {x: 200, y: 600, h: 250, fi: Math.PI / 8};
	triLevel = {x: triPos.x, y: triPos.y, h: triPos.h * startValueSlider.value() / 100, fi: triPos.fi};

	stroke(150);
	for (let i = 0; i < 7; i++) {
		line(tankPos.x2, tankPos.y1 + (tankPos.y2 - tankPos.y1) / 6 * i, screen.width, tankPos.y1 + (tankPos.y2 - tankPos.y1) / 6 * i);
		line(triPos.x, (triPos.y - triPos.h / 6 * i), screen.width, triPos.y - triPos.h / 6 * i)
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
	loss(tankLevel, lossSlider.value(), 'RECT');

	tankDiagram[currentFrame] = {val: tankLevel.y1 - tankPos.y1, t: currentFrame};
	triDiagram[currentFrame] = {val: triPos.h - triLevel.h, t: currentFrame};

	if (currentFrame === 0) {
		tankDiagram[0].h = tankPos.y2 - tankPos.y1;
		triDiagram[0].h = triPos.h;
	}

	drawGraph(tankPos.x2 + 75, tankPos.y1, tankDiagram);
	drawGraph(triPos.x + triPos.h * Math.tan(triPos.fi) + 25, triPos.y - triPos.h, triDiagram);

	//Azért inkrementálunk előbb, mert a resetnél nem akarjuk elveszteni a 0 értéket
	currentFrame++;
	frameCount++;
	
	stroke(25);
	fill(200);
	drawTriangle(triPos.x, triPos.y, triPos.h, triPos.fi);
	fill(0, 255, 0);
	drawTriangle(triLevel.x, triLevel.y, triLevel.h, triLevel.fi);
	if (triLevel.y <= triPos.y) loss(triLevel, lossSlider.value(), 'TRIANGLE');


	if (impulseFrequencySlider.value() !== 0) {
		if (frameCount >= impulseFrequencySlider.value()) {
			impulse(impulseGainSlider.value() / 100);
			frameCount = 0;
		}
	}
}


function impulse(gain) {
	tankLevel.y1 -= (tankPos.y2 - tankPos.y1) * gain;
	if (tankLevel.y1 < tankPos.y1) tankLevel.y1 = tankPos.y1;


	//T'=h^2*tg(fi)*gain+T0
	//h'=sqrt(T'/T)*h
	let T0 = triLevel.h * triLevel.h * Math.tan(triLevel.fi);
	let T = triPos.h * triPos.h * Math.tan(triPos.fi);
	triLevel.h = Math.sqrt((T0 + T * gain) / T) * triPos.h;
	if (triLevel.h > triPos.h) triLevel.h = triPos.h
}


/**
 * Decrement the value of the tanks
 * @param pos The position array
 * @param rate The rate of decrement in percentage
 * @param type The shape type of the tank
 */
function loss(pos, rate, type) {
	let area = undefined;
	/**
	 * Téglalap esetén mivel a csökkenés lineáris, így
	 */
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
		if (z !== 0) pos.h = area / z;
		else pos.h = 0;
	}
}


function drawGraph(x, y, arr) {
	stroke(255, 0, 0);
	if (currentFrame === 1) line(arr[1].t + x, arr[1].val + y, x, y + arr[0].h);
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

function modes(mode) {
	switch (mode) {
		//Egységugrás
		case 0:
			startValueSlider.value(0);
			lossSlider.value(0);
			impulseFrequencySlider.value(75);
			impulseGainSlider.value(10);
			hide();
			break;
		//Kétszeres egységugrás
		case 1:
			startValueSlider.value(0);
			lossSlider.value(0);
			impulseFrequencySlider.value(75);
			impulseGainSlider.value(20);
			hide();
			break;
		//Homokvár
		case 2:
			startValueSlider.value(100);
			lossSlider.value(0.5);
			impulseFrequencySlider.value(150);
			impulseGainSlider.value(100);
			hide();
			break;
		//Interaktív
		case 3:
			wrapper1.style('display', 'inline-block');
			wrapper2.style('display', 'inline-block');
			break;

		default:
			console.log('Mode error')
	}

	function hide() {
		wrapper1.style('display', 'none');
		wrapper2.style('display', 'none');
	}
}