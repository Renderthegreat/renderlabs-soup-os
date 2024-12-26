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
            };
            static Meta = class Meta {
                function add(label: string, value: string) {
                    
                };
            };
            type: typeof Node.NodeType[keyof typeof Node.NodeType];
        };
    };
};