#!/bin/bash
# Lexi Install Script

# Colors
NOCOLOR='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
LIGHTGRAY='\033[0;37m'
DARKGRAY='\033[1;30m'
LIGHTRED='\033[1;31m'
LIGHTGREEN='\033[1;32m'
YELLOW='\033[1;33m'
LIGHTBLUE='\033[1;34m'
LIGHTPURPLE='\033[1;35m'
LIGHTCYAN='\033[1;36m'
WHITE='\033[1;37m'

# Define the prefixes used.
INFO_PREFIX="  ${LIGHTBLUE}[i]${NOCOLOR}"
QUESTION_PREFIX="  ${LIGHTCYAN}[?]${NOCOLOR}"
WARNING_PREFIX="  ${YELLOW}[!]${NOCOLOR}"
OK_PREFIX="  ${LIGHTGREEN}[✔]${NOCOLOR}"
ERROR_PREFIX="  ${LIGHTRED}[✖]${NOCOLOR}"

# Allow colors in echoing.
shopt -s expand_aliases
alias echo="echo -e"

echo_info() {
  echo "${INFO_PREFIX} $1"
}
echo_question() {
  echo -n "${QUESTION_PREFIX} $1 "
}
echo_warning() {
  echo "${WARNING_PREFIX} $1"
}
echo_ok() {
  echo "${OK_PREFIX} $1"
}
echo_error() {
  echo "${ERROR_PREFIX} $1"
}

# Intro
echo_info "OwO What's This?"
echo_info "Welcome to the Lexi Installer!"
echo_info "This script will guide you through the installation of Lexi."
echo ""

# Update repo
echo_info "Updating the repository..."
git_update_log="$(git pull)"
if [ $? -eq 0 ]; then
  echo_ok "Done!"
else
  echo_error "Failed!"
  echo_error "Please make sure you have git installed."
  echo_error "If you have git installed, please make sure you have a working internet connection."
  echo_warning "Try running 'git pull' yourself."
  echo_warning "Continuing out-of-date."
fi

echo ""
echo_info "Versioning information:"
git_log_text="$(git log -1 --pretty=%B | head -1)"
echo_info "  Running on commit ${YELLOW}$(git rev-parse HEAD)${NOCOLOR} by ${YELLOW}$(git log -1 | head -2 | tail -1 | sed 's/Author: //g')${NOCOLOR}."
echo_info "  Commit title:     ${LIGHTCYAN}${git_log_text}${NOCOLOR}"
echo ""

# Dependency check.
echo_info "Checking for needed dependencies..."

does_have_deps=1;
check_dependency() {
    if [ -x "$(command -v $1)" ]; then
        if [[ "$2" == "" ]]; then
            echo_ok "  $1: ${GREEN}Found${NOCOLOR}"
        else
            echo_ok "  $1: ${GREEN}Found${NOCOLOR} $($1 $2 | head -1)"
        fi
    else
        echo_error "  $1: ${RED}Not found${NOCOLOR}"
        if [[ "$does_have_deps" -eq 1 ]]; then does_have_deps=0; fi
    fi
}

# The flags are the executable name and the version argument, if
# applicable. This argument is used to display the first line of
# the program version.
check_dependency bash --version
check_dependency node --version
check_dependency curl --version
check_dependency grep --version
check_dependency head --version
check_dependency tail --version
check_dependency sort --version
check_dependency npm --version
check_dependency yarn --version
check_dependency git --version
check_dependency sed --version
check_dependency awk --version
check_dependency wc --version

if [[ "$does_have_deps" -eq 0 ]]; then
    echo_error "  ${RED}Not all dependencies were found.${NOCOLOR}"
    echo_error "  Please install the missing dependencies and try again."
    exit 1
fi

# Ensure we are on Node 16.
echo "if (parseInt(process.version.split('.')[0].replace('v', '')) < 18) process.exit(1)" | node
if [ $? -eq 1 ]; then
  echo_error "  ${RED}You need to be running Node 18 or higher.${NOCOLOR}"
  echo_error "  Please update your Node version and try again."
  exit 1
fi
# Ensure we are on an EVEN Node version
echo "if (parseInt(process.version.split('.')[0].replace('v', '')) % 2 !== 0) process.exit(1)" | node
if [ $? -eq 1 ]; then
    echo_error "  ${RED}You need to be running an even-numbered (stable) Node version.${NOCOLOR}"
    echo_error "  Please update your Node version and try again."
    exit 1
fi

echo_ok "Node version OK!"

echo ""
echo_info "Now I'm going to ask you a few questions about your system."
echo_info "We can start the bot automatically on boot via PM2, a Node application. This will require root access."
echo_info "${YELLOW}If you don't know what this means, just press enter.${NOCOLOR}"
echo_question "Do you want to enable automatic start on boot via PM2? [y/N]"
read pm2_auto_start
case "$pm2_auto_start" in
    [yY]*)
        echo_info "Enabling automatic start on boot via PM2..."
        if [ -x "$(command -v pm2)" ]; then
            echo_ok "  PM2 found!"
            sudo pm2 startup
            echo_ok "  PM2 auto-start enabled!"
            echo_warning "${YELLOW}### You will need to execute pm2 start yourself the first time. ###${NOCOLOR}"
        else
            echo_error "  PM2 not found, aborting..."
            exit 1
        fi
        echo_ok "Done!"
        ;;
        *)
        echo_ok "Not enabling automatic start on boot via PM2..."
        ;;
esac
echo ""

if [[ -f src/config.ts ]]; then
    echo_warning "The file src/config.ts already exists!"
    echo_warning "This means you have already configured the bot."
    echo_warning "If you want to reconfigure the bot, please delete src/config.ts and run this script again."
    echo_warning "Due to this, we are skipping the configuration generation steps."
    echo_warning "Press Enter to continue..."
    read
else
    echo_info "Now I need to ask... what is your bot token?"
    echo_question "Please enter your bot token [no echo]:"
    read -s bot_token
    echo ""

    echo_info "What is your Discord user ID?"
    echo_warning "THIS MUST BE YOUR USER ID, or your bot may be compromised!"
    echo_question "Please enter your Discord user ID:"
    read discord_user_id

    echo_info "Bot information read, generating configuration..."

    cp src/config.rename-me.ts src/config.ts
    sed -i "s/PBCONF-DiscordBotToken/$bot_token/g" src/config.ts
    sed -i "s/PBCONF-DiscordUserID/$discord_user_id/g" src/config.ts
    echo_ok "Config written!"
fi
echo ""

echo_info "Install dependencies..."
yarn
echo_ok "Dependencies installed."

echo ""

echo_ok "All done!"
echo_info "We should be ready for action now. Run ./start.sh to start the bot."
echo_info "PM2 users: please run 'pm2 start ecosystem.config.js' to start the bot."
echo_info "PM2 autostart users: run 'pm2 save'."
echo_info "If there was a build error, install build-essential and then re-run this script."
