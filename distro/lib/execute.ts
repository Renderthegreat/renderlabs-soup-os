namespace Lib.Executor {
    export type APIs = {
        Screen: typeof API.GUI.Screen,
        Input: typeof API.Input,
        FS: typeof API.FS
    };
    export class Context {
        constructor(apis: APIs) {
            
        };
    };
};