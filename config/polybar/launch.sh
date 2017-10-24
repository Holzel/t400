#Terminate already running bar instances
killall -q polybar

# wait until the processes have been shut down
while pgrep -x polybar </dev/null; do sleep 1; done

# launch bar1 and bar2
polybar example &

echo "Bars launched....."
