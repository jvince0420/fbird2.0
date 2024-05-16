// ----------------------------VARIABLES---------------------------------------------- //
//board **********
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

let isNightMode = false;

//bird position and size  **********
let birdWidth = 38;
let birdHeight = 36;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes **********
let pipeArray = [];
let pipeWidth = 60;
let pipeHeight = 508;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// game start
let gamePaused = true; // Indicates if the game is paused
let gameStarted = false;

//game physics  **********
let velocityX = -2; //pipes moving to left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4 //bird gravity going down


//obstacles
let gameOver = false;


//score
let score = 0;
let topScore = 0;

//points
let points = 0;

// Skills

// Shield size and img
let shieldActive = false;
let shieldImg;
let shieldWidth = 48;
let shieldHeight = 46;

let extraLifeActive = false;
let lifeImg;

let invulnerableActive = false;
let invulImg;


let skillActivationText = '';
let insufficientPoints = ''


// Points required to use power-ups
let pointsForShield = 1;
let pointsForExtraLife = 1;
let pointsForinvulnerable = 1;



// ----------------------------VARIABLES END---------------------------------------------- //


// ----------------------------SETTINGS FOR THE GAME------------------------- //
function update() { 

    requestAnimationFrame(update);
    if (gameOver) {
        // Reset skill activation and insufficient points text
        skillActivationText = '';
        insufficientPoints = '';
        context.clearRect(0, 0, board.width, board.height);
        // Draw Game Over Text
        context.font = "45px 'Black Ops One', system-ui"; //font of the score
        context.fillText("Game Over", 50, 150);

        // points
        context.fillStyle = "white"; //color of the text
        context.font = "15px Radio Canada Big";; //font of the score
        context.fillText("Skill Points: " + points, 280, 25);

        // score
        context.fillStyle = "white"; //color of the text
        context.font = "25px Radio Canada Big";; //font of the score
        context.fillText("Score: " + score, 75, 320); // x and y position of the score

        // Top score
        context.fillStyle = "white"; //color of the text
        context.font = "25px Radio Canada Big"; //font of the Top score
        context.fillText("High Score: " + topScore, 75, 350); // x and y position of the Top score

        return;
    }
    context.clearRect(0, 0, board.width, board.height)


    //bird fucntions
    velocityY += gravity
    // bird.y += velocityY; - This code while just set to infity of whether it goes up or down
    bird.y = Math.max(bird.y + velocityY, 0) //apply gravity to current bird.y, this limits the bird.y to go up
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) { //The game will end if the bird goes to the bottom
        gameOver = true;
    }


    //pipes functions
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height)

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            points += 0.5;
            if (score > topScore) {
                topScore +=1;
            }
            
            pipe.passed = true;
        }
 
             
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }


    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }


    // points
    context.fillStyle = "white"; //color of the text
    context.font = "15px Radio Canada Big"; //font of the score
    context.fillText("Skill Points: " + points, 10, 45);


    // score
    context.fillStyle = "white"; //color of the text
    context.font = "50px Radio Canada Big"; //font of the score
    context.fillText(score, 160, 150); // x and y position of the score

    // Top score
    context.fillStyle = "white"; //color of the text
    context.font = "15px Radio Canada Big"; //font of the Top score
    context.fillText("High Score: " + topScore, 10, 25); // x and y position of the Top score

    
    // Draw skill activation text
    drawSkillActivationText();
    drawSkillInsufficientText();

    drawShield()
    
}
// ----------------------------SETTINGS FOR THE GAME END------------------------- //



// -------------------------------- FUNCTIONS ------------------------------- //

// Background Day and Night
function toggleMode() {
    isNightMode = !isNightMode;
    updateBackground();
}

function updateBackground() {
    const board = document.getElementById("board");
    const body = document.body;
    if (isNightMode) {
        board.style.backgroundImage = "url('./img/GdnytBG.jpg')";
    } else {
        board.style.backgroundImage = "url('./img/flappybirdbg.png')";
    }
}


// Pipes posiition
function placePipes() {

    //Pipes height 
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = boardHeight/5

    // Top pipe placement **********
    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe); //add a new pipe to the Array

    // Bottom pipe placement **********
    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(bottomPipe);
}

// controls for the bird to fly
function moveBird(e) {
    if (e.code == "Space" || e.type == 'click') {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            shieldActive = false;
            extraLifeActive = false;
            invulnerableActive = false;
        }
    }
}



