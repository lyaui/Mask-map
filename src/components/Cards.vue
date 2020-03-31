<template>
  <div v-if="data" class="search-results d-flex flex-column align-items-center" id="result-top">
    <div
      class="card border-0 p-1 mb-3 w-100"
      v-for="item in data.slice(0, showNum)"
      :key="item.properties.id"
      @click="emitNewCenter(item)"
    >
      <div class="card-body p-0">
        <div class="d-flex mb-5 mask-num">
          <div
            class="px-2 py-1 w-100 rounded mr-2 text-white maskStatus"
            :class="calcMask(item.properties['mask_adult'], adultDaily)"
          >
            <p>成人口罩數量</p>
            <p class="mb-0">
              <span>{{ item.properties["mask_adult"] }}</span
              >片
            </p>
          </div>
          <div
            class="px-2 py-1 w-100 rounded text-white maskStatus"
            :class="calcMask(item.properties['mask_child'], childDaily)"
          >
            <p>兒童口罩數量</p>
            <p class="mb-0">
              <span>{{ item.properties["mask_child"] }}</span
              >片
            </p>
          </div>
        </div>
        <div class="pharmacy-info text-primary-darken">
          <div class="d-flex">
            <div
              class="rounded-right opening-status"
              :class="isOpening(item.properties['service_periods']).color"
            ></div>
            <h5 class="mb-5">
              {{ item.properties.name }}
            </h5>
            <span
              class="badge ml-1 px-1"
              :class="isOpening(item.properties['service_periods']).text"
            >
              {{ isOpening(item.properties["service_periods"]).status }}</span
            >
          </div>
          <div class="info-details">
            <div class="mb-1 d-flex justify-content-between flex-wrap">
              <div class="d-flex">
                <span class="text-primary-darken">地址</span>
                <p>{{ item.properties.address }}</p>
              </div>
              <a
                target="_blank"
                :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                ><u>地圖查看</u></a
              >
            </div>
            <div class="mb-1 d-flex justify-content-between flex-wrap">
              <div class="d-flex">
                <span class="text-primary-darken">電話</span>
                <p>{{ item.properties.phone.replace(/\s/g, "") }}</p>
              </div>

              <a :href="`tel:${item.properties.phone.replace(/\s/g, '')}`"><u>播打電話</u></a>
            </div>
            <div class="d-flex">
              <span class="text-primary-darken">備註</span>
              <p class="mb-1 w-100">{{ item.properties.note }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <span class="text-primary-darken mb-1 text-center"
      >尚有 {{ data.length - showNum >= 0 ? data.length - showNum : 0 }} 筆資料</span
    >
    <div class="d-flex w-100 more-info">
      <button
        v-if="data.length >= showNum"
        class="btn btn-primary-darken rounded-pill px-0 py-1 shadow-lg mb-2 load-more-btn"
        @click="showNum += 5"
      >
        查看更多
      </button>
      <button class="btn btn-primary-darken p-0 shadow-lg go-top-btn">
        TOP
      </button>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
export default {
  props: {
    data: {
      type: Array,
    },
    adultDaily: {
      type: Number,
    },
    childDaily: {
      type: Number,
    },
    calcMask: {
      type: Function,
    },
  },
  data() {
    return { showNum: 8 };
  },
  methods: {
    emitNewCenter(item) {
      const coordinates = item["geometry"]["coordinates"];
      const newCenter = [coordinates[1], coordinates[0]];
      this.$emit("newCenter", newCenter);
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
};
</script>
