namespace Distro {
    export const name: string = "Blueberry";
    export function welcome() {
        API.onPanic = () => {
            // Auto generated
            music.play(music.createSong(hex`0078000408020207001c00020a006400f40164000004000000000000000000000000000000000345000000040002242704000800012008000c00021d250c0010000119100014000322272c14001800031e242a18001c000220251c002000012420002400031d24252c003000011908001c000e050046006603320000040a002d0000006400140001320002010002480000000400012908000c0002202a0c001000012010001400021e2014001800012018001c0001201c002000012020002400012024002800012028002c000322272c2c003000031d2429`), music.PlaybackMode.UntilDone)
        };
        Distro.Setup.welcome();
    };
    export function start() {
        OS.Debug.run(new API.FS.File("/var/system.conf").read());
        root = new API.User("root");
        rootFSController = new API.FS.Controller(root);
        welcome();
    };
    export namespace Sounds {
        export const welcome = music.createSong(hex`0078000408020205001c000f0a006400f4010a0000040000000000000000000000000000000002300000000400012a08000c00012a0c001000012a10001400012914001800012718001c00012520002400012024002800012508001c000e050046006603320000040a002d0000006400140001320002010002300000000400012508000c0001250c001000012210001400012514001800012a18001c00012920002400011d240028000129`);
    };
    export namespace Themes {

    };
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
    let root: API.User;
    export let rootFSController: API.FS.Controller;
    let drawContents: (() => void)[] = [];
    game.onPaint(() => {
        Distro.satisfyDrawContents();
    });
};