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
        function jingle() {
            music.playMelody("A A G B G D", 180);
        };
        function setupFS() {
            OS.IO.Memory.nuke();
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
            };
        };
        scene.setBackgroundColor(0);
        Debug.print("Booting to SOUP OS!\n");
        timer.background(jingle);
        Debug.print("Reading Filesystem...\n");
        setupFS();
    };
    export function repeat(string: any, count: number) {
        let output = string;
        for (let i = 0; i < count; i++) {
            output += string;
        };
        return output;
    };
    export namespace Debug {
        export function print(message: string) {
            OS.IO.Display.print(message);
        };
        export function success(name: string) {
            OS.IO.Display.print("[ <green>OK</green> ]  " + name + '\n');
        };
        export function fail(name: string) {
            OS.IO.Display.print("[ <red>ER</red> ]  " + name + '\n');
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
            return result.replace("\0", "");
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
            update() {
                this.console.setText(this.consoleText);
                let lines = this.consoleText.split('\n').length;
                if (lines > 10) {
                    this.console.setPosition(5, this.console.y + 0.1);
                };
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
                for (let block = 1; block < size; block++) {
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
        export class NetworkPort {

        };
        export class TimePort {
            unix() {
                return 0;
            };
        };
        export const Display: DisplayPort = new DisplayPort();
        export const Memory: MemoryPort = new MemoryPort();
        export const Time: TimePort = new TimePort();
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
                    this.meta.set("creation_date", OS.IO.Time.unix().toString());
                };
            };
            write(contents: string) {
                OS.IO.Memory.createBuffer(this.path, contents);
                this.meta.set("modification_date", OS.IO.Time.unix().toString());
                return true;
            };
            read(contents: string) {
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
                this.contents = new List(OS.IO.Memory.readBuffer(this.path) || "");
                OS.Debug.print(this.contents.contents + '\n');
                OS.IO.Memory.createBuffer(this.path,  (this.contents).contents);
                OS.IO.Memory.createBuffer(this.path + ":meta", OS.IO.Memory.readBuffer(this.path + ":meta") || "");
            };
            addFile(file: File) {
                OS.IO.Memory.createBuffer(this.path + file.name, this.contents.add(file.name + ":file").contents);
            };
            addFolder(folder: Folder) {
                OS.IO.Memory.createBuffer(this.path + folder.name, this.contents.add(folder.name + ":folder").contents);
            };
            list() {
                let contents: string[] = this.contents.extract();
                Debug.print(OS.IO.Memory.readBuffer(this.path) + '\n');
                for (let i = 0; i < contents.length; i++) {
                    let type = contents[i].split(':')[1];
                    let path = contents[i].split(':')[0];
                    if (type == "file") {
                        let file: File = new File(path);
                        contents.push(file.name);
                    };
                    if (type == "folder") {
                        let folder: Folder = new Folder(path);
                        contents.push(`${folder.name}/`);
                    };
                    if (contents[i] == "null") {
                        continue; // Nothing bad, just an empty folder.
                    };
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
                OS.Debug.print(OS.IO.Memory.readBuffer('/') + '\n');

                return root;
            };
            export function load(folder: Folder) {
                for (let item of folder.list()) {
                    recognize(item);
                    if (item[item.length - 1] == '/') {
                        load(new Folder(item));
                    };
                };
            };
            export function recognize(item: string) {
                OS.Debug.success(item);
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
            const usr = new Folder("usr");
            const usr_apps = new Folder("apps");
            const home = new Folder("home");
            const sys = new Folder("sys");
            const sys_conf = new File("system.conf");
            usr.addFolder(usr_apps);
            sys.addFile(sys_conf);
            root.addFolder(usr);
            root.addFolder(home);
            root.addFolder(sys);
            root.addFile(new File("hello.txt"));
            OS.Debug.print(root.list().join('\n'));
        };
    };
};

OS.BackgroundSetup();