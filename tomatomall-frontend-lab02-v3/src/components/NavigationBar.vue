<script setup>
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {ShoppingCart, User, Menu} from '@element-plus/icons-vue'
const router = useRouter()
const isMenuCollapsed = ref(true)

// 判断用户是否已登录
const isLoggedIn = computed(() => {
    return !!localStorage.getItem('token')
})

const userRole = computed(() => {
  const userInfo = localStorage.getItem('userInfo')
  try {
    return JSON.parse(userInfo)?.role || 'user'
  } catch {
    return 'user'
  }
})

const isAdmin = computed(() => userRole.value === 'admin')

// 新增后台管理导航方法


// 获取用户名
const username = computed(() => {
    return localStorage.getItem('username') || '用户'
})

// 获取用户头像
const userAvatar = computed(() => {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
        try {
            const parsedInfo = JSON.parse(userInfo)
            return parsedInfo.avatar
        } catch (e) {
            return ''
        }
    }
    return ''
})

// 登出方法
const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('username')
    ElMessage.success('已成功退出登录')
    router.push('/login')
}

// 导航方法
const goToHome = () => router.push('/')
const goToBooks = () => router.push('/books')
const goToCart = () => router.push('/cart')
const goToProfile = () => router.push('/profile')
const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')
const goToWarehouse = () => router.push('/Warehouse')

</script>

<template>
    <div class="navigation-bar">
        <div class="nav-container">
            <div class="nav-left">
                <div class="logo-container" @click="goToHome">
                    <img src="../assets/logo.png" alt="番茄书城" class="nav-logo"/>
                    <span class="nav-title">番茄书城</span>
                </div>

                <div class="nav-links">
                    <el-button text @click="goToHome">首页</el-button>
                    <el-button text @click="goToBooks">浏览图书</el-button>
                    <el-button v-if="isLoggedIn" text @click="goToCart">
                        <el-icon>
                            <ShoppingCart/>
                        </el-icon>
                        购物车
                    </el-button>
                  <el-button text @click="goToWarehouse">仓库信息</el-button>
<!--                  <el-button-->
<!--                      v-if="isAdmin"-->
<!--                      text-->
<!--                      @click="goToWarehouse"-->
<!--                      class="admin-button">-->
<!--                    <el-icon>< Operation /></el-icon>-->
<!--                    后台管理-->
<!--                  </el-button>-->
                </div>
            </div>

            <div class="nav-right">
                <template v-if="isLoggedIn">
                    <el-dropdown trigger="click">
                        <span class="user-dropdown">
                          <div v-if="userAvatar" class="user-avatar">
                            <img :src="userAvatar" alt="头像"/>
                          </div>
                          <div v-else class="user-avatar default-avatar">
                            {{ username.charAt(0).toUpperCase() }}
                          </div>
                          <span class="username-text">{{ username }}</span>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
                                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template v-else>
                    <el-button type="primary" @click="goToLogin">登录</el-button>
                    <el-button @click="goToRegister">注册</el-button>
                </template>
            </div>

        </div>

    </div>
</template>

<style scoped>
.navigation-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.admin-button {
  color: #f56c6c !important;
  font-weight: 500;
}

.admin-button:hover {
  background-color: rgba(245, 108, 108, 0.1);
}


.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-left, .nav-right {
    display: flex;
    align-items: center;
}

.logo-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-right: 20px;
}

.nav-logo {
    width: 36px;
    height: 36px;
    margin-right: 8px;
}

.nav-title {
    font-size: 18px;
    font-weight: bold;
    color: #ff6b6b;
}

.nav-links {
    display: flex;
    align-items: center;
}

.user-dropdown {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.user-dropdown:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 8px;
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.default-avatar {
    background-color: #409eff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.username-text {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mobile-menu-button {
    display: none;
}

.mobile-dropdown {
    display: none;
    flex-direction: column;
    padding: 10px 20px;
    background-color: rgba(255, 255, 255, 0.95);
    border-top: 1px solid #eaeaea;
}

.mobile-dropdown .el-button {
    justify-content: flex-start;
    margin: 5px 0;
}

@media (max-width: 768px) {
    .nav-links, .nav-right {
        display: none;
    }

    .mobile-menu-button {
        display: block;
    }

    .mobile-dropdown {
        display: flex;
    }
}

@media (max-width: 768px) {
  .admin-button {
    color: #f56c6c;
  }
}
</style>