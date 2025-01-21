namespace Distro {
    export const name: string = "Blueberry";
    export function welcome() {
        API.onPanic = () => {
            // Auto generated
            music.play(music.createSong(hex`0078000408020207001c00020a006400f40164000004000000000000000000000000000000000345000000040002242704000800012008000c00021d250c0010000119100014000322272c14001800031e242a18001c000220251c002000012420002400031d24252c003000011908001c000e050046006603320000040a002d0000006400140001320002010002480000000400012908000c0002202a0c001000012010001400021e2014001800012018001c0001201c002000012020002400012024002800012028002c000322272c2c003000031d2429`), music.PlaybackMode.UntilDone)
        };
        game.onPaint(() => {
            Distro.satisfyDrawContents();
        });
        Distro.splash();
    };
    export function splash() {
        OS.Debug.clear();
        class SplashScreen extends XInterface.Window {
            render() {
                super.render();
                const splashScreen = this;
                Distro.Setup.welcome(splashScreen);
            };
        };
        XInterface.display(new SplashScreen(""));
    };
    export function loadConfiguration(path: string) {
        try {
            return JSON.parse((new API.FS.File(path)).read());
        } catch (err) {
            return null;
        };
    };
    export function start() {
        let configuration = loadConfiguration("/var/blueberry.json");
        if (configuration == null) {
            welcome();
        };
    };
    export namespace Setup {
        export const textStyle: XInterface.TextStyle = {
            background: img`.`,
            fgColor: color.rgb(236, 236, 236),
            bgColor: 0,
            hlColor: 9,
            margin: 0,
            width: 50,
            height: 20
        };
        export const  buttonStyle: XInterface.ButtonStyle = {
            background: img`.`,
            fgColor: color.rgb(236, 236, 236),
            bgColor: 0,
            hlColor: 9,
            margin: 0,
            width: 50,
            height: 20
        };
        export const inputStyle: XInterface.InputStyle = {
            background: img`.`,
            fgColor: color.rgb(236, 236, 236),
            bgColor: 0,
            hlColor: 9,
            margin: 0,
            width: 50,
            height: 20
        };
        export function welcome(splashScreen: XInterface.Window) {
            if (!OS.IO.Memory.existsNode("/var")) {
                splashScreen.refresh();
                splashScreen.addButton("Start installation", buttonStyle, () => {
                    splashScreen.refresh();
                    let setupFS = {
                        "var": new API.FS.Folder("/var"),
                        "usr": new API.FS.Folder("/usr"),
                        "home": new API.FS.Folder("/home"),
                    };
                    const setup = new Lib.Interface.Document();
                    const root = setup.createElement("root");
                    root.setStyle("background-color", ColorHues.Blue.toString());
                    root.setStyle("height", screen.height.toString());
                    root.setStyle("width", screen.width.toString());
                    const welcomeButton = setup.createButton();
                    welcomeButton.setTextContent("Hello");
                    welcomeButton.setStyle("background-color", ColorHues.Orange.toString());
                    welcomeButton.setOnClick(() => {
                        music.play(Distro.Sounds.welcome, music.PlaybackMode.InBackground);
                    });
                    root.appendChild(welcomeButton);
                    setup.setRootElement(root);
                    setup.setNavigator(new Lib.Interface.Navigator(setup));
                    setup.setScreen(new Lib.Interface.Screen);
                    setup.render();
                    music.play(Distro.Sounds.welcome, music.PlaybackMode.InBackground);
                });
            };
        }
    };
    export namespace Sounds {
        export const welcome = music.createSong(hex`0078000408020403001c0001dc00690000045e010004000000000000000000000564000104000307002400280002202706001c00010a006400f401640000040000000000000000000000000000000002120008000c00011d18001c00012720002400011d07001c00020a006400f401640000040000000000000000000000000000000003240000000400012708000c00012410001400012718001c0001202000240001242c003000012708001c000e050046006603320000040a002d00000064001400013200020100022c0000000400012a08000c0001271000140002202418001c00011d20002400012a24002800011d2c003000021e24`);
    }
    export function addDrawContents(a: () => void) {
        drawContents.push(a);
    };
    export function clearDrawContents() {
        drawContents = [];
    };
    export function satisfyDrawContents() {
        for (const content of drawContents) {
            content();
        };
    };
    let drawContents: (() => void)[] = [];    
};