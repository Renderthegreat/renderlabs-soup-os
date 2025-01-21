/* 
 * SOUP OS Kernel
 */

// Config
let BLOCK_SIZE = 4;

namespace OS {
    export function BackgroundSetup() {
        timer.background(OS.Startup);
    };
    export function Startup() {
        function setupFS() {
            // OS.IO.Memory.nuke();
            let fsStatus: string = OS.Filesystem.init();
            if (fsStatus == 'fail') {
                Debug.print("Reading Filesystem failed!\n");
                Debug.print("Please read the manual on how to fix this.\n");
            };
            if (fsStatus == 'setup') {
                Debug.clear();
                Debug.print("Welcome to setup!\n");
                OS.Filesystem.setup();
                fsStatus = OS.Filesystem.init();
                return true;
            };
            return false;
        };
        Debug.print("Booting into SOUP OS!\n");
        Debug.print("Reading Filesystem...\n");
        setupFS();
        Distro.start();
    };
    export function UUID() {
        const r = (Math.random() * 16) | 0;
        return r;
    };
    export function repeat(string: any, count: number) {
        let output = string;
        for (let i = 0; i < count; i++) {
            output += string;
        };
        return output;
    };
    /*export function rexec(regex: RegExp, str: string): RegExpExecArray {
        const matches: string[] = [];
        let lastIndex = 0;
    
        while (lastIndex < str.length) {
            const substring = str.slice(lastIndex);
            if (regex.test(substring)) {
                const match = substring.match(regex)[0] || "";
                matches.push(match);
                lastIndex += substring.indexOf(match) + match.length;
            } else {
                break;
            };
        };
        return matches as RegExpExecArray;
    };*/
    export namespace Debug {
        export function print(message: string) {
            OS.IO.Display.print(message);
        };
        export function debug(message: string) {
            OS.IO.Display.print("[ <purple>DG</purple> ]  " + message + '\n');
        };
        export function success(message: string) {
            OS.IO.Display.print("[ <green>OK</green> ]  " + message + '\n');
        };
        export function warn(message: string) {
            OS.IO.Display.print("[ <orange>WN</orange> ]  " + message + '\n');
        };
        export function fail(message: string) {
            OS.IO.Display.print("[ <red>ER</red> ]  " + message + '\n');
        };
        export function crashLikeDebug(message: string) {
            OS.Debug.debug(message);
            pause(300);
        };
        export function IODebug(message: string) {
            OS.IO.Display.print("[ <purple>DG</purple> ]  " + message + '\n');
            pause(30);
        };
        export function log(message: string) {
            OS.IO.Display.print(message + '\n');
        };
        export function panic(message: string) {
            OS.IO.Display.print("Kernel Panic :(" + '\n' + "Error:" + '\n' + message + '\n');
            OS.IO.Display.show();
            API.onPanic();
            pause(8000);
            game.reset();
        };
        export function run(name: string) {
            OS.IO.Display.print("[ <orange>TR</orange> ]  " + name + '\n');
        };
        export function clear() {
            OS.IO.Display.clear();
        };
    };
    export class List {
        constructor(contents: string) {
            this.contents = contents;
        };
        add(contents: string) {
            this.contents += '\0' + contents;
            return this;
        };
        extract() {
            return this.contents.split('\0');
        };

