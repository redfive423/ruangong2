// src/api/book.js
import axios from 'axios'

// ????axios????????????URL
const instance = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 5000
})

// ???????????????token
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

// ?????????
instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const bookApi = {
    // ??????????
    getAllBooks() {
        return instance.get('/api/products')
    },

    getProduct(id) {
        return instance.get(`/api/products/${id}`)
    },

    // ??????????????
    getBookDetail(id) {
        return instance.get(`/api/products/${id}`)
    },

    // ???????API
    getCartItems() {
        return instance.get('/api/cart')
    },

    addToCart(bookId, quantity = 1) {
        return instance.post('/api/cart', { bookId, quantity })
    },

    updateCartItem(cartItemId, quantity) {
        return instance.put(`/api/cart/${cartItemId}`, { quantity })
    },

    removeCartItem(cartItemId) {
        return instance.delete(`/api/cart/${cartItemId}`)
    },

    // ??????API
    create(bookData) {
        return instance.post('/api/products', bookData)
    },

    updateBook(bookData) {
        return instance.put(`/api/products`, bookData)
    },

    deleteBook(id) {
        return instance.delete(`/api/products/${id}`)
    },

    getStockPile(productId) {
        return instance.get(`/api/products/stockpile/${productId}`)
    },

    updateStock(productId, amount) {
        return instance.patch(`/api/products/stockpile/${productId}`, {
            productId: productId,
            amount: amount
        })
    },

    create(bookData){
        return instance.post('/api/products', bookData)
    }
}