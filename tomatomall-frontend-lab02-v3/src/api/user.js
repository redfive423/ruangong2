// src/api/user.js
import axios from 'axios'

// 创建axios实例并配置基础URL
const instance = axios.create({
    baseURL: 'http://localhost:8080', // 替换为实际后端API地址
    timeout: 5000
})

// 请求拦截器：添加token
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.token = token
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器：处理常见错误
instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // 未授权，清除token并跳转到登录页
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const userApi = {
    login(data) {
        console.log('账号:', data.username); // 添加日志
        console.log('密码:', data.password); // 添加日志
        return instance.post('/api/accounts/login', data)
    },

    register(data) {
        return instance.post('/api/accounts', data)
    },

    getUserInfo(username) {
        return instance.get(`/api/accounts/${username}`)
    },

    updateInformation(data) {
        return instance.put('/api/accounts', data)
    },

    changePassword(data) {
        return instance.put('/api/accounts/{username}', data)
    },

    uploadAvatar(data) {
        return instance.post('/oss/upload', data)
    },

    updateAvatar(username, avatarUrl) {
        return instance.post(
            '/api/accounts/avatar',
            { accountVO: { username } },  // 请求体参数
            {
                params: { avatarUrl },       // 查询参数
            }
        )
    }
}