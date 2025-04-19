<script setup>
import {ref, reactive, onMounted, computed} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {bookApi} from '@/api/book.js'
import {Plus, Edit, Delete, Search} from '@element-plus/icons-vue'
import {userApi} from "@/api/user.js";

// 图书列表数据
const books = ref([])
const stocks = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加新书籍')
const isEdit = ref(false)
const currentSpecifications = ref([])//存储规格

// 搜索条件
const searchQuery = ref('')

const specificationList = ref([])


// 编辑或新增的图书数据
const bookForm = reactive({
    id: null,
    title: '',
    price: 0,
    rate: 0,
    cover: '',
    description: '',
    detail: '',
    specifications: []
})

const stockPile = reactive(
    {
        id: null,
        productID: null,
        amount: 0,
        frozen: 0
    }
)

const resetStockPile = () => {
    Object.assign(stockPile, {
        id: null,
        productID: null,
        amount: 0,
        frozen: 0
    });
};

// 表单规则
const rules = {
    title: [{required: true, message: '请输入书名', trigger: 'blur'}],
    price: [{required: true, message: '请输入价格', trigger: 'blur'}],
}

const bookFormRef = ref(null)

// 加载图书列表
const loadBooks = async () => {
    loading.value = true
    try {
        const res = await bookApi.getAllBooks()
        books.value = res.data.data || []

        const validBooks = books.value.filter(book => book.id)
        const stockPromises = validBooks.map((book, index) =>
            bookApi.getStockPile(book.id)
                .then(res => {
                    // 通过索引更新响应式数组
                    books.value[index].stock = res.data.data.amount
                })
                .catch(() => {
                    books.value[index].stock = 0
                })
        )

        // 3. 等待所有库存请求完成
        await Promise.all(stockPromises);


    } catch (error) {
        ElMessage.error('加载图书列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 打开新增图书对话框
const openAddDialog = () => {
    isEdit.value = false
    dialogTitle.value = '添加新书籍'
    resetForm()
    dialogVisible.value = true
}

// 打开编辑图书对话框
const openEditDialog = (row) => {
    isEdit.value = true
    dialogTitle.value = '编辑书籍'
    Object.assign(bookForm, row)
    dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
    if (bookFormRef.value) {
        bookFormRef.value.resetFields()
    }
    Object.assign(bookForm, {
        id: null,
        title: '',
        description: '',
        rate: 0,
        price: 0,
        cover: '',
        category: '',
        detail: '',
        specifications: []
    })
}

//重置spec表单
const resetSpecForm = () => {
    Object.assign(specForm, {
        id: null,
        item: '',
        value: '',
        productId: null
    });
};


// 控制规格对话框的显示状态
const specDialogVisible = ref(false);
const isEditSpec = ref(false);
const specDialogTitle = ref('');

const specShowDialogVisible = ref(false);
const isEditSpecShow = ref(false);
const specShowDialogTitle = ref('');
const specForm = reactive({
    id: null,
    item: '',
    value: '',
    productId: null
});

// 打开添加规格对话框
const openAddSpecDialog = () => {
    isEditSpec.value = false;
    specDialogTitle.value = '添加新规格';
    resetSpecForm();
    specDialogVisible.value = true;
};

const openShowSpecDialog = () => {
    isEditSpecShow.value = false
    specShowDialogTitle.value = '商品规格'
    if (bookForm.id) {
        loadSpecifications(bookForm.id)
    }
    specShowDialogVisible.value = true
}

//加载规格
const loadSpecifications = async (bookId) => {
    try {
        const res = await bookApi.getProduct(bookId)
        currentSpecifications.value = res.data.data.specifications || []
    } catch (error) {
        ElMessage.error('获取规格数据失败')
        console.error(error)
    }
}

// 保存图书
const saveBook = async () => {
    if (!bookFormRef.value) return
    await bookFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                // 保存主图书数据
                let bookId = bookForm.id;
                // 先保存图书数据
                if (isEdit.value) {
                    console.log(bookForm.specifications[0].productId)
                    await bookApi.updateBook(bookForm);
                } else {
                    const createRes = await bookApi.create(bookForm);
                    bookId = createRes.data.data.id; // 获取新ID
                    bookForm.specifications.forEach(spec => spec.productId = bookId);
                }

                // 然后保存库存
                await bookApi.updateStock(
                    bookId,  // 使用正确的ID
                    stockPile.amount
                );
                if (!isEdit.value && bookForm.specifications.length > 0) {
                    await bookApi.updateBook({...bookForm, id: bookId});
                }
                resetStockPile()
                resetForm()


                ElMessage.success('保存成功');
                dialogVisible.value = false;
                await loadBooks();
            } catch (error) {
                ElMessage.error('保存失败');
            }
        }
    })
}

// 删除图书
const deleteBook = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除这本书吗？此操作不可逆', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        await bookApi.deleteBook(id)
        ElMessage.success('删除成功')
        loadBooks()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败')
            console.error(error)
        }
    }
}


const filteredBooks = computed(() => {
    if (!searchQuery.value) return books.value

    const query = searchQuery.value.toLowerCase()
    return books.value.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
    )
})


