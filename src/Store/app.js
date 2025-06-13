import { defineStore } from "pinia";
import {ref,onMounted} from  'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

export const useAppStore = defineStore('app', () => {
	const user = ref()

	onMounted(() => {
		fetchProfile()
    })
  async function fetchProfile() {
		try {
      const route = useRoute()
      const router = useRouter()
			const backend = import.meta.env.VITE_BACKEND
			const token = localStorage.getItem('token')
      if(!token) {
        if(route.path !== '/login' && route.path !== '/register') {
          router.push('/login')
        }
        return
      }
			const res = await fetch(`${backend}/users`, {
				method: 'GET',
				headers: { Authorization: `Bearer ${token}` }
			})
			const json = await res.json()
			if (!res.ok) {
        if(res.status === 401) {
          logout()
        }
				toast.error(json.message)
				return
			}
			user.value = json.user
		} catch (error) {
			toast.error(error.message)
		}
	}

  async function logout() {
    user.value = undefined
    localStorage.removeItem('token')
    router.push('/login')
  }

	return { user, fetchProfile, logout }
})
