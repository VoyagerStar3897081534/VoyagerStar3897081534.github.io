#!/usr/bin/env node

/**
 * 创建新博客文章工具
 * 使用方法: node create-post.js "文章标题"
 */

const fs = require('fs');
const path = require('path');

// 配置
const BLOG_DIR = path.join(__dirname, 'data', 'blog');

// 确保目录存在
if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
}

// 获取标题
const title = process.argv[2];

if (!title) {
    console.error('❌ 请提供文章标题');
    console.log('使用方法: node create-post.js "文章标题"');
    process.exit(1);
}

// 生成时间戳
const timestamp = Date.now();
const now = new Date();

// 转换为北京时间 (UTC+8)
const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
const beijingTime = new Date(utcTime + (8 * 3600000));

const year = beijingTime.getFullYear();
const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
const day = String(beijingTime.getDate()).padStart(2, '0');
const hours = String(beijingTime.getHours()).padStart(2, '0');
const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
const seconds = String(beijingTime.getSeconds()).padStart(2, '0');

// 创建文章对象
const post = {
    title: title,
    content: `# ${title}\n\n在这里编写您的文章内容...\n\n支持 Markdown 格式！`,
    timestamp: timestamp,
    date: now.toISOString(),
    formattedDate: `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
};

// 保存文件
const filePath = path.join(BLOG_DIR, `${timestamp}.json`);
fs.writeFileSync(filePath, JSON.stringify(post, null, 2), 'utf8');

console.log('✅ 文章创建成功！');
console.log(`📄 文件位置: ${filePath}`);
console.log(`📅 发布时间: ${post.formattedDate}`);
console.log('');
console.log('下一步：');
console.log('1. 编辑文件添加内容');
console.log('2. 运行以下命令提交到 Git:');
console.log(`   git add data/blog/${timestamp}.json`);
console.log(`   git commit -m "添加新文章: ${title}"`);
console.log('   git push');
