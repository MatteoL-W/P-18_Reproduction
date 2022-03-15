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

// -------------------
//       Drawing
// -------------------

function draw() {
    randomSeed(params.Seed)

}

function drawLines(newVector) {
    line(current.x, current.y, current.x + newVector.x, current.y + newVector.y)
}

// -------------------
//    Initialization
// -------------------

function setup() {
    p6_CreateCanvas()
    current = createVector(random(PADDING, width - PADDING), random(PADDING, height - PADDING))

    background("white")

    for (let i = 0; i < LINES_NB; i++) {
        /* Sinon */
        let norm = 10 * floor(random(0, MAX_NORM) / 10);

        let xRandom = floor(random(0, 3));
        let yRandom = floor(random(0, 3));
        let xNewVector, yNewVector;

        switch (xRandom) {
            case 0:
                xNewVector = -1 * norm;
                break;
            case 1:
                xNewVector = 0;
                break;
            case 2:
                xNewVector = norm;
                break;
        }

        switch (yRandom) {
            case 0:
                yNewVector = -1 * norm;
                break;
            case 1:
                yNewVector = 0;
                break;
            case 2:
                yNewVector = norm;
                break;
        }

        // Avoid drawing outside the frame
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

        // Draw the lines
        let newVector = createVector(xNewVector, yNewVector)

        drawLines(newVector)
        current.add(newVector);
    }
}

function windowResized() {
    p6_ResizeCanvas()
}
