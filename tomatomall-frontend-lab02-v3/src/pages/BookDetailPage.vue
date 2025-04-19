<!-- src/pages/BookDetailPage.vue -->
<script setup>
import {ref, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {bookApi} from '@/api/book.js'
import {ArrowLeft, ShoppingCart, Plus, Minus} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'

const route = useRoute()
const router = useRouter()
const bookId = route.params.id
const book = ref({})
const loading = ref(false)
const quantity = ref(1)

// 加载图书详情
const loadBookDetail = async () => {
    loading.value = true
    try {
        const res = await bookApi.getBookDetail(bookId)
        book.value = res.data.data || {}
    } catch (error) {
        ElMessage.error('加载图书详情失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 调整数量
const adjustQuantity = (amount) => {
    const newValue = quantity.value + amount
    if (newValue >= 1) {
        quantity.value = newValue
    }
}

// 添加到购物车
const addToCart = async () => {
    if (!book.value.id) return

    try {
        await bookApi.addToCart(book.value.id, quantity.value)
        ElMessage.success(`已将 ${quantity.value} 本《${book.value.title}》添加到购物车`)
    } catch (error) {
        ElMessage.error('添加到购物车失败')
        console.error(error)
    }
}

// 返回列表页
const goBack = () => {
    router.push('/books')
}

onMounted(() => {
    loadBookDetail()
})
</script>

<template>
    <div class="book-detail-container">
        <div class="book-detail-content">
            <el-card class="detail-card" v-loading="loading">
                <div class="back-button">
                    <el-button icon="arrow-left" text @click="goBack">返回列表</el-button>
                </div>

                <div class="book-details" v-if="book.id">
                    <div class="book-image">
                        <img :src="book.coverUrl" :alt="book.title" v-if="book.coverUrl">
                        <div class="no-image" v-else>暂无封面</div>
                    </div>

                    <div class="book-info">
                        <h1 class="book-title">{{ book.title }}</h1>

                        <div class="book-meta">
                            <p class="book-author">
                                <span class="label">作者：</span>{{ book.author }}
                            </p>
                            <p v-if="book.publisher">
                                <span class="label">出版社：</span>{{ book.publisher }}
                            </p>
                            <p v-if="book.publicationDate">
                                <span class="label">出版日期：</span>{{ book.publicationDate }}
                            </p>
                            <p v-if="book.category">
                                <span class="label">分类：</span>
                                <el-tag size="small">{{ book.category }}</el-tag>
                            </p>
                        </div>

                        <div class="book-price-section">
                            <span class="price-label">价格：</span>
                            <span class="book-price">CNY￥{{ book.price ? book.price.toFixed(2) : '0.00' }}</span>
                        </div>

                        <div class="book-stock">
                            <span class="stock-label">库存：</span>
                            <span :class="{ 'low-stock': book.stock < 10 }">
                {{ book.stock }} 本
              </span>
                        </div>

                        <div class="add-to-cart-section">
                            <div class="quantity-control">
                                <el-button
                                    :icon="Minus"
                                    circle
                                    @click="adjustQuantity(-1)"
                                    :disabled="quantity === 1"
                                />
                                <span class="quantity">{{ quantity }}</span>
                                <el-button
                                    :icon="Plus"
                                    circle
                                    @click="adjustQuantity(1)"
                                    :disabled="quantity >= book.stock"
                                />
                            </div>

                            <el-button
                                type="primary"
                                :icon="ShoppingCart"
                                @click="addToCart"
                                :disabled="book.stock <= 0"
                            >
                                加入购物车
                            </el-button>
                        </div>
                    </div>
                </div>

                <div class="book-description" v-if="book.description || book.detail">
                    <h3 v-if="book.description">图书简介</h3>
                    <p v-if="book.description">{{ book.description }}</p>

                    <h3 v-if="book.detail" class="detail-title">详细信息</h3>
                    <p v-if="book.detail">{{ book.detail }}</p>
                </div>

                <el-empty description="图书不存在" v-if="!loading && !book.id"></el-empty>
            </el-card>
        </div>
    </div>
</template>

<style scoped>
.book-detail-container {
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    padding: 20px;
}

.book-detail-content {
    max-width: 1000px;
    margin: 0 auto;
    padding-top: 20px;
}

.detail-card {
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    padding: 20px;
}

.back-button {
    margin-bottom: 20px;
}

.book-details {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
}

.book-image {
    flex: 0 0 300px;
    height: 400px;
}

.book-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f2f5;
    color: #909399;
    border-radius: 8px;
}

.book-info {
    flex: 1;
}

.book-title {
    margin: 0 0 20px;
    color: #303133;
    font-size: 24px;
}

.book-meta {
    margin-bottom: 20px;
}

.book-meta p {
    margin: 8px 0;
}

.label {
    color: #909399;
    display: inline-block;
    width: 80px;
}

.book-price-section {
    margin: 20px 0;
}

.price-label {
    font-size: 16px;
    color: #606266;
}

.book-price {
    font-size: 24px;
    color: #ff6b6b;
    font-weight: bold;
}

.book-stock {
    margin-bottom: 20px;
}

.stock-label {
    color: #606266;
}

.low-stock {
    color: #f56c6c;
}

.add-to-cart-section {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 30px;
}

.quantity-control {
    display: flex;
    align-items: center;
}

.quantity {
    margin: 0 10px;
    min-width: 30px;
    text-align: center;
    font-size: 16px;
}

.book-description {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
}

.book-description h3 {
    margin-bottom: 15px;
    color: #303133;
}

.book-description p {
    line-height: 1.6;
    color: #606266;
    white-space: pre-line;
}

.detail-title {
    margin-top: 20px;
    margin-bottom: 15px;
    color: #303133;
}
@media (max-width: 768px) {
    .book-details {
        flex-direction: column;
    }

    .book-image {
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
    }
}
</style>