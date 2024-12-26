/* 
 * SOUP OS Kernel
 */

namespace OS {
    export function BackgroundSetup() {
        timer.background(OS.Startup);
    };
    export function Startup() {
        function jingle() {
            music.playMelody("A A G B G D", 180);
        };
        scene.setBackgroundColor(0);
        Debug.print("Welcome to SOUP OS!\n");
        timer.background(jingle);
        Debug.print("Reading Filesystem...\n");
        let fsStatus: string = OS.Filesystem.init();
        if (fsStatus == 'fail') {
            Debug.print("Reading Filesystem failed!\n");
            Debug.print("Please read the manual on how to fix this.\n");
        };
    };
    export namespace Debug {
        export function print(message: string) {
            OS.IO.Display.print(message);
        };
    };
    export namespace IO {
        export class DisplayPort {
            constructor() {
                this.console = textsprite.create("", 0, 1);
                this.consoleText = "";
                this.console.setPosition(5,10);
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
        export function init() {
            return "success";
        };
    };
};

OS.BackgroundSetup();