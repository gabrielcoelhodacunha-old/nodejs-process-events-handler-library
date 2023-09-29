import { Console } from "node:console";
import { Server as HttpServer } from "node:http";
import { Server as HttpsServer } from "node:https";
export interface ILogger {
    log: typeof Console.prototype.log;
}
export interface IServer {
    close: typeof HttpServer.prototype.close | typeof HttpsServer.prototype.close;
}
export interface IDatabaseClient {
    close: () => Promise<void>;
}
