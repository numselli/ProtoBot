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
            res.json({ ok: true, data: client.emoteCounterTrackers.get(req.query.uid as string, 'uwus') });
        } else res.json({ ok: true, data: client.emoteCounterTrackers.map((values, id) => [id, values.uwus] as const).sort((a, b) => b[1] - a[1]) });
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
            res.json({ ok: true, data: client.emoteCounterTrackers.get(req.query.uid as string, 'owos') });
        } else res.json({ ok: true, data: client.emoteCounterTrackers.map((values, id) => [id, values.owos] as const).sort((a, b) => b[1] - a[1]) });
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
            res.json({ ok: true, data: client.emoteCounterTrackers.get(req.query.uid as string, 'tildes') });
        } else
            res.json({ ok: true, data: client.emoteCounterTrackers.map((values, id) => [id, values.tildes] as const).sort((a, b) => b[1] - a[1]) });
    });

    app.get('/api/v0/uwus', (req, res) => {
        if (req.query.uid) {
            if (isNaN(parseInt(req.query.uid as string))) {
                res.status(400).send('Invalid user ID');
                return;
            }
            if (!client.emoteCounterTrackers.has(req.query.uid as string)) {
                res.status(404).send('User not found');
                return;
            }
            res.json({
                uid: req.query.uid,
                uwus: client.emoteCounterTrackers.get(req.query.uid as string, 'uwus')
            });
        } else res.json(client.emoteCounterTrackers.map((values, id) => [id, values.uwus] as const).sort((a, b) => b[1] - a[1]));
    });
    app.get('/api/v0/owos', (req, res) => {
        if (req.query.uid) {
            if (isNaN(parseInt(req.query.uid as string))) {
                res.status(400).send('Invalid user ID');
                return;
            }
            if (!client.emoteCounterTrackers.has(req.query.uid as string)) {
                res.status(404).send('User not found');
                return;
            }
            res.json({
                uid: req.query.uid,
                uwus: client.emoteCounterTrackers.get(req.query.uid as string, 'owos')
            });
        } else res.json(client.emoteCounterTrackers.map((values, id) => [id, values.owos] as const).sort((a, b) => b[1] - a[1]));
    });
    app.get('/api/v0/tildes', (req, res) => {
        if (req.query.uid) {
            if (isNaN(parseInt(req.query.uid as string))) {
                res.status(400).send('Invalid user ID');
                return;
            }
            if (!client.emoteCounterTrackers.has(req.query.uid as string)) {
                res.status(404).send('User not found');
                return;
            }
            res.json({
                uid: req.query.uid,
                uwus: client.emoteCounterTrackers.get(req.query.uid as string, 'tildes')
            });
        } else res.json(client.emoteCounterTrackers.map((values, id) => [id, values.tildes] as const).sort((a, b) => b[1] - a[1]));
    });

    app.listen(client.config.apiPort);
}
