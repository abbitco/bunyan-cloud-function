import {Writable} from 'stream';

type LogLevel =
    | 'trace'
    | 'debug'
    | 'info'
    | 'warn'
    | 'error'
    | 'fatal'
    | number;

interface BunyanLogRecord {
    message?: string;
    msg?: string;
    err?: Error;
    level?: string;
    time?: Date;
    labels?: {};
    // And arbitrary other properties.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

// Map of Stackdriver logging levels.
const BUNYAN_TO_STACKDRIVER: Map<number, string> = new Map([
    [60, 'CRITICAL'],
    [50, 'ERROR'],
    [40, 'WARNING'],
    [30, 'INFO'],
    [20, 'DEBUG'],
    [10, 'DEBUG'],
]);

export class LoggingBunyan extends Writable {
    constructor() {
        super({objectMode: true});
    }

    /**
     * Convenience method that Builds a bunyan stream object that you can put in
     * the bunyan streams list.
     */
    stream(level: LogLevel) {
        return {level, type: 'raw', stream: this as Writable};
    }

    /**
     * Format a bunyan record into a Stackdriver log entry.
     */
    private formatEntry_(record: string | BunyanLogRecord) {
        if (typeof record === 'string') {
            throw new Error(
                '@google-cloud/logging-bunyan only works as a raw bunyan stream type.'
            );
        }
        // Stackdriver Log Viewer picks up the summary line from the 'message' field
        // of the payload. Unless the user has provided a 'message' property also,
        // move the 'msg' to 'message'.
        if (!record.message) {
            // If this is an error, report the full stack trace. This allows
            // Stackdriver Error Reporting to pick up errors automatically (for
            // severity 'error' or higher). In this case we leave the 'msg' property
            // intact.
            // https://cloud.google.com/error-reporting/docs/formatting-error-messages
            //
            if (record.err && record.err.stack) {
                record.message = record.err.stack;
            } else if (record.msg) {
                // Simply rename `msg` to `message`.
                record.message = record.msg;
                //delete record.msg;
            }
        }

        return {severity: BUNYAN_TO_STACKDRIVER.get(Number(record.level)), ...record};
    }

    _write(record: BunyanLogRecord, encoding: string, callback: Function) {
        const entry = this.formatEntry_(record);
        console.log(JSON.stringify(entry));
        callback();
    }

    // Writable._write used 'any' in function signature.
    _writev(
        chunks: Array<{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            chunk: any;
            encoding: string;
        }>,
        callback: Function
    ) {
        chunks.map(
            (request: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                chunk: any;
                encoding: string;
            }) => {
                const entry = this.formatEntry_(request.chunk);
                console.log(JSON.stringify(entry));
            }
        );

        callback();
    }
}
