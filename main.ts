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
    };
    export namespace Filesystem {
        export class Node {
            static NodeType = {
                File: 'FILE',
                Folder: 'FOLDER',
            } as const;
            static Meta = class Meta {
                constructor() {

                };
                set(propery: string, value: string) {

                };
            };
            type: typeof keyof Node.NodeType;
        };
    };
};