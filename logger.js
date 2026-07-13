const pino = require("pino");

let logger;

if (process.env.NODE_ENV !== "production") {
  try {
    const prettyTarget = require.resolve("pino-pretty");
    logger = pino({
      level: "debug",
      transport: {
        target: prettyTarget,
      },
    });
  } catch {
    logger = pino({ level: "debug" });
  }
} else {
  logger = pino();
}

module.exports = logger;