# run me instead of "node ." to support
# restarts.

echo 'Starting!';

while true; do
    tsc;
    cd dist;
    node .;
    if [[ "$?" -eq 9 ]]; then
        echo 'Restarting instantly: exit code was 9 (RESTART)'
    else
        echo 'Restarting in 3 seconds. Press Ctrl+C to cancel.';
        sleep 3
    fi
    cd ..
done;
