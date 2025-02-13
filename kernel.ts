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
        export function debug(message: string, dinger: string = null) {
            OS.IO.Display.print(`[ <purple>${dinger || "DG"}</purple> ]  ` + message + '\n');
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
            OS.Debug.debug(message, "IO");
            control.waitMicros(300);
        };
        export function IODebug(message: string) {
            OS.IO.Display.print("[ <purple>DG</purple> ]  " + message + '\n');
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
                };
                arcadeDB.deleteList(name);
                return true;
            };
            getDB() {
                return settings.list();
            };
            nuke() {
                arcadeDB.deleteAll();
            };
            blockFactory: BlockFactory;
        };
        export class EnvironmentPort {
            constructor() {
                
            };
            getTemperature() {
                return input.temperature(TemperatureUnit.Celsius);
            };
            getAllLight() {
                return input.lightLevel();
            };
            getRottion(type: Rotation) {
                return input.rotation(type);
            };
            getDimension(dimension: Dimension) {
                return input.acceleration(dimension);
            };
            onGesture(gesture: Gesture, callback: () => {}) {
                input.onGesture(gesture, callback);
            };
        };
        export const Display: DisplayPort = new DisplayPort();
        export const Memory: MemoryPort = new MemoryPort();
        export const Environment = new EnvironmentPort();
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
                this.path = path;
            };
            set(property: string, value: string) {
                OS.IO.Memory.createBuffer(`${this.path}:${property}`, value);
            };
            get(property: string) {
                return OS.IO.Memory.readBuffer(`${this.path}:${property}`);
            };
            path: string;
        };
        export class File {
            constructor(path: string) {
                this.path = path;
                this.name = Path.name(this.path);
                this.meta = new Meta(this.path);
                if (!OS.IO.Memory.readNode(this.path)) {
                    OS.IO.Memory.createNode(this.path, this.path);
                    OS.IO.Memory.createBuffer(this.path, "");
                    OS.IO.Memory.createBuffer(this.path + ":meta", "");
                    OS.IO.Memory.createBuffer(this.path + ":type", "file");
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
                if (!OS.IO.Memory.readNode(this.path)) {
                    OS.IO.Memory.createNode(this.path, this.path);
                    OS.IO.Memory.createBuffer(this.path, "");
                    OS.IO.Memory.createBuffer(this.path + ":meta", "");
                    OS.IO.Memory.createBuffer(this.path + ":type", "folder");
                };
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
        };
        export function convertNodesToPaths(nodes: string[]) {
            const paths: string[] = [];
            for (const node of nodes) {
                let path = "/" + node.split("/").slice(1).join('/');
                if (!path || path.includes(':') || paths.join(',').includes(path)) {
                    continue;
                };
                paths.push(path);
            };
            game.splash(paths.join(','));
            return paths;
        };
        export function makeOut() {
            const nodes = OS.IO.Memory.getDB();
            const paths = convertNodesToPaths(nodes);
            for (let path of paths) {
                const nodeData = {
                    type: OS.IO.Memory.readBuffer(path + ":type"),
                    meta: OS.IO.Memory.readBuffer(path + ":meta"),
                    data: OS.IO.Memory.readBuffer(path)
                };
                if (nodeData.type == "folder") {
                    OS.IO.Memory.deleteBuffer(path);
                    if (path[path.length] != "/") {
                        OS.IO.Memory.deleteNode(path);
                        path += "/";
                        OS.IO.Memory.createNode(path, path);
                    };
                    const generated = new OS.List("");
                    for (let folderPath of paths) {
                        if (folderPath.split(path)[0] == "" && folderPath.split(path)[1]) {
                            generated.add(folderPath);
                        };
                    };
                    OS.IO.Memory.createBuffer(path, generated.contents);
                };
            };
        };
        export function init() {
            const rootNode = OS.IO.Memory.readNode("ROOT");
            if (!rootNode) {
                return "setup";
            };
            OS.Debug.success("Filesystem");
            const root = FS.makeRoot(rootNode);
            OS.Debug.IODebug(`Root: ${JSON.stringify(root.list())}`);
            makeOut();
            
            return "ready";
        };
        export function setup() {
            OS.IO.Memory.createNode("ROOT", "/");
            OS.Debug.crashLikeDebug(`Root node: ${OS.IO.Memory.readNode("ROOT")}`)
            FS.makeRoot(OS.IO.Memory.readNode("ROOT"));

            const system_conf_ = new File("/var/system.conf");
            system_conf_.write(JSON.stringify({
                "users": {
                    "root": {
                        "level": 10
                    },
                },
            }));
            system_conf_.meta.set("owner", "root");
            system_conf_.meta.set("level", "10");
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
                    new OS.Filesystem.File(path); // To create the needed data
                    this.path = path;
                    return true;
                };
                return null;
            };
            get metadata() {
                return this.source.meta;
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
            list() {
                return this.source.list();
            };
            move(path: string) {
                if (OS.IO.Memory.createBuffer(path, OS.IO.Memory.readBuffer(this.path))) {
                    new OS.Filesystem.Folder(path); // To create the needed data
                    this.path = path;
                    return true;
                };
                return null;
            };
            get metadata() {
                return this.source.meta;
            };
            get currentPath() {
                return this.path;
            };

            private path: string;
            private source: OS.Filesystem.Folder;
        };
        export class Controller {
            /**
             * Initates a controller that can be used to modify the filesystem as a user
             * @param user The user that is operating the controller
             */
            constructor(user: User) {
                this.user = user;
            };

            /** 
             * Creates a file in the tmp directory
             * @returns {File} The file that was created
             */
            createFile(): File {
                const file = new File(this.makeTmp());
                // Protect files to user permissions
                return file;
            };

            /**
             * Creates a folder in the tmp directory
             * @returns {Folder} The folder that was created
             */
            createFolder(): Folder {
                const folder = new Folder(this.makeTmp());
                // Protect files to user permissions
                return folder;
            };

            /**
             * Gets a file from the filesystem, or returns null
             * @param path
             * @returns {File | null} The file that was gotten
             */
            getFile(path: string): File | null {
                const file = new File(path);
                if (this.owns(file)) {
                    return file;
                } else {
                    return null;
                };
            };

            /**
             * Gets a file from the filesystem, or returns null
             * @param path The path that the file is at
             * @returns {Folder | null} The file that was gotten
             */
            getFolder(path: string): Folder {
                const folder = new Folder(path);
                if (this.owns(folder)) {
                    return folder;
                } else {
                    return null;
                };
            };

            /**
             * Adds a file to a folder
             * @param des Destination
             * @param item The item that should be moved
             * @param name the name of the item in the folder
             * 
             */
            addToFolder(des: Folder, item: File | Folder, name: string): boolean {
                // Protect files to user permissions
                item.move(des.currentPath + name);
                // If it fails return false
                return true;
            };

            /**
             * Lists all of the files in a folder, or returns null
             * @param folder The folder to list
             * @returns 
             */
            list(folder: Folder): (File | Folder)[] | null {
                if (this.owns(folder)) {
                    return folder.list().map((item) => {
                        if (item[item.length] == ('/')) {
                            return new Folder(item);
                        } else {
                            return new File(item);
                        }
                    })
                } else {
                    return null;
                };
            };

            /**
             * Checks if the user in charge of this controller owns a file
             * @param item The file or folder that you want to check.
             * @returns {boolean}
             */
            owns(item: File | Folder): boolean {
                return (item.metadata.get("owner") == this.user.name || (parseInt(item.metadata.get("level")) || 0) < this.user.properties.level);
            };

            /**
             * Creates a random tmp location
             * @returns {string} Temporary location
             */
            makeTmp(): string {
                return `/tmp/${Math.random()}`;
            };

            private user: User;
        };
    };
    export namespace Wireless {
        export const myBand = Math.round(Math.random() * 100);
        export class Connection {
            /**
             * Creates a connection to a device
             * @param id The ID of the device
             * @param timeout An optional timeout
             * @returns { Connection | null } Returns null if connection fails
             */
            constructor(id: string, timeout: number = 4000) {
                const reception = new Packet({
                    "mode": "connect",
                    "band": myBand
                });
                let success = false;
                let band = 0;
                sdwireless.sdw_set_radiogp(0);
                sdwireless.sdw_mbit_send_string(JSON.stringify(reception.getFormed(id)));
                sdwireless.sdw_onmbit_string((raw: string) => {
                    const data = JSON.parse(raw);
                    if (data)
                    if (data.success && data.band) {
                        success = true;
                        band = data.band
                    };
                });
                control.waitMicros(timeout);
                if (!success) {
                    return null;
                };
                this.id = id;
                this.band = band;
            };
            /**
             * Sends a packet to the device
             * @param packet The packet to send
             */
            public sendPacket(packet: Packet) {
                sdwireless.sdw_set_radiogp(this.band);
                sdwireless.sdw_mbit_send_string(JSON.stringify(packet.getFormed(this.id)));
                sdwireless.sdw_set_radiogp(myBand);
            };
            /**
             * Lists the currently available devices
             * @param timeout Optional timeout
             * @returns { "id": string, "name": string }[]
             */
            public static list(timeout: number = 4000): { id: string, name: string, }[] {
                const shout = new Packet({
                    "mode": "discovery"
                });
                let connections: { "id": string, "name": string }[] = [];
                sdwireless.sdw_set_radiogp(0);
                sdwireless.sdw_mbit_send_string(JSON.stringify(shout.getFormed("*")));
                sdwireless.sdw_onmbit_string((raw: string) => {
                    const data = JSON.parse(raw);
                    if (data)
                    if (data.id && data.name) {
                        connections.push({
                            "id": data.id,
                            "name": data.name
                        });
                    };
                });
                control.waitMicros(timeout);
                return connections;
            };
            private id: string;
            private band: number;
        };
        export class Packet {
            /**
             * A packet of data
             * @param data The data you want to send
             */
            constructor(data: object) {
                this.data = data;
            };

            /**
             * Converts the packet into a format that can be read by the device
             * @param id The ID of the device
             * @returns { "data": string, "target": string }
             */
            public getFormed(id: string): { "data": object, "target": string, "sender": number } {
                return {
                    "data": this.data,
                    "target": id,
                    "sender": myBand
                };
            };

            private data: object;
        };
        function addIdListener(id: string, callback: (packet: Packet) => { }) {
            idListeners.push({ callback, id });
        };
        function callListener(id: string, packet: Packet) {
            for (const listener of idListeners) {
                if (listener.id == id) {
                    listener.callback(packet);
                    break;
                };
            };
        };
        function removeListener(id: string) {
            for (const i in idListeners) {
                if (idListeners[i].id == id) {
                    delete idListeners[i];
                };
            };
        };
        function setupListener() {
            sdwireless.sdw_onmbit_string((raw: string) => {
                if (JSON.parse(raw)) {
                    const data = JSON.parse(raw)
                    callListener(JSON.parse(raw).id, new Packet(JSON.parse(raw)));
                };
            });
        };
        let idListeners: ({ callback: (packet: Packet) => {}, id: string })[] = [];
    };
    export class User {
        constructor(name: string) {
            this.name = name;
            this.properties = JSON.parse(new API.FS.File("/var/system.conf").read()).users[name];
            if (this.properties == undefined) {
                return null;
            }
        };

        name: string;
        properties: any;
    };
    export namespace GUI {
        export const Screen = screen;
        export namespace Game {
            export import Scene = scene;
            export import TextSprite = textsprite;
        };
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