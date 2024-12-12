// https://github.com/colinbdclark/osc.js/
// https://github.com/romeojeremiah/javascript-light-switch-project/blob/master/style.css

// MESSAGE DISPLAY
let messageText;

// VARIABLES TO BE USED TO POINT TO DOM ELEMENTS
let light;
let photo;
let pot;
let button;
let indexCadenas = 1;

// Const pour les sons
const correctSound = new Audio("./enigma_4/assets/correct.mp3");
const incorrectSound = new Audio("./enigma_4/assets/incorrect.mp3");
const victorySound = new Audio("./enigma_4/assets/victoire.mp3");

// OSC WEBSOCKET
let webSocketConnected = false;

let socketPort = 8080;
oscSocket = new osc.WebSocketPort({
  url: "ws://localhost:" + socketPort,
  metadata: true,
});

// ON WEBSOCKET OPEN AND READY
oscSocket.on("ready", function (msg) {
  console.log("WebSocket Opened on Port " + socketPort);
  webSocketConnected = true;
});

let toutBon1 = false; //Bonne réponse etape 1
let toutBon2 = false; //Bonne réponse etape 2
let toutBon3 = false; //Bonne réponse etape 3

let thermometerBody = document.querySelector("thermometerBody");
let thermometerDegreeText = document.querySelector("thermometer-degree");

// Tableau de lettres
const letters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
//Bonne lettre (S, A, N, G, L, I, E, R)
const bonneRep = [19, 1, 14, 7, 12, 9, 5, 18];
//Sauvegarde les values dans ce tableau
let currentEncoderValues = new Array(9);

