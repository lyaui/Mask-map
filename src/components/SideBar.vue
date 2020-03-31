<template>
  <div class="menu col-sm-6 col-md-4 col-xl-3">
    <form class="search-bar form-inline align-items-baseline px-2 pt-2">
      <div v-if="!onSearch" class="d-flex w-100" style="margin-bottom: 6px;">
        <select
          class="custom-select w-50"
          v-model="citySel"
          @change="
            areaSel = '';
            filterWay = 'bySelect';
          "
        >
          <option value disabled selected hidden>請選擇縣市</option>
          <option v-for="city in cities" :key="city">{{ city }}</option>
        </select>
        <select class="custom-select w-50" v-model="areaSel" style="margin-left: 6px;">
          <option value disabled selected hidden>請選擇區域</option>
          <option v-for="area in areas" :key="area">{{ area }}</option>
        </select>
      </div>
      <div class="form-group d-flex w-100">
        <!-- @blur="onSearch = false" -->
        <button
          @click="onSearch = !onSearch"
          v-if="onSearch"
          class="shadow-none text-gray pl-0 pr-1"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <input
          @focus="
            onSearch = true;
            filterWay = 'byKeyword';
          "
          type="text"
          class="form-control search-input"
          placeholder="輸入地址 / 店名"
          v-model.trim="keyword"
        />

        <button
          @click.prevent="
            filterWay = 'byKeyword';
            citySel = '';
            areaSel = '';
            search();
          "
          class="btn shadow-none search-icon"
        >
          <img
            class="d-block d-sm-none"
            src="../assets/sources/ic_location@2x.png"
            v-if="!keyword"
            style="width: 24px; height: 24px;"
          />
        </button>
        <button @click.prevent="keyword = ''" class="btn shadow-none search-icon">
          <img
            v-if="keyword"
            class="d-block d-sm-none"
            src="../assets/sources/ic_delete@2x.png"
            alt=""
            style="width: 24px; height: 24px;"
          />
        </button>
        <button
          @click.prevent="
            filterWay = 'byKeyword';
            citySel = '';
            areaSel = '';
            search();
          "
          type="submit"
          class="btn btn-primary-darken px-5 d-none d-sm-block"
        >
          搜尋
        </button>
      </div>
      <ul
        v-if="onSearch && keyword && filterdData.length > 0"
        class="search-result-list list-group pl-5"
      >
        <li
          v-for="(item, i) in filterdData"
          :key="i"
          class="list-group-item border-bottom-0 rounded-0"
        >
          <i class="fas fa-map-marker-alt pr-1"></i> {{ item.properties.name }}
          <p class="pl-5">{{ item.properties.address }}</p>
        </li>
      </ul>
    </form>
    <div v-if="onSearch">
      <div>
        <div class="search-result-bar bg-primary-darken text-white px-2">最近搜尋</div>
        <ul v-if="keywords.length > 0" class="list-group list-group-flush px-2">
          <li
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
        <button
          id="tooltip"
          @mouseover="tooltipShow()"
          data-toggle="tooltip"
          data-trigger="hover"
          data-placement="right"
          data-html="true"
          :data-title="'奇數-身分證末碼 1,3,5,7,9 者<br>偶數-身分證末碼 0,2,4,6,8 者'"
        >
          <img src="@/assets/sources/ic_help@2x.png" />
        </button>
      </div>
      <div class="d-flex justify-content-between">
        <div>
          <p v-if="filterWay !== 'bySelect' && filterWay !== 'byKeyword'">
            距離方圓 5公里 以內的供應商
          </p>
          <p v-if="filterWay === 'bySelect'">{{ citySel }} {{ areaSel }} 以內的供應商</p>
          <p>資訊更新時間 {{ this.updateTime }}</p>
        </div>
        <button class="btn btn-outline-primary-darken rounded-pill px-3">重整列表</button>
      </div>
    </div>
    <cards
      class="p-2"
      v-if="!onSearch"
      :calcMask="calcMask"
      :data.sync="filterdData"
      :adultDaily="adultDaily"
      :childDaily="childDaily"
      :newCenter="newCenter"
      @newCenter="emitNewCenter"
    ></cards>
  </div>
</template>

<script>
import $ from "jquery";
import Cards from "@/components/Cards";
import Cities from "@/assets/cityName";

