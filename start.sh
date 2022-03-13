# THE ONLY LEGITIMATE WAY TO START THE DISCORD BOT!
RESTART_DELAY_SECONDS="${RESTART_DELAY_SECONDS:-30}"

echo 'bootstrap: ProtoBot Auto-Restart Bootstrap';
echo 'bootstrap: This script will start ProtoBot with the correct environment variables.';
echo 'bootstrap: RESTART_DELAY_SECONDS is set to '"${RESTART_DELAY_SECONDS}"' seconds.';
eprod="$PRODUCTION"
echo 'bootstrap:            PRODUCTION is set to '"${eprod:="0"}"'.';

while true; do
    echo 'bootstrap: Getting current commit hash...';
    COMMIT_HASH="$(git rev-parse HEAD)";
    echo 'bootstrap: Running ProtoBot with commit '"$COMMIT_HASH"'.';
    echo 'bootstrap: Check for dirty source...'
    (git diff --quiet && DIRTYSOURCE=0) || DIRTYSOURCE=1
    echo 'bootstrap: DIRTYSOURCE is set to '"$DIRTYSOURCE"'.'
    echo 'bootstrap: Compiling...'
    tsc;
    echo 'bootstrap: Setting CWD to dist/';
    cd dist;
    echo 'bootstrap: Running ProtoBot...'
    PRODUCTION=$PRODUCTION PROTOBOT_STARTSH_COMMIT="$COMMIT_HASH" PROTOBOT_STARTSH_DIRTYSOURCE="$DIRTYSOURCE" node .;
    if [ "$?" -eq 9 ]; then
        echo 'bootstrap: Restarting instantly: exit code was 9 (RESTART)'
    else
        echo 'bootstrap: Restarting in '"$RESTART_DELAY_SECONDS"' seconds. Press Ctrl+C to cancel.';
        sleep $RESTART_DELAY_SECONDS
    fi
    cd ..
done;
