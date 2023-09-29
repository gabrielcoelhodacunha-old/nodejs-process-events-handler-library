import { ProcessEventsHandler } from "../process-events-handler";
import { IDatabaseClient, ILogger, IServer } from "../types";

describe("ProcessEventsHandler", () => {
  const spies = {} as {
    process: {
      once: jest.SpyInstance;
      on: jest.SpyInstance;
      exit: jest.SpyInstance;
    };
    logger: jest.MockedObjectDeep<ILogger>;
    httpServer: jest.MockedObjectDeep<IServer>;
    databaseClient: jest.MockedObjectDeep<IDatabaseClient>;
  };
  const sut = {} as { processEventsHandler: ProcessEventsHandler };

  beforeAll(() => {
    spies.process = {
      once: jest.spyOn(process, "once").mockImplementation(),
      on: jest.spyOn(process, "on").mockImplementation(),
      exit: jest.spyOn(process, "exit").mockImplementation(),
    };
    spies.logger = jest.mocked({ log: jest.fn() } as ILogger);
    spies.httpServer = jest.mocked({
      close: jest.fn().mockImplementation((callback) => callback()),
    } as IServer);
    spies.databaseClient = jest.mocked({ close: jest.fn() } as IDatabaseClient);
    sut.processEventsHandler = new ProcessEventsHandler(
      spies.httpServer,
      spies.databaseClient,
      spies.logger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("setUpEventsHandling", () => {
    const suiteCalls = { process: { once: [], on: [] } } as {
      process: {
        once: { event: string; listener: Function }[];
        on: { event: string; listener: Function }[];
      };
    };

    beforeEach(() => {
      sut.processEventsHandler.setUpEventsHandling();
      const processCalls = {
        once: spies.process.once.mock.calls as [string, Function][],
        on: spies.process.on.mock.calls as [string, Function][],
      };
      (Object.keys(processCalls) as (keyof typeof processCalls)[]).forEach(
        (key) => {
          processCalls[key].forEach(([event, listener]) => {
            suiteCalls.process[key].push({ event, listener });
          });
        }
      );
    });

    it("should call _setUpSignalsHandling", () => {
      expect(suiteCalls.process.once[0].event).toBe("SIGINT");
      expect(suiteCalls.process.once[1].event).toBe("SIGTERM");
    });

    it("should call _setUpUnexpectedErrorsHandling", () => {
      expect(suiteCalls.process.on[0].event).toBe("uncaughtException");
      expect(suiteCalls.process.on[1].event).toBe("unhandledRejection");
    });

    it("when SIGINT or SIGTERM occurs, should call _setUpGracefulShutdown internal closure", async () => {
      await suiteCalls.process.once[0].listener();
      expect(spies.httpServer.close).toHaveBeenCalledTimes(1);
      expect(spies.databaseClient.close).toHaveBeenCalledTimes(1);
    });

    it("when an uncaughtException occurs, should call the attached listener", () => {
      suiteCalls.process.on[0].listener();
      expect(spies.logger.log).toHaveBeenCalledTimes(1);
    });

    it("when an unhandledRejection occurs, should call the attached listener", () => {
      suiteCalls.process.on[1].listener();
      expect(spies.logger.log).toHaveBeenCalledTimes(1);
    });
  });
});
