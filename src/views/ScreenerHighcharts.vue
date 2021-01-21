<template>
  <v-row fluid>
    <v-col cols="6">
      <v-card>
        <v-card-title>Screener</v-card-title>
        <v-data-table
          dense
          :headers="headers"
          :items="stocks"
          :items-per-page="10"
          item-key="name"
          class="elevation-1"
          :footer-props="{ 'items-per-page-options': [10, 20, 30, 40] }"
          @click:row="getHighChartData"
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
                  v-model="crs"
                  type="number"
                  placeholder=" "
                  label=">"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="ath"
                  type="number"
                  placeholder=" "
                  label=">"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="rs"
                  type="number"
                  placeholder=" "
                  label=">"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="e1"
                  type="number"
                  placeholder=" "
                  label=">"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="e2"
                  type="number"
                  placeholder=" "
                  label=">"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="r1"
                  type="number"
                  placeholder=" "
                  label=">"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="r2"
                  type="number"
                  placeholder=" "
                  label=">"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="tt"
                  type="number"
                  placeholder=" "
                  label="=="
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="fscore"
                  type="number"
                  placeholder=" "
                  label=">"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="rev"
                  type="number"
                  placeholder=" "
                  label=">"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="eps"
                  type="number"
                  placeholder=" "
                  label=">"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="pp"
                  type="number"
                  placeholder=" "
                  label="=="
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="ps"
                  type="number"
                  placeholder=" "
                  label="<"
                ></v-text-field>
              </td>
              <td>
                <v-text-field
                  v-model="ab"
                  type="number"
                  placeholder=" "
                  label="=="
                ></v-text-field>
              </td>
            </tr>
          </template>
          <template v-slot:item.crs="{ item }">
            <span :class="getRankedStyle(item.crs)">{{ item.crs }}%</span>
          </template>
          <template v-slot:item.ath="{ item }">
            <span :class="getRankedStyle(item.ath)">{{ item.ath }}%</span>
          </template>
          <template v-slot:item.rs="{ item }">
            <span :class="getRankedStyle(item.rs)">{{ item.rs }}</span>
          </template>
          <template v-slot:item.rs="{ item }">
            <span :class="getRankedStyle(item.rs)">{{ item.rs }}</span>
          </template>
          <template v-slot:item.e1="{ item }">
            <span :class="getGrowthStyle(item.e1)">{{ item.e1 }}%</span>
          </template>
          <template v-slot:item.e2="{ item }">
            <span :class="getGrowthStyle(item.e2)">{{ item.e2 }}%</span>
          </template>
          <template v-slot:item.r1="{ item }">
            <span :class="getGrowthStyle(item.r1)">{{ item.r1 }}%</span>
          </template>
          <template v-slot:item.r2="{ item }">
            <span :class="getGrowthStyle(item.r2)">{{ item.r2 }}%</span>
          </template>
          <template v-slot:item.rev="{ item }">
            <span :class="getRankedStyle(item.rev)">{{ item.rev }}</span>
          </template>
          <template v-slot:item.eps="{ item }">
            <span :class="getRankedStyle(item.eps)">{{ item.eps }}</span>
          </template>
          <template v-slot:item.fscore="{ item }">
            <span :class="getFscoreStyle(item.fscore)">{{ item.fscore }}</span>
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
      <highcharts :options="barChartOptions" ref="barChart" :v-if="loaded" />
    </v-col>
    <v-col cols="6">
      <highcharts
        v-if="loaded"
        :constructor-type="'stockChart'"
        :options="chartOptions"
        ref="stockChart"
      />
    </v-col>
  </v-row>
</template>

