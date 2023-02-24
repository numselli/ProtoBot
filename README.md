<div align="center">

# Lexi

</div>

<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-9-orange.svg?style=for-the-badge)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->

<div align="center">

## An Update on the Status of Lexi

</div>

The Lexi project has been a major project of mine for a long time. I've put a lot of
work into the framework and design behind the Lexi Discord bot, and I've enjoyed
the time that everyone has put into this as well. However, as all great things must
come to an end, I've decided to begin sunsetting Lexi.

I've decided to do this for a few reasons:

-   Lack of assistance from other developers & even the other maintainers
-   Lack of interest in the bot at all (it's only in my servers)
-   Lack of time & motivation (The framework is amazing, but few features are available)
-   Lack of legal support with privacy policies etc

Here's how this is going to work. From now on, I will no longer be providing any
feature updates to Lexi. I will still be providing bug fixes and security updates
for a limited amount of time, but once Discord stops supporting Lexi's API version,
the hosted instance will officially be shut down.

Thank you to everyone who has made this project possible, especially:

-   Alcremie, for performing the TypeScript rewrite in ProtoBot 2
-   numselli, for helping me find some security issues and for making some contributions
-   charmines, for maintaining the project

And finally, thank you, the user, for using Lexi. I hope you enjoyed your time with
the bot while it lasted.

Signing off...

Logan (LogN / 0xLogN)  
Lexi Core Maintainer
SkyMines Network Owner
Zirco Compiler Engineer

<div align="center">

## What is Lexi?

</div>

Lexi is a powerful Discord bot for furries and alike! It contains a variety of commands that can be used to make your server more fun and interactive.

**Add me to your server!** [**Main Bot, Recommended**][prod_lax] | [Development Bot][dev_lax]

**You may choose more detailed permissions here:**

-   **Production Lexi** -- **Recommended.** This bot is the stable version.
    -   [**Production Lexi, administrator**][prod_admin] -- **Recommended for development.** Do not use in real servers.
    -   [**Production Lexi, lax permissions**][prod_lax] -- **Recommended.** Provides leeway for new and planned features.
    -   [**Production Lexi, strict permissions**][prod_strict] -- **Not recommended.** Use this if your server needs to be very strict on permissions. Lexi may need to be re-invited regularly.
-   **Development Lexi** -- **Recommended for contributors.** This bot is more likely to break.
    -   [**Development Lexi, administrator**][dev_admin] -- **Recommended.** Provides leeway for new and planned features.
    -   [**Development Lexi, lax permissions**][dev_lax] -- **Recommended for testing.** Provides leeway for new and planned features.
    -   **We do not support a strict version of Dev Lexi.** You may set permissions yourself.

[prod_admin]: https://discord.com/api/oauth2/authorize?client_id=769227328387416084&permissions=8&scope=applications.commands%20bot
[prod_lax]: https://discord.com/api/oauth2/authorize?client_id=769227328387416084&permissions=1633965964615&scope=applications.commands%20bot
[prod_strict]: https://discord.com/api/oauth2/authorize?client_id=769227328387416084&permissions=516053912903&scope=applications.commands%20bot
[dev_admin]: https://discord.com/api/oauth2/authorize?client_id=957443529314013244&permissions=8&scope=bot%20applications.commands
[dev_lax]: https://discord.com/api/oauth2/authorize?client_id=957443529314013244&permissions=1633965964615&scope=applications.commands%20bot

<div align="center">

## How Lexi Started

</div>

Lexi started as a furry bot named "ProtoBot" in it's earliest development phases. I eventually decided to make it more accessible for people outside the fandom (as a lot of people were saying ProtoBot was too specific for them) and then the name Lexi came out of my head.

In pull request #510, ProtoBot 3 was started. Eventually, it got renamed to "Lexi."

The name Lexi is actually the name of one of my protogen fursonas, and a lot of her traits carried into Lexi as a Discord bot.

<div align="center">

## Installing and Setup

</div>

The following steps will help you get Lexi up and running on your computer.

Lexi supports **Linux** and **macOS 11 or later**. Any Windows/OSX bugs will be treated with low priority, and we will not consider
adding install/start scripts in Batch any time in the near future. WSL is supported and recommended if you are to host using Windows, and we suggest using PM2 for process management.

### Before you continue (Notice on Open Source status of Lexi)

Please consider the following before you continue the installation of Lexi.

Lexi's source code is OSS (Open Source Software). As part of the terms in GPL3, I (Logan) have no right to stop you from self-hosting this bot with the applicable credit. I decided to open-source Lexi to allow for contributions from other fandom members, and to further my maintaining experience.

One thing I considered when open-sourcing Lexi was the possibility of people forking off on their own and contributing to their own Lexi fork, instead of Lexi itself. If you have something you'd like to see added to Lexi, please contribute instead of self-hosting. It's better for all of us.

In addition, Lexi relies on a lot of external services to function, and this number is getting greater as more functionality is being added.

Self-hosts of Lexi is not recommended for non-development purposes.

\- 0xLogN
Lexi Maintainer

### 1. Install Prerequisites

#### Node.js

Follow the installation steps for [Node.js v16](https://nodejs.org/en/)

Then install TypeScript: `yarn global add typescript`

#### Build-Essential

Install `build-essential` for your system; it should be available on macOS via the build tools in XCode.

#### Git

Ensure [Git](https://git-scm.com/) is installed. On Linux, install it with your package manager, the package is probably named `git`.

### 2. Download Source Code

In the destination folder (this can be moved later), run this command:

```bash
git clone https://github.com/thetayloredman/Lexi.git
```

### 3. Preparing Configuration and Dependencies

Execute `./install.sh`.

Before you continue, take close note:

> One of the questions the installer will ask you is VERY important:
> It will read as something like "What is your Discord User ID?"
>
> This is one of the most important steps here. Do NOT give ANYONE you do not know very well access to this. They can open a shell on your system and make changes to any file.

**Hey, did you read that thing above me? If not, read it. Did you read it? Read it again. This is serious.**

### 4. First Startup

#### Normal Run

Run `./start.sh`.

FOR PRODUCTION ENVIRONMENTS: Run `PRODUCTION=1 ./start.sh`

#### With [PM2](https://pm2.keymetrics.io/)

[PM2](https://pm2.keymetrics.io/) is a process manager for Node.js. It is a good alternative to using the normal start scripts.

First, ensure PM2 is installed: `yarn global add pm2`

Optionally, enable PM2 to automatically start as a daemon: `pm2 startup`

Then, run `pm2 start ecosystem.config.js` (add `--env production` if you want to run in production)

If you want daemon startup, run `pm2 save`.

### 5. Logging

Logs will automatically be created and manual maintenance is needed for cleaning these up.

## Notable Mentions & Maintainers

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/thetayloredman">
        <img src="https://avatars0.githubusercontent.com/u/26350849?v=4?s=100" width="100px;" alt=""/>
        <br/>
        <sub>
          <b>thetayloredman</b>
        </sub>
      </a>
      <br/>
      Core Maintainer
    </td>
    <td align="center">
      <a href="https://github.com/ilikestohack">
        <img src="https://avatars0.githubusercontent.com/u/47259933?v=4&s=100" width="100px;" alt=""/>
        <br/>
        <sub>
          <b>ilikestohack</b>
        </sub>
      </a>
      <br/>
      Maintainer
    </td>
  </tr>
</table>

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://badboyhalocat.tk/"><img src="https://avatars0.githubusercontent.com/u/26350849?v=4?s=100" width="100px;" alt="BadBoyHaloCat"/><br /><sub><b>BadBoyHaloCat</b></sub></a><br /><a href="https://github.com/thetayloredman/Lexi/issues?q=author%3Athetayloredman" title="Bug reports">🐛</a> <a href="https://github.com/thetayloredman/Lexi/commits?author=thetayloredman" title="Code">💻</a> <a href="#data-thetayloredman" title="Data">🔣</a> <a href="https://github.com/thetayloredman/Lexi/commits?author=thetayloredman" title="Documentation">📖</a> <a href="#ideas-thetayloredman" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-thetayloredman" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-thetayloredman" title="Maintenance">🚧</a> <a href="#projectManagement-thetayloredman" title="Project Management">📆</a> <a href="#question-thetayloredman" title="Answering Questions">💬</a> <a href="https://github.com/thetayloredman/Lexi/pulls?q=is%3Apr+reviewed-by%3Athetayloredman" title="Reviewed Pull Requests">👀</a> <a href="#security-thetayloredman" title="Security">🛡️</a> <a href="https://github.com/thetayloredman/Lexi/commits?author=thetayloredman" title="Tests">⚠️</a></td>
      <td align="center"><a href="https://github.com/LostNuke"><img src="https://avatars1.githubusercontent.com/u/36674771?v=4?s=100" width="100px;" alt="LostNuke"/><br /><sub><b>LostNuke</b></sub></a><br /><a href="https://github.com/thetayloredman/Lexi/commits?author=LostNuke" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/Alcremie"><img src="https://avatars0.githubusercontent.com/u/54785334?v=4?s=100" width="100px;" alt="Ivan Lieder"/><br /><sub><b>Ivan Lieder</b></sub></a><br /><a href="#maintenance-Alcremie" title="Maintenance">🚧</a> <a href="https://github.com/thetayloredman/Lexi/commits?author=Alcremie" title="Code">💻</a> <a href="https://github.com/thetayloredman/Lexi/pulls?q=is%3Apr+reviewed-by%3AAlcremie" title="Reviewed Pull Requests">👀</a></td>
      <td align="center"><a href="https://www.linuxbad.com/"><img src="https://avatars1.githubusercontent.com/u/37817019?v=4?s=100" width="100px;" alt="JustAnotherDev"/><br /><sub><b>JustAnotherDev</b></sub></a><br /><a href="https://github.com/thetayloredman/Lexi/issues?q=author%3Ashadowplays4k" title="Bug reports">🐛</a></td>
      <td align="center"><a href="https://github.com/Nepgfurmixpro"><img src="https://avatars.githubusercontent.com/u/58635917?v=4?s=100" width="100px;" alt="Nepgfurmixpro"/><br /><sub><b>Nepgfurmixpro</b></sub></a><br /><a href="https://github.com/thetayloredman/Lexi/commits?author=Nepgfurmixpro" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/808-Dev"><img src="https://avatars.githubusercontent.com/u/63218975?v=4?s=100" width="100px;" alt="0v0Bot Admin"/><br /><sub><b>0v0Bot Admin</b></sub></a><br /><a href="#infra-808-Dev" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center"><a href="http://numselli.xyz"><img src="https://avatars.githubusercontent.com/u/58607232?v=4?s=100" width="100px;" alt="numselli"/><br /><sub><b>numselli</b></sub></a><br /><a href="#infra-numselli" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/thetayloredman/Lexi/issues?q=author%3Anumselli" title="Bug reports">🐛</a> <a href="https://github.com/thetayloredman/Lexi/commits?author=numselli" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/ilikestohack"><img src="https://avatars.githubusercontent.com/u/47259933?v=4?s=100" width="100px;" alt="charmines"/><br /><sub><b>charmines</b></sub></a><br /><a href="https://github.com/thetayloredman/Lexi/commits?author=ilikestohack" title="Code">💻</a></td>
      <td align="center"><a href="https://github.com/ei-pi"><img src="https://avatars.githubusercontent.com/u/91853103?v=4?s=100" width="100px;" alt="ei-pi"/><br /><sub><b>ei-pi</b></sub></a><br /><a href="#ideas-ei-pi" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
