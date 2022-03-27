// -------------------
//  Parameters and UI
// -------------------

const gui = new dat.GUI()
const params = {
    Seed: 1,
    Repetition_probability: 0.5,
    Lines_nb: 100,
    Arrangement: 20,
    Max_norm: 200,
    Padding: 80,
    invertedColor: true,
    Download_Image: () => save(),
    Add_line: () => params.Lines_nb++,
    Inverse_color: () => {
        params.invertedColor = !params.invertedColor
    },
}
gui.add(params, "Seed", 0, 100, 1).onChange(() => draw())
gui.add(params, "Repetition_probability", 0, 1, 0.05).onChange(() => draw())
gui.add(params, "Lines_nb", 0, 200, 1).onChange(() => draw())
gui.add(params, "Arrangement", 1, 30, 1).onChange(() => draw())
gui.add(params, "Max_norm", 10, 250, 10).onChange(() => draw())
gui.add(params, "Padding", 0, 200, 10).onChange(() => draw())
gui.add(params, "Inverse_color").onChange(() => draw())

// -------------------
//     Variables
// -------------------

let current;
let plotter;
let rectangle;

let configuration;
let configurationOblique;
let repetition = false;
let randomNorm;
let operatorRandom;
let configurationRepetition;
let operatorX;
let operatorY;
let randomLengthOpposite;
let repetitionNumber;
let repetitionCounter;

// -------------------
//       Classes
// -------------------

class Plotter {
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    mode: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.mode = 0;
    }

    render() {
        switch (this.mode) {
            case 0 : //default -> point
                point(this.x, this.y)
                break;
            case 1 : //1 -> vertical line
                line(this.x, this.y + 5, this.x, this.y - 5);
                break;
            case 2 : //2 -> horizontal line
                line(this.x - 5, this.y, this.x + 5, this.y);
                break;
            case 3 : //2 -> horizontal line for oblique
                line(this.x, this.y, this.x + 10, this.y);
                break;
        }
    }

    step(newVector) {
        push()
        fill((params.invertedColor ? "white" : "black"))
        stroke((params.invertedColor ? "white" : "black"))

        let distance = newVector.mag();
        distance = (configuration === 'oblique') ? distance / sqrt(2) : distance;

        for (let i = 0; i < distance * 2; i++) {
            this.x += this.deltaX / 2;
            this.y += this.deltaY / 2;
            this.x = constrain(this.x, params.Padding, width - params.Padding);
            this.y = constrain(this.y, params.Padding, height - params.Padding);

            this.render();
        }

        this.x += this.deltaX / 2;
        this.y += this.deltaY / 2;
        pop();
    }
}

// -------------------
//       Drawing
// -------------------

function draw() {
    plotter = new Plotter();
    plotter.mode = 0;
    randomSeed(params.Seed)

    current = createVector(
        random(params.Padding, width - params.Padding),
        random(params.Padding, height - params.Padding)
    )

    background((params.invertedColor ? "black" : "white"))

    let counter = 0
    while (counter < params.Lines_nb) {
        let xNewVector, yNewVector;
        // Si le prochain tracé est une répétition
        if (repetitionCounter < repetitionNumber) {
            let configTemp = configuration;

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
                            configuration = 'horizontal'
                            break;
                    }
                    break;

                case 'vertical':
                    switch (configuration) {
                        case 'vertical':
                            plotter.mode = 1;
                            xNewVector = operatorRandom * randomLengthOpposite;
                            yNewVector = 0;
                            configuration = 'horizontal'
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
                    xNewVector = (configurationOblique === 'x') ? -randomNorm * plotter.deltaX : randomNorm * plotter.deltaX
                    yNewVector = (configurationOblique === 'y') ? -randomNorm * plotter.deltaY : randomNorm * plotter.deltaY
                    break;
            }

            if (outOfRectangle(xNewVector, yNewVector) === true) {
                configuration = configTemp;
                repetition = false;
                repetitionNumber = 0;
                continue;
            }

            repetitionCounter++;
            drawLines(createVector(xNewVector, yNewVector))
            counter++;
        }

        // Si le prochain tracé n'est pas une répétition
        else {
            repetition = false;
            repetitionCounter = 0;
            let configurationTemp = whatConfiguration(xNewVector, yNewVector);

            // Only multiplier of MULTIPLIERS to have a structure / grid / arrangement
            randomNorm = params.Arrangement * floor(random(0, params.Max_norm) / params.Arrangement);

            plotter.rotateMode = random([1, 0, 0, 0]);
            xNewVector = random([-1 * randomNorm, 0, randomNorm]);
            yNewVector = random([-1 * randomNorm, 0, randomNorm]);

            // -------------------
            //   Error handling
            // -------------------
            if (outOfRectangle(xNewVector, yNewVector) === true
                || (xNewVector === yNewVector && yNewVector === 0)
                || (configurationTemp === whatConfiguration(xNewVector, yNewVector))
                || (whatConfiguration(xNewVector, yNewVector) == undefined)
            ) {
                continue;
            }
            // -------------------

            configuration = whatConfiguration(xNewVector, yNewVector);
            configurationRepetition = configuration;

            drawLines(createVector(xNewVector, yNewVector))
            counter++;

            operatorX = plotter.deltaX;
            operatorY = plotter.deltaY;
            operatorRandom = random([-1, 1]);
            randomLengthOpposite = params.Arrangement * floor(random(10, (params.Max_norm)) / params.Arrangement);

            if (random(1) < params.Repetition_probability) {
                repetition = true;
                repetitionNumber = random([4, 5, 6, 7]);
                if (configurationRepetition == 'oblique') {
                    plotter.mode = random([0, 0, 0, 3])
                }
            }
        }
    }
    noLoop();
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
    let futureVectorCopy = current.copy().add(createVector(xNewVector, yNewVector));

    if (futureVectorCopy.x < params.Padding || futureVectorCopy.x > width + params.Padding) {
        return true;
    }
    if (futureVectorCopy.y < params.Padding || futureVectorCopy.y > height + params.Padding) {
        return true;
    }

    return false;
}

function whatConfiguration(xNewVector, yNewVector) { //return the actual configuration based on vector's x and y position
    if (abs(xNewVector) === abs(yNewVector) && xNewVector != 0) {
        return 'oblique';
    } else if (xNewVector === 0 && yNewVector != 0) {
        return 'vertical';
    } else if (yNewVector === 0 && xNewVector != 0) {
        return 'horizontal';
    }
    return configuration;
}

// -------------------
//    Initialization
// -------------------

function setup() {
    p6_CreateCanvas()
}

function windowResized() {
    p6_ResizeCanvas()
}
