# THE ONLY LEGITIMATE WAY TO START THE DISCORD BOT!
RESTART_DELAY_SECONDS="${RESTART_DELAY_SECONDS:-30}"

echo 'bootstrap: Lexi Auto-Restart Bootstrap';
echo 'bootstrap: This script will start Lexi with the correct environment variables.';
echo 'bootstrap: This script will also restart Lexi if it crashes.';
echo 'bootstrap: Environment set:'
echo 'bootstrap: RESTART_DELAY_SECONDS is set to '"${RESTART_DELAY_SECONDS}"' seconds.';
eprod="$PRODUCTION"
echo 'bootstrap:            PRODUCTION is set to '"${eprod:="0"}"'.';

while true; do
    echo 'bootstrap: Starting Lexi...';
    echo 'bootstrap: Cleaning dist tree...';
    ./clean.sh
    echo 'bootstrap: Getting current commit hash...';
    COMMIT_HASH="$(git rev-parse HEAD)";
    echo 'bootstrap: Running Lexi with commit '"$COMMIT_HASH"'.';
    echo 'bootstrap: Check for dirty source...'
    (git diff --quiet && DIRTYSOURCE=0) || DIRTYSOURCE=1
    eds="$DIRTYSOURCE"
    echo 'bootstrap: DIRTYSOURCE is set to '"${eds:="0"}"'.'
    if [[ ! -d ".pb-cache" ]]; then
        echo 'bootstrap: cacher: Creating .pb-cache directory...';
        mkdir .pb-cache
    fi
    if [[ ! -f ".pb-cache/package.json" || ! -f ".pb-cache/yarn.lock" ]]; then
        echo 'bootstrap: cacher: Missing package.json or yarn.lock, DIMMOD=1. Recache.';
        DIMMOD=1
        cp package.json .pb-cache/package.json
        cp yarn.lock .pb-cache/yarn.lock
    fi
    if [[ "$(cat package.json)" != "$(cat .pb-cache/package.json)" ]]; then
        echo 'bootstrap: cacher: package.json has changed, DIMMOD=1. Recache.';
        DIMMOD=1
        cp package.json .pb-cache/package.json
    fi
    if [[ "$(cat yarn.lock)" != "$(cat .pb-cache/yarn.lock)" ]]; then
        echo 'bootstrap: cacher: yarn.lock has changed, DIMMOD=1. Recache.';
        DIMMOD=1
        cp yarn.lock .pb-cache/yarn.lock
    fi
    if [[ "$DIMMOD" == 1 ]]; then
        echo 'bootstrap: dimmod: DIMMOD=1. Re-install dependencies.';
        yarn
    fi
    echo 'bootstrap: Compiling source tree...'
    yarn run build
    echo 'bootstrap: Setting CWD to dist/';
    (
        cd dist;
        echo 'bootstrap: Running Lexi...'
        echo 'bootstrap: Final env:'
        echo 'bootstrap:               PRODUCTION is set to '"${PRODUCTION}"'.';
        echo 'bootstrap:      LEXI_STARTSH_COMMIT is set to '"${COMMIT_HASH}"'.';
        echo 'bootstrap: LEXI_STARTSH_DIRTYSOURCE is set to '"${DIRTYSOURCE}"'.';

        PRODUCTION=$PRODUCTION LEXI_STARTSH_COMMIT="$COMMIT_HASH" LEXI_STARTSH_DIRTYSOURCE="$DIRTYSOURCE" yarn node -r source-map-support/register  --experimental-specifier-resolution=node .;
        EXIT="$?"
        if [ "$EXIT" -eq 9 ]; then
            echo 'bootstrap: Restarting instantly: exit code was 9 (RESTART)'
        elif [ "$EXIT" -eq 5 ]; then
            echo 'bootstrap: not restarting, exit code was 5 (EXIT_RECIEVED_TERM)'
            exit 5
        else
            echo 'bootstrap: Restarting in '"$RESTART_DELAY_SECONDS"' seconds. Press Ctrl+C to cancel.';
            sleep "$RESTART_DELAY_SECONDS"
        fi
    )
    if [[ "$?" -eq 5 ]]; then exit 0; fi
done;
