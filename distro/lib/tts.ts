namespace Lib {
    export class TTS {
        private static pin: AnalogPin; // Buzzer pin
        private static toneDuration: number = 200; // Duration of each tone in ms
        private static frequency: number = 1000; // Frequency of the buzzer sound in Hz
        private static pauseDuration: number = 100; // Pause between tones in ms

        // Initialize the TTS library with a buzzer pin
        public static init(buzzerPin: AnalogPin): void {
            this.pin = buzzerPin;
        };

        // "Say" a text by playing tones for each character
        public static say(text: string): void {
            for (let char of text) {
                this.playCharacter(char);
                basic.pause(this.pauseDuration); // Pause between characters
            };
        };

        // Convert a character to tones
        private static playCharacter(char: string): void {
            // Map for tones (basic alphabet mapping, extendable)
            const tones: { [key: string]: number } = {
                "a": 440,
                "b": 494,
                "c": 523,
                "d": 587,
                "e": 659,
                "f": 698,
                "g": 784,
                "h": 880,
                "i": 988,
                "j": 1047,
                "k": 1175,
                "l": 1319,
                "m": 1397,
                "n": 1568,
                "o": 1760,
                "p": 1976,
                "q": 2093,
                "r": 2349,
                "s": 2637,
                "t": 2794,
                "u": 3136,
                "v": 3520,
                "w": 3951,
                "x": 4186,
                "y": 4699,
                "z": 5274,
                " ": 0 // Silence for spaces
            };

            // Play the corresponding tone
            const freq = tones[char.toLowerCase()] || 0; // Default to silence for unknown characters
            if (freq > 0) {
                pins.analogWritePin(this.pin, 512); // Start tone
                basic.pause(this.toneDuration); // Hold tone
                pins.analogWritePin(this.pin, 0); // Stop tone
            } else {
                basic.pause(this.toneDuration); // Silence for spaces
            };
        };
    };
};
