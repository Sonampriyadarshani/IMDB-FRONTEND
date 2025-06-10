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
      <button>Create Movie</button>
    </form>
  </div>

  <div class="movies-wrapper">
    <div class="top-controls">
      <div class="movieCount">{{ count }} movies</div>
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
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 40px;
}
h1 {
  text-align: center;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  margin: 20px 5px;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  display: block;
}

button:hover {
  background-color: #0056b3;
}

.movies-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.movies {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.top-controls {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
  padding: 0 40px;
  flex-wrap: wrap;
}

.top-note,
.top-search {
  display: flex;
  align-items: center;
  gap: 10px;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
}
.active {
  background-color: red;
}
.active:hover {
  background-color: rgb(142, 30, 30);
}
.movieCount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
  padding: 0 40px;
  flex-wrap: wrap;
  font-weight: bold;
}
</style>
