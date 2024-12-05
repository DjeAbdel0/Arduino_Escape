#define CHAN_ANGLE 0
#define btn1 1
#define btn2 2
#define btn3 3
#define btn4 4
#define ENCODER 2
#define CHAN_8ENCODER 3

#include <M5Atom.h>
#include <MicroOscSlip.h>
MicroOscSlip<128> monOsc(&Serial);
#include <M5_PbHub.h>
M5_PbHub myPbHub;
#include <VL53L0X.h>
VL53L0X myTOF;
#include "Unit_Encoder.h"
// Encoder
#include "Unit_Encoder.h"
Unit_Encoder myEncoder;
#include "UNIT_8ENCODER.h"

CRGB pixel;
UNIT_8ENCODER my8Encoder;
unsigned long monChronoMessages;

int maLectureKeyPrecedente1;
int maLectureKeyPrecedente2;
int maLectureKeyPrecedente3;
int maLectureKeyPrecedente4;



int etatPlay;

// Fonction pour réinitialiser les compteurs des encodeurs
void resetCounter() {
    for (int i = 0; i < 8; i++) {
        my8Encoder.resetCounter(i);  // Réinitialiser le compteur de chaque encodeur
    }
}

void show_encoder_value(void) {
  int32_t encoder[8] = { 0 };

  for (int i = 0; i < 8; i++) {
    // Retrieve the raw encoder value
    int32_t rawValue = my8Encoder.getEncoderValue(i);

    // Map the raw value to the range 0 - 26
    int32_t mappedValue = map(rawValue, 0, 52, 0, 26);

    // Ensure the mapped value is within 0 - 26
    encoder[i] = max((int32_t)0, min(mappedValue, (int32_t)26));

    // Prepare the OSC address and send the clamped value
    char address[20];
    sprintf(address, "/Encoder/%d", i);
    monOsc.sendInt(address, encoder[i]);
  }
}

void setup() {
  M5.begin(false, false, false);
  FastLED.addLeds<WS2812, DATA_PIN, GRB>(&pixel, 1);
  Serial.begin(115200);

  unsigned long chronoDepart = millis();
  while (millis() - chronoDepart < 5000) {
    pixel = CRGB(0, 255, 15);
    FastLED.show();
    delay(100);
  }

  myPbHub.setPixelColor(btn1, 0, 0, 255, 0);

  my8Encoder.begin(&Wire, ENCODER_ADDR, SDA, SCL, 100000UL);  //Wire.begin();
  myPbHub.begin();
  myPbHub.setPixelCount(btn1, 1);
  myEncoder.begin();  // Démarrer la connexion avec l'encodeur
}

void maReceptionMessageOsc(MicroOscMessage& oscMessage) {
}

void loop() {
  M5.update();

  monOsc.onOscMessageReceived(maReceptionMessageOsc);

  // À CHAQUE 20 MS
  if (millis() - monChronoMessages >= 20) {
    monChronoMessages = millis();

    int maLectureKey1 = myPbHub.digitalRead(btn1);
    int maLectureKey2 = myPbHub.digitalRead(btn2);
    int maLectureKey3 = myPbHub.digitalRead(btn3);
    int maLectureKey4 = myPbHub.digitalRead(btn4);

    // Bouton Verif 1
    if (maLectureKeyPrecedente1 != maLectureKey1) {
      if (maLectureKey1 == 0) {
        myPbHub.setPixelColor(btn1, 0, 0, 255, 0);
        monOsc.sendInt("/Verif1", etatPlay);
        resetCounter();  // Réinitialiser tous les encodeurs
      }
    }
    maLectureKeyPrecedente1 = maLectureKey1;

    // Traitement pour les autres boutons...
    if (maLectureKeyPrecedente2 != maLectureKey2) {
      if (maLectureKey2 == 0) {
        myPbHub.setPixelColor(btn2, 0, 0, 0, 255);
        monOsc.sendInt("/Verif2", etatPlay);
      }
    }
    maLectureKeyPrecedente2 = maLectureKey2;

    if (maLectureKeyPrecedente3 != maLectureKey3) {
      if (maLectureKey3 == 0) {
        myPbHub.setPixelColor(btn3, 0, 255, 0, 0);
        monOsc.sendInt("/Verif3", etatPlay);
      }
    }
    maLectureKeyPrecedente3 = maLectureKey3;

    if (maLectureKeyPrecedente4 != maLectureKey4) {
      if (maLectureKey4 == 0) {
        myPbHub.setPixelColor(btn4, 0, 255, 255, 255);
        monOsc.sendInt("/Reset", etatPlay);
      }
    }
    maLectureKeyPrecedente4 = maLectureKey4;

    // Lecture de l'angle et envoi
    int maLectureAngle = myPbHub.analogRead(CHAN_ANGLE);
    int valeur = map(maLectureAngle, 0, 4095, 0, 100);
    monOsc.sendInt("/chiffreAngle", valeur);

    // Affichage des valeurs des encodeurs
    show_encoder_value();

    // Encoder solo
    int encoderRotation = myEncoder.getEncoderValue();
    monOsc.sendInt("/cadenas", encoderRotation);
    int encoderButton = myEncoder.getButtonStatus();
    monOsc.sendInt("/cadenas/button", encoderButton);
  }
}
