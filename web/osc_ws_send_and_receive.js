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



let toutBon = false; //Bon mot

// Get references to the DOM elements for thermometer
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

	if (currentEncoderValues.every((value, index) => value === bonneRep[index])) {
		toutBon = true;
	} else {
		toutBon = false;
	}

	if (address.startsWith("/Verif1/")) {
		let btn1 = parseInt(address.split("/Verif1/")[1]); 
		console.log("/Verif1/ :", btn1);
		console.log("/Verif1/ :", btn1.number);
		console.log("/Verif1/ :", btn1.firstArgumentValue);
		console.log("/Verif1/ :", firstArgumentValue);
	
		if (firstArgumentValue === 0) {
			console.log("Bouton pressé ");
			document.body.style.backgroundColor = "green"; 
		} else {
			console.log("Bouton relache");
			document.body.style.backgroundColor = "white"; 
		}
	}
	
	

	// Verifier 
	document.getElementById("verifier").addEventListener("click", function () {
		if (toutBon) {
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
	});

	/*angle unit*/
	//Recoi l'adresse
    if (address.startsWith("/chiffreAngle")) {

		let angleThermo = firstArgumentValue;
        //console.log("Angle received: " + angleThermo);

        // Ajuster la taille du thermometre
        let mappedHeight = 160 - (angleThermo * 149 / 100);  // Adjusting for a range between 160px and 11px

        let thermometerBodyFill = document.querySelector('.thermometerBodyFill');
        thermometerBodyFill.style.top = `${mappedHeight}px`;
		
		//Montrer la temperature avec innerHTML
		let angleDisplay = document.getElementById("angle-display");
		angleDisplay.innerHTML = "Angle: " + firstArgumentValue + "°";
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