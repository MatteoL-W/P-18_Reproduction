var gui = new dat.GUI();
var params = {
    Seed: 1,
    Download_Image: function () { return save(); },
};
gui.add(params, "Seed", 1, 50, 1);
gui.add(params, "Download_Image");
var PADDING = 10;
var LINES_NB = 100;
var MAX_NORM = 200;
var current;
var plotter;
var Plotter = (function () {
    function Plotter() {
        this.x = 0;
        this.y = 0;
        this.deltaX = 0;
        this.deltaY = 0;
    }
    Plotter.prototype.render = function () {
        line(this.x, this.y + 5, this.x, this.y - 5);
    };
    Plotter.prototype.step = function (newVector) {
        for (var i = 0; i < newVector.mag(); i++) {
            this.x += this.deltaX;
            this.y += this.deltaY;
            this.x = constrain(this.x, 80, width - 80);
            this.y = constrain(this.y, 80, height - 80);
            this.render();
        }
    };
    return Plotter;
}());
function checkConfiguration(xNewVector, yNewVector, configuration) {
    if (abs(xNewVector) === abs(yNewVector) && xNewVector != 0) {
        configuration = 'oblique';
    }
    else if (xNewVector === 0 && yNewVector != 0) {
        configuration = 'vertical';
    }
    else if (yNewVector === 0 && xNewVector != 0) {
        configuration = 'horizontal';
    }
    return configuration;
}
function draw() {
    randomSeed(params.Seed);
    background("white");
    var configuration;
    var repetition = false;
    var repetitionProbability = 1;
    var iterationRepetition = 0;
    var randomNorm;
    current = createVector(random(PADDING, width - PADDING), random(PADDING, height - PADDING));
    for (var i = 0; i < LINES_NB; i++) {
        var xNewVector = void 0, yNewVector = void 0;
        var randomRun = random(0, 1);
        if (repetition && randomRun < repetitionProbability) {
            var operator = ((iterationRepetition / 2) % 2 == 0) ? 1 : -1;
            if (configuration === 'horizontal') {
                xNewVector = 0;
                yNewVector = operator * randomNorm;
                configuration = 'vertical';
            }
            else if (configuration === 'vertical') {
                xNewVector = -operator * randomNorm;
                yNewVector = 0;
                configuration = 'horizontal';
            }
            else if (configuration === 'oblique') {
                operator = (iterationRepetition % 2 == 0) ? 1 : -1;
                xNewVector = operator * randomNorm;
                yNewVector = randomNorm;
            }
            repetitionProbability -= .2;
            iterationRepetition++;
            var inGridVector = avoidOutOfGrid(xNewVector, yNewVector);
            drawLines(createVector(inGridVector.xNewVector, inGridVector.yNewVector));
        }
        else {
            randomNorm = 20 * floor(random(0, MAX_NORM) / 20);
            repetition = false;
            var xRandom = floor(random(0, 3));
            var yRandom = floor(random(0, 3));
            switch (xRandom) {
                case 0:
                    xNewVector = -1 * randomNorm;
                    break;
                case 1:
                    xNewVector = 0;
                    break;
                case 2:
                    xNewVector = randomNorm;
                    break;
            }
            switch (yRandom) {
                case 0:
                    yNewVector = -1 * randomNorm;
                    break;
                case 1:
                    yNewVector = 0;
                    break;
                case 2:
                    yNewVector = randomNorm;
                    break;
            }
            var inGridVector = avoidOutOfGrid(xNewVector, yNewVector);
            xNewVector = inGridVector.xNewVector;
            yNewVector = inGridVector.yNewVector;
            configuration = checkConfiguration(xNewVector, yNewVector, configuration);
            if (xNewVector === yNewVector && yNewVector === 0) {
                i--;
            }
            if (randomRun < 0.3) {
                repetition = true;
                repetitionProbability = 1;
                iterationRepetition = 0;
            }
            drawLines(createVector(xNewVector, yNewVector));
        }
    }
}
function drawLines(newVector) {
    plotter.deltaX = (newVector.x === 0) ? 0 : (abs(newVector.x)) / newVector.x;
    plotter.deltaY = (newVector.y === 0) ? 0 : (abs(newVector.y)) / newVector.y;
    console.log("vector.x : " + newVector.x);
    console.log("vector.y : " + newVector.y);
    console.log(plotter.deltaX);
    console.log(plotter.deltaY);
    plotter.x = current.x;
    plotter.y = current.y;
    plotter.step(newVector);
    current.add(newVector);
}
function avoidOutOfGrid(xNewVector, yNewVector) {
    var futureVectorCopy = current.copy().add(createVector(xNewVector, yNewVector));
    if (futureVectorCopy.x < PADDING) {
        xNewVector = abs(xNewVector);
    }
    else if (futureVectorCopy.x > width - PADDING) {
        xNewVector = -xNewVector;
    }
    if (futureVectorCopy.y < PADDING) {
        yNewVector = abs(yNewVector);
    }
    else if (futureVectorCopy.y > height - PADDING) {
        yNewVector = -yNewVector;
    }
    return { xNewVector: xNewVector, yNewVector: yNewVector };
}
function setup() {
    p6_CreateCanvas();
    plotter = new Plotter();
    frameRate(1);
}
function windowResized() {
    p6_ResizeCanvas();
}
var __ASPECT_RATIO = 1;
var __MARGIN_SIZE = 25;
function __desiredCanvasWidth() {
    var windowRatio = windowWidth / windowHeight;
    if (__ASPECT_RATIO > windowRatio) {
        return windowWidth - __MARGIN_SIZE * 2;
    }
    else {
        return __desiredCanvasHeight() * __ASPECT_RATIO;
    }
}
function __desiredCanvasHeight() {
    var windowRatio = windowWidth / windowHeight;
    if (__ASPECT_RATIO > windowRatio) {
        return __desiredCanvasWidth() / __ASPECT_RATIO;
    }
    else {
        return windowHeight - __MARGIN_SIZE * 2;
    }
}
var __canvas;
function __centerCanvas() {
    __canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}
function p6_CreateCanvas() {
    __canvas = createCanvas(__desiredCanvasWidth(), __desiredCanvasHeight());
    __centerCanvas();
}
function p6_ResizeCanvas() {
    resizeCanvas(__desiredCanvasWidth(), __desiredCanvasHeight());
    __centerCanvas();
}
var p6_SaveImageSequence = function (durationInFrames, fileExtension) {
    if (frameCount <= durationInFrames) {
        noLoop();
        var filename_1 = nf(frameCount - 1, ceil(log(durationInFrames) / log(10)));
        var mimeType = (function () {
            switch (fileExtension) {
                case 'png':
                    return 'image/png';
                case 'jpeg':
                case 'jpg':
                    return 'image/jpeg';
            }
        })();
        __canvas.elt.toBlob(function (blob) {
            p5.prototype.downloadFile(blob, filename_1, fileExtension);
            setTimeout(function () { return loop(); }, 100);
        }, mimeType);
    }
};
//# sourceMappingURL=../src/src/build.js.map