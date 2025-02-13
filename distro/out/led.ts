namespace Distro.LED {
    export class StatusLED {
        private constructor(private r: AnalogInOutPin, private g: AnalogInOutPin, private b: AnalogInOutPin) {}

        public setColor(rValue: number, gValue: number, bValue: number): void {
            this.r.analogWrite(rValue); // Red channel
            this.g.analogWrite(gValue); // Green channel
            this.b.analogWrite(bValue); // Blue channel
        };

        static instance() {
            // ???
        };
    };
};
