/* 
 * SOUP OS Kernel
 */

namespace OS {
    export function BackgroundSetup() {
        timer.background(OS.Startup);
    };
    export function Startup() {
        scene.setBackgroundColor(0);
        Debug.print("Welcome to SOUP OS!\n");
        music.playMelody("A A G B G D", 180)
    };
    export namespace Debug {
        export function print(message: string) {
            OS.IO.Display.print(message);
        };
    };
    export namespace IO {
        export class DisplayPort {
            constructor() {
                this.console = textsprite.create("", 0, 200);
                this.consoleText = "";
                this.console.setPosition(0,0);
            };
            print(message: string) {
                this.consoleText += message;
                this.update();
            };
            clear() {
                this.consoleText = "";
                this.update();
            };
            update() {
                this.console.setText(this.consoleText);
            };
            console: any;
            consoleText: string;
        };
        export class MemoryPort {

        };
        export class NetworkPort {

        };
        export const Display: DisplayPort = new DisplayPort();
    };
    export namespace Filesystem {
        export class Meta {
                constructor() {

                };
                set(propery: string, value: string) {
            };
        };
        export class File {
            constructor(name: string) {
                
            };
        };
        export class Folder {
            constructor(name: string) {
                
            };
        };
    };
};

OS.BackgroundSetup();