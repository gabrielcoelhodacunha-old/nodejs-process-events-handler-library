import { IDatabaseClient, ILogger, IServer } from "./types";

export class ProcessEventsHandler {
  private readonly _server: IServer;
  private readonly _databaseClient: IDatabaseClient;
  private readonly _logger: ILogger;

  constructor(
    server: IServer,
    databaseClient: IDatabaseClient,
    /* istanbul ignore next */
    logger: ILogger = console
  ) {
    this._server = server;
    this._databaseClient = databaseClient;
    this._logger = logger;
  }

  public setUpEventsHandling() {
    this._setUpSignalsHandling();
    this._setUpUnexpectedErrorsHandling();
  }

  private _setUpSignalsHandling() {
    process.once("SIGINT", this._setUpGracefulShutdown());
    process.once("SIGTERM", this._setUpGracefulShutdown());
  }

  private _setUpUnexpectedErrorsHandling() {
    process.on("uncaughtException", (error, origin) => {
      this._logger.log(
        `uncaughtException:\n Error: ${error}\n Origin: ${origin}`
      );
    });
    process.on("unhandledRejection", (reason) => {
      this._logger.log(`unhandledRejection:\n  Reason: ${reason}`);
    });
  }

  private _setUpGracefulShutdown() {
    return (event: string) => {
      this._logger.log(`\n${event}:`);
      this._server.close(async () => {
        this._logger.log("\tServer closed");
        await this._databaseClient.close();
        this._logger.log("\tDatabase connection closed");
        process.exit(1);
      });
    };
  }
}
