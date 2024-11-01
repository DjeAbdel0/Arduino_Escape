#define CHAN_KEY 0
#define CHAN_ANGLE 1
#define CHAN_8ENCODER 3

#include <M5Atom.h>
#include <MicroOscSlip.h>
MicroOscSlip<128> monOsc(&Serial);
#include <M5_PbHub.h>
M5_PbHub myPbHub;
#include <VL53L0X.h>
VL53L0X myTOF;
#include "Unit_Encoder.h"
#include "UNIT_8ENCODER.h"



CRGB pixel;
// Unit_Encoder sensor; Juste un Sensor a chq fois
UNIT_8ENCODER my8Encoder;
unsigned long monChronoMessages;

int maLectureKeyPrecedente;
int etatPlay;


void show_encoder_value(void) {
    int32_t encoder[8] = {0};
    for (int i = 0; i < 8; i++) {
        encoder[i] = my8Encoder.getEncoderValue(i);
         char address[20];
      sprintf(address, "/Encoder/%d", i); 
      monOsc.sendInt(address, encoder[i]);
    }

}

void setup() {
  // put your setup code here, to run once:
  M5.begin(false, false, false);
  FastLED.addLeds<WS2812, DATA_PIN, GRB>(&pixel, 1); 
  Serial.begin(115200);

  unsigned long chronoDepart = millis();
  while (millis() - chronoDepart < 5000) {
    pixel = CRGB(255, 255, 255);
    FastLED.show();
    delay(100);

    pixel = CRGB(0, 255, 0);
    FastLED.show();
    delay(100);
  }

  pixel = CRGB(0, 0, 0);
  FastLED.show();

  Wire.begin();
  myPbHub.begin();
  myPbHub.setPixelCount(CHAN_KEY, 1);

  myTOF.init();
  myTOF.setTimeout(500);
  myTOF.startContinuous();

  my8Encoder.begin();
}

void maReceptionMessageOsc(MicroOscMessage& oscMessage) {

  if (oscMessage.checkOscAddress("/master/vu")) {
    float vu = oscMessage.nextAsFloat();
    int niveau = floor(vu * 255.0);
    pixel = CRGB(niveau, niveau, niveau);
    FastLED.show();
  }
}


void loop() {
  M5.update();

  monOsc.onOscMessageReceived(maReceptionMessageOsc);

  // À CHAQUE 20 MS I.E. 50x PAR SECONDE
  if (millis() - monChronoMessages >= 20) {
    monChronoMessages = millis();

    int maLectureKey = myPbHub.digitalRead(CHAN_KEY);

    if (maLectureKeyPrecedente != maLectureKey) {
      if (maLectureKey == 0) {

        etatPlay = !etatPlay;

        int monMin = 0;
        int monMax = 256;
        int r = random(monMin, monMax);
        int g = random(monMin, monMax);
        int b = random(monMin, monMax);
        myPbHub.setPixelColor(CHAN_KEY, 0, r, g, b);
      }
    }
    maLectureKeyPrecedente = maLectureKey;

    int maLectureAngle = myPbHub.analogRead(CHAN_ANGLE);
    //float volume = maLectureAngle / 4095.0;
    int valeur = map(maLectureAngle, 0, 4095, 0, 127);
    monOsc.sendInt("/chiffreAngle", valeur);

    // Encoder Solo
    // int encoder_value = sensor.getEncoderValue();
    // monOsc.sendInt("/EncoderSolo", encoder_value);

    //Encoder 8 channels
    show_encoder_value();
  }
}
