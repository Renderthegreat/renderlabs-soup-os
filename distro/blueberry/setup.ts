namespace Distro.Setup {
    export function welcome() {
        if (!OS.IO.Memory.readNode("setup")) {
            const setup = new Lib.Interface.Document();
            const root = setup.createElement("root");
            root.setStyle("height", screen.height.toString());
            root.setStyle("width", screen.width.toString());
            function showConnectionScreen() {
                // ...
            };
            function showUserCreationScreen() {
                const username = setup.prompt("What should your username be?", Lib.Interface.PromptType.STRING);
                game.waitAnyButton();
                const password = setup.prompt("What should your password be?", Lib.Interface.PromptType.STRING);
                game.waitAnyButton();
                const pin = setup.prompt("What should your pin be?", Lib.Interface.PromptType.NUMBER, 4);

                const hashedPassword = Lib.Encryption.hash(password);
                const hashedPin = Lib.Encryption.hash(pin);
                const userManFolder = rootFSController.createFolder();
                const passwordFile = rootFSController.createFile();
                const pinFile = rootFSController.createFile();
                const conf = rootFSController.getFile('/var/system.conf');
                let newConf = JSON.stringify(JSON.parse(conf.read()).users[username] = {
                    "level": 5
                });
                rootFSController.addToFolder(new API.FS.Folder(`/`), rootFSController.createFolder(), "var");
                rootFSController.addToFolder(new API.FS.Folder(`/var`), rootFSController.createFolder(), "usr");
                rootFSController.addToFolder(new API.FS.Folder(`/var/usr`), userManFolder, username);
                passwordFile.write(hashedPassword);
                passwordFile.move(`/var/usr/${username}/password`);
                pinFile.write(hashedPin);
                pinFile.move(`/var/usr/${username}/pin`);
                conf.write(newConf);
                setup.alert("User was created successfully!");
            };
            showConnectionScreen();
            showUserCreationScreen();
            OS.IO.Memory.createNode("setup", "true");
            Lib.Orchestrator.shutdown();
        };
        Distro.LockScreen.display();
    };
};