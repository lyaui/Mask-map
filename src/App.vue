<template>
  <div id="app">
    <loading :active.sync="isLoading" :opacity="0.9" :background-color="'#000'" :color="'#ff5722'"></loading>
    <!-- navbar -->
    <div class="pos-f-t">
      <nav class="navbar navbar-dark bg-primary-white px-2" :class="{ 'bg-primary-darken': dropDown === true }">
        <div class="nav-item d-flex align-items-center">
          <img src="./assets/imgs/logo.png" alt="口罩即時查" />
          <h1 class="title text-white" href="#" :class="{ 'text-primary-darken': dropDown === false }">
            口罩即時查
          </h1>
        </div>
        <ul class="d-none d-sm-flex ml-auto my-auto">
          <li class="nav-item py-2 px-1 text-primary-darken" @click="menuSelected = '口罩供給現況'" :class="{ 'nav-item--active': menuSelected === '口罩供給現況' }">
            口罩供給現況
          </li>
          <li
            class="nav-item py-2 px-1 ml-2 text-primary-darken"
            @click="
              menuSelected = '口罩怎麼買';
              openImg();
            "
            :class="{ 'nav-item--active': menuSelected === '口罩怎麼買' }"
          >
            口罩怎麼買
          </li>
        </ul>

        <button class="btn navbar-toggler border-0 d-block d-sm-none ml-auto" @click="dropDown = !dropDown" data-toggle="collapse" data-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent">
          <img v-if="!dropDown" class="m-0" src="./assets/imgs/ic_toggler@2x.png" />
          <img v-if="dropDown" class="m-0" src="./assets/imgs/ic_close@2x.png" />
        </button>
      </nav>
      <div class="collapse bg-primary-darken text-center text-white" id="navbarToggleExternalContent">
        <li class="navbar-toggler d-block d-sm-none py-2" @click="dropDown = !dropDown" data-toggle="collapse" data-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent">
          口罩供給現況
        </li>
        <li
          class="navbar-toggler d-block d-sm-none py-2"
          @click="
            openImg();
            dropDown = !dropDown;
          "
          data-toggle="collapse"
          data-target="#navbarToggleExternalContent"
          aria-controls="navbarToggleExternalContent"
        >
          口罩怎麼買
        </li>
      </div>
    </div>

    <div class="row no-gutters" style="height: 100%;">
      <!-- sidebar -->
      <side-bar :allData.sync="data" :userPosition="userPosition" :calcMask="calcMask" :adultDaily="adultDaily" :childDaily="childDaily" @getNewCenter="updatePosition" @reloadData="getData"></side-bar>
      <!-- map -->
      <osm-map :allData.sync="data" :userPosition="userPosition" :calcMask="calcMask" :adultDaily="adultDaily" :childDaily="childDaily" ref="mapInfo"></osm-map>
      <!-- footer -->
    </div>
    <footer class="bg-primary-darken p-6">
      <p>防疫專線 1922 ｜ 口罩資訊 1919</p>
      <p>
        Design /
        <a class="text-white" href="https://challenge.thef2e.com/user/3405?schedule=4432#works-4432">PY Design</a>
      </p>
      <p>
        Made / I. H
      </p>
    </footer>

    <!-- lightbox modal -->
    <div class="modal fade" id="howbuy" role="dialog" aria-hidden="true" data-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <img @click="closeImg" class="close-modal" src="./assets/imgs/ic_close@2x.png" />
          <img class="rule img-fluid" src="./assets/imgs/rule.jpg" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import SideBar from '@/components/SideBar.vue';
import OsmMap from '@/components/OsmMap.vue';

export default {
  name: 'App',
  components: { Loading, SideBar, OsmMap },
  data() {
    return {
      data: null,
      menuSelected: '口罩供給現況',
      dropDown: false,
      adultDaily: 400,
      childDaily: 200,
      userPosition: [25.033671, 121.564427],
    };
  },
  computed: {
    isLoading() {
      const vm = this;
      return !vm.data;
    },
  },

  methods: {
    updatePosition(newPosition) {
      const vm = this;
      const { map } = vm.$refs.mapInfo;
      map.setView(newPosition, 18);
    },
    calcMask(num, dailyNum) {
      if (num === 0) {
        return 'maskStatus--zero';
      }
      if (num <= dailyNum * 0.1) {
        return 'maskStatus--insufficient';
      }
      return 'maskStatus--sufficient';
    },
    getData() {
      const vm = this;
      vm.data = null;
      const url = process.env.VUE_APP_API;
      vm.$http.get(url).then((response) => {
        vm.data = response.data.features;
      });
    },
    openImg() {
      $('#howbuy').modal('show');
    },
    closeImg() {
      const vm = this;
      $('#howbuy').modal('hide');
      vm.menuSelected = '口罩供給現況';
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
    window.addEventListener('resize', vm.measureSize);
    vm.measureSize();
  },
  mounted() {
    const vm = this;
    navigator.geolocation.getCurrentPosition(
      // 使用者接受存取地點，設定當前位置;使用者反對存取地點，預設地點101
      (res) => {
        const { latitude, longitude } = res.coords;
        vm.userPosition = [latitude, longitude];
      },
    );
    vm.getData();
  },
};
</script>

<style lang="scss">
@import '@/assets/all.scss';
</style>
