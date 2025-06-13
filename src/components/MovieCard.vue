<script setup>
import StarRating from "./StarRating.vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const props = defineProps(["movie"]);
const id = props.movie.id;
</script>

<template>
  <div class="movie">
    <router-link :to="`/movies/${id}`">
      <img
        class="cover"
        :src="
          props.movie.cover ||
          'https://thumbs.dreamstime.com/b/error-not-found-page-concept-d-isometric-view-vector-web-app-design-illustration-website-problem-256061684.jpg'
        "
        alt="Movie Cover"
      />
      <p class="movie-id">{{ props.movie.id }}</p>
      <p class="movie-name">{{ props.movie.name }}</p>

      <!-- ✅ Use StarRating component -->

      <StarRating :rating="props.movie.rating" />
    </router-link>
  </div>
</template>

<style scoped>
a {
  text-decoration: none;
}

.movie {
  width: 500px;
  box-shadow: 2px 2px 2px grey;
  border: 1px solid black;
}
.cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}
.movie-id {
  font-size: 10px;
  color: brown;
  margin: 4px 0 20px 40px;
}
.movie-name {
  font-size: 28px;
  font-weight: 600;
  color: #1e2a78; /* Deep blue tone */
  margin: 8px 0;
  text-align: center;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: 1px;
  text-transform: capitalize;
}
</style>
