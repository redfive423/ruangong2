<!-- src/pages/BookListPage.vue -->
<script setup>
import {ref, onMounted, computed} from 'vue'
import {useRouter} from 'vue-router'
import {bookApi} from '@/api/book.js'
import {Search, ShoppingCart} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'

const router = useRouter()
const books = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const categories = ref([])

// 加载所有书籍
const loadBooks = async () => {
    loading.value = true
    try {
        const res = await bookApi.getAllBooks()
        books.value = res.data.data || []

        // 提取所有分类
        const uniqueCategories = [...new Set(books.value.map(book => book.category).filter(Boolean))]
        categories.value = uniqueCategories
    } catch (error) {
        ElMessage.error('加载图书列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 根据搜索条件过滤图书
const filteredBooks = computed(() => {
    return books.value.filter(book => {
        // 同时匹配搜索关键词和分类
        const matchesQuery = !searchQuery.value ||
            book.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.value.toLowerCase())

        const matchesCategory = !selectedCategory.value || book.category === selectedCategory.value

        return matchesQuery && matchesCategory
    })
})

// 查看图书详情
const viewBookDetail = (bookId) => {
    router.push(`/book/${bookId}`)
}

// 快速添加到购物车
const addToCart = async (book, event) => {
    event.stopPropagation() // 阻止事件冒泡到卡片点击

    try {
        await bookApi.addToCart(book.id, 1)
        ElMessage.success(`《${book.title}》已添加到购物车`)
    } catch (error) {
        ElMessage.error('添加到购物车失败')
        console.error(error)
    }
}

onMounted(() => {
    loadBooks()
})
</script>

<template>
    <div class="book-list-container">
        <div class="book-list-content">
            <el-card class="filter-card">
                <div class="filter-section">
                    <el-input
                        v-model="searchQuery"
                        placeholder="搜索书名或作者"
                        :prefix-icon="Search"
                        clearable
                    />

                    <el-select v-model="selectedCategory" clearable placeholder="选择分类">
                        <el-option
                            v-for="category in categories"
                            :key="category"
                            :label="category"
                            :value="category"
                        />
                    </el-select>
                </div>
            </el-card>

            <h2 class="section-title">图书列表 ({{ filteredBooks.length }})</h2>

            <div class="book-grid" v-loading="loading">
                <el-card
                    v-for="book in filteredBooks"
                    :key="book.id"
                    class="book-card"
                    @click="viewBookDetail(book.id)"
                >
                    <div class="book-cover">
                        <img :src="book.coverUrl" :alt="book.title" v-if="book.coverUrl">
                        <div class="no-cover" v-else>暂无封面</div>
                    </div>

                    <div class="book-info">
                        <h3 class="book-title">{{ book.title }}</h3>
                        <p class="book-author">{{ book.author }}</p>
                        <p class="book-category" v-if="book.category">{{ book.category }}</p>
                        <div class="book-footer">
                            <span class="book-price">CNY￥{{ book.price ? book.price.toFixed(2) : '0.00' }}</span>
                            <el-button
                                type="primary"
                                :icon="ShoppingCart"
                                circle
                                size="small"
                                @click="addToCart(book, $event)"
                            />
                        </div>
                    </div>
                </el-card>
            </div>

            <div class="empty-state" v-if="filteredBooks.length === 0 && !loading">
                <el-empty description="暂无图书"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
.book-list-container {
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    padding: 20px;
}

.book-list-content {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 20px;
}

.filter-card {
    margin-bottom: 20px;
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
}

.filter-section {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.filter-section .el-input {
    max-width: 300px;
}

.section-title {
    margin: 20px 0;
    color: #303133;
    font-weight: 600;
}

.book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
}

.book-card {
    height: 100%;
    cursor: pointer;
    transition: transform 0.3s;
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
}

.book-card:hover {
    transform: translateY(-5px);
}

.book-cover {
    height: 220px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
}

.book-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-cover {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f2f5;
    color: #909399;
}

.book-info {
    padding: 10px 0;
}

.book-title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 44px;
}

.book-author {
    color: #606266;
    margin: 0 0 5px;
    font-size: 14px;
}

.book-category {
    display: inline-block;
    background-color: #ecf5ff;
    color: #409eff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin: 5px 0;
}

.book-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.book-price {
    color: #ff6b6b;
    font-size: 18px;
    font-weight: bold;
}

.empty-state {
    margin: 40px 0;
}
</style>