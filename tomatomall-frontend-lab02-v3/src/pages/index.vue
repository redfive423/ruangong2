<script setup>
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'

const router = useRouter()

// 判断是否登录
const isLoggedIn = computed(() => {
    return !!localStorage.getItem('token')
})

const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')
</script>

<template>
    <div class="home-container">
        <div class="content">
            <div class="logo-container">
                <img src="../assets/logo.png" alt="番茄书城" class="logo"/>
                <h1 class="logo-text">番茄书城</h1>
            </div>

            <p class="slogan">发现阅读的无限乐趣</p>

            <div v-if="!isLoggedIn" class="action-buttons">
                <el-button type="primary" size="large" @click="goToLogin">
                    立即登录
                </el-button>
                <el-button type="danger" size="large" @click="goToRegister">
                    快速注册
                </el-button>
            </div>
            <div v-else class="welcome-message">
                <h2>欢迎回来</h2>
                <el-button type="success" size="large" @click="router.push('/profile')">
                    进入个人中心
                </el-button>
            </div>
        </div>
    </div>
    <div class="welcome-message">
        <h2>欢迎来到番茄书城</h2>
        <el-button type="success" size="large" @click="router.push('/books')">
            浏览图书
        </el-button>
    </div>
</template>

<style scoped>
.home-container {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    position: fixed;
    top: 0;
    left: 0;
}

.content {
    text-align: center;
    padding: 2.5rem;
    background-color: rgba(255, 255, 255, 0.7); /* 更透明的背景 */
    backdrop-filter: blur(8px); /* 添加模糊效果 */
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    max-width: 500px;
    width: 90%;
}

.logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.logo {
    width: 80px;
    height: 80px;
    margin-right: 15px;
    opacity: 0.7; /* 添加半透明效果 */
    transition: opacity 0.3s; /* 添加过渡效果 */
}

.logo-text {
    font-size: 2.5rem;
    color: #ff6b6b;
    margin: 0;
}

.slogan {
    font-size: 1.2rem;
    color: #606266;
    margin-bottom: 3rem;
}

.action-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
}

.action-buttons .el-button {
    padding-left: 30px;
    padding-right: 30px;
    font-size: 16px;
    font-weight: bold;
    transition: transform 0.3s;
}

.action-buttons .el-button:hover {
    transform: translateY(-5px);
}

.welcome-message {
    margin: 20px 0;
}
</style>