        contents: string;
    }
    export class BlockFactory {
        compress(content: string) {
            let result = 0;
            for (let i = 0; i < BLOCK_SIZE; i++) {
                const charCode = content.charCodeAt(i) || 0;
                result = (result << 8) | charCode;
            };
            return result;
        };
        uncompress(content: number) {
            let result = "";
            for (let i = 0; i < BLOCK_SIZE; i++) {
                const charCode = content & 0xFF;
                result = String.fromCharCode(charCode) + result;
                content = content >> 8;
            };
            result = (result.replace('\0', '')) + (result[BLOCK_SIZE - 1] == '\0' ? '\0': '');
            return result;
        };
    };
    export namespace IO {
        export class DisplayPort {
            constructor() {
                this.console = fancyText.create("", 0, 1);
                this.consoleText = "";
                this.console.setPosition(5, 10);
            };
            print(message: string) {
                this.consoleText += message;
                this.update();
            };
            clear() {
                this.consoleText = "";
                this.update();
            };
            hide() {
                this.console.setPosition(1000, 0);
            };
            show() {
                this.console.setPosition(5, 10);
            };
            update() {
                let lines = this.consoleText.split('\n');
                if (lines.length > 14) {
                    lines.shift();
                };
                this.consoleText = lines.join('\n');
                this.console.setText(this.consoleText);
            };            
            console: fancyText.TextSprite;
            consoleText: string;
        };
        export class MemoryPort {
            constructor() {
                this.blockFactory = new BlockFactory();
            };
            createNode(name: string, point: string) {
                arcadeDB.setTextValue(name, point);
                return true;
            };
            readNode(name: string) {
                if (!arcadeDB.existsKey(name)) {
                    return null;
                };
                return arcadeDB.getTextValue(name);
            };
            existsNode(name: string) {
                if (!arcadeDB.existsKey(name)) {
                    return false;
                };
                return true;
            };
            deleteNode(name: string) {
                if (!arcadeDB.existsKey(name)) {
                    return null;
                };
                arcadeDB.removeKey(name);
                return true;
            };
            createBuffer(name: string, contents: string) {
                for (let block = 0; block < Math.ceil(contents.length / BLOCK_SIZE); block++) {
                    const blockStart = block * BLOCK_SIZE;
                    let filledBlock = "";
                    for (let i = 0; i < BLOCK_SIZE; i++) {
                        if (blockStart + i < contents.length) {
                            filledBlock += contents[blockStart + i];
                        } else {
                            filledBlock += '\0';
                        };
                    };
                    arcadeDB.listAddValue(name, this.blockFactory.compress(filledBlock));
                };
                return true;
            };
            readBuffer(name: string) {
                let size = arcadeDB.listCount(name);
                if (size == 0) {
                    return null;
                };
                let contents = "";
                for (let block = 1; block < size + 1; block++) {
                    let blockContent = this.blockFactory.uncompress(arcadeDB.listGetValueAt(name, block - 1));
                    contents += blockContent;
                };
                return contents;
            };
            deleteBuffer(name: string) {
                if (arcadeDB.listCount(name) == 0) {
                    return null;
                }
                arcadeDB.deleteList(name);
                return true;
            };
            nuke() {
                arcadeDB.deleteAll();
            };
            blockFactory: BlockFactory;
        };
        export class MicrophonePort {
            constructor() { };
            listen() {
                let contents = "";
                function backgroundListener() {
                    
                };
            };
        };
        export const Display: DisplayPort = new DisplayPort();
        export const Memory: MemoryPort = new MemoryPort();
    };
    export namespace Filesystem {
        export namespace Path {
            export function name(path: string) {
                const parts = path.split("/[/\\]/"); // FIX REGEX
                return parts[parts.length - 1];
            };
        };
        export class Meta {
            constructor(path: string) {

            };
            set(propery: string, value: string) {

            };
        };
        export class File {
            constructor(path: string) {
                this.path = path;
                this.name = Path.name(this.path);
                this.meta = new Meta(this.path);
                if (!OS.IO.Memory.readNode(this.path)) {
                    OS.IO.Memory.createNode(this.path, this.path);
                    OS.IO.Memory.createBuffer(this.path, "")
                };
            };
            write(contents: string) {
                OS.IO.Memory.createBuffer(this.path, contents);
                return true;
            };
            read() {
                return OS.IO.Memory.readBuffer(this.path);
            };

