import { BaseKernel } from '@jupyterlite/kernel';
/**
 * A kernel that echos content back.
 */
export class EchoKernel extends BaseKernel {
    constructor() {
        super(...arguments);
        this.blocker = null;
        this.blockerResolve = null;
        this.first_run = true;
    }
    setBlocked(blocked) {
        if (blocked && !this.blocker) {
            this.blocker = new Promise((resolve) => {
                this.blockerResolve = resolve;
            });
        }
        else if (!blocked && this.blockerResolve) {
            this.blockerResolve();
            this.blocker = null;
            this.blockerResolve = null;
        }
    }
    async interrupt() {
        if (this.writer) {
            const ctrl_c = new Uint8Array([3]);
            const encoder = new TextEncoder();
            const new_line = encoder.encode('\r\n');
            await this.writer.write(ctrl_c);
            await this.writer.write(new_line);
        }
    }
    streamOutput(output) {
        this.stream({
            text: output,
            name: 'stdout',
        });
    }
    // /*
    //  * https://github.com/WICG/serial/issues/122
    //  */
    async readWithTimeout(timeoutMs = 500) {
        if (!this.reader) {
            return null;
        }
        const result = await this.reader.read();
        return result.value;
    }
    async read_loop() {
        let outputBuffer = ''; // Buffer to accumulate data
        const sendInterval = 500; // Interval in milliseconds to send data
        const sendData = () => {
            if (outputBuffer) {
                this.streamOutput(outputBuffer); // Send accumulated data
                console.log(outputBuffer);
                outputBuffer = ''; // Clear the buffer
            }
        };
        const intervalId = setInterval(sendData, sendInterval);
        try {
            while (this.reader) {
                const value = await this.readWithTimeout();
                if (!value) {
                    continue;
                }
                const data = new TextDecoder().decode(value);
                console.log('Current buffer before: ', outputBuffer);
                outputBuffer += data;
                console.log('Data: ', data);
                console.log('Current buffer after: ', outputBuffer);
                if (data.includes('>>>')) {
                    this.setBlocked(false);
                }
            }
        }
        finally {
            clearInterval(intervalId); // Stop the timer when exiting the loop
            sendData(); // Ensure remaining data is sent
        }
    }
    async waitForPrompt() {
        if (this.blocker) {
            await this.blocker;
        }
    }
    // async readUntilError() {
    //   try {
    //     while (this.reader) {
    //       const data  = await this.readWithTimeout();
    //       if (data){
    //         const value = new TextDecoder().decode(data);
    //         this.streamOutput(value)
    //       }
    //     }
    //   } catch (error) {
    //     console.error(error);
    //     return
    //   }
    // }
    async kernelInfoRequest() {
        const content = {
            implementation: 'embedded',
            implementation_version: '1.0.0',
            language_info: {
                codemirror_mode: {
                    name: 'python',
                    version: 3,
                },
                file_extension: '.py',
                mimetype: 'text/x-python',
                name: 'python',
                nbconvert_exporter: 'python',
                pygments_lexer: 'ipython3',
                version: '3.8',
            },
            protocol_version: '5.3',
            status: 'ok',
            banner: 'Echo Kernel with Serial Support',
            help_links: [
                {
                    text: 'Echo Kernel',
                    url: 'https://github.com/jupyterlite/echo-kernel',
                },
            ],
        };
        return content;
    }
    async executeRequest(content) {
        this.setBlocked(true);
        if (this.first_run) {
            this.read_loop();
            this.first_run = false;
        }
        const { code } = content;
        const encoder = new TextEncoder();
        // const ctrl_a = new Uint8Array([1])
        const ctrl_d = new Uint8Array([4]);
        const ctrl_e = new Uint8Array([5]);
        const new_line = encoder.encode('\r\n');
        console.log('2');
        if (this.writer) {
            await this.writer.write(ctrl_e);
            await this.writer.write(new_line);
            const data = encoder.encode(code);
            await this.writer.write(data);
            await this.writer.write(ctrl_d);
            await this.writer.write(new_line);
        }
        console.log('3');
        await this.waitForPrompt();
        console.log('4');
        return {
            status: 'ok',
            execution_count: this.executionCount,
            user_expressions: {},
        };
    }
    async completeRequest(content) {
        throw new Error('Not implemented');
    }
    async inspectRequest(content) {
        throw new Error('Not implemented');
    }
    async isCompleteRequest(content) {
        throw new Error('Not implemented');
    }
    async commInfoRequest(content) {
        throw new Error('Not implemented');
    }
    inputReply(content) { }
    async commOpen(msg) { }
    async commMsg(msg) { }
    async commClose(msg) { }
}
