var gui = new dat.GUI();
var params = {
    Seed: 1,
    Lines_nb: 100,
    Multipliers: 20,
    Max_norm: 200,
    Padding: 80,
    Download_Image: function () { return save(); },
};
gui.add(params, "Seed", 1, 50, 1);
gui.add(params, "Lines_nb", 0, 200, 1);
gui.add(params, "Multipliers", 1, 30, 1);
gui.add(params, "Max_norm", 10, 250, 10);
gui.add(params, "Padding", 0, 200, 10);
gui.add(params, "Download_Image");
var current;
var plotter;
var counter = 0;
var configuration;
var repetition = false;
var repetitionProbability = 1;
var iterationRepetition = 0;
var randomNorm;
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
        for (var i = 0; i < newVector.mag() * 2; i++) {
            this.x += this.deltaX / 2;
            this.y += this.deltaY / 2;
            this.x = constrain(this.x, params.Padding, width - params.Padding);
            this.y = constrain(this.y, params.Padding, height - params.Padding);
            this.render();
        }
    };
    return Plotter;
}());
function draw() {
    var noCounter = false;
    if (counter < params.Lines_nb) {
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
            randomNorm = params.Multipliers * floor(random(0, params.Max_norm) / params.Multipliers);
            repetition = false;
            var xNewVector_1 = random([-1 * randomNorm, 0, randomNorm]);
            var yNewVector_1 = random([-1 * randomNorm, 0, randomNorm]);
            var inGridVector = avoidOutOfGrid(xNewVector_1, yNewVector_1);
            xNewVector_1 = inGridVector.xNewVector;
            yNewVector_1 = inGridVector.yNewVector;
            if (xNewVector_1 === yNewVector_1 && yNewVector_1 === 0) {
                noCounter = true;
            }
            else if (configuration === checkConfiguration(xNewVector_1, yNewVector_1)) {
                noCounter = true;
            }
            else if (checkConfiguration(xNewVector_1, yNewVector_1) == undefined) {
                noCounter = true;
            }
            else {
                configuration = checkConfiguration(xNewVector_1, yNewVector_1);
                if (randomRun < 0.3) {
                    repetition = true;
                    repetitionProbability = 1;
                    iterationRepetition = 0;
                }
                drawLines(createVector(xNewVector_1, yNewVector_1));
            }
        }
        if (!noCounter) {
            console.log(counter);
            counter++;
        }
    }
}
function drawLines(newVector) {
    plotter.deltaX = (newVector.x === 0) ? 0 : (abs(newVector.x)) / newVector.x;
    plotter.deltaY = (newVector.y === 0) ? 0 : (abs(newVector.y)) / newVector.y;
    plotter.x = current.x;
    plotter.y = current.y;
    plotter.step(newVector);
    current.add(newVector);
}
function avoidOutOfGrid(xNewVector, yNewVector) {
    var futureVectorCopy = current.copy().add(createVector(xNewVector, yNewVector));
    if (futureVectorCopy.x < params.Padding) {
        xNewVector = abs(xNewVector);
    }
    else if (futureVectorCopy.x > width - params.Padding) {
        xNewVector = -xNewVector;
    }
    if (futureVectorCopy.y < params.Padding) {
        yNewVector = abs(yNewVector);
    }
    else if (futureVectorCopy.y > height - params.Padding) {
        yNewVector = -yNewVector;
    }
    return { xNewVector: xNewVector, yNewVector: yNewVector };
}
function checkConfiguration(xNewVector, yNewVector) {
    var configuration;
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
function setup() {
    p6_CreateCanvas();
    plotter = new Plotter();
    background("white");
    frameRate(5);
    current = createVector(random(params.Padding, width - params.Padding), random(params.Padding, height - params.Padding));
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