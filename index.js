const fs = require("fs");

Date.prototype.getWeekNumber = function () {
  var d = new Date(
    Date.UTC(this.getFullYear(), this.getMonth(), this.getDate())
  );
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

let data;

try {
  data = fs.readFileSync("./log.txt", "utf8");
  //   console.log(data)
} catch (err) {
  console.error(err);
}

var regex = /app.service\('mentions'\).find\(\) - Query(.*\n)/g;

var r = `${data}`.match(regex);

console.log("data raw", r.length);

var filterSolr = r.filter((e) => e.includes("date_from"));

console.log("data query solr", filterSolr.length);

var regex1 = /{(.*)(})/g;

data = filterSolr.map((e) => {
  // console.log(e.match(re1))
  const { topic_id, date_from, date_to } = JSON.parse(e.match(regex1)[0]);
  return {
    topic_id,
    date_from: new Date(date_from),
    date_to: new Date(date_to),
  };
});

// console.log(data);

// handle

const statistical = (data) => {
  let total_same_week = 0;
  let total_same_month = 0;
  let total_same_2_months = 0;
  let total_same_3_months = 0;
  let total_same_year = 0;
  let about_query_number_of_times = {};
  data.forEach((e) => {
    if (
      e.date_from.getMonth() - e.date_to.getMonth() === 0 &&
      e.date_from.getYear() - e.date_to.getYear() === 0
    )
      total_same_month++;
    if (
      e.date_from.getWeekNumber() - e.date_to.getWeekNumber() === 0 &&
      e.date_from.getYear() - e.date_to.getYear() === 0
    )
      total_same_week++;
    if (
      e.date_from.getMonth() - e.date_to.getMonth() >= -2 &&
      e.date_from.getYear() - e.date_to.getYear() === 0
    )
      total_same_2_months++;
    if (
      e.date_from.getMonth() - e.date_to.getMonth() >= -3 &&
      e.date_from.getYear() - e.date_to.getYear() === 0
    )
      total_same_3_months++;
    if (e.date_from.getYear() - e.date_to.getYear() === 0) total_same_year++;
    // other++;
    const date = `${(
      (e.date_to - e.date_from) /
      (1000 * 60 * 60 * 24)
    ).toFixed()}`;

    about_query_number_of_times[date] = about_query_number_of_times[date] === undefined ? 1 : about_query_number_of_times[date] + 1;
  });

  return {
    total_same_week,
    total_same_month,
    total_same_2_months,
    total_same_3_months,
    total_same_year,
    about_query_number_of_times,
  };
};

console.log(statistical(data));
