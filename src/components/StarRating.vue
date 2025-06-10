<script setup>
import { computed, ref } from "vue";
import { Icon } from "@iconify/vue";

const props = defineProps(["rating"]);
const emit = defineEmits(["change"]);

const filledCount = computed(() => Math.floor(props.rating));
const unfilledCount = computed(() => 5 - filledCount.value);

const color = computed(() => {
  if (filledCount.value === 0) {
    return "grey";
  } else if (filledCount.value === 1) {
    return "red";
  } else if (filledCount.value === 2) {
    return "orangered";
  } else if (filledCount.value === 3) {
    return "yellow";
  } else if (filledCount.value === 4) {
    return "lightgreen";
  } else if (filledCount.value === 5) {
    return "green";
  }
});
</script>

<template>
  <div>
    <Icon
      v-for="e of filledCount"
      icon="material-symbols:star"
      class="icon"
      :class="color"
      @click="emit('change', e)"
    />
    <Icon
      v-for="e of unfilledCount"
      icon="material-symbols:star-outline"
      class="icon"
      :class="color"
      @click="emit('change', e + filledCount)"
    />
    <span class="rating" :class="color">{{ rating }}</span>
  </div>
</template>

<style scoped>
.icon {
  font-size: 20px;
}

.red {
  color: red;
}

.orangered {
  color: orangered;
}

.yellow {
  color: rgb(237, 237, 0);
}

.lightgreen {
  color: rgb(0, 197, 0);
}

.green {
  color: rgb(0, 160, 0);
}

.grey {
  color: grey;
}

.rating {
  font-size: 18px;
  font-weight: bold;
  margin-left: 5px;
}

div {
  display: flex;
  align-items: center;

  margin: 0 0 20px 40px;
}
</style>
