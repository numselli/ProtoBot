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

import type { CommandInteraction, GuildMember, PermissionsBitField as DJSPermissionsBitField, TextChannel } from 'discord.js';

import type LexiLogger from '#lib/interfaces/LexiLogger';
import { Permissions } from '#lib/Permissions';
import type LexiClient from '#lib/structures/LexiClient';

/**
 * Get the user's permissions value in a guild. See the Permissions enum.
 * @param interaction The interaction to check.
 */
export function getInteractionPermissions(client: LexiClient, log: LexiLogger, interaction: CommandInteraction): Permissions {
    // FIXME: buggy in DMs.
    log.verbose(`permission checking ${interaction.user.tag} @ ${interaction.guild!.name}/#${(interaction.channel as TextChannel).name ?? '<DM>'}`);
    if (client.config.ownerID === interaction.user.id) {
        log.verbose(`user is OWNER, return value BOT_OWNER: ${Permissions.BOT_OWNER}`);
        return Permissions.BOT_OWNER;
    } else if (client.config.superAdminIDs.includes(interaction.user.id)) {
        log.verbose(`user is Super Admin, return value BOT_SUPER_ADMIN: ${Permissions.BOT_SUPER_ADMIN}`);
        return Permissions.BOT_SUPER_ADMIN;
    } else if (client.config.adminIDs.includes(interaction.user.id)) {
        log.verbose(`user is ADMIN, return value BOT_ADMINISTRATOR: ${Permissions.BOT_ADMINISTRATOR}`);
        return Permissions.BOT_ADMINISTRATOR;
    } else if (interaction.guild!.ownerId === interaction.user.id) {
        log.verbose(`user is guild owner, return value SERVER_OWNER: ${Permissions.SERVER_OWNER}`);
        return Permissions.SERVER_OWNER;
    } else if ((interaction.member!.permissions as DJSPermissionsBitField).has('Administrator')) {
        log.verbose(`user is server admin, return value SERVER_ADMINISTRATOR: ${Permissions.SERVER_ADMINISTRATOR}`);
        return Permissions.SERVER_ADMINISTRATOR;
    } else if ((interaction.member!.permissions as DJSPermissionsBitField).has('BanMembers')) {
        log.verbose(`user is server moderator, return value SERVER_MODERATOR: ${Permissions.SERVER_MODERATOR}`);
        return Permissions.SERVER_MODERATOR;
    } else if ((interaction.member as GuildMember).permissionsIn(interaction.channel as TextChannel).has('ManageMessages')) {
        log.verbose(`user is channel moderator, return value CHANNEL_MODERATOR: ${Permissions.CHANNEL_MODERATOR}`);
        return Permissions.CHANNEL_MODERATOR;
    } else {
        log.verbose(`no matches, return value NONE: ${Permissions.NONE}`);
        return Permissions.NONE;
    }
}
