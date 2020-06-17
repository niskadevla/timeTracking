#!/bin/bash
path=/home/admin1/time_tracking
start=$(ps -o lstart 1 | tail -n 1);
year=$(last -x | grep -o -E '[0-9]{4}$');
echo $start >> $path/starts_log.txt;

end=$(last -x | grep shutdown | head -1);
echo "$end $year" >> $path/ends_log.txt;
echo "$end $year" >> $path/ends_De.txt;
