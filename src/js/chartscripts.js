export function calculateMA(dayCount, data) {
  // eslint-disable-next-line no-console
  //console.log(data);
  var result = [];
  for (var i = 0, len = data.length; i < len; i++) {
    if (i < dayCount) {
      result.push([data[i][0], "-"]);
      continue;
    }
    var sum = 0;
    for (var j = 0; j < dayCount; j++) {
      sum += data[i - j][1];
    }
    // eslint-disable-next-line no-console
    //console.log(sum / dayCount);
    // eslint-disable-next-line no-console
    //console.log(sum);
    result.push([data[i][0], scale_to_percent(sum / dayCount)]);
  }
  return result;
}

export function calculateSMA(data, dayCount) {
  var result = [];
  for (var i = 0, len = data.length; i < len; i++) {
    if (i < dayCount) {
      result.push(data[i]);
      continue;
    }
    var sum = 0;
    for (var j = 0; j < dayCount; j++) {
      sum += data[i - j];
    }
    result.push(sum / dayCount);
  }
  return result;
}

export function calculatePctOfTrades(tradesCount, allTrades) {
  var profits = [];
  var losses = [];
  for (var i = 0, len = allTrades.length; i < len; i++) {
    if (i < tradesCount) {
      profits.push([allTrades[i].date, "-"]);
      losses.push([allTrades[i].date, "-"]);
      continue;
    }
    var posTurnover = 0;
    for (var j = 0; j < tradesCount; j++) {
      if (allTrades[i - j].turnover > 0) {
        posTurnover += 1;
      }
    }

    profits.push([
      allTrades[i].date,
      scale_to_percent(posTurnover / tradesCount),
    ]);
    losses.push([
      allTrades[i].date,
      scale_to_percent((tradesCount - posTurnover) / tradesCount),
    ]);
  }
  return [profits, losses];
}

export function scale_to_percent(value_to_scale) {
  value_to_scale = value_to_scale* 100.0
  var retVal = Math.round(value_to_scale * 10) / 10
  // eslint-disable-next-line no-console
  //console.log(retVal);
  return retVal;
}

export function calculateExpectancyValue(
  winRate,
  lossRate,
  profitableTradesMA20,
  lossTradesMA20
) {
  var expVal = [];
  var minLength = Math.min(profitableTradesMA20.length, lossTradesMA20.length);
  // eslint-disable-next-line no-console
  //console.log("min length: ", minLength);
  var shortestData = null;
  if (profitableTradesMA20.length > lossTradesMA20.length) {
    shortestData = lossTradesMA20;
  } else {
    shortestData = profitableTradesMA20;
  }

  for (let i = 0; i < minLength; i++) {
    var expV =
      (profitableTradesMA20[profitableTradesMA20.length - 1 - i][1] *
        winRate[winRate.length - 1 - i][1]) /
        100 +
      (lossTradesMA20[lossTradesMA20.length - 1 - i][1] *
        lossRate[lossRate.length - 1 - i][1]) /
        100;
    expVal.push([shortestData[shortestData.length - 1 - i][0], expV]);
  }
  // eslint-disable-next-line no-console
  //console.log(expVal);
  return expVal;
}

export function createStockChartConfig() {
  var chartOptions = {
    title: {
      text: "CandlestickChart",
    },
    yAxis: [
      {
        scale: true,
        splitNumber: 2,
        axisLine: { lineStyle: { color: "#777" } },
        splitLine: { show: true },
        axisTick: { show: false },
        axisLabel: {
          inside: true,
          formatter: "{value}\n",
        },
        type: "value",
      },
    ],
    xAxis: [
      {
        type: "time",
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#777" } },
        min: "dataMin",
        max: "dataMax",
        axisPointer: {
          show: true,
        },
      },
    ],
    /*
    xAxis: [
      {
        scale: true,
        axisLabel: {
          formatter: function(value) {
            return moment(value).format("MMM-YY");
          }
        },
        type: "time"
      }
    ],
    */
    grid: {
      left: "0%",
      right: "10%",
      bottom: "0%",
      containLabel: true,
    },
    series: [
      {
        type: "candlestick",
        name: "",
        data: [],
        itemStyle: {
          normal: {
            color: "#ef232a",
            color0: "#14b143",
            borderColor: "#ef232a",
            borderColor0: "#14b143",
          },
          emphasis: {
            color: "black",
            color0: "#444",
            borderColor: "black",
            borderColor0: "#444",
          },
        },
        encode: {
          x: 0,
          y: [1, 4, 3, 2],
        },
      },
    ],
    tooltip: {
      trigger: "item",
      axisPointer: {
        type: "cross",
      },
    },
  };
  return chartOptions;
}
