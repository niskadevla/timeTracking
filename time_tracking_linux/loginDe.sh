#!/bin/bash
path=/home/admin1/time_tracking
while [[ !($name == "de") ]]; do
echo -n "Please enter name: "
read name
done

start=$(ps -o lstart 1 | tail -n 1);
echo 'Ok';
echo "$start" >> $path/starts_De.txt;
echo $(date -R) >> $path/starts_input_De.txt;
