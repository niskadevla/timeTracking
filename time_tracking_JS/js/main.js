'use strict';

//@param - [Object]
// {name: [url1, url2, url3]}
// Data structure
/*
const date = {
  'Андрей': {starts_wifi: [
              Date Mon Feb 17 2020 10:10:41 GMT+0200 (Восточная Европа, стандартное время),
          ​​​      Date Wed Feb 19 2020 08:36:26 GMT+0200 (Восточная Европа, стандартное время),
          ​      Date Fri Feb 21 2020 08:47:06 GMT+0200 (Восточная Европа, стандартное время),
              ...
            ],
            ends_wifi: `[
              Date Sun Feb 16 2020 18:28:00 GMT+0200 (Восточная Европа, стандартное время),
          ​​​    Date Mon Feb 17 2020 19:34:00 GMT+0200 (Восточная Европа, стандартное время),
          ​    Date Tue Feb 18 2020 19:36:00 GMT+0200 (Восточная Европа, стандартное время),
              ...
            ],
            starts: `${path}starts_An.txt`,
            ends: `${path}ends_An.txt`,
            starts_input: `${path}starts_input_An.txt`,
            ends_input: `${path}ends_input_An.txt`
          },
  'Денис': {starts_wifi: `${path}starts_wifi_De.txt`,
            ends_wifi: `${path}ends_wifi_De.txt`,
            starts: `${path}starts_De.txt`,
            ends: `${path}ends_De.txt`,
            starts_input: `${path}starts_input_De.txt`,
            ends_input: `${path}ends_input_De.txt`
          }
};
*/

const path = './data/';

const param = {
  'Андрей': {starts_wifi: `${path}starts_wifi_An.txt`,
            ends_wifi: `${path}ends_wifi_An.txt`,
            starts: `${path}starts_An.txt`,
            ends: `${path}ends_An.txt`,
            starts_input: `${path}starts_input_An.txt`,
            ends_input: `${path}ends_input_An.txt`
          },
  'Денис': {starts_wifi: `${path}starts_wifi_De.txt`,
            ends_wifi: `${path}ends_wifi_De.txt`,
            starts: `${path}starts_De.txt`,
            ends: `${path}ends_De.txt`,
            starts_input: `${path}starts_input_De.txt`,
            ends_input: `${path}ends_input_De.txt`
          }
};

const root = document.getElementById('root');
root.className = 'root';

const wrapper = document.createElement('div');
wrapper.className = 'wrapper';
root.appendChild(wrapper);

const ANDREY_SEC = 0;
const DENIS_SEC = 36000; //10ч

const DAYS_OF_WEEK = {
  0: 'вс',
  1: 'пн',
  2: 'вт',
  3: 'ср',
  4: 'чт',
  5: 'пт',
  6: 'сб'
};

const MONTHES_OF_YEAR = {
  0: 'Январь',
  1: 'Февраль',
  2: 'Март',
  3: 'Апрель',
  4: 'Май',
  5: 'Июнь',
  6: 'Июль',
  7: 'Август',
  8: 'Сентябрь',
  9: 'Октябрь',
  10: 'Ноябрь',
  11: 'Декабрь'
};

Number.prototype.fromMSecToSec = function() {
  return this / 1000;
}

Number.prototype.fromSecToDay = function() {
  let totalTime = this;
  const totalDD = Math.floor(totalTime / 3600 / 24);
  const totalHH = Math.floor( (totalTime / 3600 / 24 - totalDD) * 24);
  const totalMM = Math.floor( ((totalTime / 3600 / 24 - totalDD) * 24 - totalHH) * 60);
  const totalSS = totalTime - totalDD * 3600 * 24 - totalHH * 3600 - totalMM * 60 ;

  return {
    dd: totalDD,
    hh: totalHH,
    mm: totalMM,
    ss: totalSS
  };
}