oscSocket.on("message", function (msg) {
  /************************Étape 1: 8Encoder*********************************/
  let vraiMot = document.getElementById("vrai-mot");
  let fauxMot = document.getElementById("faux-mot");
  let etape1 = document.getElementById("etape-1");
  let etape2 = document.getElementById("etape-2");
  let etape3 = document.getElementById("etape-3");
  let win = document.getElementById("win");

  let address = msg.address;
  let firstArgumentValue = msg.args[0].value;

  if (address.startsWith("/Encoder/")) {
    let encoderIndex = parseInt(address.split("/Encoder/")[1]);

    if (encoderIndex >= 0 && encoderIndex <= 8) {
      let lettreElement = document.getElementById(`Lettre-${encoderIndex + 1}`);
      if (lettreElement) {
        if (firstArgumentValue >= 1 && firstArgumentValue <= 26) {
          lettreElement.innerHTML =
            "Lettre: " + letters[firstArgumentValue - 1];
        } else {
          lettreElement.innerHTML =
            "Chiffre: " + firstArgumentValue + " Tourner vers la droite";
        }
      }

      // Assign firstArgumentValue to currentEncoderValues
      currentEncoderValues[encoderIndex] = firstArgumentValue;
    }
  }

  // Update the value of `toutBon1` (Step 1 verification)
  toutBon1 = currentEncoderValues.every(
    (value, index) => value === bonneRep[index]
  );

  // Handle Btn1 functionality for Step 1 verification
  if (address.startsWith("/Verif1")) {
    if (firstArgumentValue == 0) {
      if (toutBon1) {
        correctSound.play(); // Jouer le son de réussite
        document.body.style.backgroundColor = "rgb(117, 255, 255)";
        etape1.style.display = "none";
        etape2.style.display = "flex";
        etape3.style.display = "none";
        win.style.display = "none";
      } else {
        incorrectSound.play(); // Jouer le son d'échec
        document.body.style.backgroundColor = "red";
        etape1.style.display = "flex";
        etape2.style.display = "none";
        etape3.style.display = "none";
        win.style.display = "none";
      }
    }
  }

  /************************angle unit*********************************/
  //Recoi l'adresse
  if (address.startsWith("/chiffreAngle")) {
    // Ensure the angle value is within a reasonable range (e.g., 0 to 100)
    let angleThermo = firstArgumentValue;

    // Ajuster la taille du thermometre
    let mappedHeight = 160 - (angleThermo * 149) / 100; // Adjusting for a range between 160px and 11px

    let thermometerBodyFill = document.querySelector(".thermometerBodyFill");
    thermometerBodyFill.style.top = `${mappedHeight}px`;

    //Montrer la temperature avec innerHTML
    let angleDisplay = document.getElementById("angle-display");
    angleDisplay.innerHTML = "Angle: " + firstArgumentValue + "°";

    if (angleThermo == 69) {
      toutBon2 = true;
      // Vous pouvez ajouter des actions pour la bonne réponse ici
    } else if (angleThermo !== 69) {
      toutBon2 = false;
      // Vous pouvez ajouter des actions pour la mauvaise réponse ici
    }
  }

  if (address.startsWith("/Verif2")) {
    if (firstArgumentValue == 0) {
      if (toutBon2) {
        document.body.style.backgroundColor = "rgb(117, 255, 255)";
        correctSound.play(); // Jouer le son de réussite
        etape1.style.display = "none";
        etape2.style.display = "none";
        etape3.style.display = "flex";
        win.style.display = "none";
      } else if (!toutBon2) {
        document.body.style.backgroundColor = "red";
        incorrectSound.play(); // Jouer le son d'échec
        toutBon2 = false;
        etape1.style.display = "none";
        etape2.style.display = "flex";
        etape3.style.display = "none";
        win.style.display = "none";
      }
    }
  }

  /************************Encoder solo*********************************/
  let nombre1 = document.querySelector("#nombre-1");
  let nombre2 = document.querySelector("#nombre-2");
  let nombre3 = document.querySelector("#nombre-3");
  // Définir l'index à 1
  let encoderValue = 0; // Initialiser une variable pour stocker la valeur de l'encodeur

  // Déclarer index en dehors de la condition pour qu'il ne soit pas réinitialisé à chaque appel de la fonction

  if (address.startsWith("/CodeBtn")) {
    indexCadenas++; // Incrémentation de l'index
  }

  if (address.startsWith("/cadenas")) {
    // Lorsque l'encodeur tourne, mettre à jour la valeur
    if (indexCadenas == 1) {
      // Comparaison stricte avec ===

      if (firstArgumentValue !== undefined) {
        nombre1.innerHTML = firstArgumentValue;
      }
    } else if (indexCadenas == 2) {
      if (firstArgumentValue !== undefined) {
        nombre2.innerHTML = firstArgumentValue;
        encoderValue = firstArgumentValue;
      }
    } else if (indexCadenas == 3) {
      if (firstArgumentValue !== undefined) {
        nombre3.innerHTML = firstArgumentValue;
        encoderValue = firstArgumentValue;
      }
    }
  }

  if (
    nombre1.innerHTML == 0 &&
    nombre2.innerHTML == 3 &&
    nombre3.innerHTML == 7
  ) {
    toutBon3 = true;
  }

  if (address.startsWith("/Verif3")) {
    if (firstArgumentValue == 0) {
      if (toutBon3) {
        victorySound.play(); // Jouer le son de réussite
        document.body.style.backgroundColor = "rgb(117, 255, 255)";
        etape1.style.display = "none";
        etape2.style.display = "none";
        etape3.style.display = "none";
        win.style.display = "flex";
      } else {
        incorrectSound.play(); // Jouer le son d'échec
        document.body.style.backgroundColor = "red";
        etape1.style.display = "none";
        etape2.style.display = "none";
        etape3.style.display = "flex";
        win.style.display = "none";
        nombre1.innerHTML = 0;
        nombre2.innerHTML = 0;
        nombre3.innerHTML = 0;
        indexCadenas = 1;
      }
    }
  }

  if (address.startsWith("/cadenas")) {
    // Lorsque l'encodeur tourne, mettre à jour la valeur
    if (indexCadenas == 1) {
      if (firstArgumentValue !== undefined) {
        nombre1.innerHTML = Math.max(0, Math.min(9, firstArgumentValue)); // Valider la valeur dans la plage [0, 9]
      }
    } else if (indexCadenas == 2) {
      if (firstArgumentValue !== undefined) {
        nombre2.innerHTML = Math.max(0, Math.min(9, firstArgumentValue)); // Valider la valeur dans la plage [0, 9]
        encoderValue = firstArgumentValue;
      }
    } else if (indexCadenas == 3) {
      if (firstArgumentValue !== undefined) {
        nombre3.innerHTML = Math.max(0, Math.min(9, firstArgumentValue)); // Valider la valeur dans la plage [0, 9]
        encoderValue = firstArgumentValue;
      }
    }
  }

  if (address.startsWith("/Reset")) {
    if (firstArgumentValue == 0) {
      location.reload();
      etape1.style.display = "flex";
      etape2.style.display = "none";
      etape3.style.display = "none";
      win.style.display = "none";
      toutBon1 = toutBon2 = toutBon3 = false;
    }
  }
});

// ON WEBSOCKET CLOSED
oscSocket.on("close", function (msg) {
  console.log("WebSocket closed");
  messageText.innerText = "WebSocket closed";
  webSocketConnected = false;
});

// ON WINDOW UNLOAD
window.addEventListener("beforeunload", (event) => {
  oscSocket.close();
});

// ON WINDOW LOAD
window.addEventListener("load", (event) => {
  oscSocket.open();
});
