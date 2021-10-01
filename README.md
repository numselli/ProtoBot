# ProtoBot

<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->

A Discord furry bot

## What is ProtoBot?

ProtoBot is a Discord bot made by furries, for furries.

## Installing & Setup

The following steps will help you to get ProtoBot running on your computer.

We support **Linux** and **macOS 11 or above**. Any Windows/OSX bugs will be treated with LOW PRIORITY.

### 1. Node.js

Follow the installation steps for [Node.js v16](https://nodejs.org/en/)

Then install TypeScript: `npm install -g typescript`

### 2. Enmap

Install the [Enmap pre-requisites](https://enmap.evie.dev/install#pre-requisites). **DO NOT** run the `npm i enmap` command!

### 3. Git

Ensure [Git](https://git-scm.com/) is installed. On Linux, install it with your package manager, the package is probably named `git`.

### 4. Cloning

In a destination folder, run this command:

```bash
git clone https://github.com/thetayloredman/ProtoBot.git
```

### 5. Installing NPM Dependencies

> **WARNING:** _This process may take a while._

Run the following command:

```bash
npm i
```

### 6. Configuring the Bot

Copy the file `src/config.rename-me.ts` to `src/config.ts`. Edit the new file.

> **NOTE:** _Only change values inside of the config export. Any other changes are unsupported._

#### `token`

Create a bot account (if you don't have one already) from [the Discord developer panel](discord.com/developers/applications)

Create an application and add a bot. Copy the token. Paste it here.

#### `dirs`

> **WARNING:** _Changing these may break the command and hook handling modules._

The directories used for commands and hooks. I wouldn't change these unless needed due to a directory rename.

#### `prefixes`

The bot's prefixes.

#### `cooldowns`

The cooldowns for commands and hooks.

#### `ownerID`

> **_WARNING: DO NOT GIVE ANYBODY YOU DO NOT KNOW VERY WELL OWNER ACCESS!_**  
> **ANYONE WITH OWNER ACCESS CAN GET DIRECT ACCESS TO A SHELL ON YOUR SYSTEM.**  
> **I REPEAT, _NOBODY_ GETS OWNER ACCESS. I AM NOT RESPONSIBLE FOR ANY DAMAGE CAUSED IF YOU DO NOT OBEY THIS.**

**Hey, did you read that thing above me? If not, read it. Did you read it? Read it again. This is serious.**

Your user ID.

### 7. First Startup

Run `./start.sh`.

### 8. Logging

Logs will automatically be created and manual maintanence is needed for cleaning these up.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/LostNuke"><img src="https://avatars1.githubusercontent.com/u/36674771?v=4?s=100" width="100px;" alt=""/><br /><sub><b>LostNuke</b></sub></a><br /><a href="https://github.com/thetayloredman/ProtoBot/commits?author=LostNuke" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Alcremie"><img src="https://avatars0.githubusercontent.com/u/54785334?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ivan Lieder</b></sub></a><br /><a href="#maintenance-Alcremie" title="Maintenance">🚧</a> <a href="https://github.com/thetayloredman/ProtoBot/commits?author=Alcremie" title="Code">💻</a> <a href="https://github.com/thetayloredman/ProtoBot/pulls?q=is%3Apr+reviewed-by%3AAlcremie" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://badboyhalocat.tk/"><img src="https://avatars0.githubusercontent.com/u/26350849?v=4?s=100" width="100px;" alt=""/><br /><sub><b>BadBoyHaloCat</b></sub></a><br /><a href="https://github.com/thetayloredman/ProtoBot/issues?q=author%3Athetayloredman" title="Bug reports">🐛</a> <a href="https://github.com/thetayloredman/ProtoBot/commits?author=thetayloredman" title="Code">💻</a> <a href="#data-thetayloredman" title="Data">🔣</a> <a href="https://github.com/thetayloredman/ProtoBot/commits?author=thetayloredman" title="Documentation">📖</a> <a href="#ideas-thetayloredman" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-thetayloredman" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-thetayloredman" title="Maintenance">🚧</a> <a href="#projectManagement-thetayloredman" title="Project Management">📆</a> <a href="#question-thetayloredman" title="Answering Questions">💬</a> <a href="https://github.com/thetayloredman/ProtoBot/pulls?q=is%3Apr+reviewed-by%3Athetayloredman" title="Reviewed Pull Requests">👀</a> <a href="#security-thetayloredman" title="Security">🛡️</a> <a href="https://github.com/thetayloredman/ProtoBot/commits?author=thetayloredman" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.linuxbad.com/"><img src="https://avatars1.githubusercontent.com/u/37817019?v=4?s=100" width="100px;" alt=""/><br /><sub><b>JustAnotherDev</b></sub></a><br /><a href="https://github.com/thetayloredman/ProtoBot/issues?q=author%3Ashadowplays4k" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/Nepgfurmixpro"><img src="https://avatars.githubusercontent.com/u/58635917?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nepgfurmixpro</b></sub></a><br /><a href="https://github.com/thetayloredman/ProtoBot/commits?author=Nepgfurmixpro" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
