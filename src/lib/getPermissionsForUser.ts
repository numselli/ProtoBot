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

import { Permissions } from '@lib/Permissions';
import { Message, Client, TextChannel } from 'discord.js';
import Logger from './interfaces/Logger';

/**
 * Get the user's permissions value in a guild. See the Permissions enum.
 * @param message The message of whomst author to check permissions for. Why a message? Channel details are needed.
 */
export function getPermissionsForUser(client: Client, log: Logger, message: Message): Permissions {
    // FIXME: buggy in DMs.
    log('v', `permission checking ${message.author.tag} @ ${message.guild!.name}/#${(message.channel as TextChannel).name ?? '<DM>'}`);
    if (client.config.ownerID === message.author.id) {
        log('v', `user is OWNER, return value BOT_OWNER: ${Permissions.BOT_OWNER}`);
        return Permissions.BOT_OWNER;
    } else if (client.config.adminIDs.includes(message.author.id)) {
        log('v', `user is ADMIN, return value BOT_ADMINISTRATOR: ${Permissions.BOT_ADMINISTRATOR}`);
        return Permissions.BOT_ADMINISTRATOR;
    } else if (message.guild!.ownerId === message.author.id) {
        log('v', `user is guild owner, return value SERVER_OWNER: ${Permissions.SERVER_OWNER}`);
        return Permissions.SERVER_OWNER;
    } else if (message.member!.permissions.has('ADMINISTRATOR')) {
        log('v', `user is server admin, return value SERVER_ADMINISTRATOR: ${Permissions.SERVER_ADMINISTRATOR}`);
        return Permissions.SERVER_ADMINISTRATOR;
    } else if (message.member!.permissions.has('BAN_MEMBERS')) {
        log('v', `user is server moderator, return value SERVER_MODERATOR: ${Permissions.SERVER_MODERATOR}`);
        return Permissions.SERVER_MODERATOR;
    } else if (message.member!.permissionsIn(message.channel as TextChannel).has('MANAGE_MESSAGES')) {
        log('v', `user is channel moderator, return value CHANNEL_MODERATOR: ${Permissions.CHANNEL_MODERATOR}`);
        return Permissions.CHANNEL_MODERATOR;
    } else {
        log('v', `user is a boring noob, return value NONE: ${Permissions.NONE}`);
        return Permissions.NONE;
    }
}
