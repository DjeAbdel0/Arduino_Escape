#define CHAN_KEY 1
#define CHAN_ANGLE 0
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
  // put your setup code here, to run once:
  M5.begin(false, false, false);
  FastLED.addLeds<WS2812, DATA_PIN, GRB>(&pixel, 1);
  Serial.begin(115200);

  unsigned long chronoDepart = millis();
  while (millis() - chronoDepart < 5000) {
    pixel = CRGB(0, 255, 15);
    FastLED.show();
    delay(100);
  }

myPbHub.setPixelColor(CHAN_KEY, 0, 0, 255, 0);

  my8Encoder.begin(&Wire, ENCODER_ADDR, SDA, SCL, 100000UL);  //Wire.begin();
  myPbHub.begin();
  myPbHub.setPixelCount(CHAN_KEY, 1);
}

void maReceptionMessageOsc(MicroOscMessage& oscMessage) {
}


void loop() {
  M5.update();

  monOsc.onOscMessageReceived(maReceptionMessageOsc);

  // À CHAQUE 20 MS I.E. 50x PAR SECONDE
  if (millis() - monChronoMessages >= 20) {
    monChronoMessages = millis();

    int maLectureKey = myPbHub.digitalRead(CHAN_KEY);

    if (maLectureKeyPrecedente != maLectureKey) { 
      monOsc.sendInt("/Verif1", maLectureKey);
      
    }
    

    int maLectureAngle = myPbHub.analogRead(CHAN_ANGLE);
    //float volume = maLectureAngle / 4095.0;
    int valeur = map(maLectureAngle, 0, 4095, 0, 100);
    monOsc.sendInt("/chiffreAngle", valeur);

    //Encoder 8 channels
    show_encoder_value();
  }
}
