<script setup>
import {ref, onMounted, computed} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {bookApi} from '@/api/book.js'
import {Delete, Minus, Plus} from '@element-plus/icons-vue'

// 购物车数据
const cartItems = ref([])
const loading = ref(false)

// 计算购物车总金额
const totalAmount = computed(() => {
    return cartItems.value.reduce((total, item) => {
        return total + (item.book.price * item.quantity)
    }, 0).toFixed(2)
})

// 加载购物车数据
const loadCartItems = async () => {
    loading.value = true
    try {
        const res = await bookApi.getCartItems()
        cartItems.value = res.data.data || []
    } catch (error) {
        ElMessage.error('加载购物车失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 更新商品数量
const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return

    try {
        await bookApi.updateCartItem(item.id, newQuantity)
        item.quantity = newQuantity
        ElMessage.success('数量已更新')
    } catch (error) {
        ElMessage.error('更新数量失败')
        console.error(error)
    }
}

// 从购物车移除商品
const removeFromCart = async (item) => {
    try {
        await ElMessageBox.confirm('确定要从购物车中移除该商品吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        await bookApi.removeCartItem(item.id)
        cartItems.value = cartItems.value.filter(i => i.id !== item.id)
        ElMessage.success('商品已移除')
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('移除失败')
            console.error(error)
        }
    }
}

// 结算购物车
const checkout = async () => {
    if (cartItems.value.length === 0) {
        ElMessage.warning('购物车为空')
        return
    }

    try {
        // 这里应该调用结算API
        ElMessage.success('结算成功！')
        // 清空购物车
        cartItems.value = []
    } catch (error) {
        ElMessage.error('结算失败')
        console.error(error)
    }
}

onMounted(() => {
    loadCartItems()
})
</script>

<template>
    <div class="cart-container">
        <div class="cart-content">
            <el-card class="cart-card">
                <template #header>
                    <div class="cart-header">
                        <h2>我的购物车</h2>
                    </div>
                </template>

                <el-table
                    v-loading="loading"
                    :data="cartItems"
                    style="width: 100%"
                    empty-text="购物车中还没有商品">
                    <el-table-column label="商品信息" min-width="300">
                        <template #default="scope">
                            <div class="book-info">
                                <img :src="scope.row.book.cover" alt="封面" class="book-cover">
                                <div class="book-details">
                                    <h4>{{ scope.row.book.title }}</h4>
                                    <p class="book-author">作者：{{ scope.row.book.author }}</p>
                                </div>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="单价" width="120">
                        <template #default="scope">
                            <span class="price">¥{{ scope.row.book.price.toFixed(2) }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="数量" width="180">
                        <template #default="scope">
                            <div class="quantity-control">
                                <el-button
                                    :icon="Minus"
                                    circle
                                    size="small"
                                    @click="updateQuantity(scope.row, scope.row.quantity - 1)"
                                    :disabled="scope.row.quantity <= 1"
                                />
                                <span class="quantity">{{ scope.row.quantity }}</span>
                                <el-button
                                    :icon="Plus"
                                    circle
                                    size="small"
                                    @click="updateQuantity(scope.row, scope.row.quantity + 1)"
                                />
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="小计" width="120">
                        <template #default="scope">
                            <span class="subtotal">¥{{ (scope.row.book.price * scope.row.quantity).toFixed(2) }}</span>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="100">
                        <template #default="scope">
                            <el-button
                                :icon="Delete"
                                circle
                                type="danger"
                                @click="removeFromCart(scope.row)"
                            />
                        </template>
                    </el-table-column>
                </el-table>

                <div class="cart-footer" v-if="cartItems.length > 0">
                    <div class="total-section">
                        <span class="total-label">合计：</span>
                        <span class="total-amount">¥{{ totalAmount }}</span>
                    </div>
                    <el-button type="primary" size="large" @click="checkout">去结算</el-button>
                </div>
            </el-card>
        </div>
    </div>
</template>

<style scoped>
.cart-container {
    height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    padding: 20px;
    overflow-y: auto;
}

.cart-content {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 40px;
}

.cart-card {
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.book-info {
    display: flex;
    align-items: center;
}

.book-cover {
    width: 60px;
    height: 80px;
    object-fit: cover;
    margin-right: 15px;
    border-radius: 4px;
}

.book-details h4 {
    margin: 0 0 8px;
    font-size: 16px;
}

.book-author {
    margin: 0;
    color: #909399;
    font-size: 14px;
}

.price, .subtotal {
    color: #ff6b6b;
    font-weight: bold;
}

.quantity-control {
    display: flex;
    align-items: center;
}

.quantity {
    margin: 0 10px;
    min-width: 20px;
    text-align: center;
}

.cart-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
}

.total-section {
    margin-right: 20px;
}

.total-label {
    font-size: 16px;
    color: #606266;
}

.total-amount {
    font-size: 24px;
    color: #ff6b6b;
    font-weight: bold;
}
</style>