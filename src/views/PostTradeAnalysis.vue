<template>
  <v-container fluid>
    <v-row fluid pa-0 ma-0>
      <v-file-input
        label="Trade input csv"
        v-model="file"
        accept=".csv"
        @change="loadCSV($event)"
      ></v-file-input>
    </v-row>
    <v-row>
      <v-col cols="5">
        <v-card>
          <v-card-title>
            <template v-if="loaded">
              <v-card-title
                >Trading stats last {{ selectedAverage }} trades</v-card-title
              >
              <v-card-text>
                Batting average: {{ winRateSeries.slice(-1)[0][1] }}%
                <br />
                Average gain: {{ averageGainSeries.slice(-1)[0][1] }}%
                <br />
                Average loss: {{ averageLossSeries.slice(-1)[0][1] }}%
              </v-card-text>

              <v-select
                :items="selectAverages"
                v-model="selectedAverage"
                label="Average"
                @change="createTradeData"
              ></v-select>
            </template>
            <v-spacer></v-spacer>

            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :v-if="loaded"
            dense
            :headers="headers"
            :items="indexedItems"
            :items-per-page="20"
            item-key="id"
            class="elevation-1"
            :footer-props="{ 'items-per-page-options': [10, 20, 30] }"
            :search="search"
            @click:row="getTradingViewData"
          >
            <template v-slot:item.turnover="{ item }">
              <span :class="getPercentColor(item.turnover)"
                >{{ Math.round(item.turnover * 1000) / 10 }}%</span
              >
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="7">
        <v-tabs slot="extension" v-model="tab">
          <!-- declare tabs in data -->
          <v-tabs-slider></v-tabs-slider>
          <v-tab v-for="(item, index) in tabItems" :key="index">{{
            item.text
          }}</v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
          <v-tab-item>
            <trading-vue
              ref="tradingVue"
              :data="dc"
              :toolbar="true"
              :titleTxt="chartTitle"
              :indexBased="false"
              :colorCandleUp="colors.candleUp"
              :colorCandleDw="colors.candleDw"
              :colorWickUp="colors.wickUp"
              :colorWickDw="colors.wickDw"
              :colorVolUp="colors.volUp"
              :colorVolDw="colors.volDw"
              :colorGrid="colors.grid"
              :colorBack="colors.background"
              :chart-config="{ DEFAULT_LEN: 150 }"
              :width="1000"
              :height="600"
              :legend-buttons="['display']"
            ></trading-vue>
          </v-tab-item>
          <v-tab-item v-if="tab == 1">
            <div>
              <v-card>
                <v-card-title>Trading stats 2020</v-card-title>
                <v-card-text>
                  Batting average:
                  {{ Math.round(battingAverage * 1000) / 10 }}%
                  <br />
                  Average gain: {{ Math.round(averageGain * 1000) / 10 }}%
                  <br />
                  Average loss: {{ Math.round(averageLoss * 1000) / 10 }}%
                </v-card-text>
              </v-card>
              <stat-chart
                v-bind:chart-data="[
                  averageGainSeries,
                  averageLossSeries,
                  expectancyValueSeries,
                ]"
                v-if="tradeMetricsLoaded"
              ></stat-chart>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="7" offset="5"></v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as cs from "../js/chartscripts.js";
import { TradingVue, DataCube } from "trading-vue-js";
import axios from "axios";
import StatChart from "../components/StatChart.vue";

