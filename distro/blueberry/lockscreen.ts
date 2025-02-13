namespace Distro.LockScreen {
    export function display() {
        const lockscreen = new Lib.Interface.Document();
        const root = lockscreen.createDiv();

        function unlock() {
            const username = lockscreen.prompt("Enter your username", Lib.Interface.PromptType.STRING);
            const testPin = Lib.Encryption.hash(lockscreen.prompt("Enter your pin", Lib.Interface.PromptType.NUMBER, 4));
            const realPin = rootFSController.getFile(`/var/usr/${username}/pin`).read();
            if (testPin == realPin) {
                Distro.HomeScreen.display();
            } else {
                lockscreen.alert("Verification failed");
                failedAttempts++;
                if (failedAttempts > 5) {
                    const reset = lockscreen.prompt("Would you like to reset the system?", Lib.Interface.PromptType.YESNO);
                    if (reset == "true") {
                        OS.IO.Memory.nuke();
                        Lib.Orchestrator.shutdown();
                    };
                    
                };
                setTimeout(() => {
                    unlock();
                }, Math.pow(2, failedAttempts) * 1000);                
            };
        };

        root.setStyle("height", screen.height.toString());
        root.setStyle("width", screen.width.toString());
        unlock();
    };
    export let failedAttempts = 0;
};