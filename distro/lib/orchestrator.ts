namespace Lib.Orchestrator {
    export function shutdown() {
        // Orchestrator shutdown proccess
        effects.dissolve.startScreenEffect();
        control.waitMicros(500);
        power.deepSleep();
    };
    export function sleep() {
        
    };
};