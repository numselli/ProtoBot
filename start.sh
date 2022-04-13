# THE ONLY LEGITIMATE WAY TO START THE DISCORD BOT!
RESTART_DELAY_SECONDS="${RESTART_DELAY_SECONDS:-30}"

echo 'bootstrap: ProtoBot Auto-Restart Bootstrap';
echo 'bootstrap: This script will start ProtoBot with the correct environment variables.';
echo 'bootstrap: This script will also restart ProtoBot if it crashes.';
echo 'bootstrap: Environment set:'
echo 'bootstrap: RESTART_DELAY_SECONDS is set to '"${RESTART_DELAY_SECONDS}"' seconds.';
eprod="$PRODUCTION"
echo 'bootstrap:            PRODUCTION is set to '"${eprod:="0"}"'.';

while true; do
    echo 'bootstrap: Starting ProtoBot...';
    echo 'bootstrap: Cleaning dist tree...';
    ./clean.sh
    echo 'bootstrap: Getting current commit hash...';
    COMMIT_HASH="$(git rev-parse HEAD)";
    echo 'bootstrap: Running ProtoBot with commit '"$COMMIT_HASH"'.';
    echo 'bootstrap: Check for dirty source...'
    (git diff --quiet && DIRTYSOURCE=0) || DIRTYSOURCE=1
    eds="$DIRTYSOURCE"
    echo 'bootstrap: DIRTYSOURCE is set to '"${eds:="0"}"'.'
    if [[ ! -d ".pb-cache" ]]; then
        echo 'bootstrap: cacher: Creating .pb-cache directory...';
        mkdir .pb-cache
    fi
    if [[ ! -f ".pb-cache/package.json" || ! -f ".pb-cache/package-lock.json" ]]; then
        echo 'bootstrap: cacher: Missing package.json or package-lock.json, DIMMOD=1. Recache.';
        DIMMOD=1
        cp package.json .pb-cache/package.json
        cp package-lock.json .pb-cache/package-lock.json
    fi
    if [[ "$(cat package.json)" != "$(cat .pb-cache/package.json)" ]]; then
        echo 'bootstrap: cacher: package.json has changed, DIMMOD=1. Recache.';
        DIMMOD=1
        cp package.json .pb-cache/package.json
    fi
    if [[ "$(cat package-lock.json)" != "$(cat .pb-cache/package-lock.json)" ]]; then
        echo 'bootstrap: cacher: package-lock.json has changed, DIMMOD=1. Recache.';
        DIMMOD=1
        cp package-lock.json .pb-cache/package-lock.json
    fi
    if [[ "$DIMMOD" == 1 ]]; then
        echo 'bootstrap: dimmod: DIMMOD=1. Re-install dependencies.';
        npm install
    fi
    echo 'bootstrap: Compiling source tree...'
    npm run build
    echo 'bootstrap: Setting CWD to dist/';
    cd dist;
    echo 'bootstrap: Running ProtoBot...'
    echo 'bootstrap: Final env:'
    echo 'bootstrap:                   PRODUCTION is set to '"${PRODUCTION}"'.';
    echo 'bootstrap:      PROTOBOT_STARTSH_COMMIT is set to '"${COMMIT_HASH}"'.';
    echo 'bootstrap: PROTOBOT_STARTSH_DIRTYSOURCE is set to '"${DIRTYSOURCE}"'.';

    PRODUCTION=$PRODUCTION PROTOBOT_STARTSH_COMMIT="$COMMIT_HASH" PROTOBOT_STARTSH_DIRTYSOURCE="$DIRTYSOURCE" node --experimental-specifier-resolution=node .;
    if [ "$?" -eq 9 ]; then
        echo 'bootstrap: Restarting instantly: exit code was 9 (RESTART)'
    else
        echo 'bootstrap: Restarting in '"$RESTART_DELAY_SECONDS"' seconds. Press Ctrl+C to cancel.';
        sleep $RESTART_DELAY_SECONDS
    fi
    cd ..
done;