//Get Data
const getData = async url => {
   const res = await fetch(url);

   if(res.ok) {
     return res.text();
   } else {
     throw new Error(`Cannot get data ${url}`);
   }
}

const getAllData = async () => {
  //All data after fetch
  const data = {};

  for(let name in param) {
    data[name] = {};

    for (let key in param[name]) {
      data[name][key] = await getData(param[name][key]);
    }
  }

  return data;
}
//***


function parseData(data) {
  const newData = {};

  for(let name in data) {
    newData[name] = {};

    //Парсим данные вайфай, удаляем с этой же датой данные
    newData[name].starts_wifi = removeSimilarStarts( parseWifiData(data[name].starts_wifi) );
    newData[name].ends_wifi = removeSimilarEnds( parseWifiData(data[name].ends_wifi) );

    //Парсим данные старт и енд, удаляем с этой же датой данные
    newData[name].starts = removeSimilarStarts( parseSingleDate(data[name].starts) );
    newData[name].ends = removeSimilarEnds( parseEndsData(data[name].ends) );

    //Парсим данные starts_input, ends_input, а потом удаляем с одинаковой датой
    newData[name].starts_input = removeSimilarStarts( parseSingleDate(data[name].starts_input) );
    newData[name].ends_input = removeSimilarEnds( parseSingleDate(data[name].ends_input) );

    //Складываем в один массив енды и старты со всех данных, если работал один чел
    newData[name].allStartsOne = removeSimilarStarts(newData[name].starts_wifi.
                                                  concat(newData[name].starts));
    newData[name].allEndsOne = removeSimilarEnds(newData[name].ends_wifi.
                                                  concat(newData[name].ends));

    //Складываем в один массив енды и старты со всех данных, если работали два человека
    newData[name].allStartsTwo = removeSimilarStarts(newData[name].starts_wifi.
                                                  concat(newData[name].starts_input));
    newData[name].allEndsTwo = removeSimilarEnds(newData[name].ends_wifi.
                                                  concat(newData[name].ends_input));
  }

  return newData;
}

function parseSingleDate(str) {
  let starts = str.split('\n') //Array of computer running [String]
  starts = removeEmpty(starts);
  starts = starts.map(s => new Date(s.trim()
                                      .slice(3)
                                      .trim())); //Skip day of week
                                                //Array of computer running [Object (Dates)]

  return starts;
}

function parseEndsData(str) {
  let ends = str.split('\n'); // Array of computer shutdowns [String]
  ends = removeEmpty(ends);
  ends = ends.map( s => new Date(removeEmpty(s.split(' '))
                                             .slice(4,8)
                                             .join(' ')
                                             + ' '
                                             + s.slice(-4)));// Array of computer shutdowns [Object (Dates)]

  return ends;
}

function parseWifiData(str) {
  let starts = str.split('\n') //Array of computer running [String]
  starts = removeEmpty(starts);
  starts = starts.map(s => new Date( removeEmpty(s.trim()
                                                  .split(' '))
                                                  .slice(2)
                                                  .join(' ') )); //Array of computer running [Object (Dates)]

  return starts;
}

function isSameDate(date1, date2) {
  return date2 && (
     date1.getFullYear() === date2.getFullYear() &&
     date1.getMonth() === date2.getMonth() &&
     date1.getDate() === date2.getDate()
  );
}

function getSameDate(start, ends) {
  return ends.find(end => isSameDate(start, end));
}

function isLessTen(val) {
  return val < 10 ? '0' + val : val;
}

function removeEmpty(arr) {
  return arr.filter(el => el ? el : false);
}

function sortAscending(array) {
  array.sort( (a,b) => a - b );
}

function sortDescending(array) {
  array.sort( (a,b) => b - a );
}

