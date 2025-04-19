import {createRouter, createWebHistory} from 'vue-router';
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import HomePage from '../pages/index.vue';
import CartPage from "../pages/CartPage.vue";
import WarehousePage from "../pages/WarehousePage.vue";
import ChangePassword from '../pages/ChangePassword.vue'
import BookListPage from '../pages/BookListPage.vue'
import BookDetailPage from '../pages/BookDetailPage.vue'

const routes = [
    {
        path: '/',
        name: 'index',
        component: HomePage
    },
    {
        path: '/cart',
        name: 'cart',
        component: CartPage,
    },
    {
        path: '/warehouse',
        name: 'warehouse',
        component: WarehousePage,
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterPage
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfilePage
    },
    {
        path: '/changepassword',
        name: 'changepassword',
        component: ChangePassword
    },
    {
        path: '/books',
        name: 'books',
        component: BookListPage
    },
    {
        path: '/book/:id',
        name: 'bookDetail',
        component: BookDetailPage
    },
    {
        path: '/warehouse',
        name: 'warehouse',
        component: WarehousePage
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

import {ElMessage} from 'element-plus'

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    // 需要登录的页面列表
    const requireAuth = ['profile', 'cart', 'warehouse']

    if (requireAuth.includes(to.name) && !token) {
        ElMessage.warning('请先登录')
        next({name: 'login', query: {redirect: to.fullPath}})
    } else if ((to.name === 'login' || to.name === 'register') && token) {
        // 已登录用户不应再访问登录和注册页
        next({name: 'index'})
    } else {
        next()
    }
})

export default router;

