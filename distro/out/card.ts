namespace Distro.CardFS {
    type EvtStr = (data: string) => void;
    type EvtBuff = (data: Buffer) => void;
    type EvtNum = (data: number) => void;
    type EvtValue = (name: string, value: number) => void;

    let spi: SPI;
    let cs = pins.P19;
    let irq = pins.P20;

    function spiTransfer(tx: Buffer): Buffer {
        let rx = pins.createBuffer(tx.length);
        cs.digitalWrite(false);
        spi.transfer(tx, rx);
        cs.digitalWrite(true);
        return rx;
    };

    export function initialize(): void {
        spi = pins.createSPI(pins.P15, pins.P14, pins.P13);
        spi.setMode(0);
        spi.setFrequency(1000000);
        cs.digitalWrite(true);
    };

    export function formatSD(): boolean {
        const cmd = pins.createBuffer(6);
        cmd[0] = 0x40 | 0; // CMD0
        cmd[1] = 0x00;
        cmd[2] = 0x00;
        cmd[3] = 0x00;
        cmd[4] = 0x00;
        cmd[5] = 0x95; // CRC for CMD0

        const response = spiTransfer(cmd);
        return response[0] === 0x01; // Expecting idle state response
    };

    export function writeBlock(address: number, data: string): boolean {
        const blockSize = 512;
        if (data.length > blockSize) {
            return false; // Data too large for a single block
        };

        const cmd = pins.createBuffer(6);
        cmd[0] = 0x40 | 24; // CMD24 (WRITE_BLOCK)
        cmd[1] = (address >> 24) & 0xFF;
        cmd[2] = (address >> 16) & 0xFF;
        cmd[3] = (address >> 8) & 0xFF;
        cmd[4] = address & 0xFF;
        cmd[5] = 0xFF; // Dummy CRC

        const response = spiTransfer(cmd);
        if ((response[0] & 0x1F) !== 0x00) {
            return false; // Error in response
        }

        const dataBuffer = pins.createBuffer(blockSize + 2);
        dataBuffer[0] = 0xFE; // Start block token
        for (let i = 0; i < data.length; i++) {
            dataBuffer[i + 1] = data.charCodeAt(i) || 0;
        }
        dataBuffer[blockSize + 1] = 0xFF; // Dummy CRC

        spiTransfer(dataBuffer);

        const status = spiTransfer(pins.createBuffer(1));
        return (status[0] & 0x1F) === 0x05; // Data accepted
    };

    export function readBlock(address: number): string {
        const blockSize = 512;
        const cmd = pins.createBuffer(6);
        cmd[0] = 0x40 | 17; // CMD17 (READ_BLOCK)
        cmd[1] = (address >> 24) & 0xFF;
        cmd[2] = (address >> 16) & 0xFF;
        cmd[3] = (address >> 8) & 0xFF;
        cmd[4] = address & 0xFF;
        cmd[5] = 0xFF; // Dummy CRC
        spiTransfer(cmd);
        while (true) {
            const token = spiTransfer(pins.createBuffer(1));
            OS.Debug.IODebug(token.toHex());
            if (token[0] === 0xFE) break; // Start block token
        };
        const dataBuffer = spiTransfer(pins.createBuffer(blockSize));
        return dataBuffer.toString();
    };

    export function clearBlock(address: number): boolean {
        const emptyData = "\0"; //.repeat(512);
        return writeBlock(address, emptyData);
    };
};
