const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据目录
const DATA_DIR = path.join(__dirname, 'data');
const BLOG_DIR = path.join(DATA_DIR, 'blog');
const KEY_FILE = path.join(DATA_DIR, 'key.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');

// 确保目录存在
if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// ==================== 文件上传配置 ====================

let upload;
try {
    // 尝试使用 multer 2.x
    const multer = require('multer');
    
    // 配置 multer 存储
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const fileType = file.mimetype.split('/')[0];
            if (fileType === 'image') {
                cb(null, IMAGES_DIR);
            } else if (fileType === 'video') {
                cb(null, VIDEOS_DIR);
            } else {
                cb(new Error('不支持的文件类型'), null);
            }
        },
        filename: function (req, file, cb) {
            // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    });

    // 文件过滤器
    const fileFilter = (req, file, cb) => {
        const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg/;
        const allowedVideoTypes = /mp4|webm|ogg|avi|mov/;
        
        const mimetype = allowedImageTypes.test(file.mimetype) || 
                         allowedVideoTypes.test(file.mimetype);
        const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                        allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传图片或视频文件'));
        }
    };

    // 创建 multer 实例
    upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 50 * 1024 * 1024 // 限制文件大小为 50MB
        }
    });
    
    console.log('✅ Multer 加载成功');
} catch (error) {
    console.error('❌ Multer 加载失败:', error.message);
    console.log('⚠️  文件上传功能将不可用');
    upload = null;
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

// 根据语言格式化时间
function formatDateTimeByLang(date, lang = 'zh-CN') {
    const timestamp = date.getTime();
    
    if (lang === 'en-US') {
        // 英文显示 UTC 时间
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} (UTC)`;
    } else {
        // 中文显示北京时间 (UTC+8)
        const utcTime = timestamp + (date.getTimezoneOffset() * 60000);
        const beijingTime = new Date(utcTime + (8 * 3600000));
        
        const year = beijingTime.getFullYear();
        const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
        const day = String(beijingTime.getDate()).padStart(2, '0');
        const hours = String(beijingTime.getHours()).padStart(2, '0');
        const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
        const seconds = String(beijingTime.getSeconds()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    }
}

// ==================== 博客文章API ====================

// 获取所有博客文章列表
app.get('/api/posts', (req, res) => {
    try {
        // 从查询参数或请求头中获取语言
        const lang = req.query.lang || req.headers['accept-language'] || 'zh-CN';
        
        const files = fs.readdirSync(BLOG_DIR);
        const posts = [];
        
        files.forEach(file => {
            if (file.endsWith('.json')) {
                try {
                    const filePath = path.join(BLOG_DIR, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const post = JSON.parse(content);
                    
                    // 根据语言重新格式化时间
                    const postDate = new Date(post.date);
                    post.formattedDate = formatDateTimeByLang(postDate, lang);
                    
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
        // 从查询参数或请求头中获取语言
        const lang = req.query.lang || req.headers['accept-language'] || 'zh-CN';
        
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
        
        // 根据语言重新格式化时间
        const postDate = new Date(post.date);
        post.formattedDate = formatDateTimeByLang(postDate, lang);
        
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
        
        const trimmedTitle = title.trim();
        
        // 检查是否有重复标题
        const files = fs.readdirSync(BLOG_DIR);
        let hasDuplicateTitle = false;
        let duplicatePostTitle = '';
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const filePath = path.join(BLOG_DIR, file);
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const existingPost = JSON.parse(fileContent);
                    
                    // 比较标题（不区分大小写）
                    if (existingPost.title.toLowerCase() === trimmedTitle.toLowerCase()) {
                        hasDuplicateTitle = true;
                        duplicatePostTitle = existingPost.title;
                        break;
                    }
                } catch (err) {
                    console.error(`读取文件 ${file} 失败:`, err);
                }
            }
        }
        
        if (hasDuplicateTitle) {
            return res.status(409).json({
                success: false,
                message: `标题 "${duplicatePostTitle}" 已存在，请使用不同的标题`
            });
        }
        
        const timestamp = Date.now();
        const now = new Date();
        
        // 使用 UTC+8 (北京时间) 格式化时间
        // 获取 UTC 时间并转换为北京时间 (UTC+8)
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000); // 转换为 UTC
        const beijingTime = new Date(utcTime + (8 * 3600000)); // 转换为北京时间
        
        const year = beijingTime.getFullYear();
        const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
        const day = String(beijingTime.getDate()).padStart(2, '0');
        const hours = String(beijingTime.getHours()).padStart(2, '0');
        const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
        const seconds = String(beijingTime.getSeconds()).padStart(2, '0');
        
        const post = {
            title: trimmedTitle,
            content: content.trim(),
            timestamp: timestamp,
            date: now.toISOString(),
            formattedDate: `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
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
        
        const trimmedTitle = title.trim();
        
        // 检查是否有重复标题（排除当前文章）
        const files = fs.readdirSync(BLOG_DIR);
        let hasDuplicateTitle = false;
        let duplicatePostTitle = '';
        
        for (const file of files) {
            if (file.endsWith('.json') && file !== `${timestamp}.json`) {
                try {
                    const otherFilePath = path.join(BLOG_DIR, file);
                    const fileContent = fs.readFileSync(otherFilePath, 'utf8');
                    const existingPost = JSON.parse(fileContent);
                    
                    // 比较标题（不区分大小写）
                    if (existingPost.title.toLowerCase() === trimmedTitle.toLowerCase()) {
                        hasDuplicateTitle = true;
                        duplicatePostTitle = existingPost.title;
                        break;
                    }
                } catch (err) {
                    console.error(`读取文件 ${file} 失败:`, err);
                }
            }
        }
        
        if (hasDuplicateTitle) {
            return res.status(409).json({
                success: false,
                message: `标题 "${duplicatePostTitle}" 已存在，请使用不同的标题`
            });
        }
        
        const existingPost = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const updatedPost = {
            ...existingPost,
            title: trimmedTitle,
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

// ==================== 健康检查 ====================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 调试：检查 uploads 目录
app.get('/debug/uploads', (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        
        let images = [];
        let videos = [];
        
        if (fs.existsSync(IMAGES_DIR)) {
            images = fs.readdirSync(IMAGES_DIR);
        }
        
        if (fs.existsSync(VIDEOS_DIR)) {
            videos = fs.readdirSync(VIDEOS_DIR);
        }
        
        res.json({
            success: true,
            uploadsDir: UPLOADS_DIR,
            imagesDir: IMAGES_DIR,
            videosDir: VIDEOS_DIR,
            images: images,
            videos: videos,
            imagesCount: images.length,
            videosCount: videos.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== 文件上传API ====================

// 上传图片
app.post('/api/upload/image', (req, res) => {
    console.log('收到图片上传请求');
    
    if (!upload) {
        console.error('Multer 未初始化');
        return res.status(503).json({
            success: false,
            message: '文件上传功能未启用'
        });
    }
    
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer 错误:', err);
            return res.status(400).json({
                success: false,
                message: err.message || '图片上传失败'
            });
        }
        
        try {
            if (!req.file) {
                console.error('没有接收到文件');
                return res.status(400).json({
                    success: false,
                    message: '没有上传文件'
                });
            }
            
            console.log('图片上传成功:', req.file.filename);
            console.log('文件路径:', req.file.path);
            console.log('文件大小:', req.file.size);
            
            // 返回文件的访问URL
            const fileUrl = `/uploads/images/${req.file.filename}`;
            console.log('访问 URL:', fileUrl);
            
            res.json({
                success: true,
                message: '图片上传成功',
                data: {
                    filename: req.file.filename,
                    url: fileUrl,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            });
        } catch (error) {
            console.error('图片上传错误:', error);
            res.status(500).json({
                success: false,
                message: error.message || '图片上传失败'
            });
        }
    });
});

// 上传视频
app.post('/api/upload/video', (req, res) => {
    if (!upload) {
        return res.status(503).json({
            success: false,
            message: '文件上传功能未启用'
        });
    }
    
    upload.single('video')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || '视频上传失败'
            });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: '没有上传文件'
                });
            }
            
            // 返回文件的访问URL
            const fileUrl = `/uploads/videos/${req.file.filename}`;
            
            res.json({
                success: true,
                message: '视频上传成功',
                data: {
                    filename: req.file.filename,
                    url: fileUrl,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            });
        } catch (error) {
            console.error('视频上传错误:', error);
            res.status(500).json({
                success: false,
                message: error.message || '视频上传失败'
            });
        }
    });
});

