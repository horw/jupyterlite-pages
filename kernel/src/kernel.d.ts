/// <reference types="w3c-web-serial" />
import { BaseKernel } from '@jupyterlite/kernel';
import { KernelMessage } from '@jupyterlab/services';
/**
 * A kernel that echos content back.
 */
export declare class EchoKernel extends BaseKernel {
    reader?: ReadableStreamDefaultReader<Uint8Array>;
    writer?: WritableStreamDefaultWriter<Uint8Array>;
    port?: SerialPort;
    private blocker;
    private blockerResolve;
    private first_run;
    private setBlocked;
    interrupt(): Promise<void>;
    private streamOutput;
    readWithTimeout(timeoutMs?: number): Promise<Uint8Array | null | undefined>;
    read_loop(): Promise<void>;
    private waitForPrompt;
    kernelInfoRequest(): Promise<KernelMessage.IInfoReplyMsg['content']>;
    executeRequest(content: KernelMessage.IExecuteRequestMsg['content']): Promise<KernelMessage.IExecuteReplyMsg['content']>;
    completeRequest(content: KernelMessage.ICompleteRequestMsg['content']): Promise<KernelMessage.ICompleteReplyMsg['content']>;
    inspectRequest(content: KernelMessage.IInspectRequestMsg['content']): Promise<KernelMessage.IInspectReplyMsg['content']>;
    isCompleteRequest(content: KernelMessage.IIsCompleteRequestMsg['content']): Promise<KernelMessage.IIsCompleteReplyMsg['content']>;
    commInfoRequest(content: KernelMessage.ICommInfoRequestMsg['content']): Promise<KernelMessage.ICommInfoReplyMsg['content']>;
    inputReply(content: KernelMessage.IInputReplyMsg['content']): void;
    commOpen(msg: KernelMessage.ICommOpenMsg): Promise<void>;
    commMsg(msg: KernelMessage.ICommMsgMsg): Promise<void>;
    commClose(msg: KernelMessage.ICommCloseMsg): Promise<void>;
}
