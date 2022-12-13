#!/bin/bash

# This script is used to evaluate the performance of the

value_size=$1

keyNumber=(5)

initHeaderCSV () {
  echo "id, key_number, value_size, put_duration[ms], get_duration[ms]" > $1
}

initHeaderCSV ./logs/orbitdb_stats_$value_size.csv

node ./index.js [${keyNumber[@]}] $value_size