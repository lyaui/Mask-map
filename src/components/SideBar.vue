<template>
  <div class="menu col-sm-6 col-md-4 col-xl-3 pb-2">
    <form class="form-inline align-items-baseline px-2 pt-2">
      <div v-if="!onSearch" class="d-flex w-100" style="margin-bottom: 6px;">
        <select
          class="custom-select w-50"
          v-model="citySel"
          @change="
            areaSel = '';
            filterWay = 'bySelect';
            keyword = '';
          "
        >
          <option value disabled selected hidden>請選擇縣市</option>
          <option v-for="city in cities" :key="city">{{ city }}</option>
        </select>
        <select
          class="custom-select w-50"
          v-model="areaSel"
          @change="
            filterWay = 'bySelect';
            keyword = '';
          "
          style="margin-left: 6px;"
        >
          <option value disabled selected hidden>請選擇區域</option>
          <option v-for="area in areas" :key="area">{{ area }}</option>
        </select>
      </div>
      <div class="form-group w-100 mb-1">
        <input
          @focus="
            onSearch = true;
            filterWay = 'byKeyword';
            citySel = '';
            areaSel = '';
          "
          type="text"
          class="ml-auto form-control search-input"
          :class="{ 'w-100': !onSearch }"
          placeholder="輸入地址 / 店名"
          v-model.trim="keyword"
        />
        <!-- 返回主頁 -->
        <button
          @click.prevent="
            onSearch = !onSearch;
            keyword = '';
          "
          v-if="onSearch"
          class="btn go-back-btn shadow-none text-gray"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <!-- 送出搜尋 -->
        <button @click.prevent="search()" class="btn shadow-none search-btn">
          <img src="../assets/imgs/ic_location@2x.png" style="width: 24px; height: 24px;" />
        </button>
        <!-- 建議藥局 -->
        <ul v-if="keyword && keyword.length >= 2 && filterdData.length > 0 && onSearch" class="recommend-results list-group list-group-flush">
          <li @click.prevent="search(item.properties.address)" v-for="(item, i) in filterdData" :key="i" class="recommend-item list-group-item border-bottom-0 rounded-0">
            <i class="recommend-item fas fa-map-marker-alt pr-1"></i> {{ item.properties.name }}
            <p class="recommend-item pl-5">{{ item.properties.address }}</p>
          </li>
        </ul>
      </div>
    </form>
    <!-- 搜尋紀錄 -->
    <div v-if="onSearch">
      <div class="search-records">
        <div class="search-records-bar bg-primary-darken text-white px-2">
          <p>最近 5 筆搜尋</p>
          <button @click.prevent="clearKeywords()">清除</button>
        </div>
        <ul v-if="keywords !== []" class="list-group list-group-flush px-2">
          <li
            @click.prevent="
              keyword = word;
              search();
            "
            class="list-group-item text-primary-darken bg-transparent"
            v-for="(word, i) in keywords"
            :key="i"
          >
            {{ word }}
          </li>
        </ul>
        <ul></ul>
      </div>
    </div>
    <div v-if="!onSearch" class="info-box text-primary-darken pb-3 px-2">
      <div class="mb-4">
        <span>{{ today }}</span
        >購買日
        <button id="tooltip" class="btn" @mouseover="tooltipShow" data-placement="right" data-html="true" :data-title="'奇數-身分證末碼 1,3,5,7,9 者<br>偶數-身分證末碼 0,2,4,6,8 者'">
          <img src="@/assets/imgs/ic_help@2x.png" />
        </button>
      </div>
      <div class="d-flex justify-content-between">
        <div>
          <p v-if="filterWay !== 'bySelect' && filterWay !== 'byKeyword'">
            距離方圓 5公里 以內的供應商
          </p>
          <p v-if="filterWay === 'bySelect'">{{ citySel }} {{ areaSel }} 以內的供應商</p>
          <p v-if="filterWay === 'byKeyword'">搜尋 {{ keyword }} 的供應商</p>
          <p v-if="filterdData && filterdData.length > 0">資訊更新時間 {{ updateTime }}</p>
        </div>
        <button class="btn btn-outline-primary-darken rounded-pill px-3" @click.prevent="reloadData">
          重整列表
        </button>
      </div>
    </div>

    <cards class="p-2" v-if="!onSearch" :calcMask="calcMask" :data.sync="filterdData" :adultDaily="adultDaily" :childDaily="childDaily" :newCenter="newCenter" @newCenter="emitNewCenter"></cards>
  </div>
