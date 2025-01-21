namespace LED {
    export class StatusLED {
        private constructor(r: DigitalInOutPin, g: DigitalInOutPin, b: DigitalInOutPin) {
            this.r = r;
            this.g = g;
            this.b = b;
        };
        public setColor(color: color) {
            
        };
        private r: DigitalInOutPin;
        private g: DigitalInOutPin;
        private b: DigitalInOutPin;
        public static instance() {
            return new this(pins.pinByCfg(DAL.CFG_PIN_LED_R), pins.pinByCfg(DAL.CFG_PIN_LED_G), pins.pinByCfg(DAL.CFG_PIN_LED_B));
        };
    };
};