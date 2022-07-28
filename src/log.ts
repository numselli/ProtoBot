/*
 * Lexi -- A Discord bot for furries and non-furs alike!
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

import { blue, bold, cyan, green, red, yellow } from 'colorette';
import type { WriteStream } from 'fs';
import { createWriteStream, mkdirSync, readdirSync } from 'fs';
import strip from 'strip-ansi';
import { inspect } from 'util';

import type LexiLogger from '#lib/interfaces/LexiLogger';

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
    readdirSync('../logs/');
} catch (e) {
    if ((e as { code: string }).code === 'ENOENT') catchFSErrors(() => mkdirSync('../logs/'));
    else die(1, e);
}

// Spawn a log file and it's respective streams.
// Disable consistent-return. This is a bug in eslint, where a process.exit() does not count
// as a return.
// eslint-disable-next-line consistent-return
function spawnLogStream(logLevel: 'verbose' | 'all' | 'warn' | 'err'): WriteStream {
    return catchFSErrors(() => {
        const logStream: WriteStream = createWriteStream(`../logs/${logInitTime}${logFolderSuffix}/${logLevel}.log`);
        logStream.write(`### Lexi - Log File @ ${logLevel}/${logInitTime}\n`);
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
catchFSErrors(() => mkdirSync(`../logs/${logInitTime}${logFolderSuffix}`));

const verboseStr = spawnLogStream('verbose');
const allStr = spawnLogStream('all');
const warnStr = spawnLogStream('warn');
const errStr = spawnLogStream('err');

// Function to log to the appropriate stream(s).
function writeItem(mode: LogMode, message: string): void {
    const logArray: [WriteStream, string][] = [
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
    const parsedDate = `${yellow(preparsedDate[1][0])} ${yellow(bold(preparsedDate[1][1]))} ${green(bold(preparsedDate[2]))}`;
    const sep: string = yellow(':');
    const parsedTime = `${yellow(bold(preparsedTime[0][0]))}${sep}${yellow(bold(preparsedTime[0][1]))}${sep}${yellow(bold(preparsedTime[0][2]))}`;

    const brackets: string[] = [yellow('['), yellow(']')];

    return `${brackets[0]}${parsedDate} ${parsedTime}${brackets[1]}`;
}

function preprocess(message: unknown): [string, number, string] {
    const epoch = Date.now();
    if (typeof message !== 'string') message = inspect(message);
    return [message as string, epoch, generateTimePrefix(epoch)];
}

function postprocess(message: string, type: LogMode, epoch: number): void {
    // eslint-disable-next-line no-console
    console.log(message);
    writeItem(type, message);
    buffer.push([epoch, type, strip(message)]);
    // FIXME: In an edge case where buffer size is *dropped*, it does not decrease
    // all of the way.
    if (buffer.length > maxBufferSize) buffer.shift();
}

function doPrintLog(prefix: string, mode: LogMode, msg: unknown) {
    const [message, epoch, timePrefix] = preprocess(msg);
    postprocess(`${timePrefix} ${prefix} ${message}`, mode, epoch);
}

function verbose(m: unknown): void {
    if (runningInProd) return;
    doPrintLog(cyan(`[${bold('VERB')}]`), 'v', m);
}
function info(m: unknown): void {
    doPrintLog(blue(`[${bold('INFO')}]`), 'i', m);
}
function warn(m: unknown): void {
    doPrintLog(yellow(`[${bold('WARN')}]`), 'w', m);
}
function error(m: unknown): void {
    doPrintLog(red(`[${bold('ERR!')}]`), 'e', m);
}
function errorWithStack(m: unknown): void {
    error(m);

    const stack = (new Error('Temporary stack creation error').stack || '').split('\n');

    // Remove the error itself.
    stack.shift();

    for (const entry of stack) error(`STACK: ${entry}`);
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

const toBeExported: LexiLogger = { verbose, info, warn, error, cleanup, errorWithStack };
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
