var gui = new dat.GUI();
var params = {
    Seed: 1,
    Lines_nb: 300,
    Multipliers: 20,
    Max_norm: 200,
    Padding: 80,
    Download_Image: function () { return save(); },
    Ajouter_Ligne: function () { return params.Lines_nb++; },
};
gui.add(params, "Seed", 1, 50, 1);
gui.add(params, "Lines_nb", 0, 200, 1);
gui.add(params, "Multipliers", 1, 30, 1);
gui.add(params, "Max_norm", 10, 250, 10);
gui.add(params, "Padding", 0, 200, 10);
gui.add(params, "Download_Image");
gui.add(params, "Ajouter_Ligne");
var gif_loadImg;
var fontMenuBold;
var fontMenuLight;
var current;
var plotter;
var counter = -1;
var rectangle;
var configuration;
var configurationOblique;
var repetition = false;
var iterationRepetition = 0;
var randomNorm;
var operatorRandom;
var configurationRepetition;
var operatorX;
var operatorY;
var randomLengthOpposite;
var repetitionNumber;
var repetitionCounter;
var rectConstrain = (function () {
    function rectConstrain() {
        this.x = mouseX;
        this.y = mouseY;
        this.rayon = 400;
    }
    rectConstrain.prototype.render = function () {
        push();
        stroke(128, 0, 128, 1);
        strokeWeight(10);
        color("red");
        noFill();
        circle(this.x, this.y, this.rayon);
        pop();
    };
    rectConstrain.prototype.step = function () {
        this.x = mouseX;
        this.y = mouseY;
    };
    return rectConstrain;
}());
var Plotter = (function () {
    function Plotter() {
        this.x = 0;
        this.y = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.mode = 0;
    }
    Plotter.prototype.render = function () {
        switch (this.mode) {
            case 0:
                point(this.x, this.y);
                break;
            case 1:
                line(this.x, this.y + 5, this.x, this.y - 5);
                break;
            case 2:
                line(this.x - 5, this.y, this.x + 5, this.y);
                break;
            case 3:
                line(this.x, this.y, this.x + 10, this.y);
                break;
        }
    };
    Plotter.prototype.step = function (newVector) {
        push();
        fill("white");
        stroke("white");
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
    var noCounter = false;
    if (counter == -1) {
        push();
        stroke("black");
        strokeWeight(2);
        imageMode(CENTER);
        image(gif_loadImg, width / 2, height / 2);
        pop();
        push();
        fill("pink");
        textAlign(CENTER);
        textSize(50);
        textFont(fontMenuBold);
        rotate(frameCount / 1000, [90]);
        text("Start", width / 2, 250);
        pop();
        push();
        rotate(frameCount);
        textSize(30);
        textFont(fontMenuLight);
        text("Bougez la souris lentement !", width / 2, 800);
        pop();
    }
    var canDraw = (counter >= 0 && counter < params.Lines_nb);
    if (canDraw) {
        rectangle.step();
        rectangle.render();
        push();
        noStroke();
        fill(0, 0, 0, 10);
        rect(0, 0, width, height);
        pop();
        var xNewVector = void 0, yNewVector = void 0;
        if (repetitionCounter < repetitionNumber) {
            var configTemp = configuration;
            console.log("configRepet : " + configurationRepetition);
            switch (configurationRepetition) {
                case 'horizontal':
                    switch (configuration) {
                        case 'horizontal':
                            plotter.mode = 2;
                            xNewVector = 0;
                            console.log("!!! : " + operatorRandom);
                            console.log("randomLengthOpposite : " + randomLengthOpposite);
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
                            console.log("!!! : " + operatorRandom);
                            console.log("randomLengthOpposite : " + randomLengthOpposite);
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
                    xNewVector = (configurationOblique === 'x') ? -randomNorm * plotter.deltaX : randomNorm * plotter.deltaX;
                    yNewVector = (configurationOblique === 'y') ? -randomNorm * plotter.deltaY : randomNorm * plotter.deltaY;
                    break;
            }
            console.log("REPETITION : " + configuration);
            iterationRepetition++;
            console.log("x : " + xNewVector);
            console.log("y : " + yNewVector);
            if (outOfRectangle(xNewVector, yNewVector) === true) {
                console.log("repetition out of grid");
                console.log("-----------");
                configuration = configTemp;
                repetition = false;
                counter--;
                repetitionNumber = 0;
                console.log("???????????,");
                return;
            }
            console.log(plotter.mode);
            repetitionCounter++;
            drawLines(createVector(xNewVector, yNewVector));
        }
        else {
            repetitionCounter = 0;
            console.log("NORMAL");
            console.log(configuration);
            var configurationTemp = whatConfiguration(xNewVector, yNewVector);
            console.log("whatconf avant new : " + configurationTemp);
            randomNorm = params.Multipliers * floor(random(0, params.Max_norm) / params.Multipliers);
            repetition = false;
            plotter.rotateMode = random([1, 0, 0, 0]);
            xNewVector = random([-1 * randomNorm, 0, randomNorm]);
            yNewVector = random([-1 * randomNorm, 0, randomNorm]);
            console.log("whatconf apres new : " + whatConfiguration(xNewVector, yNewVector));
            if (outOfRectangle(xNewVector, yNewVector) === true) {
                if (counter > 2) {
                    counter--;
                }
                return;
            }
            console.log("pas outofgrid");
            if (xNewVector === yNewVector && yNewVector === 0) {
                noCounter = true;
                console.log("vecteur nul");
                console.log(configuration);
            }
            else if (configurationTemp === whatConfiguration(xNewVector, yNewVector)) {
                noCounter = true;
                console.log("vecteur colinéaire");
            }
            else if (whatConfiguration(xNewVector, yNewVector) == undefined) {
                noCounter = true;
                console.log("jsp");
            }
            else {
                configuration = whatConfiguration(xNewVector, yNewVector);
                if (random(0, 1) < 0.5) {
                    repetition = true;
                    iterationRepetition = 0;
                    configurationOblique = random(['x', 'y']);
                }
                console.log("x : " + xNewVector);
                console.log("y : " + yNewVector);
                console.log("-----------");
                configurationRepetition = whatConfiguration(xNewVector, yNewVector);
                console.log("operatorRandom : " + operatorRandom);
                drawLines(createVector(xNewVector, yNewVector));
                operatorX = plotter.deltaX;
                operatorY = plotter.deltaY;
                console.log("opX :" + operatorX + "  opY :" + operatorY);
                operatorRandom = random([-1, 1]);
                randomLengthOpposite = params.Multipliers * floor(random(10, (params.Max_norm)) / params.Multipliers);
                var flip3 = random([0, 1, 2]);
                if (flip3 == 0) {
                    repetition = true;
                    repetitionNumber = random([4, 5, 6, 7]);
                    if (configurationRepetition == 'oblique') {
                        plotter.mode = random([0, 0, 0, 3]);
                    }
                }
            }
        }
        if (!noCounter) {
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
function outOfRectangle(xNewVector, yNewVector) {
    var futureVectorCopy = current.copy().add(createVector(xNewVector, yNewVector));
    if (futureVectorCopy.x < rectangle.x - (rectangle.rayon / 3) || futureVectorCopy.x > rectangle.x + (rectangle.rayon / 3)) {
        return true;
    }
    if (futureVectorCopy.y < rectangle.y - (rectangle.rayon / 3) || futureVectorCopy.y > rectangle.y + (rectangle.rayon / 3)) {
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
function preload() {
    gif_loadImg = loadImage("https://media1.giphy.com/media/Fu3OjBQiCs3s0ZuLY3/giphy.webp?cid=ecf05e47mns5zyc04ipb95h0lwr7vwny85ot5oita864tm7l&rid=giphy.webp&ct=g");
    fontMenuBold = loadFont("./font/Noto_Sans_JP/NotoSansJP-Black.otf");
    fontMenuLight = loadFont("./font/Noto_Sans_JP/NotoSansJP-Thin.otf");
}
function setup() {
    p6_CreateCanvas();
    plotter = new Plotter();
    plotter.mode = 0;
    background("white");
    frameRate(24);
    rectangle = new rectConstrain;
    current = createVector(random(params.Padding, width - params.Padding), random(params.Padding, height - params.Padding));
}
function windowResized() {
    p6_ResizeCanvas();
}
function mousePressed() {
    if (counter == -1) {
        clear();
        console.log("current.x" + current.x);
        console.log("current.y" + current.y);
        background("black");
        counter++;
    }
}
function animationMenu() {
    current.x = width / 2 - 200;
    current.y = height / 2 + 100;
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