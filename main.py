"""

SOUP OS Kernel

"""
@namespace
class OS:
    def BackgroundSetup():
        timer.background(OS.Startup)
    def Startup():
        def jingle():
            music.play_melody("A A G B G D", 180)
        scene.set_background_color(0)
        Debug.print("Welcome to SOUP OS!\n")
        timer.background(jingle)
        Debug.print("Reading Filesystem...\n")
        fsStatus: str = OS.Filesystem.init()
        if fsStatus == 'fail':
            Debug.print("Reading Filesystem failed!\n")
            Debug.print("Please read the manual on how to fix this.\n")
    @namespace
    class Debug:
        def print(message: str):
            OS.IO.Display.print(message)
    @namespace
    class IO:
        class DisplayPort:
            def __init__(self):
                self.console = textsprite.create("", 0, 1)
                self.consoleText = ""
                self.console.setPosition(5, 10)
            # unknown ClassElement 206
            def print(self, message: str):
                self.consoleText += message
                self.update()
            # unknown ClassElement 206
            def clear(self):
                self.consoleText = ""
                self.update()
            # unknown ClassElement 206
            def update(self):
                self.console.setText(self.consoleText)
            # unknown ClassElement 206
        class MemoryPort(Enum):
        class NetworkPort(Enum):
        Display: DisplayPort = DisplayPort()
    @namespace
    class Filesystem:
        class Meta:
            def __init__(self):
                pass
            # unknown ClassElement 206
            def set(self, propery: str, value: str):
                pass
            # unknown ClassElement 206
        class File:
            def __init__(self, name: str):
                pass
            # unknown ClassElement 206
        class Folder:
            def __init__(self, name: str):
                pass
            # unknown ClassElement 206
        def init():
            pass
OS.BackgroundSetup()