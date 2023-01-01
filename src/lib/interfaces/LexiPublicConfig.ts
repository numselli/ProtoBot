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

/** A hexadecimal color. */
type HexColor = `#${string}`;

/** Types for the PublicConfig.ts file. */
export default interface LexiPublicConfig {
    /** Link to where the source code is hosted. */
    githubRepository: string;

    /** Color pallet data for Lexi. */
    colors: {
        /** Primary color. */
        color1: HexColor;
        /** Secondary color. */
        color2: HexColor;
        /** Supplementary color. */
        color3: HexColor;
        /** Supplementary color. */
        color4: HexColor;
        /** Supplementary color. */
        color5: HexColor;
    };
}
