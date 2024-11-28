// https://github.com/colinbdclark/osc.js/
// https://github.com/romeojeremiah/javascript-light-switch-project/blob/master/style.css

// MESSAGE DISPLAY
let messageText;

// VARIABLES TO BE USED TO POINT TO DOM ELEMENTS
let light;
let photo;
let pot;
let button;


// OSC WEBSOCKET
let webSocketConnected = false;

let socketPort = 8080;
oscSocket = new osc.WebSocketPort({
	url: "ws://localhost:" + socketPort,
	metadata: true
});

// ON WEBSOCKET OPEN AND READY
oscSocket.on("ready", function (msg) {
	console.log("WebSocket Opened on Port " + socketPort);
	webSocketConnected = true;
});

let toutBon1 = false; //Bon mot etape 1
let toutBon2 = false; //Bon mot etape 2

let thermometerBody = document.querySelector('thermometerBody');
let thermometerDegreeText = document.querySelector('thermometer-degree');

// Tableau de lettres
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
//Bonne lettre (S, A, N, G, L, I, E, R)
const bonneRep = [19, 1, 14, 7, 12, 9, 5, 18];
//Sauvegarde les values dans ce tableau
let currentEncoderValues = new Array(9);

oscSocket.on("message", function (msg) {

	let vraiMot = document.getElementById("vrai-mot");
	let fauxMot = document.getElementById("faux-mot");
	let etape1 = document.getElementById("etape-1");
	let etape2 = document.getElementById("etape-2");

	let address = msg.address;
	let firstArgumentValue = msg.args[0].value;

	if (address.startsWith("/Encoder/")) {
		let encoderIndex = parseInt(address.split("/Encoder/")[1]);

		if (encoderIndex >= 0 && encoderIndex <= 8) {
			let lettreElement = document.getElementById(`Lettre-${encoderIndex + 1}`);
			if (lettreElement) {
				if (firstArgumentValue >= 1 && firstArgumentValue <= 26) {
					lettreElement.innerHTML = "Lettre: " + letters[firstArgumentValue - 1];
				} else {
					lettreElement.innerHTML = "Chiffre: " + firstArgumentValue + " Tourner vers la droite";
				}
			}


			currentEncoderValues[encoderIndex] = firstArgumentValue;
		}
	}


	// Check if all encoders' values match the expected values
	if (currentEncoderValues.every((value, index) => value === bonneRep[index])) {
		toutBon1 = true;
	} else {
		toutBon1 = false;
	}



	if (address.startsWith("/Verif1")) {
		if (firstArgumentValue == 0) {
			if (toutBon1) {
				document.body.style.backgroundColor = "green";
				vraiMot.style.display = "block";
				fauxMot.style.display = "none";
				etape2.style.display = "flex";
			} else {
				document.body.style.backgroundColor = "red";
				vraiMot.style.display = "none";
				fauxMot.style.display = "block";
				etape2.style.display = "none";
			}
		}
	}




	/************************angle unit*********************************/
	//Recoi l'adresse
	if (address.startsWith("/chiffreAngle")) {
		// Ensure the angle value is within a reasonable range (e.g., 0 to 100)
		let angleThermo = firstArgumentValue;


		// Ajuster la taille du thermometre
		let mappedHeight = 160 - (angleThermo * 149 / 100); // Adjusting for a range between 160px and 11px

		let thermometerBodyFill = document.querySelector('.thermometerBodyFill');
		thermometerBodyFill.style.top = `${mappedHeight}px`;

		//Montrer la temperature avec innerHTML
		let angleDisplay = document.getElementById("angle-display");
		angleDisplay.innerHTML = "Angle: " + firstArgumentValue + "°";

		if (mappedHeight == 69) {
			toutBon2 = true;
			console.log("Bonne réponse, l'angle est 69.");
			// Vous pouvez ajouter des actions pour la bonne réponse ici
		} else {
			//	console.log("Mauvaise réponse, l'angle n'est pas .");
			// Vous pouvez ajouter des actions pour la mauvaise réponse ici
		}
    }
	if (address.startsWith("/Verif2")) {
		if (firstArgumentValue == 0) {
			if (toutBon2) {
				document.body.style.backgroundColor = "green";
				etape1.style.display = "flex";
			} else {
				document.body.style.backgroundColor = "red";
				etape1.style.display = "none";
			}
		}
	}

/************************Encoder solo*********************************/
let cadenas = firstArgumentValue;
let currentIndex = 0; // Indice actuel pour le nombre en cours
let combinaisonArr = [0, 0, 0]; // Valeurs initiales pour le cadenas
let nombreArr = [
  document.querySelector('#nombre-1'),
  document.querySelector('#nombre-2'),
  document.querySelector('#nombre-3')
];

// Mettre à jour les affichages des nombres
function updateDisplay() {
  nombreArr.forEach((el, index) => {
    el.innerHTML = combinaisonArr[index];
  });
}

// Réception des données OSC
if (address.startsWith("/cadenas")) {
  if (address.startsWith("/cadenas/button")) {
    // Le bouton est pressé : passer au nombre suivant
    if (currentIndex < combinaisonArr.length - 1) {
      currentIndex++;
    } else {
      console.log("Tous les nombres sont définis : ", combinaisonArr);
      // Si tous les nombres sont définis, ajouter une vérification ici
    }
  } else {
    // Mise à jour de la valeur de l'encodeur pour le nombre courant
    combinaisonArr[currentIndex] += cadenas; // Ajoute la rotation
    updateDisplay(); // Met à jour l'affichage
  }
}

// Vérification finale de la combinaison
if (JSON.stringify(combinaisonArr) === JSON.stringify([a, b, c])) {
  console.log("Cadenas déverrouillé !");
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
window.addEventListener('load', (event) => {
	oscSocket.open();


});