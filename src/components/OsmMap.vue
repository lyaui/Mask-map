<template>
  <div class="col-sm-6 col-md-8 col-xl-9">
    <l-map :zoom="zoom" :center="userPosition" :minZoom="6" class="h-100" ref="mapInfo">
      <l-tile-layer :url="url"></l-tile-layer>
      <l-marker-cluster ref="clusterRef">
        <l-marker
          v-for="(item, i) in allData"
          :lat-lng="[item['geometry']['coordinates'][1], item['geometry']['coordinates'][0]]"
          :key="i"
          ref="marker"
          @add="openPopup"
        >
          <l-popup
            :options="{ autoPan: false, autoClose: false, closeOnClick: false, closeButton: false }"
            ><a
              target="_blank"
              class="text-center d-block"
              :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
              >{{ item["properties"]["name"] }}</a
            >
            <div class="d-flex justify-content-center w-100">
              <div
                class="popup-masknum"
                :class="calcMask(item.properties['mask_adult'], adultDaily)"
              >
                {{ item.properties["mask_adult"] }}
              </div>
              <div
                class="popup-masknum"
                :class="calcMask(item.properties['mask_child'], childDaily)"
              >
                {{ item.properties["mask_child"] }}
              </div>
            </div>
          </l-popup>
        </l-marker>
      </l-marker-cluster>
    </l-map>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import LMarkerCluster from "vue2-leaflet-markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Icon } from "leaflet";
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  iconSize: [0, 0],
});

export default {
  props: ["allData", "calcMask", "adultDaily", "childDaily", "newCenter", "userPosition"],
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LMarkerCluster,
  },
  data() {
    return {
      zoom: 16,
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      map: null,
    };
  },
  methods: {
    openPopup: function (event) {
      this.$nextTick(() => {
        event.target.openPopup();
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.map = this.$refs.mapInfo.mapObject;
    });
  },
};
</script>