// 通用文件上传（自动识别类型）
app.post('/api/upload', (req, res) => {
    if (!upload) {
        return res.status(503).json({
            success: false,
            message: '文件上传功能未启用'
        });
    }
    
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || '文件上传失败'
            });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: '没有上传文件'
                });
            }
            
            const fileType = req.file.mimetype.split('/')[0];
            const fileUrl = fileType === 'image' 
                ? `/uploads/images/${req.file.filename}`
                : `/uploads/videos/${req.file.filename}`;
            
            res.json({
                success: true,
                message: '文件上传成功',
                data: {
                    filename: req.file.filename,
                    url: fileUrl,
                    type: fileType,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            });
        } catch (error) {
            console.error('文件上传错误:', error);
            res.status(500).json({
                success: false,
                message: error.message || '文件上传失败'
            });
        }
    });
});

// ==================== 404 处理 ====================

// 静态文件服务 - 提供前端文件（放在 API 路由之后）
app.use(express.static(path.join(__dirname)));

// 提供上传文件的访问
app.use('/uploads', express.static(UPLOADS_DIR));

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path
    });
});

// ==================== 错误处理 ====================

app.use((err, req, res) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`  VoyagerStar Blog Server`);
    console.log(`  服务器运行在: http://localhost:${PORT}`);
    console.log(`  API地址: http://localhost:${PORT}/api`);
    if (process.env.RENDER_EXTERNAL_URL) {
        console.log(`  云端地址: ${process.env.RENDER_EXTERNAL_URL}`);
    } else if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        console.log(`  云端地址: https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    }
    console.log(`===========================================`);
});

module.exports = app;
