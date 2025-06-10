<script setup>
import moment from "moment/moment";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import StarRating from "../components/StarRating.vue";
import RatingList from "./RatingList.vue";

const route = useRoute();
const router = useRouter();

const movie = ref(null);
const isEditingName = ref(false);
const newName = ref("");
const isEditingCover = ref(false);

// Fetch movie details
async function fetchMovieDetails() {
  try {
    const backend = import.meta.env.VITE_BACKEND;
    const token = localStorage.getItem("token");
    const id = route.params.id;

    const res = await fetch(`${backend}/movies/${id}`, {
      headers: {
        Authorization: ` Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error(json.message || "Failed to fetch movie");
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
      movie.value = null;
      return;
    }

    movie.value = json.movie;
    newName.value = json.movie.name;
  } catch (err) {
    errorMsg.value = err.message;
    movie.value = null;
  }
}

// Upload movie cover
async function updateMovieCover(event) {
  const id = route.params.id;
  try {
    const backend = import.meta.env.VITE_BACKEND;
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("cover", event.target.files[0]);

    const res = await fetch(`${backend}/movies/${id}/cover`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error(json.message || "Failed to upload cover");
      return;
    }
    isEditingCover.value = false;

    toast.success("Cover uploaded!");
    movie.value.cover = json.cover;
  } catch (err) {
    toast.error("Error: " + err.message);
  }
}

// Delete movie
async function deleteMovie() {
  if (!confirm("Are you sure you want to delete this movie?")) return;

  const backend = import.meta.env.VITE_BACKEND;
  const token = localStorage.getItem("token");
  const id = route.params.id;

  const res = await fetch(`${backend}/movies/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    toast.success("Movie deleted!");
    router.push("/");
  } else {
    const json = await res.json();
    toast.error(json.message || "Failed to delete movie");
  }
}

// Delete movie cover
async function deleteCover() {
  if (!confirm("Are you sure you want to delete the movie cover?")) return;

  const backend = import.meta.env.VITE_BACKEND;
  const token = localStorage.getItem("token");
  const id = route.params.id;

  const res = await fetch(`${backend}/movies/${id}/cover`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    toast.error(json.message || "Failed to delete cover");
    return;
  }
  toast.success("Cover deleted!");
  movie.value.cover = null;
  isEditingCover.value = false;
}

// Update movie name
async function updateMovieName() {
  const backend = import.meta.env.VITE_BACKEND;
  const token = localStorage.getItem("token");
  const id = route.params.id;

  const res = await fetch(`${backend}/movies/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: newName.value }),
  });

  const json = await res.json();

  if (!res.ok) {
    toast.error(json.message || "Failed to update movie name");
    return;
  }

  toast.success("Movie name updated!");
  movie.value.name = newName.value;
  isEditingName.value = false;
}

onMounted(fetchMovieDetails);
</script>

<template>
  <div v-if="movie">
    <div>
      <img
        height="500"
        :src="
          movie.cover ||
          'https://thumbs.dreamstime.com/b/error-not-found-page-concept-d-isometric-view-vector-web-app-design-illustration-website-problem-256061684.jpg'
        "
        alt="cover"
      />
    </div>
    <button v-if="!isEditingCover" @click="isEditingCover = true">
      Edit Cover
    </button>
    <button @click="deleteMovie">DELETE MOVIE</button>
    <button v-if="isEditingCover" @click="deleteCover">Delete Cover</button>
    <div v-if="isEditingCover" class="edit-cover">
      <input
        type="file"
        accept="image/*"
        @change="(e) => updateMovieCover(e)"
      />
      <button @click="isEditingCover = false">Cancel</button>
    </div>

    <h1>
      <span v-if="!isEditingName">{{ movie.name }}</span>

      <span v-else>
        <input v-model="newName" />
        <button @click="updateMovieName">Save</button>
        <button @click="isEditingName = false">Cancel</button>
      </span>
      <label v-if="!isEditingName" @click="isEditingName = true">✏️</label>
    </h1>
    <p>Movie ID: {{ movie.id }}</p>
    <p>Rating:<StarRating :rating="movie.rating" /></p>

    <p><strong>Created At:</strong> {{ moment(movie.createdAt).fromNow() }}</p>
    <form action="/ratings/:movieId"></form>
  </div>
  <RatingList
    @update-movie-rating="(e) => (movie.rating = e)"
    :movie="route.params.id"
  />
</template>

<style scoped></style>
