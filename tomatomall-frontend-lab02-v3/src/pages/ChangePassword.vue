<script setup>
import {ref, reactive, onMounted} from 'vue'
import {ElMessage} from 'element-plus'
import {userApi} from '@/api/user.js'
import {useRouter} from 'vue-router'
import OSS from 'ali-oss'

const router = useRouter()

const ossConfig = reactive({
    region: 'oss-cn-beijing',
    accessKeyId: 'LTAI5tKL1y7m1SAy7jbSY8KS',
    accessKeySecret: 'KihG5rkfe2QOK8PG4qrrf6UZC3CEMy',
    bucketName: 'ruangong2-231880397'
})

// 模拟获取用户信息
const userInfo = reactive({
    username: '',
    password: '',
    name: '',
    avatar: '',
    role: 'admin',
    telephone: '',
    email: '',
    location: ''
})

// 加载用户信息
const loading = ref(false)
// 头像文件
const avatarFile = ref(null)
// 头像预览 URL
const avatarUrl = ref('')

onMounted(async () => {
    loading.value = true
    try {
        const res = await userApi.getUserInfo(localStorage.getItem('username'))
        //console.log(localStorage.getItem('username'))
        console.log(localStorage.getItem('token'))
        console.log('用户信息响应:', res.data);

        userInfo.role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        Object.assign(userInfo, res.data.data)
        //console.log(userInfo.username)
        // 假设后端返回了头像的 URL
        if (res.data.avatar) {
            avatarUrl.value = res.data.avatar
        }
    } catch (error) {
        console.error('获取用户信息失败:', error)
    } finally {
        loading.value = false
    }
})


const userFormRef = ref(null)
const activeTab = ref('info')

const updateUserInfo = async () => {
    try {
        await userFormRef.value.validate()
        await userApi.updateInformation(userInfo)
        console.log(userInfo.password)
        console.log(userInfo.password)
        console.log(userInfo.password)
        ElMessage.success('个人信息已更新')
    } catch (error) {
        ElMessage.error('更新失败')
    }
}

// 处理文件选择
const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 先进行文件校验
    const ALLOWED_TYPES = ['image/jpeg', 'image/png']
    const MAX_SIZE_MB = 2

    if (!ALLOWED_TYPES.includes(file.type)) {
        ElMessage.error('仅支持 JPEG/PNG 格式')
        return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        ElMessage.error(`文件大小不能超过 ${MAX_SIZE_MB}MB`)
        return
    }

    // 生成预览
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (event) => {
        avatarUrl.value = event.target.result
    }
    reader.readAsDataURL(file)

    // 自动触发上传
    try {
        await uploadAvatar()
        ElMessage.success('头像已自动上传')
    } catch (error) {
        ElMessage.error('自动上传失败，请手动重试')
    }
}

// 上传头像
const uploadAvatar = async () => {
    if (!avatarFile.value) {
        ElMessage.warning('请选择要上传的头像')
        return
    }

    try {
        // 初始化OSS客户端
        const client = new OSS({
            region: ossConfig.region,
            accessKeyId: ossConfig.accessKeyId,
            accessKeySecret: ossConfig.accessKeySecret,
            bucket: ossConfig.bucketName
        })

        // 生成唯一文件名
        const fileName = `${userInfo.username}_${Date.now()}.${avatarFile.value.name.split('.').pop()}`
        const ossPath = `avatars/${fileName}`

        // 执行上传
        const result = await client.put(ossPath, avatarFile.value)

        // 更新显示
        avatarUrl.value = result.url
        userInfo.avatar = result.url
        ElMessage.success('头像上传成功')

        await userApi.updateAvatar(userInfo.username, userInfo.avatar)
        console.log(userInfo.password)
        console.log(userInfo.password)
        console.log(userInfo.password)
    } catch (error) {
        console.error('OSS上传失败:', error)
        ElMessage.error(`上传失败: ${error.message}`)
    }
}

</script>

<template>
    <div class="fixed-avatar-container">
        <div class="avatar-wrapper">
            <!-- 动态绑定头像URL -->
            <img
                :src="userInfo.avatar"
                alt="头像"
                class="profile-avatar"
                v-if="userInfo.avatar"
            >
            <!-- 默认显示用户名的首字母 -->
            <div class="no-avatar" v-else>
                {{ userInfo.name?.charAt(0) || 'A' }}
            </div>
        </div>
        <p class="username">{{ userInfo.username }}</p>
    </div>


    <div class="profile-container">
        <div class="profile-content">
            <el-card class="profile-card">
                <div class="profile-header">
                    <h2>个人信息管理</h2>
                </div>

                <el-tabs v-model="activeTab">
                    <el-tab-pane label="修改密码" name="info">
                        <el-form ref="userFormRef" :model="userInfo" label-width="100px">
                            <el-form-item label="原密码">
                                <el-input v-model="userInfo.username"></el-input>
                            </el-form-item>
                            <el-form-item label="新密码">
                                <el-input v-model="userInfo.username"></el-input>
                            </el-form-item>

                            <el-form-item>
                                <el-button type="primary" @click="updateUserInfo">保存修改</el-button>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
            </el-card>
        </div>
    </div>
</template>

<style scoped>
.fixed-avatar-container {
    position: fixed;
    top: 20px;
    right: 30px;
    z-index: 2000;
    text-align: center;
    background: rgba(255, 255, 255, 0.9);
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
}

.avatar-wrapper {
    width: 80px;
    height: 80px;
    margin: 0 auto 8px;
}

.profile-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
}

.no-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #409eff, #79bbff);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
}

.username {
    margin: 0;
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    white-space: nowrap;
}

.profile-container {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    position: fixed;
    top: 0;
    left: 0;
    padding: 20px;
    overflow-y: auto;
}

.register-logo {
    width: 70px;
    height: 70px;
    margin-bottom: 1rem;
    opacity: 0.7; /* 添加半透明效果 */
    transition: opacity 0.3s;
}

.profile-content {
    text-align: center;
    width: 90%;
    max-width: 700px;
}

.profile-card {
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    padding: 20px;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
}

.logout-section {
    margin-top: 30px;
    text-align: center;
    border-top: 1px solid #eaeaea;
    padding-top: 20px;
}

.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.avatar-upload {
    text-align: right;
}

.avatar-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 10px;
}
</style>