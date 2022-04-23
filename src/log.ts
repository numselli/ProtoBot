/*
 * ProtoBot -- A Discord bot for furries and non-furs alike!
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

const runningInProd = process.env.PRODUCTION;

import Logger from '@lib/interfaces/Logger';
import chalk from 'chalk'; // Chalk handles fancy coloring.
import * as fs from 'fs'; // To create the write streams.
import strip from 'strip-ansi'; // To clean off the ANSI escape codes for the log files.
import * as util from 'util'; // Utilities.

// Create the logging streams for all of the log levels.
// A certain log level is always logged to all below it, so for example, if you were
// to log an error, it would be logged to all levels.

/**
 * Print *message* and exit *code*.
 */
function die(code: number, message: unknown): never {
    // eslint-disable-next-line no-console
    console.error(message);
    process.exit(code);
}

/**
 * Catch any FS error and log it.
 */
// eslint-disable-next-line consistent-return
function catchFSErrors<T>(execute: (...n: unknown[]) => T): T {
    try {
        return execute();
    } catch (e) {
        die(1, e);
    }
}

// The timestamp when the logfile was created (now).
const logInitTime: number = Date.now();
const logFolderSuffix = runningInProd ? '.prod' : '.dev';

try {
    fs.readdirSync('../logs/');
} catch (e) {
    if ((e as { code: string }).code === 'ENOENT') catchFSErrors(() => fs.mkdirSync('../logs/'));
    else die(1, e);
}

// Spawn a log file and it's respective streams.
// Disable consistent-return. This is a bug in eslint, where a process.exit() does not count
// as a return.
// eslint-disable-next-line consistent-return
function spawnLogStream(logLevel: 'verbose' | 'all' | 'warn' | 'err'): fs.WriteStream {
    return catchFSErrors(() => {
        const logStream: fs.WriteStream = fs.createWriteStream(`../logs/${logInitTime}${logFolderSuffix}/${logLevel}.log`);
        logStream.write(`### ProtoBot - Log File @ ${logLevel}/${logInitTime}\n`);
        if (runningInProd) logStream.write('### This is a production mode log file.\n');

        if (logLevel === 'verbose' && runningInProd)
            logStream.write('### Logging at log level VERBOSE is disabled in production.\n### Check ENV.PRODUCTION.\n');

        return logStream;
    });
}

// Store the log buffer in memory.
type LogMode = 'v' | 'i' | 'w' | 'e';
let buffer: [number, LogMode, string][] = [];
let maxBufferSize = 500; // in lines

// Create the log directory.
catchFSErrors(() => fs.mkdirSync(`../logs/${logInitTime}${logFolderSuffix}`));

const verboseStr = spawnLogStream('verbose');
const allStr = spawnLogStream('all');
const warnStr = spawnLogStream('warn');
const errStr = spawnLogStream('err');

// Function to log to the appropriate stream(s).
function writeItem(mode: LogMode, message: string): void {
    const logArray: [fs.WriteStream, string][] = [
        [errStr, 'e'],
        [warnStr, 'w'],
        [allStr, 'a'],
        [verboseStr, 'v']
    ];
    if (runningInProd) logArray.pop();

    if (mode === 'e') for (const [stream] of logArray) stream.write(`${strip(message)}\n`);
    else if (mode === 'w') for (const [stream] of logArray.slice(1)) stream.write(`${strip(message)}\n`);
    else if (mode === 'i') for (const [stream] of logArray.slice(2)) stream.write(`${strip(message)}\n`);
    else if (mode === 'v') if (!runningInProd) logArray[3][0].write(`${strip(message)}\n`);
}

