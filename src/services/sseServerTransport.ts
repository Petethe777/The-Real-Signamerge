import { IncomingMessage, ServerResponse } from "http";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import crypto from "crypto";

export class SSEServerTransport implements Transport {
  private _endpoint: string;
  private _res: ServerResponse;
  private _sessionId: string;

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  constructor(endpoint: string, res: ServerResponse) {
    this._endpoint = endpoint;
    this._res = res;
    // Generate a unique session ID
    this._sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  }

  get sessionId(): string {
    return this._sessionId;
  }

  async start(): Promise<void> {
    // Set headers for SSE stream
    this._res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    // Send the endpoint event to tell client where to post messages
    const postUrl = `${this._endpoint}?sessionId=${this._sessionId}`;
    this._res.write(`event: endpoint\ndata: ${postUrl}\n\n`);
    
    // Flush the stream if available
    if ((this._res as any).flush) {
      (this._res as any).flush();
    }
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this._res.write(`event: message\ndata: ${JSON.stringify(message)}\n\n`);
    if ((this._res as any).flush) {
      (this._res as any).flush();
    }
  }

  async handlePostMessage(
    req: IncomingMessage,
    res: ServerResponse,
    parsedBody?: any
  ): Promise<void> {
    try {
      const message = parsedBody;
      if (!message || typeof message !== "object") {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid JSON-RPC message body");
        return;
      }

      if (this.onmessage) {
        this.onmessage(message as JSONRPCMessage);
      }

      res.writeHead(202, { "Content-Type": "text/plain" });
      res.end("Accepted");
    } catch (error: any) {
      if (this.onerror) {
        this.onerror(error);
      }
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`Internal Error: ${error.message}`);
    }
  }

  async close(): Promise<void> {
    this._res.end();
    if (this.onclose) {
      this.onclose();
    }
  }
}
