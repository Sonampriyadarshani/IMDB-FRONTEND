<script setup>
import moment from "moment/moment";

import { onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import MovieCard from "../components/MovieCard.vue";
import { toast } from "vue3-toastify";

const router = useRouter();

const movies = ref([]);
const page = ref(1);
const limit = ref(10);
const search = ref("");
const count = ref(0);

// Show only movies up to selected pageSize and filtered by searchQuery
const totalPages = computed(() => Math.ceil(count.value / limit.value));

// Fetch movies from backend

async function fetchMovies() {
  try {
    const backend = import.meta.env.VITE_BACKEND;
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      limit: limit.value,
      page: page.value,
      search: search.value,
    });
    const response = await fetch(`${backend}/movies?${params}`, {
      // movies/${id}
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      toast.error(json.message || "Failed to fetch movies");
      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
      return;
    }

    movies.value = json.movies;
    count.value = json.count;
    console.log("Movies set:", movies.value);
    toast.success("Movies fetched successfully");
  } catch (error) {
    toast.error("Error: " + error.message);
  }
}

//watch
watch(page, fetchMovies);
watch([limit, search], () => {
  if (page.value !== 1) {
    page.value = 1;
  } else {
    fetchMovies();
  }
});

// Check auth and fetch data on mount
onMounted(() => {
  let token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  fetchMovies();
});
</script>

<template>
  <div class="header-bar">
    <h1>Home</h1>

    <form action="/create">
      <button class="movieButton">Create Movie</button>
    </form>
  </div>

  <div class="movies-wrapper">
    <div class="top-controls">
      <div class="movieCount">
        <b>{{ count }} movies</b>
      </div>
      <div class="top-note">
        <label for="pageSize">Show per page:</label>
        <select id="pageSize" v-model="limit">
          <option
            v-for="option in [10, 20, 25, 50]"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </div>
      <div>{{ search }}</div>
      <div class="top-search">
        <label for="search">Search:</label>
        <input
          type="text"
          id="search"
          v-model.lazy="search"
          placeholder="Search movie..."
        />
      </div>
    </div>

    <!-- Movie List -->
    <div class="movies">
      <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
    </div>
    <!--pages-->

    <div class="buttons">
      <button
        v-for="n of totalPages"
        :class="{ active: n === page }"
        @click="page = n"
      >
        {{ n }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #f0f0f0;
  border-bottom: 1px solid #ccc;
}

h1 {
  font-size: 2rem;
  color: #333;
}

.movieButton {
}

.buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 40px 0 20px;
}

.buttons button {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #ffffff;
  color: #333;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.buttons button:hover {
  background-color: #e6f0ff;
  border-color: #007bff;
  color: #007bff;
}

.buttons button.active {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  border-color: #007bff;
}

.buttons button.active:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.movies-wrapper {
  padding: 20px 40px;
  max-width: 1200px;
  margin: auto;
}

.top-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.movie-count {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.top-note,
.top-search {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
}

.top-controls .right-controls {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
}

input[type="text"],
select {
  padding: 5px 10px;
  font-size: 0.85rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: auto;
  min-width: 100px;
}

.movies {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.pagination {
  display: flex;
  justify-content: center; /* Center the buttons */
  flex-wrap: wrap;
  gap: 12px; /* Gap between buttons */
  margin: 40px 0 20px;
}

.pagination button {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #fff;
  color: #333;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 40px;
}

.pagination button:hover {
  background-color: #e6f0ff;
  border-color: #007bff;
  color: #007bff;
}

.pagination button.active {
  background-color: #007bff;
  color: #fff;
  font-weight: bold;
  border: 1px solid #007bff;
}

.pagination button.active:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
</style>
