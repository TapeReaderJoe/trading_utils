<template>
  <v-chart :options="statChartData" ref="vChart" theme="dark-fresh-cut" />
</template>

<script>
import Vue from "vue";
import ECharts from "vue-echarts"; // refers to components/ECharts.vue in webpack

// import ECharts modules manually to reduce bundle size
import "echarts/lib/chart/bar";
import "echarts/lib/component/tooltip";
import "echarts/lib/chart/scatter";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/visualMap";
import "echarts/lib/component/title";
import "echarts/lib/component/legend";
import moment from "moment";

import "echarts/theme/dark-fresh-cut.js";
// register component to use
Vue.component("v-chart", ECharts);

export default {
  props: {
    chartData: Array,
  },
  components: {
    "v-chart": ECharts,
  },
  data() {
    var vm = this;
    var chartData = vm.chartData;
    return {
      statChartData: {
        chart: {
          height: 1000,
          width: 500,
        },
        xAxis: [
          {
            scale: true,
            axisLabel: {
              formatter: function (value) {
                return moment(value).format("MMM-YY");
              },
            },
            type: "time",
          },
        ],
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "AvgGain",
            type: "line",
            //smooth: true,
            symbolSize: 0,
            lineStyle: { color: "#73a373" },
            data: chartData[0],
          },
          {
            name: "AvgLoss",
            type: "line",
            //smooth: true,
            symbolSize: 0,
            lineStyle: { color: "#ea7e53" },
            data: chartData[1],
          },
          {
            name: "ExpVal",
            type: "line",
            //smooth: true,
            symbolSize: 0,
            //lineStyle: { color: "white" },
            data: chartData[2],
          },
        ],
      },
    };
  },
};
</script>

<style scoped>
/**
 * The default size is 600px×400px, for responsive charts
 * you may need to set percentage values as follows (also
 * don't forget to provide a size for the container).
 */
.echarts {
  width: 1200px;
  height: 800px;
}
</style>
