<script setup>
import {ref, reactive} from 'vue'
import {ElMessage, ElLoading} from 'element-plus'
import {useRouter} from 'vue-router'
import {userApi} from '@/api/user.js'
import {Lock, User, Message} from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

const registerForm = reactive({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    avatar: '',
    role: '',
    telephone: '',
    email: '',
    location: ''
})

const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致'))
    } else {
        callback()
    }
}

const rules = {
    username: [
        {required: true, message: '请输入用户名', trigger: 'blur'},
        {min: 3, max: 20, message: '长度在3到20个字符', trigger: 'blur'}
    ],
    password: [
        {required: true, message: '请输入密码', trigger: 'blur'},
        {min: 6, message: '密码长度不能小于6位', trigger: 'blur'}
    ],
    confirmPassword: [
        {required: true, validator: validatePass2, trigger: 'blur'}
    ],
    name: [
        {required: true, message: '请输入真实姓名', trigger: 'blur'}
    ],
    avatar: [
        {required: false, message: '请输入头像 URL', trigger: 'blur'}
    ],
    role: [
        {required: true, message: '请选择用户身份', trigger: 'blur'},
        {
            validator: (rule, value, callback) => {
                if (value && ['admin', 'user'].indexOf(value) === -1) {
                    callback(new Error('用户身份只能是admin或user'))
                } else {
                    callback()
                }
            }, trigger: 'blur'
        }
    ],
    telephone: [
        {required: false, message: '请输入手机号', trigger: 'blur'},
        {pattern: /^1[0-9]{10}$/, message: '手机号格式必须为1xxxxxxxxxx', trigger: 'blur'}
    ],
    email: [
        {required: true, message: '请输入邮箱地址', trigger: 'blur'},
        {type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur'}
    ],
    location: [
        {required: false, message: '请输入位置', trigger: 'blur'}
    ]
}

const registerFormRef = ref(null)

const submitForm = async (formEl) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                const res = await userApi.register({
                    username: registerForm.username,
                    password: registerForm.password,
                    name: registerForm.name,
                    avatar: registerForm.avatar,
                    role: registerForm.role,
                    telephone: registerForm.telephone,
                    email: registerForm.email,
                    location: registerForm.location
                })
                if (res.data.code == 400) {
                    throw new Error('用户名已存在');
                }
                ElMessage.success('注册成功')
                router.push('/login')
            } catch (error) {
                const errorMessage = error.message
                    || error.response?.data?.message
                    || '注册失败，请稍后重试';
                ElMessage.error(errorMessage);
            } finally {
                loading.value = false
            }
        }
    })
}
</script>

<template>
    <div class="register-container">
        <div class="register-card">
            <div class="register-header">
                <img src="../assets/logo.png" alt="番茄书城" class="register-logo"/>
                <h2>用户注册</h2>
            </div>

            <el-form
                ref="registerFormRef"
                :model="registerForm"
                :rules="rules"
                class="register-form"
            >
                <el-form-item prop="username">
                    <el-input
                        v-model="registerForm.username"
                        placeholder="请输入用户名"
                        :prefix-icon="User"
                        size="large"
                    ></el-input>
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="registerForm.password"
                        type="password"
                        placeholder="请输入密码"
                        :prefix-icon="Lock"
                        size="large"
                        show-password
                    ></el-input>
                </el-form-item>

                <el-form-item prop="confirmPassword">
                    <el-input
                        v-model="registerForm.confirmPassword"
                        type="password"
                        placeholder="请确认密码"
                        :prefix-icon="Lock"
                        size="large"
                        show-password
                    ></el-input>
                </el-form-item>

                <el-form-item prop="name">
                    <el-input
                        v-model="registerForm.name"
                        placeholder="请输入真实姓名"
                        size="large"
                    ></el-input>
                </el-form-item>

                <el-form-item prop="avatar">
                    <el-input
                        v-model="registerForm.avatar"
                        placeholder="请输入头像 URL"
                        size="large"
                    ></el-input>
                </el-form-item>

                <el-form-item prop="role">
                    <el-select
                        v-model="registerForm.role"
                        placeholder="请选择用户身份"
                        size="large"
                    >
                        <el-option label="管理员" value="admin"></el-option>
                        <el-option label="普通用户" value="user"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item prop="telephone">
                    <el-input
                        v-model="registerForm.telephone"
                        placeholder="请输入手机号"
                        size="large"
                    ></el-input>
                </el-form-item>

                <el-form-item prop="email">
                    <el-input
                        v-model="registerForm.email"
                        placeholder="请输入邮箱"
                        :prefix-icon="Message"
                        size="large"
                    ></el-input>
                </el-form-item>

                <el-form-item prop="location">
                    <el-input
                        v-model="registerForm.location"
                        placeholder="请输入位置"
                        size="large"
                    ></el-input>
                </el-form-item>

                <el-form-item class="register-actions">
                    <el-button
                        type="danger"
                        @click="submitForm(registerFormRef)"
                        class="register-button"
                        round
                        size="large"
                        :loading="loading"
                    >{{ loading ? '注册中...' : '立即注册' }}
                    </el-button>
                </el-form-item>

                <div class="register-options">
                    <router-link to="/login" class="login-link">
                        已有账号？立即登录
                    </router-link>
                </div>
            </el-form>
        </div>
    </div>
</template>

<style scoped>
.register-container {
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

.register-card {
    text-align: center;
    padding: 2.5rem;
    background-color: rgba(255, 255, 255, 0.7); /* 半透明背景 */
    backdrop-filter: blur(8px); /* 模糊效果 */
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    max-width: 500px;
    width: 90%;
}

.register-header {
    text-align: center;
    margin-bottom: 1.5rem;
}

.register-logo {
    width: 70px;
    height: 70px;
    margin-bottom: 1rem;
    opacity: 0.7;
    transition: opacity 0.3s;
}

h2 {
    color: #303133;
    margin: 0;
    font-weight: 600;
}

.register-form {
    margin-top: 1rem;
    width: 100%;
}

.register-button {
    width: 100%;
    padding: 12px;
    font-weight: bold;
}

.register-options {
    margin-top: 1rem;
    text-align: center;
}

.login-link {
    color: #409EFF;
    text-decoration: none;
    transition: color 0.3s;
}

.login-link:hover {
    color: #66b1ff;
}

@media (max-width: 576px) {
    .register-card {
        padding: 1.5rem;
    }
}
</style>