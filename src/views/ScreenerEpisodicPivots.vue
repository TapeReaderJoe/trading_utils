<template>
  <v-container fluid>
    <v-row fluid>
      <v-col cols="6">
        <v-card>
          <v-card-title>Episodic Pivots</v-card-title>
          <v-data-table
            dense
            :headers="headers"
            :items="stocks"
            :items-per-page="10"
            item-key="name"
            class="elevation-1"
            :footer-props="{ 'items-per-page-options': [10, 20, 30, 40] }"
            @click:row="getTradingViewData"
            :search="search"
          >
            <template v-slot:body.prepend>
              <tr>
                <td>
                  <v-text-field
                    v-model="name"
                    type="text"
                    placeholder=" "
                    label="filter"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="crs_high"
                    type="number"
                    placeholder=" "
                    label=">"
                  ></v-text-field>
                </td>
                   <td>
                  <v-text-field
                    v-model="rs_nordic"
                    type="number"
                    placeholder=" "
                    label=">"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="eqq1"
                    type="number"
                    placeholder=" "
                    label=">"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="eqq2"
                    type="number"
                    placeholder=" "
                    label=">"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="rqq1"
                    type="number"
                    placeholder=" "
                    label=">"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="rqq2"
                    type="number"
                    placeholder=" "
                    label=">"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="rvol"
                    type="number"
                    placeholder=" "
                    label=">"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="f_score"
                    type="number"
                    placeholder=" "
                    label=">"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model="ps"
                    type="number"
                    placeholder=" "
                    label="=="
                  ></v-text-field>
                </td>
               
              </tr>
            </template>
            <template v-slot:item.crs_high="{ item }">
              <span :class="getRankedStyle(Math.round(item.crs_high*100))">{{ Math.round(item.crs_high*100) }}%</span>
            </template>
            <template v-slot:item.rs_nordic="{ item }">
              <span :class="getRankedStyle(item.rs_nordic)">{{ item.rs_nordic }}</span>
            </template>
            <template v-slot:item.eqq1="{ item }">
              <span :class="getGrowthStyle(item.eqq1)">{{ Math.round(item.eqq1*100) }}%</span>
            </template>
            <template v-slot:item.eqq2="{ item }">
              <span :class="getGrowthStyle(item.eqq2)">{{ Math.round(item.eqq2*100) }}%</span>
            </template>
            <template v-slot:item.rqq1="{ item }">
              <span :class="getGrowthStyle(item.rqq1)">{{ Math.round(item.rqq1*100) }}%</span>
            </template>
            <template v-slot:item.rqq2="{ item }">
              <span :class="getGrowthStyle(item.rqq2)">{{ Math.round(item.rqq2*100) }}%</span>
            </template>
            <template v-slot:item.rvol="{ item }">
              <span :class="getGrowthStyle(item.rvol)">{{ Math.round(item.rvol*100) }}%</span>
            </template>
            <template v-slot:item.f_score="{ item }">
              <span :class="getFscoreStyle(item.f_score)">{{
                item.f_score
              }}</span>
            </template>
            <template v-slot:item.ps="{ item }">
              <span>{{ Math.round(item.ps * 10) / 10 }}</span>
            </template>
            <!--
            <template v-slot:item.rev="{ item }">
              <span :class="getRankedStyle(item.rev)">{{ item.rev }}</span>
            </template>
            <template v-slot:item.eps="{ item }">
              <span :class="getRankedStyle(item.eps)">{{ item.eps }}</span>
            </template>
       
    
          <template v-slot:item.ath="{ item }">
            <span>{{Math.round(item.ath*100)}}</span>
          </template>
            -->
          </v-data-table>
        </v-card>
        <highcharts :options="chartOptions" ref="columnChart" />
      </v-col>
      <v-col cols="6">
        <trading-vue
          ref="tradingVue"
          :titleTxt="chartTitle"
          :data="dc"
          :toolbar="true"
          :chartTitle="chartTitle"
          :indexBased="true"
          :colorCandleUp="colors.candleUp"
          :colorCandleDw="colors.candleDw"
          :colorWickUp="colors.wickUp"
          :colorWickDw="colors.wickDw"
          :colorVolUp="colors.volUp"
          :colorVolDw="colors.volDw"
          :colorGrid="colors.grid"
          :colorBack="colors.background"
          :chart-config="{ DEFAULT_LEN: 252 }"
          :width="800"
          :height="500"
          :legend-buttons="['display']"
        ></trading-vue>
        <v-btn primary dense @click="getTradingViewDataWeekly">WEEKLY</v-btn>
        <v-btn primary dense @click="getTradingViewDataDaily">DAILY</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import * as cs from "../js/chartscripts.js";
