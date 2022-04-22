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

import Logger from '@lib/interfaces/Logger';
import Hook from '@lib/structures/Hook';
import { Client } from 'discord.js';
import fs from 'fs';

export default function loadHooks(client: Client, log: Logger): void {
    log('i', 'beginning initial hook load...');
    fs.readdir(client.config.dirs.hooks, (err, files) => {
        if (err) {
            log('e', `Failed to read directory ${client.config.dirs.hooks}:`);
            log('e', err);
        } else
            files.forEach(async (path: string) => {
                if (path.endsWith('.js')) {
                    // normal load, but in this case we import into the hook Map.
                    const HookClass: Hook = (
                        await import(
                            '../../' +
                                (client.config.dirs.hooks.endsWith('/') ? client.config.dirs.hooks + path : `${client.config.dirs.hooks}/${path}`)
                        )
                    ).default;
                    const hookName = path.replace('.js', '');
                    log('v', `Loading hook "${hookName}"...`);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    const hookInstance = new HookClass(client, log);
                    client.hooks.set(hookName, hookInstance);
                    log('i', `Finished loading hook "${hookName}"!`);
                } else if (path.endsWith('.map')) return;
                // unknown ext
                else log('w', `File in hooks dir with unknown extension: ${path}`);
            });
    });
}
