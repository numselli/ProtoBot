<div align="center">

# ProtoBot

</div>

<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-7-orange.svg?style=for-the-badge)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->

<div align="center">

## An update on the status of ProtoBot development

</div>

> Hi. My name is [0xLogN](https://logn.tk/) also known as [@thetayloredman](https://github.com/thetayloredman). I am a software developer and I am currently the maintainer of this project (ProtoBot).
>
> Due to a lack of developer resources and the fact that I am a student, I am currently at a slow point in ProtoBot development. I hit a peak in the last few weeks and I am currently working on a few new core features, but I am not going to be able to keep up the pace. There are not many new features coming in, and **ProtoBot is basically on life-support**. In order to bring the project back, I'm going to need a _LOT_ of help.
>
> Send me a DM on discord `@LogN#1826` and I will allow feature requests directly, or you can create an issue (_recommended_). **Please.** Help me bring this project back. (v3 eventually?)

<div align="center">

## What is ProtoBot?

</div>

ProtoBot is a powerful Discord bot for furries and alike! It contains a variety of commands that can be used to make your server more fun and interactive.

[Add me to your server!](https://discord.com/api/oauth2/authorize?client_id=769227328387416084&permissions=518151064640&scope=bot)

<div align="center">

## Installing and Setup

</div>

The following steps will help you get ProtoBot up and running on your computer.

We support **Linux** and **macOS 11 or greater**. Any Windows/OSX bugs will be treated with LOW PRIORITY, and we will not consider
adding install/start scripts in Batch any time in the future. WSL is supported and recommended if you are to host using Windows, and we suggest using PM2 for process management.

### CONSIDER THE FOLLOWING BEFORE CONTINUING WITH THE INSTALLATION!

ProtoBot is a public Discord bot because we wanted to enforce open-source ruling and allow for the growth of the community.

One of the things we have considered is people forking off on their own, and not contributing to the project. If you have something you'd like to see
added to the project, please consider contributing to the project, instead of self-hosting.

Plus, ProtoBot relies on plenty of external services to function. Self-Hosting of ProtoBot is not endorsed!

### 1. Install Prerequisites

#### Node.js

Follow the installation steps for [Node.js v16](https://nodejs.org/en/)

Then install TypeScript: `npm install -g typescript`

#### Build-Essential

Install `build-essential` for your system; it should be available on macOS via the build tools in XCode.

#### Git

Ensure [Git](https://git-scm.com/) is installed. On Linux, install it with your package manager, the package is probably named `git`.

### 2. Download Source Code

In the destination folder (this can be moved later), run this command:

```bash
git clone https://github.com/thetayloredman/ProtoBot.git
```

### 3. Preparing Configuration and Dependencies

Execute `./install.sh`.

> One of the questions the installer asks is very important:
> **_WARNING: DO NOT GIVE ANYBODY YOU DO NOT KNOW VERY WELL OWNER ACCESS!_**  
> **ANYONE WITH OWNER ACCESS CAN GET DIRECT ACCESS TO A SHELL ON YOUR SYSTEM.**  
> **I REPEAT, _NOBODY_ GETS OWNER ACCESS. I AM NOT RESPONSIBLE FOR ANY DAMAGE CAUSED IF YOU DO NOT OBEY THIS.**
> Anyone with this user ID can access _any_ file on your system. **Keep. The. Owner. Account. Secure.** I suggest using 2FA on it.

**Hey, did you read that thing above me? If not, read it. Did you read it? Read it again. This is serious.**

### 4. First Startup

#### Normal Run

Run `./start.sh`.

FOR PRODUCTION ENVIRONMENTS: Run `PRODUCTION=1 ./start.sh`

#### With [PM2](https://pm2.keymetrics.io/)

[PM2](https://pm2.keymetrics.io/) is a process manager for Node.js. It is a good alternative to using the normal start scripts.

First, ensure PM2 is installed: `npm i -g pm2`

Optionally, enable PM2 to automatically start as a daemon: `pm2 startup`

Then, run `pm2 start ecosystem.config.js` (add `--env production` if you want to run in production)

If you want daemon startup, run `pm2 save`.

### 5. Logging

Logs will automatically be created and manual maintenance is needed for cleaning these up.

## Notable Mentions

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
      Maintainer
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
      existing
    </td>
  </tr>
</table>

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
    <td align="center"><a href="https://github.com/808-Dev"><img src="https://avatars.githubusercontent.com/u/63218975?v=4?s=100" width="100px;" alt=""/><br /><sub><b>0v0Bot Admin</b></sub></a><br /><a href="#infra-808-Dev" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="http://numselli.xyz"><img src="https://avatars.githubusercontent.com/u/58607232?v=4?s=100" width="100px;" alt=""/><br /><sub><b>numselli</b></sub></a><br /><a href="#infra-numselli" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/thetayloredman/ProtoBot/issues?q=author%3Anumselli" title="Bug reports">🐛</a> <a href="https://github.com/thetayloredman/ProtoBot/commits?author=numselli" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