<script>
import Highcharts from "highcharts";
import stockInit from "highcharts/modules/stock";
import indicators from "highcharts/indicators/indicators";
import ema from "highcharts/indicators/ema";
import axios from "axios";
stockInit(Highcharts);
indicators(Highcharts);
ema(Highcharts);
export default {
  beforeCreate() {
    axios.get("http://localhost:3000/api/screener/").then((res) => {
      var array = [];
      for (var i = 0; i < res.data.length; i++) {
        var entry = res.data[i];
        // eslint-disable-next-line no-console
        //console.log(entry);
        array.push(entry);
      }
      this.stocks = array;
    });
  },
  methods: {
    getHighChartData(row, item) {
      // eslint-disable-next-line no-console
      // eslint-disable-next-line no-console
      //console.log(item);
      this.selected_stock_id = item.item.stock_id;
      const requestOne = axios.get(
        `http://localhost:3000/api/stock_prices/${item.item.stock_id}`
      );

      const requestTwo = axios.get(
        `http://localhost:3000/api/reports_r12/${item.item.stock_id}`
      );

      axios.all([requestOne, requestTwo]).then(
        axios.spread((...responses) => {
          const responseOne = responses[0];
          const responseTwo = responses[1];
          var ohlc_data = [];
          var volume_data = [];
          for (var i = 0; i < responseOne.data.length; i++) {
            var volumeColor = "#CCCCCC";
            var entry = responseOne.data[i];
            if (i == 0) {
              volumeColor = "#7e57c2";
            } else {
              if (responseOne.data[i - 1].close > entry.close) {
                volumeColor = "#7e57c2";
              } else {
                volumeColor = "#1976d2";
              }
            }
            // eslint-disable-next-line no-console

            ohlc_data.push([
              Date.parse(entry.date),
              entry.open,
              entry.high,
              entry.low,
              entry.close,
              entry.volume,
            ]);
            volume_data.push({
              x: Date.parse(entry.date),
              y: entry.volume,
              color: volumeColor,
            });
          }
          //this.$refs.stockChart.addSeries(ohlc_data);
          this.chartOptions.series[0].name = responseOne.data[0].name;
          this.chartOptions.series[0].data = ohlc_data;
          this.chartOptions.series[1].data = volume_data;

          var revenus = [];
          var xAxis = [];
          var eps = [];
          var npm = [];
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
          this.barChartOptions.xAxis.categories = xAxis;
          this.barChartOptions.series[0].name = "Revenues";
          this.barChartOptions.series[0].data = revenus;
          this.barChartOptions.series[1].name = "Earnings Per Share";
          this.barChartOptions.series[1].data = eps;
          //this.chartOptions.series[2].name = "Net Profit Margin";
          //this.chartOptions.series[2].data = npm;
          //this.chartOpt.series[1].yAxis = 1;
          if (!this.loaded) {
            this.loaded = true;
          } else {
            this.$refs.stockChart.redraw();
            this.$refs.barChart.redraw();
          }
        })
      );
    },
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
  },
  data() {
    return {
      name: "",
      crs: "",
      ath: "",
      rev: "",
      eps: "",
      udr: "",
      rs: "",
      tt: "",
      r1: "",
      r2: "",
      e1: "",
      e2: "",
      fscore: "",
      pp: "",
      ps: "",
      mom: "",
      ab: "",
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
        time: {
          useUTC: false,
        },
        yAxis: [
          {
            labels: {
              align: "left",
            },
            type: "logarithmic",
            height: "100%",
            gridLineWidth: 0, //Set this to zero
            resize: {
              enabled: true,
            },
          },
          {
            //volume axis
            labels: {
              align: "left",
            },
            top: "80%",
            height: "20%",
            gridLineWidth: 0, //Set this to zero
            offset: 0,
          },
          {
            //rs axis
            labels: {
              align: "left",
              enabled: false,
            },
            text: "RS",
            height: "60%",
            gridLineWidth: 0, //Set this to zero
            top: "40%",
            plotLines: [
              {
                value: 86,
                color: "#fff",
                dashStyle: "shortdash",
                width: 1,
                label: {
                  text: "RS 86",
                  align: "right",
                  style: {
                    color: "#fff",
                  },
                },
              },
            ],
          },
          /*
          {
            //EPS axis
            labels: {
              align: "left",
              rotation: 90,
              enabled: true,
            },
            title: {
              enabled: true,
              text: "EPS",
              rotation: 90,
            },
            height: "60%",
            gridLineWidth: 0, //Set this to zero
            top: "40%",
          },
          */
        ],
        series: [
          {
            type: "ohlc",
            data: [],
            id: "price",
            name: "",
            yAxis: 0,
            turboThreshold: 15000,
          },
          {
            type: "column",
            data: [],
            name: "volume",
            yAxis: 1,
            turboThreshold: 15000,
          },
          {
            type: "line",
            data: [],
            lineWidth: 1,
            name: "rs_nordic",
            color: "#1976d2",
            yAxis: 2,
            marker: {
              enabled: false,
            },
          },
          /*
          {
            type: "line",
            data: [],
            name: "EPS",
            color: "green",
            lineWidth: 0.0,
            yAxis: 3,
            marker: {
              enabled: false,
            },
          },
          */
          {
            type: "ema",
            name: "EMA8",
            linkedTo: "price",
            lineWidth: 0.5,
            color: "#FF5252",
            params: {
              period: 8,
            },
            marker: {
              enabled: false,
            },
          },
          {
            type: "ema",
            name: "EMA21",
            linkedTo: "price",
            lineWidth: 0.5,
            color: "#26c6da",
            params: {
              period: 21,
            },
            marker: {
              enabled: false,
            },
          },
          {
            type: "sma",
            name: "SMA50",
            linkedTo: "price",
            lineWidth: 0.5,
            color: "#9c27b0",
            params: {
              period: 50,
            },
            marker: {
              enabled: false,
            },
          },
        ],
        chart: {
          backgroundColor: "#131722",
          //margin: 0,
          height: 1200,
        },
        plotOptions: {
          ohlc: {
            color: "#7e57c2",
            upColor: "#1976d2",
          },
        },
        navigator: {
          enabled: true,
          series: {
            color: "#4572A7",
            fillOpacity: 0.0,
            lineWidth: 1,
          },
        },
        rangeSelector: {
          selected: 3,
        },
      },
      barChartOptions: {
        colors: ["#1976d2", "#7e57c2", "#009688"],
        chart: {
          //height: "400",
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
          value: "crs",
          filter: (value) => {
            if (!this.crs) return true;
            return value > parseInt(this.crs);
          },
        },
        {
          text: "52w",
          value: "ath",
          filter: (value) => {
            if (!this.ath) return true;
            return value > parseInt(this.ath);
          },
        },
        {
          text: "RS",
          value: "rs",
          filter: (value) => {
            if (!this.rs) return true;
            return value > parseInt(this.rs);
          },
        },
        {
          text: "EPS QQ1",
          value: "e1",
          filter: (value) => {
            if (!this.e1) return true;
            return value > parseInt(this.e1);
          },
        },
        {
          text: "EPS QQ2",
          value: "e2",
          filter: (value) => {
            if (!this.e2) return true;
            return value > parseInt(this.e2);
          },
        },
        {
          text: "REV QQ1",
          value: "r1",
          filter: (value) => {
            if (!this.r1) return true;
            return value > parseInt(this.r1);
          },
        },
        {
          text: "REV QQ2",
          value: "r2",
          filter: (value) => {
            if (!this.r2) return true;
            return value > parseInt(this.r2);
          },
        },
        {
          text: "TT",
          value: "tt",
          filter: (value) => {
            if (!this.tt) return true;
            return value == parseInt(this.tt);
          },
        },
        {
          text: "fscore",
          value: "fscore",
          filter: (value) => {
            if (!this.fscore) return true;
            return value > parseInt(this.fscore);
          },
        },
        {
          text: "REV",
          value: "rev",
          filter: (value) => {
            if (!this.rev) return true;
            return value > parseInt(this.rev);
          },
        },
        {
          text: "EPS",
          value: "eps",
          filter: (value) => {
            if (!this.eps) return true;
            return value > parseInt(this.eps);
          },
        },
        {
          text: "PP",
          value: "pp",
          filter: (value) => {
            if (!this.pp) return true;
            return value == parseInt(this.pp);
          },
        },
        {
          text: "PS",
          value: "ps",
          filter: (value) => {
            if (!this.ps) return true;
            return value < parseInt(this.ps);
          },
        },
        {
          text: "AB",
          value: "ab",
          filter: (value) => {
            if (!this.ab) return true;
            return value == parseInt(this.ab);
          },
        },
      ];
    },
  },
};
</script>

<style scoped>
</style>