import { TradingVue, DataCube } from "trading-vue-js";
import Highcharts from "highcharts";
import stockInit from "highcharts/modules/stock";
import axios from "axios";

stockInit(Highcharts);

export default {
  components: { TradingVue },
  beforeCreate() {
    axios.get("http://localhost:3000/api/screener_episodic_pivots/").then((res) => {
      var array = [];
      for (var i = 0; i < res.data.length; i++) {
        var entry = res.data[i];
        //eslint-disable-next-line no-console
        console.log(entry);
        array.push(entry);
      }
      //eslint-disable-next-line no-console
      console.log(array);
      this.stocks = array;
    });
  },
  data() {
    return {
      dc: new DataCube({
        chart: {
          tf: "1D",
          grid: {
            // Grid settings (optional)
            logScale: false,

            //height: 20,
          },
        },
        onchart: [],
        offchart: [],
      }),
      colors: {
        candleUp: "#1976d2",
        candleDw: "#7e57c2",
        wickUp: "#1976d2",
        wickDw: "#7e57c2",
        volUp: "#1976d2",
        volDw: "#7e57c2",
        grid: "#212121",
        background: "#212121",
      },
      name: "",
      crs_high: "",
      rs_nordic: "",
      rqq1: "",
      rqq2: "",
      eqq1: "",
      eqq2: "",
      f_score: "",
      rvol: "",
      ps: "",
     
      stocks: [],
      selected: null,
      search: "",
      loaded: false,
      chartTitle: null,
      ema21Added: false,
      sma50Added: false,
      sma10Added: false,
      sma30Added: false,
      selected_stock_id: null,
      //width: window.innerWidth - 500,
      //height: window.innerHeight - 200,
      rowsPerPageItems: [10, 20, 30, 40],
      pagination: {
        rowsPerPage: 20,
      },
      chartOptions: {
        colors: ["#1976d2", "#7e57c2", "#009688"],
        chart: {
          height: "400",
          //width: "650",
          backgroundColor: "#212121",
          style: {
            fontFamily: "'Unica One', sans-serif",
          },
          plotBorderColor: "#606063",
          type: "column",
        },
        title: {
          style: {
            color: "#E0E0E3",
            textTransform: "uppercase",
            fontSize: "20px",
          },
          text: "",
        },
        subtitle: {
          style: {
            color: "#E0E0E3",
            textTransform: "uppercase",
          },
          text: "TTM Revenues and earnings per share",
        },
        xAxis: {
          gridLineColor: "#707073",
          labels: {
            style: {
              color: "#E0E0E3",
            },
          },
          lineColor: "#707073",
          minorGridLineColor: "#505053",
          tickColor: "#707073",
          title: {
            style: {
              color: "#A0A0A3",
            },
          },
          categories: [],
        },
        yAxis: [
          {
            gridLineColor: "#707073",
            labels: {
              style: {
                color: "#E0E0E3",
              },
            },
            lineColor: "#707073",
            minorGridLineColor: "#505053",
            tickColor: "#707073",
            tickWidth: 1,
            title: {
              style: {
                color: "#A0A0A3",
              },
            },
          },
          /*
          {
            // Secondary yAxis
            title: {
              text: "EPS",
              style: {
                color: "#009688",
              },
            },
            labels: {
              format: "{value} Mkr",
              style: {
                color: "#009688",
              },
            },
            opposite: false,
          },
          */
        ],
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          style: {
            color: "#F0F0F0",
          },
        },
        plotOptions: {
          series: {
            dataLabels: {
              color: "#F0F0F3",
              style: {
                fontSize: "13px",
              },
            },
            marker: {
              lineColor: "#333",
            },
          },
          boxplot: {
            fillColor: "#505053",
          },
          candlestick: {
            lineColor: "white",
          },
          errorbar: {
            color: "white",
          },
          column: {
            borderWidth: "0",
          },
        },
        legend: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          itemStyle: {
            color: "#E0E0E3",
          },
          itemHoverStyle: {
            color: "#FFF",
          },
          itemHiddenStyle: {
            color: "#606063",
          },
          title: {
            style: {
              color: "#C0C0C0",
            },
          },
        },
        credits: {
          style: {
            color: "#666",
          },
        },
        labels: {
          style: {
            color: "#707073",
          },
        },
        drilldown: {
          activeAxisLabelStyle: {
            color: "#F0F0F3",
          },
          activeDataLabelStyle: {
            color: "#F0F0F3",
          },
        },
        navigation: {
          buttonOptions: {
            symbolStroke: "#DDDDDD",
            theme: {
              fill: "#505053",
            },
          },
        },
        // scroll charts
        rangeSelector: {
          buttonTheme: {
            fill: "#505053",
            stroke: "#000000",
            style: {
              color: "#CCC",
            },
            states: {
              hover: {
                fill: "#707073",
                stroke: "#000000",
                style: {
                  color: "white",
                },
              },
              select: {
                fill: "#000003",
                stroke: "#000000",
                style: {
                  color: "white",
                },
              },
            },
          },
          inputBoxBorderColor: "#505053",
          inputStyle: {
            backgroundColor: "#333",
            color: "silver",
          },
          labelStyle: {
            color: "silver",
          },
        },
        navigator: {
          handles: {
            backgroundColor: "#666",
            borderColor: "#AAA",
          },
          outlineColor: "#CCC",
          maskFill: "rgba(255,255,255,0.1)",
          series: {
            color: "#7798BF",
            lineColor: "#A6C7ED",
          },
          xAxis: {
            gridLineColor: "#505053",
          },
        },
        scrollbar: {
          barBackgroundColor: "#808083",
          barBorderColor: "#808083",
          buttonArrowColor: "#CCC",
          buttonBackgroundColor: "#606063",
          buttonBorderColor: "#606063",
          rifleColor: "#FFF",
          trackBackgroundColor: "#404043",
          trackBorderColor: "#404043",
        },
        series: [
          {
            name: "",
            data: [],
          },
          {
            name: "",
            data: [],
          },
          /*
          {
            name: "",
            yAxis: 1,
            type: "spline",
            data: [],
          },
          */
        ],
      },
    };
  },
  methods: {
    getRankedStyle(rank) {
      if (rank > 79) return "green--text  font-weight-bold";
      else if (rank > 69) return "light-green--text  font-weight-bold";
      else if (rank > 49) return "lime--text font-weight-bold";
      else return "";
    },
    getFscoreStyle(rank) {
      if (rank >= 5) return "green--text  font-weight-bold";
      else return "orange--text font-weight-bold";
    },
    getGrowthStyle(rank) {
      if (rank > 0) return "green--text font-weight-bold";
      else return "red--text font-weight-bold";
    },
    calcEMA(mArray, mRange) {
      var k = 2 / (mRange + 1);
      // first item is just the same as the first item in the input
      var emaArray = [mArray[0]];
      // for the rest of the items, they are computed with the previous one
      for (var i = 1; i < mArray.length; i++) {
        emaArray.push(mArray[i] * k + emaArray[i - 1] * (1 - k));
      }
      return emaArray;
    },
    getTradingViewData(row, item) {
      // eslint-disable-next-line no-console
      //console.log(item);
      this.selected_stock_id = item.item.stock_id;
      const requestOne = this.weekly
        ? axios.get(
            `http://localhost:3000/api/stock_prices/${item.item.stock_id}`
          )
        : axios.get(
            `http://localhost:3000/api/stock_prices/${item.item.stock_id}`
          );

      const requestTwo = axios.get(
        `http://localhost:3000/api/reports_r12/${item.item.stock_id}`
      );
      axios.all([requestOne, requestTwo]).then(
        axios.spread((...responses) => {
          this.$refs.tradingVue.resetChart();
          const responseOne = responses[0];
          const responseTwo = responses[1];
          var ohlc_data = [];
          var close_data = [];
          var dates = [];
          var name = responseOne.data[0].name;
          // eslint-disable-next-line no-console
          //console.log(name);
          //var dates = [];
          for (var i = 0; i < responseOne.data.length; i++) {
            var entry = responseOne.data[i];
            var entryDate = new Date(entry.date); // some mock date
            var milliseconds = entryDate.getTime();
            // eslint-disable-next-line no-console
            //console.log(milliseconds);
            ohlc_data.push([
              milliseconds,
              entry.open,
              entry.high,
              entry.low,
              entry.close,
              entry.volume,
            ]);
            close_data.push(entry.close);
            dates.push(milliseconds);
            //dates.push(entry.date);
          }
          var ema21 = this.calcEMA(close_data, 21);
          var ema50 = cs.calculateSMA(close_data, 50);
          this.chartTitle = name;
          this.chartOptions.title.text = name;
          this.dc.set("chart", {
            type: "Candles",
            data: ohlc_data,
            tf: "1D",
            settings: {},
          });
          var ema21Array = dates.map(function (date, i) {
            return [date, ema21[i]];
          });
          var sma50Array = dates.map(function (date, i) {
            return [date, ema50[i]];
          });

          this.dc.del("Spline");
          this.dc.add("onchart", {
            type: "Spline",
            name: "EMA21",
            data: ema21Array,
            settings: {
              lineColor: "green",
            },
          });

          this.dc.add("onchart", {
            type: "Spline",
            name: "SMA50",
            data: sma50Array,
            settings: {
              lineColor: "green",
            },
          });

          var revenus = [];
          var xAxis = [];
          var eps = [];
          var npm = [];
          // eslint-disable-next-line no-console
          //console.log(responseTwo);
          for (var x = 0; x < responseTwo.data.length; x++) {
            var row = responseTwo.data[x];
            var year = row.year;
            var period = row.period;
            var report_date = year.toString() + " Q" + period.toString();
            //var report_date = new Date(entry.report_end_date);
            // eslint-disable-next-line no-console
            //console.log(report_date);
            //var date_string = report_date.toISOString().split("T")[0];
            xAxis.push(report_date);
            revenus.push(Math.round(row.revenues));
            eps.push(Math.round(row.profit_to_equity_holders * 10) / 10);
            npm.push(
              Math.round((row.profit_to_equity_holders / row.revenues) * 100)
            );
            // eslint-disable-next-line no-console
            //console.log(row);
          }
          this.chartOptions.xAxis.categories = xAxis;
          this.chartOptions.series[0].name = "Revenues";
          this.chartOptions.series[0].data = revenus;
          this.chartOptions.series[1].name = "Earnings Per Share";
          this.chartOptions.series[1].data = eps;
          //this.chartOptions.series[2].name = "Net Profit Margin";
          //this.chartOptions.series[2].data = npm;
          //this.chartOpt.series[1].yAxis = 1;

          this.loaded = true;
        })
      );
    },
    getTradingViewDataWeekly() {
      axios
        .get(
          `http://localhost:3000/api/stock_prices_weekly/${this.selected_stock_id}`
        )
        .then((res) => {
          this.$refs.tradingVue.resetChart();
          var ohlc_data = [];
          var close_data = [];
          var dates = [];
          // eslint-disable-next-line no-console
          //console.log(name);
          //var dates = [];
          for (var i = 0; i < res.data.length; i++) {
            var entry = res.data[i];
            var entryDate = new Date(entry.date); // some mock date
            var milliseconds = entryDate.getTime();
            // eslint-disable-next-line no-console
            //console.log(milliseconds);
            ohlc_data.push([
              milliseconds,
              entry.open,
              entry.high,
              entry.low,
              entry.close,
              entry.volume,
            ]);
            close_data.push(entry.close);
            dates.push(milliseconds);
            //dates.push(entry.date);
          }

          this.dc.set("chart", {
            type: "Candles",
            data: ohlc_data,
            settings: {},
          });

          var sma10 = cs.calculateSMA(close_data, 10);
          var sma30 = cs.calculateSMA(close_data, 30);
          var sma10Array = dates.map(function (date, i) {
            return [date, sma10[i]];
          });
          var sma30Array = dates.map(function (date, i) {
            return [date, sma30[i]];
          });

          this.dc.del("Spline");
          this.dc.add("onchart", {
            type: "Spline",
            name: "SMA 10",
            data: sma10Array,
            settings: {
              color: "red",
            },
          });

          this.dc.add("onchart", {
            type: "Spline",
            name: "SMA 30",
            data: sma30Array,
            settings: {
              color: "white",
            },
          });
        });
    },
    getTradingViewDataDaily() {
      axios
        .get(`http://localhost:3000/api/stock_prices/${this.selected_stock_id}`)
        .then((res) => {
          this.$refs.tradingVue.resetChart();
          var ohlc_data = [];
          var close_data = [];
          var dates = [];
          // eslint-disable-next-line no-console
          //console.log(name);
          //var dates = [];
          for (var i = 0; i < res.data.length; i++) {
            var entry = res.data[i];
            var entryDate = new Date(entry.date); // some mock date
            var milliseconds = entryDate.getTime();
            // eslint-disable-next-line no-console
            //console.log(milliseconds);
            ohlc_data.push([
              milliseconds,
              entry.open,
              entry.high,
              entry.low,
              entry.close,
              entry.volume,
            ]);
            close_data.push(entry.close);
            dates.push(milliseconds);
            //dates.push(entry.date);
          }

          this.dc.set("chart", {
            type: "Candles",
            data: ohlc_data,
            settings: {},
          });

          var ema21 = this.calcEMA(close_data, 21);
          var sma50 = cs.calculateSMA(close_data, 50);
          var ema21Array = dates.map(function (date, i) {
            return [date, ema21[i]];
          });
          var sma50Array = dates.map(function (date, i) {
            return [date, sma50[i]];
          });

          this.dc.del("Spline");
          this.dc.add("onchart", {
            type: "Spline",
            name: "EMA 21",
            data: ema21Array,
            settings: {
              color: "red",
            },
          });

          this.dc.add("onchart", {
            type: "Spline",
            name: "SMA 50",
            data: sma50Array,
            settings: {
              color: "green",
            },
          });
        });
    },
  },
  computed: {
    headers() {
      return [
        {
          text: "Stock",
          align: "start",
          sortable: false,
          value: "name",
          width: "300",
          filter: (f) => {
            return (f + "").toLowerCase().includes(this["name"].toLowerCase());
          },
        },
        {
          text: "CRS",
          value: "crs_high",
          filter: (value) => {
            if (!this.crs_high) return true;
            return value > parseInt(this.crs_high);
          },
        },
        {
          text: "RS",
          value: "rs_nordic",
          filter: (value) => {
            if (!this.rs_nordic) return true;
            return value > parseInt(this.rs_nordic);
          },
        },
        {
          text: "EPS QQ1",
          value: "eqq1",
          filter: (value) => {
            if (!this.eqq1) return true;
            return value > parseFloat(this.eqq1);
          },
        },
        {
          text: "EPS QQ2",
          value: "eqq2",
          filter: (value) => {
            if (!this.eqq2) return true;
            return value > parseFloat(this.eqq2);
          },
        },
        {
          text: "REV QQ1",
          value: "rqq1",
          filter: (value) => {
            if (!this.rqq1) return true;
            return value > parseFloat(this.rqq1);
          },
        },
        {
          text: "REV QQ2",
          value: "rqq2",
          filter: (value) => {
            if (!this.rqq2) return true;
            return value > parseFloat(this.rqq2);
          },
        },
        {
          text: "rvol",
          value: "rvol",
          filter: (value) => {
            if (!this.rvol) return true;
            return value > parseFloat(this.rvol);
          },
        },
        {
          text: "fscore",
          value: "f_score",
          filter: (value) => {
            if (!this.f_score) return true;
            return value > parseInt(this.fscore);
          },
        },
        {
          text: "PS",
          value: "ps",
          filter: (value) => {
            if (!this.ps) return true;
            return value > parseFloat(this.ps);
          },
        },
      ];
    },
  },
};
</script>
