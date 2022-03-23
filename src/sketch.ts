// -------------------
//  Parameters and UI
// -------------------

const gui = new dat.GUI()
const params = {
    Seed: 1,
    Lines_nb: 100,
    Multipliers: 20,
    Max_norm: 200,
    Padding: 80,
    Download_Image: () => save(),
}
gui.add(params, "Seed", 1, 50, 1)
gui.add(params, "Lines_nb", 10, 200, 10)
gui.add(params, "Multipliers", 1, 30, 1)
gui.add(params, "Max_norm", 10, 250, 10)
gui.add(params, "Padding", 0, 200, 10)
gui.add(params, "Download_Image")

// -------------------
//  Initialization
// -------------------

let current;
let plotter;
let counter = 0;

let configuration;
let repetition = false;
let repetitionProbability = 1;
let iterationRepetition = 0;
let randomNorm;

// -------------------
//  Classes
// -------------------

class Plotter {
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.deltaX = 0;
        this.deltaY = 0;
    }

    render() {
        line(this.x, this.y + 5, this.x, this.y - 5);
    }

    step(newVector) {
        for (let i = 0; i < newVector.mag() * 2; i++) {
            this.x += this.deltaX / 2;
            this.y += this.deltaY / 2;
            this.x = constrain(this.x, params.Padding, width - params.Padding);
            this.y = constrain(this.y, params.Padding, height - params.Padding);

            this.render();
        }
    }
}

// -------------------
//       Drawing
// -------------------

function draw() {
    if (counter < params.Lines_nb) {
        let xNewVector, yNewVector;
        let randomRun = random(0, 1);
        console.log(randomRun)

        if (repetition && randomRun < repetitionProbability) {
            // Génère l'opérateur (1 ou -1) pour le "rempart" (succession de horizontal / vertical)
            let operator = ((iterationRepetition / 2) % 2 == 0) ? 1 : -1;

            if (configuration === 'horizontal') {
                xNewVector = 0;
                yNewVector = operator * randomNorm;
                configuration = 'vertical';
            } else if (configuration === 'vertical') {
                xNewVector = -operator * randomNorm;
                yNewVector = 0;
                configuration = 'horizontal'
            } else if (configuration === 'oblique') {
                // Génère l'opérateur pour les dents (zigzag)
                operator = (iterationRepetition % 2 == 0) ? 1 : -1;
                xNewVector = operator * randomNorm;
                yNewVector = randomNorm;
            }

            repetitionProbability -= .2;
            iterationRepetition++;

            const inGridVector = avoidOutOfGrid(xNewVector, yNewVector);

            drawLines(createVector(inGridVector.xNewVector, inGridVector.yNewVector))
        } else {
            // Only multiplier of MULTIPLIERS to have a structure
            randomNorm = params.Multipliers * floor(random(0, params.Max_norm) / params.Multipliers);
            repetition = false;

            let xNewVector = random([-1 * randomNorm, 0, randomNorm]);
            let yNewVector = random([-1 * randomNorm, 0, randomNorm]);

            const inGridVector = avoidOutOfGrid(xNewVector, yNewVector);
            xNewVector = inGridVector.xNewVector;
            yNewVector = inGridVector.yNewVector;

            configuration = setConfiguration(xNewVector, yNewVector, configuration);

            // If the new vector is equal to 0
            if (xNewVector === yNewVector && yNewVector === 0) {

            }
                // faudra probablement mettre l'interdiction du nouveau vecteur inverse dans un else if ici

            // Draw the lines only if the xNewVector is new
            else {
                // Activate the repetition parameter
                if (randomRun < 0.3) {
                    repetition = true;
                    repetitionProbability = 1;
                    iterationRepetition = 0;
                }

                drawLines(createVector(xNewVector, yNewVector))
            }
        }
        counter++;
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
    let futureVectorCopy = current.copy().add(createVector(xNewVector, yNewVector));

    if (futureVectorCopy.x < params.Padding) {
        xNewVector = abs(xNewVector)
    } else if (futureVectorCopy.x > width - params.Padding) {
        xNewVector = -xNewVector
    }

    if (futureVectorCopy.y < params.Padding) {
        yNewVector = abs(yNewVector)
    } else if (futureVectorCopy.y > height - params.Padding) {
        yNewVector = -yNewVector
    }

    return {xNewVector, yNewVector};
}

function setConfiguration(xNewVector, yNewVector, configuration) {
    if (abs(xNewVector) === abs(yNewVector) && xNewVector != 0) {
        configuration = 'oblique';
    } else if (xNewVector === 0 && yNewVector != 0) {
        configuration = 'vertical';
    } else if (yNewVector === 0 && xNewVector != 0) {
        configuration = 'horizontal';
    }
    return configuration;
}

// -------------------
//    Initialization
// -------------------

function setup() {
    p6_CreateCanvas();
    plotter = new Plotter();
    background("white")
    frameRate(5)

    current = createVector(
        random(params.Padding, width - params.Padding),
        random(params.Padding, height - params.Padding)
    )
}

function windowResized() {
    p6_ResizeCanvas()
}
