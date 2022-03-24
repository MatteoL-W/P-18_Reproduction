// -------------------
//  Parameters and UI
// -------------------

const gui = new dat.GUI()
const params = {
    Seed: 1,
    Lines_nb: 5,
    Multipliers: 20,
    Max_norm: 200,
    Padding: 80,
    Download_Image: () => save(),
    Ajouter_Ligne:() => params.Lines_nb++,
}
gui.add(params, "Seed", 1, 50, 1)
gui.add(params, "Lines_nb", 0, 200, 1)
gui.add(params, "Multipliers", 1, 30, 1)
gui.add(params, "Max_norm", 10, 250, 10)
gui.add(params, "Padding", 0, 200, 10)
gui.add(params, "Download_Image")
gui.add(params, "Ajouter_Ligne")

// -------------------
//  Initialization
// -------------------

let current;
let plotter;
let counter = 0;

let configuration;
let configurationOblique;
let repetition = false;
let repetitionProbability = 1;
let iterationRepetition = 0;
let randomNorm;
let operatorRandom;
let configurationRepetition;
let operatorX;
let operatorY;
let randomLengthOpposite;
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
        let distance = newVector.mag();
        distance = (configuration === 'oblique') ? distance/sqrt(2) : distance;

        for (let i = 0; i < distance * 2; i++) {
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
    let noCounter = false;
    if (counter < params.Lines_nb) {
        let xNewVector, yNewVector;
        let randomRun = random(0, 1);
        if (repetition && randomRun < repetitionProbability)
        {
            let configTemp = configuration;
            console.log("configRepet : "+configurationRepetition)
            switch (configurationRepetition)
            {
                case 'horizontal':
                    switch (configuration)
                    {
                        case 'horizontal':
                            xNewVector = 0;
                            console.log("!!! : "+operatorRandom)
                            console.log("randomLengthOpposite : "+randomLengthOpposite)
                            yNewVector = operatorRandom * randomLengthOpposite;
                            configuration = 'vertical';
                            break;
                        case 'vertical':
                            operatorX *= -1;
                            xNewVector = operatorX * randomNorm;
                            yNewVector = 0;
                            configuration = 'horizontal'
                            break;   
                    }
                    break;

                case 'vertical':
                    switch (configuration)
                    {
                        case 'vertical':
                            xNewVector = operatorRandom * randomLengthOpposite;
                            console.log("!!! : "+operatorRandom)
                            console.log("randomLengthOpposite : "+randomLengthOpposite)
                            yNewVector = 0;
                            configuration = 'horizontal'
                            break;   
                        case 'horizontal':
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

            console.log("REPETITION : "+configuration)

            repetitionProbability -= .2;
            iterationRepetition++;

            const inGridVector = outOfGrid(xNewVector, yNewVector);

            console.log("x : "  + xNewVector)
            console.log("y : "  + yNewVector)

            if (outOfGrid(xNewVector, yNewVector)!=1)
            {
                drawLines(createVector(xNewVector, yNewVector))
            }
            else
            {
                console.log("repetition out of grid")
                console.log("-----------")
                configuration=configTemp;
                repetition=false;
                counter--;
            }
            
        }
        
        else
        {
            console.log("NORMAL")
            console.log(configuration)
            let configurationTemp = whatConfiguration(xNewVector, yNewVector);
            console.log("whatconf avant new : "+configurationTemp);
            // Only multiplier of MULTIPLIERS to have a structure
            randomNorm = params.Multipliers * floor(random(0, params.Max_norm) / params.Multipliers);
            repetition = false;

            xNewVector = random([-1 * randomNorm, 0, randomNorm]);
            yNewVector = random([-1 * randomNorm, 0, randomNorm]);

            console.log("whatconf apres new : "+whatConfiguration(xNewVector, yNewVector));

            if (outOfGrid(xNewVector, yNewVector)==0)
            {
                console.log("pas outofgrid")
                // If the new vector is equal to 0
                if (xNewVector === yNewVector && yNewVector === 0) {
                    noCounter = true;
                    console.log("vecteur nul")
                    console.log(configuration)
                }

                else if (configurationTemp === whatConfiguration(xNewVector, yNewVector)) {
                    noCounter = true;
                    console.log("vecteur colinéaire")
                }

                else if (whatConfiguration(xNewVector, yNewVector) == undefined) {
                    noCounter = true;
                    console.log("jsp")
                }

                // Draw the lines only if the xNewVector is new
                else
                {
                    configuration = whatConfiguration(xNewVector, yNewVector);
                    // Activate the repetition parameter
                    if (randomRun < 1) {
                        repetition = true;
                        repetitionProbability = 1;
                        iterationRepetition = 0;
                        configurationOblique = random(['x', 'y'])
                    }

                    console.log("x : "  + xNewVector)
                    console.log("y : "  + yNewVector)
                    console.log("-----------")



                    configurationRepetition=whatConfiguration(xNewVector,yNewVector);
                    console.log("operatorRandom : "+operatorRandom);

                    drawLines(createVector(xNewVector, yNewVector))

                    operatorX=plotter.deltaX;
                    operatorY=plotter.deltaY;
                    console.log("opX :"+operatorX+"  opY :"+operatorY)
                    operatorRandom=random([-1,1]);
                    randomLengthOpposite = params.Multipliers * floor(random(10, (params.Max_norm)) / params.Multipliers);
                }
            }
            else
            {
                counter--;
            }
        }
        if (!noCounter)
        {
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

function outOfGrid(xNewVector, yNewVector) {
    let futureVectorCopy = current.copy().add(createVector(xNewVector, yNewVector));

    /*
    if (futureVectorCopy.x < params.Padding) {
        xNewVector = abs(xNewVector)
    } else if (futureVectorCopy.x > width - params.Padding) {
        xNewVector = -xNewVector
    }

    if (futureVectorCopy.y < params.Padding) {
        yNewVector = abs(yNewVector)
    } else if (futureVectorCopy.y > height - params.Padding) {
        yNewVector = -yNewVector
    }*/
    if(futureVectorCopy.x<params.Padding || futureVectorCopy.x>width-params.Padding)
    {
        return 1;
    }
    if(futureVectorCopy.y<params.Padding || futureVectorCopy.y>height-params.Padding)
    {
        return 1;
    }
    
    return 0;
    //return {xNewVector, yNewVector};
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
