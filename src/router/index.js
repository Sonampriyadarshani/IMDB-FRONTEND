import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import ErrorPage from '../pages/ErrorPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import CreateMovie from '@/pages/CreateMovie.vue'
import MovieDetails from '@/pages/MovieDetails.vue'
import Rating from '@/pages/RatingList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/:pathMatch(.*)*', component: ErrorPage },
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/Profile',
      component: ProfilePage,
    },
    {
      path: '/create',
      component: CreateMovie,
    },
    {
      path: '/register',
      component: RegisterPage,
    },
    {
      path: '/login',
      component: LoginPage,
    },
     {
      path: '/movies/:id',
      component: MovieDetails,
    },
     {
      path: '/ratings/:movieId',
      component:Rating,
    },
   
  ],
})

export default router
