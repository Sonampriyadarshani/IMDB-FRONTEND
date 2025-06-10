<script setup>
import moment from "moment/moment";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";

const router = useRouter();

const movieName = ref("");

async function CreateMovie() {
  try {
    const token = localStorage.getItem("token");
    const backend = import.meta.env.VITE_BACKEND;
    const res = await fetch(`${backend}/movies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: movieName.value,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      toast.error(json.message);
      return;
    }
    movieName.value = json.user;

    toast.success("Movie Create successfully");
    await new Promise((res) => setTimeout(res, 2000));

    router.push("/");
  } catch (error) {
    toast.error("Error: " + error.message);
  }
}
</script>

<template>
  <div class="container">
    <h1>Create Movie</h1>
    <input type="text" placeholder="create movie name" v-model="movieName" />
    <p>
      <strong>Created At:</strong> {{ moment(movieName.createdAt).fromNow() }}
    </p>
    <button class="save-btn" @click="CreateMovie">save</button>
  </div>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-family: sans-serif;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

input[type="text"] {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.save-btn {
  background-color: #218838;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
}
</style>
