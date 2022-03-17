// -------------------
//  Parameters and UI
// -------------------

const gui = new dat.GUI()
const params = {
    Seed: 1,
    Download_Image: () => save(),
}
gui.add(params, "Seed", 1, 50, 1)
gui.add(params, "Download_Image")

const PADDING = 10;
const LINES_NB = 100;
const MAX_NORM = 200;

let current;
let configuration;
let repetition = false;
let repetitionProbability = 1;
let iterationRepetition = 0;
let randomNorm;

// -------------------
//       Drawing
// -------------------

function draw() {
    randomSeed(params.Seed)
}

function drawLines(newVector) {
    line(current.x, current.y, current.x + newVector.x, current.y + newVector.y)
    current.add(newVector);
}

// -------------------
//    Initialization
// -------------------

function avoidOutOfGrid(xNewVector, yNewVector) {
    let futureVectorCopy = current.copy().add(createVector(xNewVector, yNewVector));

    if (futureVectorCopy.x < PADDING) {
        xNewVector = abs(xNewVector)
    } else if (futureVectorCopy.x > width - PADDING) {
        xNewVector = -xNewVector
    }

    if (futureVectorCopy.y < PADDING) {
        yNewVector = abs(yNewVector)
    } else if (futureVectorCopy.y > height - PADDING) {
        yNewVector = -yNewVector
    }

    return {xNewVector, yNewVector};
}

function setup() {
    p6_CreateCanvas()

    current = createVector(
        random(PADDING, width - PADDING),
        random(PADDING, height - PADDING)
    )

    background("white")

    // Décaler tout ça dans draw (et trouver solution pour random)
    for (let i = 0; i < LINES_NB; i++) {
        let xNewVector, yNewVector;
        let randomRun = random(0, 1);

        if (repetition && randomRun < repetitionProbability) {
            if (configuration === 'horizontal') {
                let operator = ((iterationRepetition / 2) % 2 == 0) ? 1 : -1;
                xNewVector = 0;
                yNewVector = operator * randomNorm;
                configuration = 'vertical';
            } else if (configuration === 'vertical') {
                let operator = ((iterationRepetition / 2) % 2 == 0) ? 1 : -1;
                xNewVector = -operator * randomNorm;
                yNewVector = 0;
                configuration = 'horizontal'
            } else if (configuration === 'oblique') {
                let operator = (iterationRepetition % 2 == 0) ? 1 : -1;
                xNewVector = operator * randomNorm;
                yNewVector = randomNorm;
            }

            repetitionProbability -= .2;
            iterationRepetition++;

            const inGridVector = avoidOutOfGrid(xNewVector, yNewVector);

            drawLines(createVector(inGridVector.xNewVector,inGridVector.yNewVector))
        } else {
            randomNorm = 20 * floor(random(0, MAX_NORM) / 20);
            repetition = false;

            let xRandom = floor(random(0, 3));
            let yRandom = floor(random(0, 3));

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

            const inGridVector = avoidOutOfGrid(xNewVector, yNewVector);
            xNewVector = inGridVector.xNewVector;
            yNewVector = inGridVector.yNewVector;

            // Check configuration
            if (abs(xNewVector) === abs(yNewVector) && xNewVector != 0) {
                configuration = 'oblique';
            } else if (xNewVector === 0 && yNewVector != 0) {
                configuration = 'vertical';
            } else if (yNewVector === 0 && xNewVector != 0) {
                configuration = 'horizontal';
            }

            // If the new vector is equal to 0
            if (xNewVector === yNewVector && yNewVector === 0) {
                i--;
            }

            // Activate the repetition parameter
            if (randomRun < 0.3) {
                repetition = true;
                repetitionProbability = 1;
                iterationRepetition = 0;
            }

            drawLines(createVector(xNewVector, yNewVector))
        }

    }
}

function windowResized() {
    p6_ResizeCanvas()
}
