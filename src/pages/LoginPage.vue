<script setup>
import {ref,onMounted} from 'vue'

import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';



onMounted(()=>{
  let token = localStorage.getItem('token')
  if(token){
    router.push('/')
    return
  }
})

const router = useRouter()

const email=ref('')
const password = ref('')

async function Login(){
  if(!email.value || !password.value){
    toast.error('please enter all details')
    return
  }
  const backend=import.meta.env.VITE_BACKEND
  const res= await fetch (`${backend}/auth/login`,{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
   body:JSON.stringify({
    email:email.value,
    password:password.value,
   })
  })

  const json = await res.json()
  if(!res.ok) {
    toast.error(json.message)
    return
  }

  toast.success('User loggedin successfully');
  localStorage.setItem("token",json.token)
  
  email.value = ''
  password.value = ''
  
  await new Promise((res) => setTimeout(res, 2000))

  router.push('/')
}


</script>

<template>
  <h1>Login</h1>
  <fieldset>
    <legend>Login Form</legend>

    <p>
      <label>Email:<input type="email" v-model="email" placeholder="enter email"></label>

    </p>
    <p><label>password:<input type="password" v-model="password" placeholder="enter password"></label></p>
    <button @click="Login">Login</button>
  </fieldset>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
  color: #333;
}

fieldset {
  width: 350px;
  margin: 50px auto;
  padding: 25px 30px;
  border: 2px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}

legend {
  font-size: 1.2rem;
  font-weight: bold;
  color: #444;
  padding: 0 10px;
}

p {
  margin: 15px 0;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
  color: #555;
}

input {
  padding: 8px;
  margin-top: 5px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #007BFF;
  outline: none;
}

button {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  background-color:#218838;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #218838;
}
</style>

