import colors from "colors";
import { CismuError } from "./errors";

const SCALES: IScales = {
  DEBUG: 0,
  INFO: 10,
  WARN: 20,
  ERROR: 30,
  CRITICAL: 40,
  OFF: 50,
};

/**
 * This logger uses the ✨cumulative scale✨
 *
 * Cumulative scale:
 ** DEBUG: Show all logs.
 ** INFO: Show all logs except DEBUG.
 ** WARN: Show all logs except INFO and DEBUG. (default)
 ** ERROR: Show only ERROR and CRITICAL.
 ** CRITICAL: Show only the CRITICAL ones.
 ** OFF: Do not show logs.
 */
class Logger {
  timestamp: number;
  scale: keyof IScales;

  constructor(scale: keyof IScales = "WARN") {
    this.timestamp = new Date().getTime();
    this.scale = scale;

    process.on("unhandledRejection", (reason: string) =>
      this.crit(`Unhandled Rejection at Promise ${reason}`)
    );

    process.on("uncaughtException", (err, origin) =>
      this.crit(`Uncaught Exception thrown: ${err.message}\n${origin}`)
    );
  }

  logMessage(message: string | Error, colorFn: Function) {
    if (message instanceof CismuError) {
      console.log(colors.magenta(`[${this.time}] | CRITICAL |  [${message.name}]`));
      console.log(colors.magenta(message.message));
      console.log(colors.magenta(message.description));
      console.log(colors.magenta(message.stack));
    } else if (message instanceof Error) {
      console.error(colorFn(`[${this.time}] | ERROR | [${message.name}]`));
      console.error(colorFn(message.message));
      console.error(colorFn(message.stack));
    } else {
      console.log(colorFn(`[${this.time}] | LOG | [${message}]`));
    }
  }

  debug(message: string | Error) {
    if (!(SCALES[this.scale] <= SCALES["DEBUG"])) return;
    this.logMessage(message, colors.blue);
  }

  info(message: string | Error) {
    if (!(SCALES[this.scale] <= SCALES["INFO"])) return;
    this.logMessage(message, colors.white);
  }

  warn(message: string | Error) {
    if (!(SCALES[this.scale] <= SCALES["WARN"])) return;
    this.logMessage(message, colors.yellow);
  }

  error(message: string | Error) {
    if (!(SCALES[this.scale] <= SCALES["ERROR"])) return;
    this.logMessage(message, colors.red);
  }

  crit(message: string | Error) {
    if (!(SCALES[this.scale] <= SCALES["CRITICAL"])) return;
    this.logMessage(message, colors.magenta);
  }

  setScale(scale: keyof IScales) {
    this.scale = scale;
  }

  private get time() {
    return (new Date().getTime() - this.timestamp) / 1000;
  }
}

export default new Logger();

interface IScales {
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
  CRITICAL: number;
  OFF: number;
}
