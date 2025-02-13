namespace Distro.CardFS {
    const _CMD_TIMEOUT = 100;

    const _R1_IDLE_STATE = 1 << 0;
    const _R1_ILLEGAL_COMMAND = 1 << 2;
    const _TOKEN_DATA = 0xFE;
    const _TOKEN_STOP_TRAN = 0xFD;
    const _TOKEN_CMD25 = 0xFC;
    
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
        
        let startByteReceived = false;
        while (!startByteReceived) {
            let dummyBuffer = pins.createBuffer(1);
            spi.transfer(dummyBuffer, dummyBuffer);
            if (dummyBuffer[0] === 0xFF) {
                startByteReceived = true;
            };
        };
        spi.transfer(tx, rx);
    
        let checksumBuffer = pins.createBuffer(1);
        checksumBuffer[0] = 0xFF;
        spi.transfer(checksumBuffer, checksumBuffer);
        spi.transfer(checksumBuffer, checksumBuffer);
    
        cs.digitalWrite(true);
        
        return rx;
    };

    function sendCommand(cmd: number, arg: number, crc: number): number {
        const command = pins.createBuffer(6);
        command[0] = 0x40 | cmd;
        command[1] = (arg >> 24) & 0xFF;
        command[2] = (arg >> 16) & 0xFF;
        command[3] = (arg >> 8) & 0xFF;
        command[4] = arg & 0xFF;
        command[5] = crc;
    
        spiTransfer(command);
        for (let i = 0; i < 16; i++) {
            const response = spiTransfer(pins.createBuffer(1));
            OS.Debug.IODebug(`CMD Res: ${response.toHex()}`);
            if (response[0] !== 0xFF) return response[0];
        }
        return 0xFF; // Timeout
    };    

    export function initialize(): boolean {
        let ready = false;
        spi = pins.createSPI(pins.P15, pins.P14, pins.P13); // SPI_MOSI, SPI_MISO, SPI_SCK
        spi.setMode(1);
        spi.setFrequency(1000000);
        cs.digitalWrite(true);

        irq.onEvent(PinEvent.PulseHigh, function () {
            OS.Debug.IODebug("SD Pulse");
            ready = true;
        });
        
        const b = pins.createBuffer(1);
        b.fill(0xFF);
        for (let i = 0; i < 10; i++) spiTransfer(b);

        for (let i = 0; i < 10; i++) {
            if (ready) {
                break;
            };
            control.waitMicros(1000);
        };

        let response = sendCommand(0, 0, 0x95); // CMD0 should return 0x01 for idle
        if (response !== _R1_IDLE_STATE) {
            OS.Debug.fail(`CMD0: ${response}`);
            return false; // Card not in idle state
        };
    
        // CMD8: Check card version
        response = sendCommand(8, 0x1AA, 0x87);
        if (response !== _R1_IDLE_STATE) {
            OS.Debug.fail('CMD8, older card');
        };
    
        // ACMD41: Wait for card to exit idle state
        let retryCount = 0;
        do {
            sendCommand(55, 0, 0xFF); // CMD55 (prefix for ACMD)
            response = sendCommand(41, 0x40000000, 0xFF); // ACMD41
            retryCount++;
            if (retryCount > 16) {
                OS.Debug.fail('SD Timeout');
                return false;
            }
        } while (response !== 0x00);
    
        // Increase SPI frequency after initialization
        spi.setFrequency(1320000);
        OS.Debug.success('SD Card');
        return true;
    };    

    export function writeBlock(address: number, data: string): boolean {
        const blockSize = 512;
        if (data.length > blockSize) return false;
    
        // Send write command (CMD24)
        const cmd = sendCommand(24, address, 0xFF); // CMD24 (WRITE_BLOCK)
        if (cmd !== 0x00) {
            OS.Debug.fail(`WERR: ${cmd.toString()}`);
            return false;
        };
    
        const dataBuffer = pins.createBuffer(blockSize + 2);
        dataBuffer[0] = 0xFE; // Start block token
        for (let i = 0; i < data.length; i++) {
            dataBuffer[i + 1] = data.charCodeAt(i);
        };
        dataBuffer[blockSize + 1] = 0xFF; // Dummy CRC
    
        spiTransfer(dataBuffer); // Send data block
    
        const status = spiTransfer(pins.createBuffer(1));
        OS.Debug.IODebug(`WSTS: ${status[0].toString()}`); // Log the status
        return (status[0] & 0x1F) === 0x05; // Data accepted (0x05)
    };    
    // Read a block of data from the SD card at the specified address
    export function readBlock(address: number): string {
        const blockSize = 512;
        const cmd = sendCommand(17, address, 0xFF); // CMD17 (READ_BLOCK)
        if (cmd !== 0x00) {
            OS.Debug.fail(`RCMD: ${cmd}`);
            return "";
        };
    
        // Wait for the start block token (0xFE)
        while (true) {
            const token = spiTransfer(pins.createBuffer(1));
            OS.Debug.IODebug(`Token: ${token[0].toString()}`); // Add logging for token
            if (token[0] === _TOKEN_DATA) break;
            OS.Debug.IODebug('Waiting for start token...');
        };        
    
        // Read the data
        const dataBuffer = spiTransfer(pins.createBuffer(blockSize));
        return dataBuffer.toString();
    };    

    // Clear a block on the SD card by writing null data
    export function clearBlock(address: number): boolean {
        const emptyData = "\0";
        return writeBlock(address, emptyData);
    };
};