namespace Distro {
    export const name: string = "Blueberry";
    export function welcome() {
        Distro.splash();
    };
    export function splash() {
        OS.Debug.clear();
        const bgc = color.rgb(241, 241, 241);
        const fgc = color.rgb(255, 255, 255) - bgc;
        class SplashScreen extends Interface.Window {
            render() {
                super.render();
                const textStyle: Interface.TextStyle = {
                    background: img`.`,
                    fgColor: 1,
                    bgColor: 15,
                    hlColor: 4,
                    margin: 0,
                    width: 50,
                    height: 20
                };
                const buttonStyle: Interface.ButtonStyle = {
                    background: img`.`,
                    fgColor: 1,
                    bgColor: 15,
                    hlColor: 4,
                    margin: 0,
                    width: 50,
                    height: 20
                };
                const inputStyle: Interface.InputStyle = {
                    background: img`.`,
                    fgColor: 1,
                    bgColor: 15,
                    hlColor: 4,
                    margin: 0,
                    width: 50,
                    height: 20
                };
                const splashScreen = this;
        
                splashScreen.addButton("Start", buttonStyle, () => {
                    if (!OS.IO.Memory.existsNode("/var")) {
                        splashScreen.refresh();
                        splashScreen.addButton("Start installation", buttonStyle, () => {
                            splashScreen.refresh();
                            let setupFS = {
                                "var": new API.FS.Folder("/var"),
                                "usr": new API.FS.Folder("/usr"),
                                "home": new API.FS.Folder("/home"),
                            };
                            function showWifiSetup() {
                                net.logPriority = ConsolePriority.Log;
                                splashScreen.addButton("Connect to a WiFi network", buttonStyle, () => {
                                    splashScreen.refresh();
                                    let networkDetails = {
                                        "SSID": "",
                                        "password": ""
                                    };
                                    const networkController = new net.Net(newsp32.defaultController).controller;
                                    OS.Debug.crashLikeDebug("NET 1");
                                    function showConnectionSetup() {
                                        splashScreen.refresh();
                                        let failed = false;
                                        
                                        net.updateAccessPoint(networkDetails.SSID, networkDetails.password);
                                        networkController.connect();
                                        while (!networkController.isConnected) {
                                            music.playMelody("C5 E5 G5 B5", 120);
                                            if (failed) {
                                                splashScreen.refresh();
                                                splashScreen.addText("Connection failed", textStyle);
                                                splashScreen.addButton("Retry", buttonStyle, showWifiSetup);
                                                return;
                                            };
                                        };
                                    };
                                    const networks = (networkController).scanNetworks();
                                    splashScreen.addText("Choose a network", textStyle);
                                    for (let network of networks) {
                                        splashScreen.addButton(network.ssid, buttonStyle, () => {
                                            splashScreen.refresh();
                                            networkDetails.SSID = network.ssid;
                                            splashScreen.addInput("Password: ", inputStyle, (password, textSprite: TextSprite) => {
                                                networkDetails.password = password
                                                textSprite.setText(`Password: ${networkDetails.password}`);
                                            });
                                            splashScreen.addButton("Next", buttonStyle, () => {
                                                showConnectionSetup();
                                            });
                                            splashScreen.addButton("Back", buttonStyle, () => {
                                                showWifiSetup();
                                                return;
                                            });
                                        });
                                    };
                                    splashScreen.addInput("SSID: ", inputStyle, (SSID, textSprite) => {
                                        networkDetails.SSID = SSID;
                                        textSprite.setText(`SSID: ${networkDetails.SSID}`);
                                    });
                                    splashScreen.addInput("Password: ", inputStyle, (password, textSprite) => {
                                        networkDetails.password = password;
                                        textSprite.setText(`Password: ${networkDetails.password}`);
                                    });
                                    splashScreen.addButton("Connect", buttonStyle, () => {
                                        showConnectionSetup();
                                    });
                                });
                            };
                            showWifiSetup();
                        });
                        splashScreen.addButton("Repair installation", buttonStyle, () => {
                            let repairFS = {
                                "var": new API.FS.Folder("/var"),
                                "usr": new API.FS.Folder("/usr"),
                                "home": new API.FS.Folder("/home"),
                            };
                        });
                    } else {
                        //Interface.remove(splashScreen);
                    };
                });
            };
        };
        Interface.display(new SplashScreen(""));
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
};