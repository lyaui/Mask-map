<template>
  <div v-if="data" class="search-results">
    <div class="card border-0 p-1 mb-3 w-100" v-for="(item, i) in data.slice(0, showNum)" :key="item.properties.i" @click="emitNewCenter(item)" :id="i">
      <div class="card-body p-0">
        <div class="d-flex mb-5 mask-num">
          <div class="px-2 py-1 w-100 rounded mr-2 text-white maskStatus" :class="calcMask(item.properties['mask_adult'], adultDaily)">
            <p>成人口罩數量</p>
            <p class="mb-0">
              <span>{{ item.properties['mask_adult'] }}</span
              >片
            </p>
          </div>
          <div class="px-2 py-1 w-100 rounded text-white maskStatus" :class="calcMask(item.properties['mask_child'], childDaily)">
            <p>兒童口罩數量</p>
            <p class="mb-0">
              <span>{{ item.properties['mask_child'] }}</span
              >片
            </p>
          </div>
        </div>
        <div class="pharmacy-info text-primary-darken">
          <div class="d-flex">
            <div class="rounded-right opening-status" :class="isOpening(item.properties['service_periods']).color"></div>
            <h5 class="mb-5">
              {{ item.properties.name }}
            </h5>
            <span class="badge ml-1 px-1" :class="isOpening(item.properties['service_periods']).text"> {{ isOpening(item.properties['service_periods']).status }}</span>
          </div>
          <div class="info-details">
            <div class="mb-1 d-flex justify-content-between flex-wrap">
              <div class="d-flex">
                <span class="text-primary-darken">地址</span>
                <p>{{ item.properties.address }}</p>
              </div>
              <a target="_blank" :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"><u>地圖查看</u></a>
            </div>
            <div class="mb-1 d-flex justify-content-between flex-wrap">
              <div class="d-flex">
                <span class="text-primary-darken">電話</span>
                <p>{{ item.properties.phone.replace(/\s/g, '') }}</p>
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
    <div class="d-flex flex-column">
      <span class="text-primary-darken mb-1 text-center">尚有 {{ data.length - showNum >= 0 ? data.length - showNum : 0 }} 筆資料</span>
      <div class="d-flex w-100 more-info">
        <button v-if="data.length >= showNum" class="btn btn-primary-darken rounded-pill px-0 py-1 shadow-lg mb-2 load-more-btn" @click="showNum += 5">
          查看更多
        </button>
        <button v-if="data.length > 0" class="btn btn-primary-darken p-0 shadow-lg go-top-btn">
          <a href="#0" class="text-white" style="padding: 10px;">TOP</a>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Cards',
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
  watch: {
    data() {
      const vm = this;
      vm.showNum = 8;
    },
  },
  methods: {
    emitNewCenter(item) {
      const vm = this;
      const { coordinates } = item.geometry;
      const newCenter = [coordinates[1], coordinates[0]];
      vm.$emit('newCenter', newCenter);
    },
    isOpening(time) {
      let isOpening;
      let openingBg;
      let openingTextColor;
      if (!time || time === '') {
        isOpening = '無資料';
      } else {
        const morning = time.split('').slice(0, 7);
        const afternoon = time.split('').slice(7, 14);
        const night = time.split('').slice(14, 21);
        let today = new Date().getDay();
        today = today === 0 ? today : 7;
        const hour = new Date().getHours();

        if (hour < 9 || hour >= 21) {
          // 0~9 & 21點以後
          isOpening = '休息中';
          openingBg = 'bg-gray';
          openingTextColor = 'isClosed';
        } else if (hour >= 9 < 14) {
          // 上午 9~13
          isOpening = morning[today - 1] === 'N' ? '休息中' : '營業中';
          openingBg = morning[today - 1] === 'N' ? 'bg-gray' : 'bg-primary';
          openingTextColor = morning[today - 1] === 'N' ? 'isClosed' : 'isOpening';
        } else if (hour >= 14 < 18) {
          // 下午 14~17
          isOpening = afternoon[today - 1] === 'N' ? '休息中' : '營業中';
          openingBg = afternoon[today - 1] === 'N' ? 'bg-gray' : 'bg-primary';
          openingTextColor = afternoon[today - 1] === 'N' ? 'isClosed' : 'isOpening';
        } else if (hour >= 18 < 22) {
          // 晚上 18~21
          isOpening = night[today - 1] === 'N' ? '休息中' : '營業中';
          openingBg = night[today - 1] === 'N' ? 'bg-gray' : 'bg-primary';
          openingTextColor = night[today - 1] === 'N' ? 'isClosed' : 'isOpening';
          if (hour === 20 && isOpening === '營業中') {
            isOpening = '即將休息';
            openingBg = 'bg-secondary';
            openingTextColor = 'nearlyClose';
          }
        }
      }
      return { status: isOpening, color: openingBg, text: openingTextColor };
    },
  },
  created() {
    const vm = this;
    vm.keywords = JSON.parse(localStorage.getItem('searchWords')) || [];
  },
};
</script>
