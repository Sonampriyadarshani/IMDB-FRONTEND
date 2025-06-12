<script setup>
import { ref, onMounted, watch, computed } from "vue";
import moment from "moment/moment";
import { useRouter, useRoute } from "vue-router";
import { toast } from "vue3-toastify";
import StarRating from "@/components/StarRating.vue";

const router = useRouter();
const route = useRoute();
const rating = ref(0);
const review = ref("");
const props = defineProps(["movie"]);
const emit = defineEmits(["updateMovieRating"]);
const limit = ref(10);
const page = ref(1);
const ratings = ref([]);
const count = ref(0);
const selectedRating = ref("all");

// Show only movies up to selected pageSize and filtered by searchQuery
const totalPages = computed(() => Math.ceil(count.value / limit.value));

async function fetchRating() {
  try {
    const backend = import.meta.env.VITE_BACKEND;
    const token = localStorage.getItem("token");
    const Id = route.params.id;

    const obj = {
      limit: limit.value,
      page: page.value,
    };
    if (selectedRating.value !== "all") {
      obj.rating = selectedRating.value;
    }
    const params = new URLSearchParams(obj);

    const res = await fetch(`${backend}/ratings/${Id}?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error(json.message || "Failed to fetch movies");
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
      return;
    }

    ratings.value = json.ratings;
    count.value = json.count;
    toast.success("Ratings fetched successfully");
  } catch (error) {
    toast.error("Error: " + error.message);
  }
}
async function setRating() {
  try {
    const token = localStorage.getItem("token");
    const backend = import.meta.env.VITE_BACKEND;
    const res = await fetch(`${backend}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movie: props.movie,
        rating: rating.value,
        review: review.value,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      toast.error(json.message);
      return;
    }
    ratings.value.push(json.rating);
    emit("updateMovieRating", json.movieRating);
    rating.value = 0;
    review.value = "";
    count.value++;

    toast.success("Rating Create successfully");
  } catch (error) {
    toast.error("Error: " + error.message);
  }
}

// Delete movie cover
async function deleteRating(rating) {
  if (!confirm("Are you sure you want to delete the rating page?")) return;

  const backend = import.meta.env.VITE_BACKEND;
  const token = localStorage.getItem("token");

  const res = await fetch(`${backend}/ratings/${rating.id}`, {
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
  toast.success("Rating deleted!");
  ratings.value = ratings.value.filter((e) => e.id !== rating.id);
  count.value--;
}
watch(selectedRating, fetchRating);
onMounted(() => {
  let token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  fetchRating();
});
</script>

<template>
  <!-- Rating Form -->
  <form @submit.prevent="handleSubmit">
    <div>
      <label>Your Rating:</label>
      <span>
        <StarRating :rating @change="(e) => (rating = e)" />
      </span>
    </div>

    <div>
      <label>Review:</label>
      <textarea v-model="review" required></textarea>
    </div>

    <button type="submit" @click="setRating">Submit</button>
  </form>

  <!-- Filter Section -->
  <div class="ratings-container">
    <div class="RatingCount">Ratings-{{ count }}</div>
    <div class="filter-section">
      <label for="rating-filter">Filter by Rating:</label>
      <select v-model="selectedRating">
        <option value="all">All Ratings</option>
        <option value="5">5 Star</option>
        <option value="4">4 Star</option>
        <option value="3">3 Star</option>
        <option value="2">2 Star</option>
        <option value="1">1 Star</option>
      </select>
    </div>

    <!-- Ratings List -->
    <div class="ratings-list">
      <div class="rating-card" v-for="rating in ratings" :key="rating.id">
        <p>user:{{ rating.user }}</p>
        <p>
          <strong>Rating:</strong>

          <StarRating :rating="rating.rating" />
        </p>
        <p><strong>Review:</strong> {{ rating.review }}</p>
        <p>
          <strong>Created At:</strong> {{ moment(ratings.createdAt).fromNow() }}
        </p>
        <button @click="deleteRating(rating)">❌</button>
      </div>
    </div>
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
/* ===========================
   General Container & Layout
=========================== */
.ratings-container {
  padding: 2rem 0;
  max-width: 800px;
  margin: 0 auto;
  border-top: 1px solid #ddd;
}

.RatingCount {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 0 40px;
  flex-wrap: wrap;
}

/* ===========================
   Rating Form
=========================== */
form {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

form div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #fff;
  resize: vertical;
  box-sizing: border-box;
}

/* Submit Button */
button[type="submit"] {
  padding: 10px 18px;
  font-size: 14px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #45a049;
}

/* ===========================
   Filter Section
=========================== */
.filter-section {
  margin: 10px 0;
}

select {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

/* ===========================
   Ratings List
=========================== */
.ratings-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

/* Rating Card */
.rating-card {
  padding: 16px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.rating-card:hover {
  transform: translateY(-4px);
}

.rating-card p {
  margin: 8px 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

/* Star Rating (inside cards or form) */
.stars {
  font-size: 18px;
  color: #f5b301;
  margin-bottom: 8px;
}

/* ===========================
   Pagination Buttons
=========================== */
.buttons {
  margin-top: 20px;
  text-align: center;
}

.buttons button {
  margin: 0 5px;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  background-color: #eee;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.buttons button.active {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

.buttons button:hover {
  background-color: #45a049;
  color: white;
}

/* ===========================
   Responsive Design
=========================== */
@media (max-width: 600px) {
  form,
  .ratings-container {
    padding: 15px;
  }

  .rating-card {
    padding: 12px;
  }
}
</style>
