<script setup>
import { RouterLink } from "vue-router";
import { useAppStore } from "../store/app.js";

const app = useAppStore();
</script>

<template>
  <header>
    <RouterLink to="/">
      <img src="../assets/logo.svg" alt="Logo" height="25" />
    </RouterLink>

    <template v-if="app.user">
      <RouterLink to="/profile"> Profile </RouterLink>

      <RouterLink to="/login" @click="app.logout"> Logout </RouterLink>
    </template>

    <template v-else>
      <RouterLink to="/register"> Register </RouterLink>

      <RouterLink to="/login"> Login </RouterLink>
    </template>
  </header>
</template>

<style scoped>
header {
  height: 50px;
  background-color: rgb(237, 184, 106);
  display: flex;
  align-items: center;
}

header img {
  margin-left: 30px;
}

a {
  color: orangered;
  font-weight: bold;
  margin-inline: 20px;
  text-decoration: none;
}
</style>