function removeSimilarDate(arr) {
  for(let i = 0; i < arr.length - 1; i++) {
    for(let k = i + 1; k < arr.length; k++) {
      //Validate if arr[i] === null, assign new Date(0);
      let prevDate = arr[i] || new Date(0);
      let currDate = arr[k] || new Date(0);

      //If there is date in the array, so assing null instead of value
      if( prevDate.getDate() === currDate.getDate() &&
          prevDate.getMonth() === currDate.getMonth() &&
          prevDate.getYear() === currDate.getYear() ) {
             arr[k] = null;
      }
    }
  }
}

function removeSimilarStarts(array) {
  let newArr = [...array];

  sortAscending(newArr);
  removeSimilarDate(newArr);

  return removeEmpty(newArr);
}

function removeSimilarEnds(array) {
  let newArr = [...array];

  sortDescending(newArr);
  removeSimilarDate(newArr);
  sortAscending(newArr);

  return removeEmpty(newArr);
}

//Делаем конечный объект данных, где сравниваются перкрестно все данные
//И получаем конечный объект, где только ends и starts
function getDataAfterCompare(data) {
  const newData = {};
  //Конечный объект данных будет иметь только два св-ва для каждого человека.
  //Если общий день, то вместо даты будет массив с двумя одинаковыми датами
  for(let name in data) {
    newData[name] = {
      'newStarts': [],
      'newEnds': []
    };
  }

  //Сравнение даты происходит по: день/мес/год
  //Если день/мес/год одного и второго человека совпал, то это общий день.
  const names = Object.keys(data);

  for(let i = 0; i < names.length; i++) {
    data[names[i]].allStartsOne.forEach(date1 => {
      //Проверка на общий день
      //Проверяем по wifi и starts_input
      const otherName = names[i + 1] || names[0];
      if( data[otherName].allStartsOne.some(date2 => isSameDate(date1, date2)) ) {
        let newStart = getSameDate(date1, data[names[i]].allStartsTwo);
        //Если не найдет енда, чтоб не было undefined, то присвоим старт
        //Соответственно в HTML таблице кол-во отработанных минут за день = ноль
        let newEnd = getSameDate(date1, data[names[i]].allEndsTwo) || newStart;
        console.log('i = ', i, ') newStart = ', newStart, ' | newEnd = ', newEnd);

        //Если старта нет, то делаем так, чтоб в таблице кол-во минут = 0
        //(newStart - newEnd == 0)
        if (!newStart) {
          newStart = date1;
          newEnd = date1;
        }

        //newStart помещаем в массив, чтоб при рендеринге было понятно, что это общий день
        newData[names[i]].newStarts.push([newStart]);
        newData[names[i]].newEnds.push(newEnd);
      }
      //Если НЕ общий день, то сравниваем по wifi и starts.
      //Находим, какой из "ендов" был последним и вносим в ends
      else {
        newData[names[i]].newStarts.push(date1);
        const newEnd = getSameDate(date1, data[names[i]].allEndsOne);
        newData[names[i]].newEnds.push(newEnd);
      }
    });
  }

  return newData;
}


