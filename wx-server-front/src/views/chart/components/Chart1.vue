<template>
  <div id="container1"></div>
</template>

<script setup>
import { onMounted, reactive } from "vue";
import { Chart } from "@antv/g2";

var chartObject = null;
const data = reactive([
  { year: "1951 年", sales: 38 },
  { year: "1952 年", sales: 52 },
  { year: "1956 年", sales: 61 },
  { year: "1957 年", sales: 145 },
  { year: "1958 年", sales: 48 },
  { year: "1959 年", sales: 38 },
  { year: "1960 年", sales: 38 },
  { year: "1962 年", sales: 38 },
]);

/**
 * 初始化 chart
 */
const chartInit = () => {
  chartObject = new Chart({
    container: "container1",
    autoFit: true,
    height: 500,
  });

  chartObject.data(data);

  chartObject.scale("sales", {
    nice: true,
  });

  chartObject.tooltip({
    showMarkers: false,
  });
  chartObject.interaction("active-region");

  chartObject.interval().position("year*sales");

  chartObject.render();
};

const createData = () => {
  var data = [];
  for (var i = 1950; i < 1960; i++) {
    data.push({
      year: i + " 年",
      sales: Math.floor(Math.random() * 200),
    });
  }
  chartObject.changeData(data);
};

onMounted(() => {
  chartInit();
  createData();
  setInterval(() => createData(), 2000);
});
</script>

<style scoped></style>