export default {
  props: ["allData", "userPosition", "calcMask", "adultDaily", "childDaily"],
  components: { Cards },
  data() {
    return {
      filterWay: "",
      onSearch: false,
      keyword: null,
      keywords: ["哈哈", "呵呵"],
      citySel: "",
      areaSel: "",
      newCenter: "",
    };
  },
  computed: {
    filterdData() {
      if (this.allData) {
        if (this.filterWay === "byKeyword" && this.keyword) {
          //使用關鍵字搜尋，取得所有位置
          return this.allData.filter((pharmacy) =>
            `${pharmacy.properties.name}${pharmacy.properties.address}`.includes(this.keyword)
          );
        } else if (this.filterWay === "bySelect") {
          //使用縣市，取得所有位置
          let filterCounty = this.allData.filter(
            (pharmacy) => pharmacy.properties.county === this.citySel
          );
          return this.areaSel === ""
            ? filterCounty
            : filterCounty.filter((pharmacy) => pharmacy.properties.town === this.areaSel);
        } else {
          //預設，使用所在地，取得方圓五里內藥局（預設）
          const latlng = L.latLng(this.userPosition);
          return this.allData.filter(
            (pharmacy) =>
              latlng.distanceTo(
                L.latLng(
                  pharmacy["geometry"]["coordinates"][1],
                  pharmacy["geometry"]["coordinates"][0]
                )
              ) < 5000
          );
        }
      }
    },
    updateTime() {
      if (this.filterdData) {
        return this.filterdData[0].properties.updated.substr(10);
      }
    },
    cities() {
      return Cities.map((city) => city["CityName"]);
    },
    areas() {
      if (this.citySel) {
        let areas = Cities.find((city) => city["CityName"] === this.citySel);
        return areas["AreaList"].map((area) => area["AreaName"]);
      }
    },
    today() {
      const today = new Date().getDay();
      if (today === 0) {
        return "不限字號";
      } else {
        return today % 2 === 0 ? "偶數" : "奇數";
      }
    },
  },
  watch: {
    //使用watch，change無法即時傳遞變更值
    filterdData() {
      if (this.filterdData && this.filterWay !== "") {
        let coordinates = [...this.filterdData[0]["geometry"]["coordinates"]];
        this.newCenter = [coordinates[1], coordinates[0]];
        this.emitNewCenter(this.newCenter);
      }
    },
  },
  methods: {
    //處理選取或點選卡片的位置並移動地圖
    emitNewCenter(newCenter) {
      this.$emit("getNewCenter", newCenter);
    },
    tooltipShow() {
      $("#tooltip").tooltip();
    },
    isOpening(time) {
      let isOpening, openingBg, openingTextColor;
      if (!time || time === "") {
        isOpening = "無資料";
      } else {
        const morning = time.split("").slice(0, 7);
        const afternoon = time.split("").slice(7, 14);
        const night = time.split("").slice(14, 21);
        let today = new Date().getDay();
        today = today === 0 ? today : 7;
        const hour = new Date().getHours();

        switch (true) {
          //0~9 & 22點以後
          case hour < 9:
            isOpening = "休息中";
            openingBg = "bg-gray";
            openingTextColor = "isClosed";
            break;
          //上午 9~13
          case hour < 14:
            isOpening = morning[today - 1] === "N" ? "休息中" : "營業中";
            openingBg = morning[today - 1] === "N" ? "bg-gray" : "bg-primary";
            openingTextColor = morning[today - 1] === "N" ? "isClosed" : "isOpening";
            break;
          //下午 14~17
          case hour < 18:
            isOpening = afternoon[today - 1] === "N" ? "休息中" : "營業中";
            openingBg = afternoon[today - 1] === "N" ? "bg-gray" : "bg-primary";
            openingTextColor = afternoon[today - 1] === "N" ? "isClosed" : "isOpening";
            break;
          //晚上 18~22
          case hour < 21:
            isOpening = night[today - 1] === "N" ? "休息中" : "營業中";
            openingBg = night[today - 1] === "N" ? "bg-gray" : "bg-primary";
            openingTextColor = night[today - 1] === "N" ? "isClosed" : "isOpening";
            if (hour === 20 && isOpening === "營業中") {
              isOpening = "即將休息";
              openingBg = "bg-secondary";
              openingTextColor = "nearlyClose";
            }
            break;
          case hour < 24:
            isOpening = "休息中";
            openingBg = "bg-gray";
            openingTextColor = "isClosed";
            break;
        }
      }
      return { status: isOpening, color: openingBg, text: openingTextColor };
    },
  },
  mounted() {
    if (this.userPosition !== [25.033671, 121.564427]) {
      this.filterWay === "byPosition";
    }
  },
};
</script>