function render(data, name) {
  const starts = data[name].newStarts,
      ends = data[name].newEnds;

  const out = document.createElement('div');
  out.className = 'wrap';

  const table = document.createElement('table');
  table.className = 'table';

  let html = `
    <thead>
      <tr>
        <td>ДН дд/мм/гг</td>
        <td>Нач работы</td>
        <td>Конец работы</td>
        <td>Время пров. на работе</td>
      </tr>
    </thead>
    <tbody>`;

  out.innerHTML = `<h2 class="title">${name}</h2>`;
  let year;
  let month;
  let totalTime = 0;

  starts.forEach( date => {
    let isNewYear;
    let isNewMonth;
    const isCommonDay = Array.isArray(date) ? 'common-day' : '';
    date = Array.isArray(date) ? date[0] : date;
    const endDate = getSameDate(date, ends);
    const curTotalTime = (endDate - date).fromMSecToSec() || 0; //Seconds

    totalTime += curTotalTime;

    //Определяем Новый год или новый месяц?
    if(year !== date.getFullYear()) {
      year = date.getFullYear();
      isNewYear = true;
    }

    if(month !== date.getMonth()) {
      month = date.getMonth();
      isNewMonth = true;
    }

    const hh = isLessTen(date.getHours());
    const mm = isLessTen(date.getMinutes());
    const ss = isLessTen(date.getSeconds());

    let hhE = endDate ? endDate.getHours() : '';
    let mmE = endDate ? endDate.getMinutes() : '';
    let ssE = endDate ? endDate.getSeconds() : '';

    hhE = isLessTen(hhE);
    mmE = isLessTen(mmE);
    ssE = isLessTen(ssE);

    const yearHtml = isNewYear ? `<tr><th colspan="4">${year}</th></tr>` : '';
    const monthHtml = isNewMonth ? `<tr><th colspan="4">${MONTHES_OF_YEAR[month]}</th></tr>` : '';

    const curTotalHH = Math.floor(curTotalTime / 3600);
    const curTotalMM = Math.floor((curTotalTime / 3600 - curTotalHH) * 60);
    const curTotalSS = curTotalTime - curTotalHH * 3600 - curTotalMM * 60 ;

    const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
    const isWeekend = (date.getDay() === 0 || date.getDay() === 6) ? 'weekend' : '';
    const error =  curTotalTime ? '' : 'error';

    html += `
      ${yearHtml}
      ${monthHtml}
      <tr class="${isWeekend} ${isCommonDay}">
        <td>${dayOfWeek} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}</td>
        <td>${hh}:${mm}:${ss}</td>
        <td>${hhE}:${mmE}:${ssE}</td>
        <td class="${error}">${curTotalHH}ч:${curTotalMM}мин:${curTotalSS}сек</td>
      </tr>
    `;
  });

  data[name].allTime = totalTime;

  const totalDD = Math.floor(totalTime / 3600 / 24);
  const totalHH = Math.floor( (totalTime / 3600 / 24 - totalDD) * 24);
  const totalMM = Math.floor( ((totalTime / 3600 / 24 - totalDD) * 24 - totalHH) * 60);
  const totalSS = totalTime - totalDD * 3600 * 24 - totalHH * 3600 - totalMM * 60 ;

  let tfoot = `
    <tfoot>
      <tr>
        <td colspan="3">Всего времени (за все года) в сек: </td>
        <td>${totalTime}сек</td>
      </tr>
      <tr>
        <td colspan="3">Всего времени (за все года) переведено: </td>
        <td>${totalDD}д ${totalHH}ч:${totalMM}м:${totalSS}с</td>
      </tr>
    </tfoot>
  `;

  html += `
    </tbody>
    ${tfoot}
  `;

  table.innerHTML = html;

  out.append(table);
  wrapper.append(out);
}


//Render time from previous years and all years
function renderTotal(data) {
  const p = document.createElement('p');
  p.className = 'total-time';

  let dif = data["Андрей"].allTime - data["Денис"].allTime;
  // const whoWorkedLess = dif < 0 ? Object.keys(param)[0] : Object.keys(param)[1];
  const whoWorkedLess = dif < 0 ? "Андрей" : "Денис";
  dif = Math.abs(dif).fromSecToDay();

  let html = `
    <span>${whoWorkedLess} проработал меньше на: </span>
    <strong>${dif.dd}дней ${dif.hh}часов ${dif.mm}минут ${dif.ss}сек</strong>
  `;
  p.innerHTML = html;

  root.append(p);
}
//***

//********
//Initial
//********
function runProgram(data) {
  const dataAfterCompare = getDataAfterCompare( parseData(data) );

  for(let name in dataAfterCompare) {
    render(dataAfterCompare, name);
  }

  dataAfterCompare["Андрей"].allTime += ANDREY_SEC;
  dataAfterCompare["Денис"].allTime += DENIS_SEC;

  renderTotal(dataAfterCompare);

  console.log('dataAfterCompare = ', dataAfterCompare);
}

getAllData().then(runProgram);
