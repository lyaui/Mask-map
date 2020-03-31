<template>
  <div id="app">
    <loading
      :active.sync="isLoading"
      :opacity="0.9"
      :background-color="'#000'"
      :color="'#ff5722'"
    ></loading>
    <!-- navbar -->
    <div class="pos-f-t">
      <nav
        class="navbar navbar-dark bg-primary-white"
        :class="{ 'bg-primary-darken': dropDown === true }"
      >
        <li class="nav-item d-flex align-items-center">
          <img src="./assets/sources/logo.png" alt="口罩即時查" />
          <div
            class="title text-white"
            href="#"
            :class="{ 'text-primary-darken': dropDown === false }"
          >
            口罩即時查
          </div>
        </li>
        <li class="nav-item d-flex">
          <button class="text-primary-darken d-none d-sm-block">口罩供給現況</button>
          <button
            class="text-primary-darken d-none d-sm-block"
            data-toggle="modal"
            data-target="#HowToBuy"
            @click="showImg"
          >
            口罩怎麼買
          </button>
          <vue-easy-lightbox :visible="visible" :imgs="img" @hide="handleHide"></vue-easy-lightbox>
        </li>
        <button
          class="navbar-toggler border-0 d-block d-sm-none ml-auto"
          @click="dropDown = !dropDown"
          type="button"
          data-toggle="collapse"
          data-target="#navbarToggleExternalContent"
          aria-controls="navbarToggleExternalContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <img v-if="!dropDown" class="m-0" src="./assets/sources/ic_toggler@2x.png" />
          <img v-if="dropDown" class="m-0" src="./assets/sources/ic_close@2x.png" />
        </button>
      </nav>
      <div class="collapse bg-primary-darken" id="navbarToggleExternalContent"
      
      >
        <li  class="text-center d-block d-sm-none text-white py-2">
          口罩供給現況
        </li>
        <li  class="text-center d-block d-sm-none text-white py-2">
          口罩怎麼買
        </li>
      </div>
    </div>

    <div class="row no-gutters" style="height: 100%;">
      <!-- sidebar -->
      <side-bar
        :allData.sync="data"
        :userPosition="userPosition"
        :calcMask="calcMask"
        :adultDaily="adultDaily"
        :childDaily="childDaily"
        @getNewCenter="updatePosition"
      ></side-bar>
      <!-- map -->
      <osm-map
        :allData.sync="data"
        :userPosition="userPosition"
        :calcMask="calcMask"
        :adultDaily="adultDaily"
        :childDaily="childDaily"
        ref="mapInfo"
      ></osm-map>
      <!-- footer -->
    </div>
    <footer class="bg-primary-darken p-6">
      <p>防疫專線 1922 ｜ 口罩資訊 1919</p>
      <p>
        Design /
        <a class="text-white" href="https://challenge.thef2e.com/user/3405?schedule=4432#works-4432"
          >PY Design</a
        >
      </p>
      <p>
        Made / I. H
      </p>
    </footer>
  </div>
</template>

<script>
import $ from "jquery";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import SideBar from "@/components/SideBar";
import OsmMap from "@/components/OsmMap";

export default {
  name: "App",
  components: { SideBar, OsmMap },
  data() {
    return {
      data: null,
      dropDown: false,
      adultDaily: 400,
      childDaily: 200,
      userPosition: [25.033671, 121.564427],
      visible: false,
      img: require("@/assets/sources/rule_v2@2x.png"),
    };
  },
  computed: {
    isLoading() {
      const vm = this;
      return vm.data ? false : true;
    },
  },

  methods: {
    updatePosition(newPosition) {
      const vm = this;
      const map = vm.$refs.mapInfo.map;
      map.setView(newPosition, 18);
    },
    //計算口罩庫存量
    calcMask(num, dailyNum) {
      if (num === 0) {
        return "maskStatus--zero";
      } else if (num <= dailyNum * 0.1) {
        return "maskStatus--insufficient";
      } else {
        return "maskStatus--sufficient";
      }
    },
    getData() {
      const vm = this;
      const url = process.env.VUE_APP_API;
      vm.$http.get(url).then((response) => {
        vm.data = response.data.features;
      });
    },
    showImg() {
      const vm = this;
      vm.visible = true;
    },
    handleHide() {
      const vm = this;
      vm.visible = false;
    },
    measureSize() {
      const vm = this;
      const width = window.innerWidth;

      if (width >= 576) {
        vm.dropDown = false;
      }
    },
  },
  created() {
    const vm = this;
    window.addEventListener("resize", vm.measureSize);
    vm.measureSize();
  },
  mounted() {
    const vm = this;
    navigator.geolocation.getCurrentPosition(
      // 使用者接受存取地點，設定當前位置;使用者反對存取地點，預設地點101
      (res) => {
        const { latitude, longitude } = res.coords;
        vm.userPosition = [latitude, longitude];
      }
    );
    vm.getData();
  },
};
</script>

<style lang="scss">
@import "bootstrap/scss/bootstrap";
@import "../style/style.css";
</style>
