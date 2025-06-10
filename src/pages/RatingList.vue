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
        <p>
          <strong>Rating:</strong>
          <span class="stars">
            <span v-for="star in 5" :key="star">
              {{ star <= rating.rating ? "★" : "☆" }}
            </span>
            <StarRating :rating />
          </span>
        </p>
        <p><strong>Review:</strong> {{ rating.review }}</p>
        <p>
          <strong>Created At:</strong> {{ moment(ratings.createdAt).fromNow() }}
        </p>
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
    </div>
  </div>
</template>

<style scoped>
/* General container spacing */
.ratings-container {
  padding: 20px 0;
  border-top: 1px solid #ddd;
  max-width: 800px;
  margin: 0 auto;
}

/* Rating form styles */
form {
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: #f9f9f9;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

form div {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
  color: #333;
}

textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  resize: vertical;
  background-color: #fff;
  box-sizing: border-box;
}

button[type="submit"] {
  padding: 10px 18px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

button[type="submit"]:hover {
  background-color: #45a049;
}

/* Star rating (form) */
form .stars span {
  font-size: 22px;
  color: gold;
  cursor: pointer;
  margin-right: 3px;
}

/* Filter dropdown section */
.filter-section {
  margin: 10px 0;
}

select {
  padding: 6px 12px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 14px;
}

/* Rating card layout */
.ratings-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.rating-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 16px;
  transition: transform 0.2s;
}

.rating-card:hover {
  transform: translateY(-4px);
}

/* Rating stars in each card */
.stars {
  color: #f5b301;
  font-size: 18px;
  margin-bottom: 8px;
  display: inline-block;
}

/* Text styles */
.rating-card p {
  margin: 8px 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

/* Responsive spacing */
@media (max-width: 600px) {
  form,
  .ratings-container {
    padding: 15px;
  }

  .rating-card {
    padding: 12px;
  }
}
.RatingCount {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
  padding: 0 40px;
  flex-wrap: wrap;
}
</style>
