// routes.js
import Vue from "vue";
import VueRouter from "vue-router";
import ScreenerEpisodicPivots from "@/views/ScreenerEpisodicPivots.vue";
import ScreenerBreakoutsAnts from "@/views/ScreenerBreakoutsAnts.vue";
import PostTradeAnalysis from "@/views/PostTradeAnalysis.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", meta: { title: "ScreenerBreakoutsAnts" }, component: ScreenerBreakoutsAnts },
  {
    path: "/screener_episodic_pivots",
    name: "EpisodicPivots",
    meta: { title: "EpisodicPivots" },
    component: ScreenerEpisodicPivots,
  },
  {
    path: "/screener_breakouts_ants",
    name: "ScreenerBreakoutsAnts",
    meta: { title: "ScreenerBreakoutsAnts" },
    component: ScreenerBreakoutsAnts,
  },
  {
    path: "/posttradeanalysis",
    name: "posttradeanalysis",
    meta: { title: "PostTradeAnalysis - Analyse your trades!" },
    component: PostTradeAnalysis,
  }
];

const router = new VueRouter({
  mode: "history",
  routes: routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  next();
});

export default router;
