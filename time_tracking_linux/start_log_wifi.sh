#!/bin/bash
path=/home/admin1/time_tracking

#For Denis
start=$path/starts_wifi_De.txt;
end=$path/ends_wifi_De.txt;
macDe='';
macDe=`nmap -sP 192.168.0.1/24 | grep 'MAC' | awk '{print $3}' | grep '11:FC:12:3E:37:DC'`;
macSa=`nmap -sP 192.168.0.1/24 | grep 'MAC' | awk '{print $3}' | grep 'FA:11:8F:BF:02:44'`;

#only read: day, month, year
curDate=$(echo $(date -R) | awk '{print $2,$3,$4}');

#find the last date in the file and only read: day, month, year
lastDateStart=$(tail -n 1 $start | awk '{print $3,$4,$5}');
lastDateEnd=$(tail -n 1 $end | awk '{print $3,$4,$5}');

#For start
if [ "$curDate" != "$lastDateStart" ]; then 
  if [ "$macDe" == '11:FC:12:3E:37:DC' ]; then
   echo $macDe $(date -R) >> $start; 
  elif [ "$macSa" == 'FA:11:8F:BF:02:44' ]; then
   echo $macSa $(date -R) >> $start; 
  fi
fi

#For end
if [ "$curDate" != "$lastDateEnd" ]; then 
  if [ "$macDe" == '11:FC:12:3E:37:DC' ]; then
   echo $macDe $(date -R) >> $end;   
  elif [ "$macSa" == 'FA:11:8F:BF:02:44' ]; then
   echo $macSa $(date -R) >> $end; 
  fi
else
  if [ "$macDe" == '11:FC:12:3E:37:DC' ]; then
   sed -i '$d' $end;
   echo $macDe $(date -R) >> $end;   
  elif [ "$macSa" == 'FA:11:8F:BF:02:44' ]; then
   sed -i '$d' $end;
   echo $macSa $(date -R) >> $end; 
  fi
fi



