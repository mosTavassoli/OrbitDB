#!/bin/bash

# This script is used to evaluate the performance of the

value_size=$1


keyNumber=(1,10,30,50,80,100)

initHeaderCSV () {
  echo "id,key_number,value_size,put_duration,get_duration,del_duration" > $1
}

initHeaderCSV ./logs/orbitdb_stats_$value_size.csv

nodemon ./APIs.js [${keyNumber[@]}] $value_size

# --no-warnings 
