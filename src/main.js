import Vue from "vue";
import App from "./App.vue";
import axios from "axios";
import VueAxios from "vue-axios";
import "bootstrap";
import Lightbox from "vue-easy-lightbox";
import Loading from "vue-loading-overlay";

Vue.use(VueAxios, axios);
Vue.use(Lightbox);
Vue.component("Loading", Loading);
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
