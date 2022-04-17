var gui = new dat.GUI();
var params = {
    Seed: 1,
    Repetition_probability: 0.2,
    Lines_nb: 10,
    Arrangement: 5,
    Max_norm: 20,
    Padding: 0,
    invertedColor: true,
    Download_Image: function () { return save(); },
    Add_line: function () { return params.Lines_nb++; },
    Inverse_color: function () {
        params.invertedColor = !params.invertedColor;
    },
};
gui.add(params, "Seed", 0, 100, 1).onChange(function () { return draw(); });
gui.add(params, "Repetition_probability", 0, 1, 0.05).onChange(function () { return draw(); });
gui.add(params, "Lines_nb", 0, 200, 1).onChange(function () { return draw(); });
gui.add(params, "Arrangement", 1, 30, 1).onChange(function () { return draw(); });
gui.add(params, "Max_norm", 10, 250, 10).onChange(function () { return draw(); });
gui.add(params, "Padding", 0, 200, 10).onChange(function () { return draw(); });
gui.add(params, "Inverse_color").onChange(function () { return draw(); });
var capturer = new CCapture({
    framerate: 5,
    format: "png",
    name: "exportHorizontalLines",
    quality: 100,
    verbose: true,
});
var p5Canvas;
var current;
var plotter;
var rectangle;
var configuration;
var configurationOblique;
var repetition = false;
var randomNorm;
var operatorRandom;
var configurationRepetition;
var operatorX;
var operatorY;
var randomLengthOpposite;
var repetitionNumber;
var repetitionCounter;
var Plotter = (function () {
    function Plotter() {
        this.x = 0;
        this.y = 0;
        this.deltaX = 1;
        this.deltaY = 1;
        this.mode = 0;
    }
    Plotter.prototype.render = function () {
        switch (this.mode) {
            case 0:
                line(this.x - 1, this.y - 1, this.x + 1, this.y + 1);
                break;
            case 1:
                line(this.x, this.y + 2, this.x, this.y - 2);
                break;
            case 2:
                line(this.x - 2, this.y, this.x + 2, this.y);
                break;
            case 3:
                line(this.x, this.y, this.x + 2, this.y);
                break;
        }
    };
    Plotter.prototype.step = function (newVector) {
        push();
        fill((params.invertedColor ? "white" : "black"));
        stroke((params.invertedColor ? "white" : "black"));
        var distance = newVector.mag();
        distance = (configuration === 'oblique') ? distance / sqrt(2) : distance;
        for (var i = 0; i < distance * 2; i++) {
            this.x += this.deltaX / 2;
            this.y += this.deltaY / 2;
            this.x = constrain(this.x, params.Padding, width - params.Padding);
            this.y = constrain(this.y, params.Padding, height - params.Padding);
            this.render();
        }
        this.x += this.deltaX / 2;
        this.y += this.deltaY / 2;
        pop();
    };
    return Plotter;
}());
function draw() {
    if (frameCount === 1)
        capturer.start();
    plotter = new Plotter();
    current = createVector(random(params.Padding, width - params.Padding), random(params.Padding, height - params.Padding));
    background((params.invertedColor ? "black" : "white"));
    var counter = 0;
    while (counter < params.Lines_nb) {
        var xNewVector = void 0, yNewVector = void 0;
        if (repetitionCounter < repetitionNumber) {
            var configTemp = configuration;
            switch (configurationRepetition) {
                case 'horizontal':
                    switch (configuration) {
                        case 'horizontal':
                            plotter.mode = 2;
                            xNewVector = 0;
                            yNewVector = operatorRandom * randomLengthOpposite;
                            configuration = 'vertical';
                            break;
                        case 'vertical':
                            current.y--;
                            plotter.mode = 0;
                            operatorX *= -1;
                            xNewVector = operatorX * randomNorm;
                            yNewVector = 0;
                            configuration = 'horizontal';
                            break;
                    }
                    break;
                case 'vertical':
                    switch (configuration) {
                        case 'vertical':
                            plotter.mode = 1;
                            xNewVector = operatorRandom * randomLengthOpposite;
                            yNewVector = 0;
                            configuration = 'horizontal';
                            break;
                        case 'horizontal':
                            plotter.mode = 0;
                            operatorY *= -1;
                            xNewVector = 0;
                            yNewVector = operatorY * randomNorm;
                            configuration = 'vertical';
                            break;
                    }
                    break;
                case 'oblique':
                    randomNorm = (randomNorm === 0) ? random(0, params.Max_norm) : randomNorm;
                    xNewVector = (configurationOblique === 'x') ? -randomNorm * plotter.deltaX : randomNorm * plotter.deltaX;
                    yNewVector = (configurationOblique === 'y') ? -randomNorm * plotter.deltaY : randomNorm * plotter.deltaY;
                    break;
            }
            if (outOfRectangle(xNewVector, yNewVector)) {
                configuration = configTemp;
                repetition = false;
                repetitionNumber = 0;
                continue;
            }
            repetitionCounter++;
            drawLines(createVector(xNewVector, yNewVector));
            counter++;
        }
        else {
            repetition = false;
            repetitionCounter = 0;
            var configurationTemp = whatConfiguration(xNewVector, yNewVector);
            randomNorm = params.Arrangement * floor(random(0, params.Max_norm) / params.Arrangement);
            plotter.rotateMode = random([1, 0, 0, 0]);
            xNewVector = random([-1 * randomNorm, 0, randomNorm]);
            yNewVector = random([-1 * randomNorm, 0, randomNorm]);
            if (outOfRectangle(xNewVector, yNewVector) === true
                || (xNewVector === yNewVector && yNewVector === 0)
                || (configurationTemp === whatConfiguration(xNewVector, yNewVector))
                || (whatConfiguration(xNewVector, yNewVector) == undefined)) {
                continue;
            }
            configuration = whatConfiguration(xNewVector, yNewVector);
            configurationRepetition = configuration;
            drawLines(createVector(xNewVector, yNewVector));
            counter++;
            operatorX = plotter.deltaX;
            operatorY = plotter.deltaY;
            operatorRandom = random([-1, 1]);
            randomLengthOpposite = params.Arrangement * floor(random(10, (params.Max_norm)) / params.Arrangement);
            if (random(1) < params.Repetition_probability) {
                repetition = true;
                repetitionNumber = random([2, 3]);
                if (configuration === 'oblique') {
                    configurationOblique = random(['x', 'y']);
                    plotter.mode = random([0, 0, 0, 3]);
                }
            }
        }
    }
    capturer.capture(p5Canvas.canvas);
    if (frameCount === 30000) {
        noLoop();
        capturer.stop();
        capturer.save();
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
function outOfRectangle(xNewVector, yNewVector) {
    var futureVectorCopy = current.copy().add(createVector(xNewVector, yNewVector));
    if (futureVectorCopy.x < params.Padding || futureVectorCopy.x > width + params.Padding) {
        return true;
    }
    if (futureVectorCopy.y < params.Padding || futureVectorCopy.y > height + params.Padding) {
        return true;
    }
    return false;
}
function whatConfiguration(xNewVector, yNewVector) {
    if (abs(xNewVector) === abs(yNewVector) && xNewVector != 0) {
        return 'oblique';
    }
    else if (xNewVector === 0 && yNewVector != 0) {
        return 'vertical';
    }
    else if (yNewVector === 0 && xNewVector != 0) {
        return 'horizontal';
    }
    return configuration;
}
function setup() {
    p5Canvas = createCanvas(64, 64);
    frameRate(5);
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