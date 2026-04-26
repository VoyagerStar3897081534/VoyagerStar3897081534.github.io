// 认证管理模块

const API_BASE = 'http://localhost:3000/api';

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
