<template>
  <v-app-bar app dark clipped-left height="150" hide-on-scroll>
    <v-row no-gutters align-content="space-between">
      <v-col cols="4" offset="0">
        <v-toolbar-title class="white--text" @click="$router.push('/')">
          <span style="font-size: 200%">200% DICKRIDER</span>
        </v-toolbar-title>
      </v-col>
      <v-col cols="4" class="text-right">
        <div>
          <v-btn large text rounded outlined to="/screener_episodic_pivots">episodic pivots</v-btn>
          <v-btn large text rounded outlined to="/screener_breakouts_ants">breakouts and ants</v-btn>
          <v-btn large text rounded outlined to="/posttradeanalysis"
            >PostTradeAnalysis</v-btn
          >
        </div>
      </v-col>
    </v-row>
  </v-app-bar>
</template>

<script>
export default {
  name: "Nav",
};
</script>

<style scoped>
span {
  display: inline-block;
}
</style>
