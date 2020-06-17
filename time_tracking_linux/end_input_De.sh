#!/bin/bash
path=/home/admin1/time_tracking

while [[ !($name == "de") ]]; do
echo -n "Please enter name: "
read name
done

echo 'Ok';
echo $(date -R) >> $path/ends_input_De.txt;
