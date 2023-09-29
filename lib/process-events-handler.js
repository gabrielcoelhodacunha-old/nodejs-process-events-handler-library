"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessEventsHandler = void 0;
class ProcessEventsHandler {
    constructor(server, databaseClient, 
    /* istanbul ignore next */
    logger = console) {
        this._server = server;
        this._databaseClient = databaseClient;
        this._logger = logger;
    }
    setUpEventsHandling() {
        this._setUpSignalsHandling();
        this._setUpUnexpectedErrorsHandling();
    }
    _setUpSignalsHandling() {
        process.once("SIGINT", this._setUpGracefulShutdown());
        process.once("SIGTERM", this._setUpGracefulShutdown());
    }
    _setUpUnexpectedErrorsHandling() {
        process.on("uncaughtException", (error, origin) => {
            this._logger.log(`uncaughtException:\n Error: ${error}\n Origin: ${origin}`);
        });
        process.on("unhandledRejection", (reason) => {
            this._logger.log(`unhandledRejection:\n  Reason: ${reason}`);
        });
    }
    _setUpGracefulShutdown() {
        return (event) => {
            this._logger.log(`\n${event}:`);
            this._server.close(() => __awaiter(this, void 0, void 0, function* () {
                this._logger.log("\tServer closed");
                yield this._databaseClient.close();
                this._logger.log("\tDatabase connection closed");
                process.exit(1);
            }));
        };
    }
}
exports.ProcessEventsHandler = ProcessEventsHandler;
