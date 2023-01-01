/*
 * Lexi -- A Discord bot for furries and non-furs alike!
 * Copyright (C) 2020, 2021, 2022, 2023  0xLogN
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

/** Lexi's logging system. */
export default interface LexiLogger {
    /**
     * Print a debug message to the console. This is hidden when Lexi is in production mode.
     *
     * Use this for super-detailed debugging. Stuff that is not really important, but you want to know.
     * An example message is: "LCH: Command arguments for /ping by ${USER}: ${ARGS}"
     */
    verbose(message: unknown): void;
    /** Use this for informational messages like "Running command /ping for ${USER}." */
    info(message: unknown): void;
    /** Use this for warnings. Something went wrong, but it's not that bad. */
    warn(message: unknown): void;
    /** Something bad went wrong. Take a big note. */
    error(message: unknown): void;
    /** This is probably critical. Dump the stack. See {@link LexiLogger#error} as well. */
    errorWithStack(message: unknown): void;
    cleanup(): Promise<void>;
}
