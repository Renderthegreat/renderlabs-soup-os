/* 
 * SOUP OS
 */

namespace OS {
    export function BackgroundSetup() {
        timer.background(OS.Startup);
    };
    export function Startup() {
        scene.setBackgroundColor(0);
        Debug.print("Welcome to SOUP OS!\n");
    };
    export namespace Debug {
        export function print(message: string) {
            IO.Display.print(message);
        };
    };
    export namespace IO {
        export class Display {
            constructor() {
                this.console = textsprite.create("");
                this.consoleText = "";
            };
            print(message: string) {
                this.consoleText += message;
            };
            clear() {
                this.consoleText = "";
            };
            update() {
                this.console.setText(this.consoleText);
            };
            console: any;
            consoleText: string;
        };
        export class Memory {

        };
        export class Network {

        };
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

OS.BackgroundStartup();