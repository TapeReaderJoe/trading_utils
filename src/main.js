import Vue from "vue";
import App from "./App.vue";
import HighchartsVue from "highcharts-vue";
import router from "./router";
import VueGoogleCharts from "vue-google-charts";
import ECharts from "vue-echarts"; // refers to components/ECharts.vue in webpack

//dataModule(Highcharts);

import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

Vue.use(HighchartsVue);
Vue.use(VueGoogleCharts);
Vue.use("v-chart", ECharts);

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
