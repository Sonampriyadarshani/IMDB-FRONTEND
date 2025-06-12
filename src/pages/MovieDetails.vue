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

<style scoped>
/* Container */
div[v-if="movie"] {
  max-width: 800px;
  margin: 20px auto;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

/* Movie Cover */
img {
  width: 50%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 16px;
}

/* Buttons */
button {
  margin: 6px 6px 6px 0;
  padding: 8px 14px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

/* Special buttons */
button:nth-of-type(2) {
  background-color: #dc3545;
}
button:nth-of-type(3) {
  background-color: #ffc107;
  color: #000;
}
.edit-cover button:last-of-type {
  background-color: #6c757d;
}

/* Edit Section */
.edit-cover {
  margin-top: 10px;
}

.edit-cover input[type="file"] {
  margin-bottom: 8px;
}

/* Title */
h1 {
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

h1 input {
  font-size: 16px;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Text */
p {
  font-size: 14px;
  color: #333;
  margin: 8px 0;
}

label {
  cursor: pointer;
  font-size: 18px;
}
</style>