function detectCollision(a, b) {
    if (invulnerableActive) {
        // If invulnerability is active, return false to ignore collisions with pipes
        return false;
    } else {
        // If invulnerability is not active, use the original collision detection logic
        return  a.x < b.x + b.width &&
                a.x + a.width > b.x &&
                a.y < b.y + b.height &&
                a.y + a.height > b.y;
    }
}

//POWER UPS FUNCTIONS


// Skills Shortcut keys
function skills(event) {
    if (event.code == "KeyQ") {
        activateShield();
    } else if (event.code === "KeyW") {
        activateExtraLife();
    } else if (event.code === "KeyE") {
        activateinvulnerable();
    }
}

// Skills Activation And Insufficient points TEXT
function drawSkillActivationText() {
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(skillActivationText, 70, 320); // Adjust position as needed
}

function drawSkillInsufficientText() {
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText(insufficientPoints, 70, 320); // Adjust position as needed
}


// SHIELD
function activateShield() {
    if (points >= pointsForShield) {
        shieldActive = true;
        points -= pointsForShield;
        skillActivationText = "Shield Activated"; // Set the text
        setTimeout(function() {
            skillActivationText = ''; // Clear the text after 1 second
        }, 1000);
        setTimeout(deActivateShield, 10000); //deactivates the shield in 10 seconds
    } else{
        insufficientPoints = "Insufficient Points"; // Set the text
        setTimeout(function() {
            insufficientPoints = ''; // Clear the text after 1 second
        }, 1000);
    }
}
function drawShield() {
    if (shieldActive) {
        context.clearRect(bird.x, bird.y, bird.width, bird.height); // removes the birdimg
        context.drawImage(shieldImg, bird.x, bird.y, shieldWidth, shieldHeight); // aply the shieldimg
    } else {
        // If shield is not active, redraw the bird image
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }
}

function deActivateShield(){
    shieldActive = false;
}


// EXTRA LIFE SKILLS
function activateExtraLife() {
    if (points >= pointsForExtraLife) {
        extraLifeActive = true;
        points -= pointsForExtraLife;
        skillActivationText = "Extra Life Activated"; // Set the text
        setTimeout(function() {
            skillActivationText = ''; // // Clear the text after 1 second
        }, 1000);
    } else{
        insufficientPoints = "Insufficient Points"; // Set the text
        setTimeout(function() {
            insufficientPoints = ''; // // Clear the text after 1 second
        }, 1000);
    }
}


function activateinvulnerable() {
    if (points >= pointsForinvulnerable) {
        invulnerableActive = true;
        points -= pointsForinvulnerable;
        skillActivationText = "Invulnerable Activated"; // Set the text
        setTimeout(function() {
            skillActivationText = ''; // // Clear the text after 1 second
        }, 1000);
        setTimeout(deactivatesinvulnerable, 10000); //deactivates the invulnerable in 10 seconds
    } else{
        insufficientPoints = "Insufficient Points"; // Set the text
        setTimeout(function() {
            insufficientPoints = ''; // // Clear the text after 1 second
        }, 1000);
    }
}

function deactivatesinvulnerable() {
    invulnerableActive = false
}


// ------------------ ***** FUNCTIONS END ***** ------------------ //


// ----------------------------SETTING THE CANVAS FOR IMAGES------------------------- //
//For the page to load it displays all this
window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board **********

    //draw bird canvas**********
    //context.fillStyle = "yellow";
    //context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //Flappy Bird
    birdImg = new Image();
    birdImg.src = "./img/stoned.jpg.png";

    // S K I L L S
    //Shield
    shieldImg = new Image();
    shieldImg.src = "img/BirdShieldNoBg.png";

    //PIPE TOP  **********
    topPipeImg = new Image();
    topPipeImg.src = "./img/Tpipe.png"

    //PIPE BOTTOm **********
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./img/Bpipe.png"

    requestAnimationFrame(update);
    setInterval(placePipes, 2000); //every 2 seconds for the pipe to appear
    document.addEventListener("keydown", moveBird); //for the bird to move
    document.addEventListener("x", moveBird);
    document.addEventListener("keydown", skills)

}
// ----------------------------SETTING THE CANVAS FOR IMAGES END------------------------- //
