<script setup>
import{ref, onMounted} from 'vue'
import { useRouter } from 'vue-router';
import{toast} from 'vue3-toastify'

onMounted(()=>{
  let token = localStorage.getItem('token')
  if(token){
    router.push('/')
    return
  }
})
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword=ref('')
const gender=ref('male')

async function register(){
    if(!name.value || !email.value || !password.value || !confirmPassword.value){
        // alert('please enter all details')
        toast.error('please enter all details')
        return
    }
    if(password.value !== confirmPassword.value){
        toast.error('password are not matching')
        return
    }

    const backend = import.meta.env.VITE_BACKEND
    const res = await fetch(`${backend}/auth/register`,{
        method:'POST',
        header:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            name:name.value,
            email:email.value,
            password:password.value,
            gender:gender.value,
        })
    })

    const json=await res.json()
    if(!res.ok){
        toast.error(json.message)
        return
    }

    toast.success('User registered successfully')
    name.value=''
    email.value=''
    password.value=''
    confirmPassword.value=''
    await new Promise((res)=>setTimeout(res,2000))

    router.push('/login')
}

</script>

<template>
<h1>Register</h1>
<fieldset>
    <legend>Register Form</legend>

    <p><label>Name:<input type="text" v-model="name" placeholder="enter name"></label>
    </p>

    <p><label>email:<input type="email" v-model="email" placeholder="enter email"></label></p>
    <p><label>Password:<input type="password" v-model="password" placeholder="enter password"></label></p>
    <p> <label>Confirm Password:<input type="password" v-model="confirmPassword" placeholder="enter confirm password">
  </label>
</p>

     <p>  <label><input type="radio" value="male" v-model="gender">Male</label>
        <label><input type="radio" value="female" v-model="gender">Female</label>
    </p>

    <button @click="register">Register</button>
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
  width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 2px solid #ccc;
  border-radius: 12px;
  background-color: #f9f9f9;
}

legend {
  font-size: 1.3rem;
  font-weight: bold;
  color: #444;
  padding: 0 10px;
}

p {
  margin: 15px 0;
}

label {
  display: block;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #007BFF;
  outline: none;
}

input[type="radio"] {
  margin-right: 8px;
}

button {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  background-color: #28a745;
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