function generateTimePrefix(epoch: number): string {
    const date = new Date(epoch);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let preparsedDate: any = date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    preparsedDate = preparsedDate.split(', ');
    preparsedDate[1] = preparsedDate[1].split(' ');
    // I'm not even sure what locale this is, but it works.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let preparsedTime: any = date.toLocaleTimeString('it-IT');
    preparsedTime = preparsedTime.split(' ');
    preparsedTime[0] = preparsedTime[0].split(':');

    // Parse date/time
    const parsedDate = `${chalk.yellow(preparsedDate[1][0])} ${chalk.yellow.bold(preparsedDate[1][1])} ${chalk.green.bold(preparsedDate[2])}`;
    const sep: string = chalk.yellow(':');
    const parsedTime = `${chalk.yellow.bold(preparsedTime[0][0])}${sep}${chalk.yellow.bold(preparsedTime[0][1])}${sep}${chalk.yellow.bold(
        preparsedTime[0][2]
    )}`;

    const brackets: string[] = [chalk.yellow('['), chalk.yellow(']')];

    return `${brackets[0]}${parsedDate} ${parsedTime}${brackets[1]}`;
}

function preprocess(message: unknown): [string, number, string] {
    const epoch = Date.now();
    if (typeof message !== 'string') message = util.inspect(message);
    return [message as string, epoch, generateTimePrefix(epoch)];
}

function postprocess(message: string, type: LogMode, epoch: number): void {
    // eslint-disable-next-line no-console
    console.log(message);
    writeItem(type, message);
    buffer.push([epoch, type, message]);
    // FIXME: In an edge case where buffer size is *dropped*, it does not decrease
    // all of the way.
    if (buffer.length > maxBufferSize) buffer.shift();
}

function verbose(m: unknown): void {
    if (runningInProd) return;
    const [message, epoch, timePrefix] = preprocess(m);
    postprocess(`${timePrefix} ${chalk.cyan('[')}${chalk.cyan.bold('VERB')}${chalk.cyan(']')} ${message}`, 'v', epoch);
}
function info(m: unknown): void {
    const [message, epoch, timePrefix] = preprocess(m);
    postprocess(`${timePrefix} ${chalk.blue('[')}${chalk.blue.bold('INFO')}${chalk.blue(']')} ${message}`, 'i', epoch);
}
function warn(m: unknown): void {
    const [message, epoch, timePrefix] = preprocess(m);
    postprocess(`${timePrefix} ${chalk.yellow('[')}${chalk.yellow.bold('WARN')}${chalk.yellow(']')} ${message}`, 'w', epoch);
}
function error(m: unknown): void {
    const [message, epoch, timePrefix] = preprocess(m);
    postprocess(`${timePrefix} ${chalk.red('[')}${chalk.red.bold('ERR')}${chalk.red(']')} ${message}`, 'e', epoch);
}
function errorWithStack(m: unknown): void {
    error(m);

    const s = new Error('Temporary stack creation error').stack || '';
    const a = s.split('\n');
    // Remove the error itself.
    a.shift();

    for (const entry of a) error('STACK: ' + entry);
}

/**
 * Clean up the log files. This is only needed on process exit and this will not
 * allow writing of any more logs to disk.
 * @returns Resolves once finished.
 */
async function cleanup(): Promise<void> {
    return new Promise((resolve) => {
        errStr.end(() => {
            warnStr.end(() => {
                allStr.end(() => resolve());
            });
        });
    });
}

const toBeExported: Logger = { verbose, info, warn, error, cleanup, errorWithStack };
export default toBeExported;

export function clearBuffer(): void {
    buffer = [];
}

export function getMaxBufferSize(): number {
    return maxBufferSize;
}

export function changeMaxBufferSize(newSize: number): void {
    maxBufferSize = newSize;
}

export function readBuffer(): [number, LogMode, string][] {
    return buffer;
}

export function readBufferOfType(mode: LogMode): [number, string, string][] {
    return buffer.filter(([, m]) => {
        // Shorten the verbose filter; everything should match it!
        if (mode === 'v') return true;
        else if (mode === 'i') return m === 'i' || m === 'w' || m === 'e';
        else if (mode === 'w') return m === 'w' || m === 'e';
        else if (mode === 'e') return m === 'e';
        else return false;
    });
}

export { LogMode };
