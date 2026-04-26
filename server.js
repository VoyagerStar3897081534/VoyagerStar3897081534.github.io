const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务 - 提供前端文件
app.use(express.static(path.join(__dirname)));

// 数据目录
const DATA_DIR = path.join(__dirname, 'data');
const BLOG_DIR = path.join(DATA_DIR, 'blog');
const KEY_FILE = path.join(DATA_DIR, 'key.json');

// 确保目录存在
if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
}

// ==================== 登录API ====================

// 验证管理员密码
app.post('/api/login', (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                success: false,
                message: '请提供密码'
            });
        }
        
        // 读取密码文件
        const keyData = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'));
        const correctPassword = keyData.key;
        
        if (password === correctPassword) {
            res.json({
                success: true,
                message: '登录成功',
                token: generateToken()
            });
        } else {
            res.status(401).json({
                success: false,
                message: '密码错误'
            });
        }
    } catch (error) {
        console.error('登录验证错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 生成简单的token（实际项目中应使用JWT）
function generateToken() {
    return Buffer.from(Date.now().toString()).toString('base64');
}

// ==================== 博客文章API ====================

// 获取所有博客文章列表
app.get('/api/posts', (req, res) => {
    try {
        const files = fs.readdirSync(BLOG_DIR);
        const posts = [];
        
        files.forEach(file => {
            if (file.endsWith('.json')) {
                try {
                    const filePath = path.join(BLOG_DIR, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const post = JSON.parse(content);
                    posts.push(post);
                } catch (err) {
                    console.error(`读取文件 ${file} 失败:`, err);
                }
            }
        });
        
        // 按时间戳倒序排列
        posts.sort((a, b) => b.timestamp - a.timestamp);
        
        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        console.error('获取文章列表错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 获取单篇博客文章
app.get('/api/posts/:timestamp', (req, res) => {
    try {
        const timestamp = req.params.timestamp;
        const filePath = path.join(BLOG_DIR, `${timestamp}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: '文章不存在'
            });
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const post = JSON.parse(content);
        
        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('获取文章错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 创建新博客文章
app.post('/api/posts', (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: '标题和内容不能为空'
            });
        }
        
        const timestamp = Date.now();
        const now = new Date();
        
        const post = {
            title: title.trim(),
            content: content.trim(),
            timestamp: timestamp,
            date: now.toISOString(),
            formattedDate: now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };
        
        const filePath = path.join(BLOG_DIR, `${timestamp}.json`);
        // 使用UTF-8编码写入文件
        fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf8');
        
        console.log(`文章已保存: ${filePath}`);
        console.log(`标题: ${post.title}`);
        
        res.json({
            success: true,
            message: '发布成功',
            data: post
        });
    } catch (error) {
        console.error('创建文章错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 删除博客文章
app.delete('/api/posts/:timestamp', (req, res) => {
    try {
        const timestamp = req.params.timestamp;
        const filePath = path.join(BLOG_DIR, `${timestamp}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: '文章不存在'
            });
        }
        
        fs.unlinkSync(filePath);
        
        res.json({
            success: true,
            message: '删除成功'
        });
    } catch (error) {
        console.error('删除文章错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 更新博客文章
app.put('/api/posts/:timestamp', (req, res) => {
    try {
        const timestamp = req.params.timestamp;
        const filePath = path.join(BLOG_DIR, `${timestamp}.json`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: '文章不存在'
            });
        }
        
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: '标题和内容不能为空'
            });
        }
        
        const existingPost = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const updatedPost = {
            ...existingPost,
            title: title.trim(),
            content: content.trim(),
            updatedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(filePath, JSON.stringify(updatedPost, null, 2), 'utf8');
        
        res.json({
            success: true,
            message: '更新成功',
            data: updatedPost
        });
    } catch (error) {
        console.error('更新文章错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`  VoyagerStar Blog Server`);
    console.log(`  服务器运行在: http://localhost:${PORT}`);
    console.log(`  API地址: http://localhost:${PORT}/api`);
    console.log(`===========================================`);
});

module.exports = app;
