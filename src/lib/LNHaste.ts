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

import { readFileSync } from 'fs';
import { createPaste } from 'hastebin';

import config from '#root/config';
import log from '#root/log';

import publicConfig from '../publicConfig';

const gotVersion = JSON.parse(readFileSync('../node_modules/got/package.json', 'utf8')).version as string;

/**
 * Send text to LogN's hastebin server.
 * @param data The text to send
 */
export default function LNHaste(data: string): Promise<string> {
    log.info(`LNHaste: sending ${data.length} bytes of data to ${config.hasteServer}`);
    return createPaste(
        data,
        { server: config.hasteServer },
        {
            headers: {
                'User-Agent': `Lexi${process.env.PRODUCTION ? 'Prod' : ''}/${process.env.LEXI_STARTSH_COMMIT!.substring(
                    process.env.LEXI_STARTSH_COMMIT!.length - 7
                )} (${process.env.LEXI_STARTSH_DIRTYSOURCE ? 'DirtySourceTree; ' : ''}got/${gotVersion}; node/${process.version}; ${
                    process.platform
                } ${process.arch}) +${publicConfig.githubRepository}`
            }
        }
    );
}
