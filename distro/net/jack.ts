namespace Distro.Net {
    export function getJack() {
        const supplier = new Distro.Net.Supplier(jackHandler);
        return new Distro.Net.Net(supplier);
    };
    function jackHandler(command: Distro.Net.Command) {
        jackSendData(command.data, command.type);
        return jackGetData();
    };
    function jackSendData(data: string, type: Distro.Net.CommandType) {
        jackSendByte(0x0);
        jackSendByte(type);
        for (let i = 0; i < data.length; i++) {
            jackSendByte(data.charCodeAt(i));
        };
        jackSendByte(0x0);
    };
    function jackGetData() {
        let type;
        let data: string[] = [];
        let i = 0;
        
        while (true) {
            type = jackGetByte();
            OS.Debug.run(`Type: ${type}`);
            if (type < Distro.Net.offset) {
                break;
            };
        };
        while (true) {
            let byte = jackGetByte();
            if (byte == 0x0) break;
            data[i++] = (String.fromCharCode(byte - 0x3));
            OS.Debug.run(`Byte: ${byte}`);
        };
        return data.join('');
    };
    function jackGetByte() {
        let byte = 0;
        for (let i = 0; i < 8; i++) {
            while (JACKIn.digitalRead() == false) { };
            while (JACKIn.digitalRead() == true) { };

            let bit = JACKIn.digitalRead() ? 1 : 0;
            byte = (byte << 1) | bit;
        };
        return byte;
    };
    function jackSendByte(byte: number) {
        OS.Debug.debug(`S: ${byte}`);
        for (let i = 0; i < 8; i++) {
            let bit = ((byte + Distro.Net.offset) >> (7 - i)) & 1;
            if (bit == 1) {
                JACKOu.digitalWrite(true);
                control.waitMicros(2);
                JACKOu.digitalWrite(false);
                control.waitMicros(2);
            } else {
                JACKOu.digitalWrite(false);
                control.waitMicros(2);
                JACKOu.digitalWrite(true);
                control.waitMicros(2);
            };
        };
    };
    const JACKIn = pins.pinByCfg(DAL.CFG_PIN_JACK_TX);
    const JACKOu = pins.pinByCfg(DAL.CFG_PIN_JACK_TX);
};