            path: string;
            name: string;
            meta: Meta;
        };
        export class Folder {
            constructor(path: string) {
                this.path = path;
                this.name = Path.name(this.path);
                this.meta = new Meta(this.path);
                this.contents = new List("");
                this.contents.contents = OS.IO.Memory.readBuffer(this.path) || "";
                if (this.contents.contents == "") {
                    OS.IO.Memory.createBuffer(this.path, "");
                    OS.IO.Memory.createBuffer(this.path + ":meta", "");
                }
            };
            addFile(file: File) {
                this.contents.add(file.name + ":file");
                OS.IO.Memory.createBuffer(this.path, this.contents.contents);
            };
            addFolder(folder: Folder) {
                this.contents.add(folder.name + ":folder");
                OS.IO.Memory.createBuffer(this.path, this.contents.contents);
            };
            list() {
                let contents: string[] = this.contents.extract();
                for (let i = 0; i < contents.length; i++) {
                    let type = contents[i].split(':')[1];
                    let path = contents[i].split(':')[0];
                    if (!(type + path)) {
                        continue;
                    };
                    if (type == "file") {
                        let file: File = new File(path);
                        contents.push(`/${file.path}`);
                    };
                    if (type == "folder") {
                        let folder: Folder = new Folder(path);
                        contents.push(`/${folder.path}/`);
                    };
                    contents.splice(-1, 1);
                };
                return contents;
            };

            path: string;
            name: string;
            contents: List;
            meta: Meta;
        };
        export namespace FS {
            export function makeRoot(folder: string) {
                const root = new Folder(folder);

                return root;
            };
            export function load(folder: Folder) {
                for (let item of folder.list()) {
                    recognize(item);
                    if (item[item.length - 1] == '/')
                    load(new Folder(item));
                };
            };
            export function recognize(item: string) {
                OS.Debug.print(item + '\n');
            };
        };
        export function init() {
            const rootNode = OS.IO.Memory.readNode("ROOT");
            if (!rootNode) {
                return "setup";
            };
            OS.Debug.success("Filesystem");
            const root = FS.makeRoot(rootNode);
            FS.load(root);
            
            return "ready";
        };
        export function setup() {
            OS.IO.Memory.createNode("ROOT", "/");
            const root = FS.makeRoot(OS.IO.Memory.readNode("ROOT"));
        };
    };
};

OS.BackgroundSetup();

namespace API {
    export namespace FS {
        export class File {
            constructor(path: string) {
                this.path = path;
                this.source = new OS.Filesystem.File(this.path);
            };
            read() {
                return this.source.read();
            };
            write(content: string) {
                return this.source.write(content);
            };
            move(path: string) {
                if (OS.IO.Memory.createBuffer(path, OS.IO.Memory.readBuffer(this.path))) {
                    this.path = path;
                    return true;
                }
                return null;
            };
            get currentPath() {
                return this.path;
            };
            unlink() {
                OS.IO.Memory.deleteNode(this.path);
            };

            private path: string;
            private source: OS.Filesystem.File;
        };
        export class Folder {
            constructor(path: string) {
                this.source = new OS.Filesystem.Folder(this.path);
            };
            get currentPath() {
                return this.path;
            };
            list() {
                return this.source.list();
            };
            move(path: string) {
                if (OS.IO.Memory.createBuffer(path, OS.IO.Memory.readBuffer(this.path))) {
                    this.path = path;
                    return true;
                }
                return null;
            };

            private path: string;
            private source: OS.Filesystem.Folder;
        };
    };
    export namespace GUI {
        export const Screen = screen;
        export namespace Game {
            export import Scene = scene;
            export import TextSprite = textsprite;
        };
    };
    export namespace External {
        export const vibrate = controller.vibrate;
        export const StatusLED = "";
    };
    export namespace Input {
        export namespace Buttons {
            export const A = controller.A;
            export const B = controller.B;
            export const Up = controller.up;
            export const Down = controller.down;
            export const Left = controller.left;
            export const Right = controller.right;
            export const Menu = controller.menu;
        };
    };

    export let onPanic = () => {

    };
};