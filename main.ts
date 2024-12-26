/* 
 * SOUP OS
 */

namespace OS {
    export function BackgroundSetup() {
        timer.background(OS.Startup);
    };
    export function Startup() {
        scene.setBackgroundColor(0);
    };
    export namespace IO {
        export class Display {
            
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