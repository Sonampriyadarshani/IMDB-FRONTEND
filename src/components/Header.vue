<script setup>
import {RouterLink} from 'vue-router'

function logout(){
  localStorage.removeItem('token')
}
</script>

<template>
  <header>
    <RouterLink to="/">
      <img src="../assets/logo.svg" alt="Logo" height="25">
    </RouterLink>

    <RouterLink to="/profile">
      Profile
    </RouterLink>

    <RouterLink to="/register">
      Register
    </RouterLink>

    <RouterLink to="/login">
      Login
    </RouterLink>
    <RouterLink to="/login" @click="logout">
      Logout
    </RouterLink>
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