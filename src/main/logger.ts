import { CismuError } from "./errors";
import colors from "colors";
import util from "util";

class Logger {
  timestamp: number;

  constructor() {
    this.timestamp = new Date().getTime();

    process.on("unhandledRejection", (reason: string) => {
      this.crit(`Unhandled Rejection at Promise ${reason}`);
    });

    process.on("uncaughtException", (err) => {
      this.error(`Uncaught Exception thrown: ${err.message}`);
    });
  }

  debug(message: string, options?: { plain: boolean }) {
    if (options && options.plain) {
      console.log(message);
    } else {
      console.log(colors.blue(`[${this.time}] | DEBUG |  [${message}]`));
    }
  }

  log(message: string, options?: { plain?: boolean; template?: boolean }) {
    if (options && options.plain) {
      console.log(message);
    } else if (options && options.template) {
      if (message.includes("%s")) console.log(util.format(message, this.time));
      else console.log(message);
    } else {
      console.log(colors.white(`[${this.time}] | LOG |  [${message}]`));
    }
  }

  warn(message: string, options?: { plain: boolean }) {
    if (options && options.plain) {
      console.log(message);
    } else {
      console.log(colors.yellow(`[${this.time}] | WARNING |  [${message}]`));
    }
  }

  error(message: string, options?: { plain: boolean }) {
    if (options && options.plain) {
      console.log(message);
    } else {
      console.log(colors.red(`[${this.time}] | ERROR |  [${message}]`));
    }
  }

  crit(message: string | CismuError, options?: { plain: boolean }) {
    if (message instanceof CismuError) {
      console.log(
        colors.magenta(`[${this.time}] | CRITICAL |  [${message.name}]`)
      );
      console.log(colors.magenta(message.message));
      console.log(colors.magenta(message.description));
      console.log(colors.magenta(message.stack));
    } else {
      if (options && options.plain) {
        console.log(message);
      } else {
        console.log(
          colors.magenta(`[${this.time}] | CRITICAL |  [${message}]`)
        );
      }
    }
  }

  private get time() {
    return (new Date().getTime() - this.timestamp) / 1000;
  }
}

const logger = new Logger();
export default logger;
