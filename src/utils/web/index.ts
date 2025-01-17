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

import express from 'express';
import morgan from 'morgan';

import type LexiLogger from '#lib/interfaces/LexiLogger';
import type Client from '#lib/structures/LexiClient';

export function start(client: Client, log: LexiLogger): void {
    // Initialize an Express instance.
    const app = express();
    app.use(morgan('combined'));
    app.disable('x-powered-by');
    log.info('Web server started.');

    app.get('/api/v1', (req, res) => {
        res.json({ ok: true, version: 1 });
    });
    app.get('/api/v1/uwus', (req, res) => {
        if (req.query.uid) {
            if (isNaN(parseInt(req.query.uid as string))) {
                res.status(400).json({ ok: false, error: 'User ID was not a number.' });
                return;
            }
            if (!client.emoteCounterTrackers.has(req.query.uid as string)) {
                res.status(404).json({ ok: false, error: 'User not found.' });
                return;
            }
            res.json({ ok: true, data: client.emoteCounterTrackers.uwusForUser(req.query.uid as string) });
        } else res.json({ ok: true, data: client.emoteCounterTrackers.uwusLeaderboard(100, true) });
    });
    app.get('/api/v1/owos', (req, res) => {
        if (req.query.uid) {
            if (isNaN(parseInt(req.query.uid as string))) {
                res.status(400).json({ ok: false, error: 'User ID was not a number.' });
                return;
            }
            if (!client.emoteCounterTrackers.has(req.query.uid as string)) {
                res.status(404).json({ ok: false, error: 'User not found.' });
                return;
            }
            res.json({ ok: true, data: client.emoteCounterTrackers.owosForUser(req.query.uid as string) });
        } else res.json({ ok: true, data: client.emoteCounterTrackers.owosLeaderboard(100, true) });
    });
    app.get('/api/v1/tildes', (req, res) => {
        if (req.query.uid) {
            if (isNaN(parseInt(req.query.uid as string))) {
                res.status(400).json({ ok: false, error: 'User ID was not a number.' });
                return;
            }
            if (!client.emoteCounterTrackers.has(req.query.uid as string)) {
                res.status(404).json({ ok: false, error: 'User not found.' });
                return;
            }
            res.json({ ok: true, data: client.emoteCounterTrackers.tildesForUser(req.query.uid as string) });
        } else res.json({ ok: true, data: client.emoteCounterTrackers.tildesLeaderboard(100, true) });
    });

    app.get('/api/v0/uwus', (req, res) => {
        if (req.query.uid) {
            if (isNaN(parseInt(req.query.uid as string))) {
                res.status(400).send('Invalid user ID');
                return;
            }
            if (!client.emoteCounterTrackers.uwus.has(req.query.uid as string)) {
                res.status(404).send('User not found');
                return;
            }
            res.json({
                uid: req.query.uid,
                uwus: client.emoteCounterTrackers.uwusForUser(req.query.uid as string)
            });
        } else res.json(client.emoteCounterTrackers.uwusLeaderboard(100, true));
    });
    app.get('/api/v0/owos', (req, res) => {
        if (req.query.uid) {
            if (isNaN(parseInt(req.query.uid as string))) {
                res.status(400).send('Invalid user ID');
                return;
            }
            if (!client.emoteCounterTrackers.owos.has(req.query.uid as string)) {
                res.status(404).send('User not found');
                return;
            }
            res.json({
                uid: req.query.uid,
                uwus: client.emoteCounterTrackers.owosForUser(req.query.uid as string)
            });
        } else res.json(client.emoteCounterTrackers.owosLeaderboard(100, true));
    });
    app.get('/api/v0/tildes', (req, res) => {
        if (req.query.uid) {
            if (isNaN(parseInt(req.query.uid as string))) {
                res.status(400).send('Invalid user ID');
                return;
            }
            if (!client.emoteCounterTrackers.tildes.has(req.query.uid as string)) {
                res.status(404).send('User not found');
                return;
            }
            res.json({
                uid: req.query.uid,
                uwus: client.emoteCounterTrackers.tildesForUser(req.query.uid as string)
            });
        } else res.json(client.emoteCounterTrackers.tildesLeaderboard(100, true));
    });

    app.listen(client.config.apiPort, () => {
        log.info(`Web server listening on port ${client.config.apiPort}.`);
    });
}