const addSpecification = async () => {
    // 将新规格添加到当前图书的Specification数组
    bookForm.specifications.push({
        id: specForm.id,
        item: specForm.item,
        value: specForm.value,
        productId: bookForm.id // 确保此时bookForm.id有效
    });
    specificationList.value.push(specForm);
    console.log(bookForm.specifications[0].productId)

    try {
        // 更新整个图书信息（包含规格）
        ElMessage.success('规格添加成功');
        specDialogVisible.value = false;
    } catch (error) {
        ElMessage.error('规格添加失败');
    }
}
onMounted(() => {
    loadBooks()
})
</script>

<template>
    <div class="warehouse-container">
        <div class="warehouse-content">
            <el-card class="warehouse-card">
                <template #header>
                    <div class="warehouse-header">
                        <h2>图书库存管理</h2>
                        <div class="header-actions">
                            <el-input
                                v-model="searchQuery"
                                placeholder="搜索书名/作者/分类"
                                prefix-icon="search"
                                clearable
                                style="width: 300px; margin-right: 20px;"
                            />
                            <el-button type="primary" :icon="Plus" @click="openAddDialog">
                                添加新书籍
                            </el-button>
                        </div>
                    </div>
                </template>

                <el-table
                    v-loading="loading"
                    :data="filteredBooks"
                    style="width: 100%"
                    border
                >
                    <el-table-column label="封面" width="100">
                        <template #default="scope">
                            <el-image
                                :src="scope.row.cover"
                                fit="cover"
                                style="width: 60px; height: 80px; border-radius: 4px;"
                                :preview-src-list="[scope.row.cover]"
                            >
                                <template #error>
                                    <div class="image-placeholder">无封面</div>
                                </template>
                            </el-image>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="ID" width="100"/>
                    <el-table-column prop="title" label="书名" min-width="180"/>
                    <el-table-column prop="rate" label="评分" width="100"/>
                    <el-table-column prop="stock" label="库存" width="120">
                        <template #default="{row}">
                            {{ row.stock ?? '加载中...' }}
                        </template>
                    </el-table-column>

                    <el-table-column label="价格" width="100">
                        <template #default="scope">
                            ¥{{ scope.row.price.toFixed(2) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" width="180"/>

                    <el-table-column label="操作" width="150" fixed="right">
                        <template #default="scope">
                            <el-button
                                :icon="Edit"
                                circle
                                type="primary"
                                @click="openEditDialog(scope.row)"
                            />
                            <el-button
                                :icon="Delete"
                                circle
                                type="danger"
                                @click="deleteBook(scope.row.id)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>

        <!-- 添加/编辑图书对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogTitle"
            width="50%"
        >
            <el-form
                ref="bookFormRef"
                :model="bookForm"
                :rules="rules"
                label-width="100px"
            >
                <el-form-item label="id" prop="price">
                    <el-input v-model="bookForm.id"/>
                </el-form-item>
                <el-form-item label="书名" prop="title">
                    <el-input v-model="bookForm.title"/>
                </el-form-item>

                <el-form-item label="价格" prop="price">
                    <el-input-number v-model="bookForm.price" :min="0" :precision="2"/>
                </el-form-item>
                <el-form-item label="评分" prop="rate">
                    <el-input-number v-model="bookForm.rate" :min="0" :max='10' :precision="1"/>
                </el-form-item>

                <el-form-item
                    label="要改变的库存数量"
                    prop="stock"
                >
                    <el-input-number v-model="stockPile.amount" :precision="0"/>
                </el-form-item>

                <el-form-item label="封面URL" prop="cover">
                    <el-input v-model="bookForm.cover"/>
                </el-form-item>

                <el-form-item label="描述" prop="description">
                    <el-input
                        v-model="bookForm.description"
                        type="textarea"
                        :rows="4"
                    />
                </el-form-item>
                <el-form-item label="详细说明" prop="detail">
                    <el-input v-model="bookForm.detail"
                              type="textarea"
                              :rows="2"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="openAddSpecDialog">增加新规格</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="openShowSpecDialog">查看已有规格</el-button>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveBook">保存</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog
            v-model="specDialogVisible"
            :title="specDialogTitle"
            width="30%"
        >
            <el-form
                ref="specFormRef"
                :model="specForm"
                :rules="rules"
                label-width="100px"
            >

                <el-form-item label="规格ID" prop="id">
                    <el-input v-model="specForm.id"/>
                </el-form-item>

                <el-form-item label="规格项" prop="item">
                    <el-input v-model="specForm.item"/>
                </el-form-item>

                <el-form-item label="规格值" prop="value">
                    <el-input v-model="specForm.value"/>
                </el-form-item>


            </el-form>


            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="specDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="addSpecification">保存</el-button>
                </div>
            </template>
        </el-dialog>


        <!--展示规格-->
        <el-dialog
            v-model="specShowDialogVisible"
            :title="specShowDialogTitle"
            width="60%"
        >
            <el-table
                :data="currentSpecifications"
                border
                style="width: 100%"
                empty-text="暂无规格数据"
            >
                <el-table-column prop="id" label="规格ID"/>
                <el-table-column prop="item" label="规格项"/>
                <el-table-column prop="value" label="规格值"/>
                <el-table-column prop="productId" label="产品ID"/>
            </el-table>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="specShowDialogVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<style scoped>
.warehouse-container {
    height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    padding: 20px;
    overflow-y: auto;
}

.warehouse-content {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 40px;
}

.warehouse-card {
    background-color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.warehouse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header-actions {
    display: flex;
    align-items: center;
}

.image-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 80px;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 12px;
    border-radius: 4px;
}
</style>