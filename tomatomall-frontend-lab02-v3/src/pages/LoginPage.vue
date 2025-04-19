<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { useRouter } from 'vue-router'
import { userApi } from '@/api/user.js'
import { Lock, User } from '@element-plus/icons-vue'

const router = useRouter()

const loginForm = reactive({
    username: '',
    password: ''
})

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const loginFormRef = ref(null)

const submitForm = async (formEl) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
        if (valid) {
            const loading = ElLoading.service({ fullscreen: true, text: '登录中...' })
            try {
                console.log('尝试登录:', loginForm.username); // 日志

                // 发起登录请求
                const res = await userApi.login(loginForm)
              if (res.data.code == 400) {
                // 抛出错误，阻止后续代码执行
                throw new Error('用户名已存在');
              }
              if (res.data.code == 401) {
                // 抛出错误，阻止后续代码执行
                throw new Error('未登录！');
              }
              if (res.data.code == 402) {
                // 抛出错误，阻止后续代码执行
                throw new Error('用户不存在');
              }
              if (res.data.code == 403) {
                // 抛出错误，阻止后续代码执行
                throw new Error('密码错误');
              }
                // --- 登录成功处理 ---
                // 假设后端成功时，不一定有 code 字段，或者 code 是 '200' / 200
                // 并且失败时会抛出错误（由 axios 拦截器或 userApi 包装处理）
                // 因此，如果代码能执行到这里，通常认为是成功的。

                console.log('登录成功，响应:', res.data); // 日志

                // 存储用户信息和token
                localStorage.setItem('token', res.data.data);
                localStorage.setItem('username', loginForm.username);
                if (res.data.userInfo) {
                    localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo));
                } else if (res.data.user) { // 兼容旧字段（如果存在）
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                }

                ElMessage.success('登录成功')
                router.push('/')

            } catch (error) {
                // --- 登录失败处理 ---
                console.error('登录失败:', error.response || error); // 打印详细错误信息

                let errorMessage = '登录失败，未知错误'; // 默认的最终备用消息

                // 检查是否是 axios 错误且包含后端响应
                if (error.response && error.response.data) {
                    const backendData = error.response.data;
                    const backendCode = backendData.code; // 获取后端定义的 code
                    const backendMessage = backendData.message; // 获取后端定义的消息

                    if (backendMessage) {
                        // **优先使用后端返回的 message**
                        // 这将直接显示 "用户不存在" 或 "密码错误" 等后端定义的具体信息
                        errorMessage = backendMessage;

                        // 可选：根据 code 做特定处理 (虽然直接用 message 通常足够)
                        // if (backendCode === '401') {
                        //     // 如果后端确实用 401 表示需要登录（通常在访问受保护资源时），
                        //     // 这里可以特殊处理，但对于登录接口本身的失败，直接用 message 可能更好
                        //     console.warn('收到 401 错误，可能需要重新登录或检查权限');
                        // } else if (backendCode === '402') {
                        //     // 用户不存在
                        // } else if (backendCode === '403') {
                        //     // 密码错误
                        // }
                    } else {
                        // 后端有响应，但没有 message 字段，使用通用提示
                        errorMessage = `登录失败，服务器响应 ${error.response.status} 但无详细信息`;
                    }
                } else if (error.request) {
                    // 请求已发出，但没有收到响应 (网络问题)
                    errorMessage = '登录失败：无法连接服务器，请检查网络连接';
                } else {
                    // 设置请求时发生错误 (代码问题或配置错误)
                    errorMessage = `登录请求出错: ${error.message}`;
                }

                ElMessage.error(errorMessage);

            } finally {
                // 无论成功或失败，都关闭加载动画
                loading.close()
            }
        } else {
            console.log('表单验证失败'); // 日志
            return false; // 阻止提交
        }
    })
}
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <img src="../assets/logo.png" alt="番茄书城" class="login-logo"/>
                <h2>用户登录</h2>
            </div>

            <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="rules"
                class="login-form"
            >
                <el-form-item prop="username">
                    <el-input
                        v-model="loginForm.username"
                        placeholder="请输入用户名"
                        :prefix-icon="User"
                        size="large"
                    ></el-input>
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        size="large"
                        show-password
                    ></el-input>
                </el-form-item>

                <el-form-item class="login-actions">
                    <el-button
                        type="primary"
                        @click="submitForm(loginFormRef)"
                        class="login-button"
                        round
                        size="large"
                    >登录
                    </el-button>
                </el-form-item>

                <div class="login-options">
                    <router-link to="/register" class="register-link">
                        没有账号？立即注册
                    </router-link>
                </div>
            </el-form>
        </div>
    </div>
</template>

<style scoped>
.login-container {
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

.login-card {
    text-align: center;
    padding: 2.5rem;
    background-color: rgba(255, 255, 255, 0.7); /* 半透明背景 */
    backdrop-filter: blur(8px); /* 模糊效果 */
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    max-width: 500px;
    width: 90%;
}

.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.login-logo {
    width: 70px;
    height: 70px;
    margin-bottom: 1rem;
    opacity: 0.7; /* 添加半透明效果 */
    transition: opacity 0.3s;
}

h2 {
    color: #303133;
    margin: 0;
    font-weight: 600;
}

.login-form {
    margin-top: 1.5rem;
    width: 100%;
}

.login-button {
    width: 100%;
    padding: 12px;
    font-weight: bold;
}

.login-options {
    margin-top: 1rem;
    text-align: center;
}

.register-link {
    color: #409EFF;
    text-decoration: none;
    transition: color 0.3s;
}

.register-link:hover {
    color: #66b1ff;
}

@media (max-width: 576px) {
    .login-card {
        padding: 1.5rem;
    }
}
</style>