</template>

<script>
import $ from 'jquery';
import L from 'leaflet';
import Cards from '@/components/Cards.vue';
import Cities from '@/assets/cityName.json';

export default {
  name: 'SideBar',
  props: ['allData', 'userPosition', 'calcMask', 'adultDaily', 'childDaily'],
  components: { Cards },
  data() {
    return {
      filterWay: '',
      onSearch: false,
      showResults: true,
      keyword: null,
      keywords: [],
      citySel: '',
      areaSel: '',
      newCenter: '',
      distance: 5000,
    };
  },
  computed: {
    filterdData() {
      const vm = this;
      let data;
      if (vm.allData) {
        if (vm.filterWay === 'byKeyword' && vm.keyword) {
          // 使用關鍵字搜尋，取得所有位置
          data = vm.allData.filter((pharmacy) => `${pharmacy.properties.name}${pharmacy.properties.address}`.includes(vm.keyword));
        } else if (vm.filterWay === 'bySelect') {
          // 使用縣市，取得所有位置
          const filterCounty = vm.allData.filter((pharmacy) => pharmacy.properties.county === vm.citySel);
          data = vm.areaSel === '' ? filterCounty : filterCounty.filter((pharmacy) => pharmacy.properties.town === vm.areaSel);
        } else {
          // 預設，使用所在地，取得方圓五里內藥局（預設），並由近排至遠
          const latlng = L.latLng(vm.userPosition);
          data = vm.allData
            .filter((pharmacy) => {
              // eslint-disable-next-line no-param-reassign
              pharmacy.dist = latlng.distanceTo(L.latLng(pharmacy.geometry.coordinates[1], pharmacy.geometry.coordinates[0]));
              return pharmacy.dist < vm.distance;
            })
            .sort((a, b) => a.dist - b.dist);
        }
      }
      return data;
    },
    updateTime() {
      const vm = this;
      let time;
      if (vm.filterdData && vm.filterdData.length > 0) {
        time = vm.filterdData[0].properties.updated.substr(10);
      }
      return time;
    },
    cities() {
      return Cities.map((city) => city.CityName);
    },
    areas() {
      const vm = this;
      let areaList;
      if (vm.citySel) {
        const areas = Cities.find((city) => city.CityName === vm.citySel);
        areaList = areas.AreaList.map((area) => area.AreaName);
      }
      return areaList;
    },
    today() {
      const today = new Date().getDay();
      if (today === 0) {
        return '不限字號';
      }
      return today % 2 === 0 ? '偶數' : '奇數';
    },
  },
  watch: {
    // 使用watch，change無法即時傳遞變更值
    filterdData() {
      const vm = this;
      if (vm.filterdData.length > 0) {
        const coordinates = [...vm.filterdData[0].geometry.coordinates];
        vm.newCenter = [coordinates[1], coordinates[0]];
        vm.emitNewCenter(vm.newCenter);
      }
    },
  },
  methods: {
    // 處理選取或點選卡片的位置並移動地圖
    emitNewCenter(newCenter) {
      const vm = this;
      vm.$emit('getNewCenter', newCenter);
    },
    reloadData() {
      const vm = this;
      vm.$emit('reloadData');
    },
    search(add) {
      const vm = this;
      if (vm.keyword) {
        if (vm.keywords.length > 4) {
          vm.keywords.pop();
        }
        vm.keywords.unshift(vm.keyword);
        vm.onSearch = false;
        localStorage.setItem('searchWords', JSON.stringify(vm.keywords));
        if (add) {
          vm.keyword = add;
        }
      }
    },
    clearKeywords() {
      const vm = this;
      vm.keywords = [];
      localStorage.setItem('searchWords', JSON.stringify(vm.keywords));
    },
    tooltipShow() {
      $('#tooltip').tooltip();
    },
  },
  created() {
    const vm = this;
    vm.keywords = JSON.parse(localStorage.getItem('searchWords')) || [];
  },
};
</script>
