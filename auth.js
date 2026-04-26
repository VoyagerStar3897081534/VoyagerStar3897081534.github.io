// 认证管理模块 - 已禁用在线发帖功能
// 博客文章通过本地编辑并 Git 推送的方式管理

// API 基础 URL - Railway 后端
const API_BASE = 'https://upbeat-sparkle-production-61c6.up.railway.app/api';

// 前端基础 URL - 用于生成资源的完整 URL
const FRONTEND_BASE = window.location.origin;

// 注意：以下登录相关函数已不再使用
// 博客采用 Git-based 工作流程，无需在线登录

// 检查是否已登录
function isLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

// 设置登录状态
function setLoggedIn(status, token = null) {
    localStorage.setItem('adminLoggedIn', status);
    if (status && token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('loginTime', new Date().toISOString());
    } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('loginTime');
    }
}

// 获取token
function getToken() {
    return localStorage.getItem('authToken');
}

// 获取登录时间
function getLoginTime() {
    return localStorage.getItem('loginTime');
}

// 退出登录
function logout() {
    setLoggedIn(false);
    window.location.href = 'index.html';
}

// 检查登录状态，未登录则重定向
function requireLogin() {
    if (!isLoggedIn()) {
        alert('请先登录');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 更新导航栏显示
function updateNavbarAuth() {
    const loginLink = document.getElementById('nav-login');
    const logoutLink = document.getElementById('nav-logout');
    const postLink = document.getElementById('nav-post');
    
    if (!loginLink || !logoutLink) return;
    
    if (isLoggedIn()) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
        if (postLink) {
            postLink.style.display = 'block';
        }
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
        if (postLink) {
            postLink.style.display = 'none';
        }
    }
}

// 页面加载时更新导航栏
document.addEventListener('DOMContentLoaded', function() {
    updateNavbarAuth();
});
