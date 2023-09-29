import { IDatabaseClient, ILogger, IServer } from "./types";
export declare class ProcessEventsHandler {
    private readonly _server;
    private readonly _databaseClient;
    private readonly _logger;
    constructor(server: IServer, databaseClient: IDatabaseClient, logger?: ILogger);
    setUpEventsHandling(): void;
    private _setUpSignalsHandling;
    private _setUpUnexpectedErrorsHandling;
    private _setUpGracefulShutdown;
}