export default {
  components: { TradingVue, StatChart },
  data() {
    return {
      dc: new DataCube({
        chart: {
          grid: {
            // Grid settings (optional)
            //logScale: true,
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
      tab: null,
      tradeMetricsLoaded: false,
      tabItems: [{ text: "Chart" }, { text: "TradingStats" }],
      chartTitle: "",
      tradesTradingVue: [],
      selectAverages: [10, 20, 30, 40, 50],
      selectedAverage: 10,
      loaded: false,
      allTrades: [],
      averageGain: [],
      averageLoss: [],
      search: "",
      profits: [],
      losses: [],
      winRate: [],
      expectancyValue: [],
      file: [],
      parse_header: [],
      parse_csv: [],
      headers: [
        {
          text: "Stock",
          align: "start",
          sortable: false,
          value: "stock",
          width: "300",
        },
        { text: "Turnover", value: "turnover", align: "start" },
        { text: "Date", value: "date", align: "start" },
      ],
      rowsPerPageItems: [10, 20, 30, 40],
      pagination: {
        rowsPerPage: 20,
      },
    };
  },
  methods: {
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
    getPercentColor(percent) {
      if (percent > 0) return "green--text font-weight-bold";
      else return "red--text font-weight-bold";
    },
    csvJSON(csv, del = ";") {
      var vm = this;
      var lines = csv.split("\n");
      var result = [];
      // Datum	Konto	Typ av transaktion	Värdepapper/beskrivning	Antal	Kurs	Belopp	Courtage	Valuta	ISIN
      vm.parse_header = [
        "date",
        "account",
        "type",
        "stock",
        "amount",
        "price",
        "total_amount",
        "brokerage",
        "currency",
        "isin",
      ];
      var objectCtr = 0;
      lines.map(function (line, indexLine) {
        if (indexLine < 1) return; // Jump header line
        var obj = {};
        line = line.replace(",", ".");
        var currentline = line.split(del);
        vm.parse_header.map(function (header, indexHeader) {
          obj[header] = currentline[indexHeader];
        });
        obj["date"] = new Date(obj["date"]);
        if (obj["type"] == "Köp") {
          obj["type"] = "buy";
        } else if (obj["type"] == "Sälj") {
          obj["type"] = "sell";
        }
        obj["amount"] = Math.abs(parseFloat(obj["amount"]));
        obj["price"] = Math.abs(parseFloat(obj["price"]));
        obj["brokerage"] = parseFloat(obj["brokerage"]);
        obj["total_amount"] = Math.abs(parseFloat(obj["total_amount"]));
        obj["index"] = objectCtr;
        objectCtr += 1;
        result.push(obj);
      });
      //eslint-disable-next-line no-console
      //console.log(result.pop());
      result.pop(); // remove the last item because undefined values
      return result; // JavaScript object
    },
    loadCSV() {
      var vm = this;
      if (window.FileReader) {
        var reader = new FileReader();
        reader.readAsText(this.file);
        // Handle errors load
        reader.onload = function (event) {
          var csv = event.target.result;
          vm.parse_csv = vm.csvJSON(csv).reverse();
          vm.createTradeData();
        };
        reader.onerror = function (evt) {
          if (evt.target.error.name == "NotReadableError") {
            alert("File is not supported!");
          }
        };
      } else {
        alert("FileReader are not supported in this browser.");
      }
    },
    createTradeData() {
      var vm = this;
      var allTrades = [];
      var tradesVue = [];
      var buyAndSells = vm.parse_csv.filter(function (row) {
        return row.type == "buy" || row.type == "sell";
      });
      var stockIDs = new Set(buyAndSells.map((row) => row.isin));
      var stockIDsArray = Array.from(stockIDs);
      for (let index = 0; index < stockIDsArray.length; index++) {
        var stockID = stockIDsArray[index];

        var allTransactions = buyAndSells.filter(function (transaction) {
          return transaction.isin === stockID;
        });

        // eslint-disable-next-line no-console
        //console.log(allTransactions);
        allTransactions = allTransactions.sort((a, b) => b.index - a.index);
        // eslint-disable-next-line no-console
        //console.log(allTransactions);
        var stockName = allTransactions[0].stock;
        var currentPosition = {
          name: stockName,
          price: 0,
          stocks: 0,
          trades: [],
        };
        var tradeCtr = 0;
        for (let x = 0; x < allTransactions.length; x++) {
          const transaction = allTransactions[x];
          var entryDate = new Date(transaction.date);
          var milliseconds = entryDate.getTime();
          if (transaction.type == "buy") {
            if (currentPosition["stocks"] == 0) {
              currentPosition["price"] = transaction.price;
              currentPosition["stocks"] = transaction.amount;
            } else {
              currentPosition["price"] =
                (currentPosition["price"] * currentPosition["stocks"] +
                  transaction.price * transaction.amount) /
                (currentPosition["stocks"] + transaction.amount);
              currentPosition["stocks"] += transaction.amount;
            }
            tradesVue.push({
              date: milliseconds,
              type: 1,
              price: transaction.price,
              isin: transaction.isin,
            });
          } else if (transaction.type == "sell") {
            tradesVue.push({
              date: milliseconds,
              type: 0,
              price: transaction.price,
              isin: transaction.isin,
            });
            if (transaction.amount <= currentPosition["stocks"]) {
              var turnover =
                (transaction.price - currentPosition.price) /
                currentPosition.price;
              currentPosition.trades.push(
                turnover * (transaction.amount / currentPosition.stocks)
              );
              //eslint-disable-next-line no-console
              //console.log(turnover);
              currentPosition["stocks"] -= Math.abs(transaction.amount);
              if (currentPosition["stocks"] == 0) {
                allTrades.push({
                  stock: transaction.stock,
                  turnover: currentPosition.trades.reduce((a, b) => a + b, 0),
                  stocks: transaction.amount,
                  sell_price: transaction.price,
                  buy_price: currentPosition.price,
                  date: transaction.date.toISOString().substring(0, 10),
                  isin: transaction.isin,
                  tradeId: tradeCtr,
                  trades: tradesVue,
                });
                tradeCtr += 1;
                currentPosition.price = 0;
                currentPosition.trades = [];
                tradesVue = [];
              }
            }
          }
        }
      }

      allTrades = allTrades.sort((a, b) =>
        a.date > b.date ? 1 : b.date > a.date ? -1 : 0
      );

      //vm.allTrades = allTrades.slice(Math.max(allTrades.length - 20, 0));
      vm.allTrades = allTrades;
      vm.tradesTradingVue = tradesVue;
      // eslint-disable-next-line no-console
      //console.log(allTrades);
      var tradeData = [];
      for (let index = 0; index < vm.allTrades.length; index++) {
        const trade = vm.allTrades[index];
        tradeData.push([trade.date, trade.turnover, trade.stock]);
      }
      var profitableTrades = tradeData.filter(function (trade) {
        return trade[1] > 0;
      });
      var lossTrades = tradeData.filter(function (trade) {
        return trade[1] <= 0;
      });
      // eslint-disable-next-line no-console
      //console.log(profitableTrades);
      vm.profits = profitableTrades;
      vm.losses = lossTrades;
      vm.loaded = true;
      this.createTradeMetrics();
    },
    createTradeMetrics() {
      var vm = this;
      var avgPeriod = this.selectedAverage;
      //% of profitable trades x average profit – % of losing trades x average loss = expectancy value
      // eslint-disable-next-line no-console
      //console.log(vm.profits);
      var profitsThisYear = vm.allTrades.filter(function (trade) {
        return (
          new Date(trade.date) > new Date("2020-01-01") && trade.turnover > 0
        );
      });
      var lossesThisYear = vm.allTrades.filter(function (trade) {
        return (
          new Date(trade.date) > new Date("2020-01-01") && trade.turnover <= 0
        );
      });
      // eslint-disable-next-line no-console
      console.log(profitsThisYear);

      const sumProfits = profitsThisYear.reduce((a, b) => a + b.turnover, 0);
      const sumLosses = lossesThisYear.reduce((a, b) => a + b.turnover, 0);
      // eslint-disable-next-line no-console
      //console.log(sum);
      const avgGain = sumProfits / profitsThisYear.length;
      const avgLoss = sumLosses / lossesThisYear.length;
      // eslint-disable-next-line no-console
      console.log(avgGain);
      // eslint-disable-next-line no-console
      console.log(avgLoss);
      // eslint-disable-next-line no-console
      console.log(
        profitsThisYear.length /
          (profitsThisYear.length + lossesThisYear.length)
      );

      vm.averageGain = avgGain;
      vm.averageLoss = avgLoss;
      vm.battingAverage =
        profitsThisYear.length /
        (profitsThisYear.length + lossesThisYear.length);

      var profitableTradesMA20 = cs.calculateMA(avgPeriod, vm.profits);
      var lossTradesMA20 = cs.calculateMA(avgPeriod, vm.losses);
      var rates = cs.calculatePctOfTrades(avgPeriod, vm.allTrades);
      var winRate = rates[0];
      var lossRate = rates[1];
      var expectancyValue = cs.calculateExpectancyValue(
        winRate,
        lossRate,
        profitableTradesMA20,
        lossTradesMA20
      );
      // eslint-disable-next-line no-console
      //console.log(profitableTradesMA20);
      vm.expectancyValueSeries = expectancyValue;
      vm.averageGainSeries = profitableTradesMA20;
      vm.averageLossSeries = lossTradesMA20;
      vm.winRateSeries = winRate;
      vm.tradeMetricsLoaded = true;
      //vm.$refs.statChart.redraw();
    },
    getTradingViewData(row, item) {
      // eslint-disable-next-line no-console
      //console.log(item);
      this.selected_stock_id = item.item.stock_id;
      const requestOne = axios.get(
        `http://100.71.5.144:3000/api/stock_prices_isin/${item.item.isin}`
      );
      //var selectedItem = item.item;
      axios.all([requestOne]).then(
        axios.spread((...responses) => {
          this.$refs.tradingVue.resetChart();
          const responseOne = responses[0];
          // eslint-disable-next-line no-console
          //console.log(responseOne);
          //const responseTwo = responses[1];
          var ohlc_data = [];
          var close_data = [];
          var dates = [];
          var name = responseOne.data[0].name;
          // eslint-disable-next-line no-console
          //console.log(item.item.isin);
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

          // eslint-disable-next-line no-console
          //console.log(allTradesInStock.length);
          var tradesToAppend = [];
          for (var x = 0; x < item.item.trades.length; x++) {
            var trade = item.item.trades[x];
            // eslint-disable-next-line no-console
            //console.log(trade);
            tradesToAppend.push([trade.date, trade.type, trade.price]);
          }
          // eslint-disable-next-line no-console
          //console.log(tradesToAppend);
          var ema8 = this.calcEMA(close_data, 8);
          var ema21 = this.calcEMA(close_data, 21);
          var ema50 = cs.calculateSMA(close_data, 50);
          this.chartTitle = name;
          this.dc.set("chart", {
            type: "Candles",
            data: ohlc_data,
            //indexBased: false,
            settings: {},
          });

          var ema8Array = dates.map(function (date, i) {
            return [date, ema8[i]];
          });
          var ema21Array = dates.map(function (date, i) {
            return [date, ema21[i]];
          });
          var sma50Array = dates.map(function (date, i) {
            return [date, ema50[i]];
          });

          this.dc.del("Trades");
          this.dc.del("Spline");

          this.dc.add("onchart", {
            name: "Trades",
            type: "Trades",
            data: tradesToAppend,
            settings: {
              markerSize: 5,
            },
            indexSrc: "map",
          });

          this.dc.add("onchart", {
            type: "Spline",
            name: "EMA 8",
            data: ema8Array,
            settings: {
              color: "pink",
            },
          });

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

          this.loaded = true;
        })
      );
    },
  },
  computed: {
    indexedItems() {
      return this.allTrades.map((item, index) => ({
        id: index,
        ...item,
      }));
    },
  },
};
</script>

<style></style>
