<template>
  <v-app>
    <v-main>
      <navbar></navbar>
      <v-container fluid pa-0 ma-0>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import NavBar from "./components/NavBar.vue";
//import NavFooter from "./components/NavFooter.vue";
export default {
  name: "App",
  components: { navbar: NavBar },
  data() {
    return {
      drawer: null,
      //
    };
  },
  created() {
    this.$vuetify.theme.dark = true;
  },
};
</script>

