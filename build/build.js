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
var configuration;
var repetition = false;
var repetitionProbability = 1;
function draw() {
    randomSeed(params.Seed);
}
function drawLines(newVector) {
    line(current.x, current.y, current.x + newVector.x, current.y + newVector.y);
}
function setup() {
    p6_CreateCanvas();
    current = createVector(random(PADDING, width - PADDING), random(PADDING, height - PADDING));
    background("white");
    for (var i = 0; i < LINES_NB; i++) {
        var norm_1 = 10 * floor(random(0, MAX_NORM) / 10);
        var xRandom = floor(random(0, 3));
        var yRandom = floor(random(0, 3));
        var xNewVector = void 0, yNewVector = void 0;
        switch (xRandom) {
            case 0:
                xNewVector = -1 * norm_1;
                break;
            case 1:
                xNewVector = 0;
                break;
            case 2:
                xNewVector = norm_1;
                break;
        }
        switch (yRandom) {
            case 0:
                yNewVector = -1 * norm_1;
                break;
            case 1:
                yNewVector = 0;
                break;
            case 2:
                yNewVector = norm_1;
                break;
        }
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
        var newVector = createVector(xNewVector, yNewVector);
        drawLines(newVector);
        current.add(newVector);
    }
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