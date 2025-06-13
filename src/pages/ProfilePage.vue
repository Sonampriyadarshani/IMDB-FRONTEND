<script setup>
import moment from "moment/moment";
import { nextTick, ref } from "vue";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";

import { useAppStore } from "../store/app.js";

const router = useRouter();
const app = useAppStore();
onMounted(() => {
  let token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  fetchUser();
});

// User data
const user = ref();

const isEditingEmail = ref(false);

const emailInput = ref(null);
function editEmail() {
  isEditingEmail.value = true;
  nextTick(() => emailInput.value?.focus());
}
//edit photo
const isEditingPhoto = ref(false);

//editi password
const showPasswordFields = ref(false);
const passwords = ref({
  old: "",
  new: "",
  confirm: "",
});

function cancelEditMode() {
  isEditingEmail.value = false;
  showPasswordFields.value = false;
}

//server

async function fetchUser() {
  try {
    const backend = import.meta.env.VITE_BACKEND;
    const token = localStorage.getItem("token");
    const res = await fetch(`${backend}/users`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.message);
      return;
    }
    user.value = json.user;
    //user.value.photo=null;
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function saveUserData() {
  console.log("testing");
  try {
    const backend = import.meta.env.VITE_BACKEND;
    const token = localStorage.getItem("token");
    console.log(showPasswordFields.value);

    if (showPasswordFields.value) {
      if (
        !passwords.value.old ||
        !passwords.value.new ||
        !passwords.value.confirm
      ) {
        toast.error("please enter all pasword field");
        return;
      }
      if (passwords.value.new !== passwords.value.confirm) {
        toast.error("passwords are not matching");
        return;
      }
    }
    console.log(showPasswordFields.value);

    const updatedData = {};

    if (isEditingEmail.value) {
      updatedData.email = app.user.email;
    }

    if (showPasswordFields.value) {
      updatedData.password = passwords.value.new;
      updatedData.oldPassword = passwords.value.old;
    }

    const response = await fetch(`${backend}/users`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const json = await response.json();
    if (!response.ok) {
      toast.error(json.message || "Failed to save data");
      return;
    }

    toast.success("User data saved!");
    passwords.value.new = "";
    passwords.value.confirm = "";
    showPasswordFields.value = false;
    isEditingEmail.value = false;
  } catch (error) {
    console.error(error);
    toast.error("Error: " + error.message);
  }
}
// photo section
async function uploadPhoto(event) {
  try {
    const backend = import.meta.env.VITE_BACKEND;
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("photo", event.target.files[0]);
    const response = await fetch(`${backend}/users/photo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const json = await response.json();
    if (!response.ok) {
      toast.error(json.message || "failed to upload photo");
      return;
    }
    toast.success("photo uploaded  successfully");
    isEditingPhoto.value = false;
    user.value.photo = json.photo;
  } catch (error) {
    toast.error("Error: " + error.message);
  }
}
async function deletePhoto() {
  try {
    const backend = import.meta.env.VITE_BACKEND;
    const token = localStorage.getItem("token");
    const res = await fetch(`${backend}/users/photo`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.message);
      return;
    }
    user.value.photo = null;
    toast.success("Photo deleted successfully.");
  } catch (error) {
    alert("Error: " + error.message);
  }
}
</script>

<template>
  <div v-if="app.user" class="container">
    <h2>User Profile</h2>
    <div>
      <img
        :src="
          app.user.photo ??
          'https://static.vecteezy.com/system/resources/previews/008/442/086/original/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg'
        "
        class="profile-pic"
        alt="profile-picture"
      />
      <span v-if="isEditingPhoto">
        <input type="file" accept="image/*" @change="(e) => uploadPhoto(e)" />
        <span class="close" @click="deletePhoto">❌</span>
      </span>

      <template v-else>
        <span class="icon-pencil" @click="isEditingPhoto = true">✏️</span>
      </template>
    </div>

    <div class="info">
      <!-- Name -->
      <label>
        <strong
          >Name:
          <span>{{ app.user.name || "N/A" }}</span>
        </strong>
      </label>

      <!-- Email -->
      <label>
        <strong>Email:</strong>
        <div class="input-icon-wrapper">
          <template v-if="isEditingEmail">
            <input ref="emailInput" v-model="user.email" type="email" />
          </template>
          <template v-else>
            <span>{{ app.user.email || "N/A" }}</span>
            <span class="icon-pencil" @click="editEmail">✏️</span>
          </template>
        </div>
      </label>

      <!-- Change password button -->
      <!-- Change password toggle -->
      <button
        class="change-btn"
        @click="showPasswordFields = !showPasswordFields"
      >
        Change Password
      </button>

      <!-- Password fields -->
      <div v-if="showPasswordFields" class="password-fields">
        <label>
          old Password:
          <input type="password" v-model="passwords.old" />
        </label>

        <label>
          New Password:
          <input type="password" v-model="passwords.new" />
        </label>
        <label>
          Confirm Password:
          <input type="password" v-model="passwords.confirm" />
        </label>
      </div>

      <!-- Gender -->
      <label>
        <strong>Gender:</strong>
        <div class="radio-group">
          <label v-if="app.user.gender === 'male'" class="gender-option"
            >♂ Male</label
          >
          <label v-else class="gender-option">♀ Female </label>
        </div>
      </label>

      <!-- Created At -->
      <p>
        <strong>Created At:</strong> {{ moment(app.user.createdAt).fromNow() }}
      </p>

      <button
        class="cancle-btn"
        v-if="isEditingEmail || showPasswordFields"
        @click="cancelEditMode"
      >
        CANCLE
      </button>
      <button
        class="save-btn"
        v-if="isEditingEmail || showPasswordFields"
        @click="saveUserData"
      >
        Save Changes
      </button>
    </div>
  </div>

  <div v-else>
    <p>no data</p>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 30px auto;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.preview-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.profile-pic {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #ccc;
}

.info {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 15px;
}

.input-icon-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.input-icon-wrapper input {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
}

.icon-pencil {
  cursor: pointer;
  font-size: 1.1rem;
  color: #10e6b4;
}

button.change-btn,
button.save-btn {
  margin-top: 10px;
  padding: 8px 14px;
  gap: 20px;
  background-color: #218838;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}
button.cancle-btn {
  margin-top: 10px;
  padding: 8px 14px;

  background-color: #218838;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.password-fields input {
  width: 100%;
  padding: 6px 10px;
  margin-top: 5px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.radio-group {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.gender-option {
  font-weight: 500;
  font-size: 1rem;
}
</style>
