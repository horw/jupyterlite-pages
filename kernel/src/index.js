import { IKernelSpecs } from '@jupyterlite/kernel';
import { EchoKernel } from './kernel';
/**
 * Plugin configuration for the enhanced kernel
 */
const enhancedKernel = {
    id: 'enhanced-kernel-plugin',
    autoStart: true,
    requires: [IKernelSpecs],
    activate: (app, kernelspecs) => {
        const activeKernels = new Map();
        app.router.post('/api/kernels/(.*)/interrupt', async (req, kernelId) => {
            const kernel = activeKernels.get(kernelId);
            if (kernel) {
                try {
                    await kernel.interrupt();
                    return new Response(null, { status: 204 });
                }
                catch (error) {
                    console.error('Failed to interrupt kernel:', error);
                    return new Response('Failed to interrupt kernel', { status: 500 });
                }
            }
            return new Response('Kernel not found', { status: 404 });
        });
        kernelspecs.register({
            spec: {
                name: 'enhanced',
                display_name: 'Enhanced Kernel',
                language: 'python',
                argv: [],
                resources: {
                    'logo-32x32': '',
                    'logo-64x64': '',
                },
            },
            create: async (options) => {
                const kernel = new EchoKernel(options);
                activeKernels.set(kernel.id, kernel);
                async function connectSerialPort() {
                    var _a, _b;
                    try {
                        const port = await navigator.serial.requestPort();
                        await port.open({ baudRate: 115200 });
                        //
                        await port.setSignals({ dataTerminalReady: false });
                        await new Promise((resolve) => setTimeout(resolve, 200));
                        await port.setSignals({ dataTerminalReady: true });
                        //
                        // await port.open({ baudRate: 115200 });
                        const reader = (_a = port.readable) === null || _a === void 0 ? void 0 : _a.getReader();
                        const writer = (_b = port.writable) === null || _b === void 0 ? void 0 : _b.getWriter();
                        kernel.reader = reader;
                        kernel.writer = writer;
                        kernel.port = port;
                    }
                    catch (err) {
                        console.error('Serial Port Error:', err);
                    }
                }
                await connectSerialPort();
                console.log('Creating enhanced kernel instance');
                await kernel.ready;
                return kernel;
            },
        });
        console.log('Enhanced kernel plugin activated');
    },
};
const plugins = [enhancedKernel];
export default plugins;
