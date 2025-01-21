namespace Distro.Net {
    export enum CommandType {
        HELLO = 0x1,
        RESOLVE = 0x2,
        GET = 0x3,
        SEND = 0x4
    };
    export const offset = 0x5;
    export class Command {
        constructor(type: Distro.Net.CommandType, data: string) {
            this.type = type;
            this.data = data;
        };
        public type: Distro.Net.CommandType;
        public data: string;
    };
    export class Supplier {
        constructor(handler: (command: Command) => string) {
            this.handler = handler;
        };
        public command(command: Distro.Net.Command) {
            return this.handler(command);
        };
        private handler: (command: Command) => string;
    };
    export class Net {
        constructor(supplier: Distro.Net.Supplier) {
            this.supplier = supplier;
        };
        public command(command: Distro.Net.Command) {
            return this.supplier.command(command);
        };
        private supplier: Distro.Net.Supplier;
    };
    export let net: Distro.Net.Net = null;
};