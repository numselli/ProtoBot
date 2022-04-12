/**
 * ProtoBot -- A Discord furry bot
 * Copyright (C) 2020, 2021, 2022  0xLogN
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/************************************READ ME BEFORE EDITING THIS FILE*******
 * Hey there, fellow explorer! This file is core to the functioning of     *
 * ProtoBot. It handles logging and file writes for the log archives.      *
 * This code was written a long time ago, back when persistent logging     *
 * was implemented, so it may not make much sense. If someone is willing   *
 * to take a look and potentially refactor it, that would be nice, but     *
 * please ensure the API stays the same, as it is used HUNDREDS OF TIMES   *
 * around the source code. Things we need to change are listed just        *
 * under this comment in todo tags. Thank you for (hopefully) contributing *
 * to the continued development of ProtoBot!                               *
 *                                      - ProtoBot Core Developer   0xLogN *
 ***************************************************************************/

const runningInProd = process.env.PRODUCTION;

// Import the necessary modules for the logger
import chalk from 'chalk'; // Chalk handles fancy coloring.
import * as fs from 'fs'; // To create the write streams.
import strip from 'strip-ansi'; // To clean off the ANSI escape codes for the log files.
import * as util from 'util'; // Utilities.

// Create the logging streams for all of the log levels.
// A certain log level is always logged to all below it, so for example, if you were
// to log an error, it would be logged to all levels.

// The timestamp when the logfile was created (now).
const logInitTime: number = Date.now();
try {
    fs.readdirSync('../logs/');
} catch (e) {
    if ((<{ code: string }>e).code === 'ENOENT')
        try {
            fs.mkdirSync('../logs/');
        } catch (e2) {
            console.error(e2);
            process.exit(1);
        }
    else {
        console.error(e);
        process.exit(1);
    }
}

const logFldrSuffix = runningInProd ? '.prod' : '.dev';

// Spawn a logfile and it's respective streams.
// Disable consistent-return. This is a bug in eslint, where a process.exit() does not count
// as a return.
// eslint-disable-next-line consistent-return
function spawnLogStream(logLevel: 'verbose' | 'all' | 'warn' | 'err'): fs.WriteStream {
    try {
        const logStream: fs.WriteStream = fs.createWriteStream(`../logs/${logInitTime}${logFldrSuffix}/${logLevel}.log`);
        logStream.write(`### ProtoBot - Log File @ ${logLevel}/${logInitTime}\n`);
        if (runningInProd) logStream.write('### This is a production mode log file.\n');

        if (logLevel === 'verbose' && runningInProd)
            logStream.write('### Logging at loglevel VERBOSE is disabled in production.\n### Check ENV.PRODUCTION.\n');

        return logStream;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

// Create the log directory.
try {
    fs.mkdirSync(`../logs/${logInitTime}${logFldrSuffix}/`);
} catch (e) {
    console.error(e);
    process.exit(1);
}

const verboseStr = spawnLogStream('verbose');
const allStr = spawnLogStream('all');
const warnStr = spawnLogStream('warn');
const errStr = spawnLogStream('err');

// Function to log to the appropriate stream(s).
function writeItem(mode: 'v' | 'i' | 'w' | 'e', message: string): void {
    const logArray: [fs.WriteStream, string][] = [
        [errStr, 'e'],
        [warnStr, 'w'],
        [allStr, 'a'],
        [verboseStr, 'v']
    ];
    if (runningInProd) logArray.pop();

    if (mode === 'e') for (const [stream, _] of logArray) stream.write(`${strip(message)}\n`);
    else if (mode === 'w') for (const [stream, _] of logArray.slice(1)) stream.write(`${strip(message)}\n`);
    else if (mode === 'i') for (const [stream, _] of logArray.slice(2)) stream.write(`${strip(message)}\n`);
    else if (mode === 'v') if (!runningInProd) logArray[3][0].write(`${strip(message)}\n`);
}

// Main
// Literal hell ensues below...
export default function log(mode: 'CLOSE_STREAMS'): Promise<void>;
export default function log(mode: 'v' | 'i' | 'w' | 'e', message: any, _bypassStackPrint?: boolean): void;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function log(mode: 'v' | 'i' | 'w' | 'e' | 'CLOSE_STREAMS', message?: any, _bypassStackPrint = false): void | Promise<void> {
    if (mode === 'CLOSE_STREAMS')
        // Close all of the file streams
        return new Promise((resolve) => {
            errStr.end(() => {
                warnStr.end(() => {
                    allStr.end(() => {
                        resolve();
                    });
                });
            });
        });
    else {
        if (mode === 'v' && runningInProd) return undefined;

        if (typeof message !== 'string')
            // Use util.inspect to color the message
            message = util.inspect(message, { colors: true });

        let msg = '';
        let preparsedDate: any = new Date(Date.now()).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        preparsedDate = preparsedDate.split(', ');
        preparsedDate[1] = preparsedDate[1].split(' ');
        // I'm not even sure what locale this is, but it works.
        let preparsedTime: any = new Date(Date.now()).toLocaleTimeString('it-IT');
        preparsedTime = preparsedTime.split(' ');
        preparsedTime[0] = preparsedTime[0].split(':');

        // Parse date/time
        const parsedDate = `${chalk.yellow(preparsedDate[1][0])} ${chalk.yellow.bold(preparsedDate[1][1])} ${chalk.green.bold(preparsedDate[2])}`;
        const sep: string = chalk.yellow(':');
        const parsedTime = `${chalk.yellow.bold(preparsedTime[0][0])}${sep}${chalk.yellow.bold(preparsedTime[0][1])}${sep}${chalk.yellow.bold(
            preparsedTime[0][2]
        )}`;

        switch (mode) {
            case 'v':
                // Verbose
                msg = `${chalk.cyan('[')}${chalk.cyan.bold('VERB')}${chalk.cyan(']')} ${message}`;
                break;
            case 'i':
                // Info
                msg = `${chalk.blue('[')}${chalk.blue.bold('INFO')}${chalk.blue(']')} ${message}`;
                break;
            case 'w':
                // Warning
                msg = `${chalk.yellow('[')}${chalk.yellow.bold('WARN')}${chalk.yellow(']')} ${message}`;
                break;
            case 'e':
                // Error
                msg = `${chalk.red('[')}${chalk.red.bold('ERR!')}${chalk.red(']')} ${message}`;
                break;
            default:
                // Default
                msg = `${chalk.blue('[')}${chalk.blue.bold('INFO')}${chalk.blue(']')} ${message}`;

                // Throw a warning for invalid name
                log('w', `[log] Invalid log level ${mode}`);
                break;
        }

        const brackets: string[] = [chalk.yellow('['), chalk.yellow(']')];

        msg = `${brackets[0]}${parsedDate} ${parsedTime}${brackets[1]} ${msg}`;

        console.log(msg);
        // @ts-ignore
        writeItem(mode, msg);

        // #125: Add stack traces for errors - BadBoyHaloCat
        if (mode === 'e' && !_bypassStackPrint) {
            const s = new Error('Temporary stack creation error').stack || '';
            const a = s.split('\n');
            a.shift();

            for (const entry of a) log('e', 'STACK: ' + entry, true);
        }

        return undefined;
    }
}
