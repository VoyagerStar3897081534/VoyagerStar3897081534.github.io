# 文件上传进度条功能说明

## 更新内容

### ✅ 新增功能

1. **上传进度条显示**
   - 实时显示上传进度百分比
   - 渐变色进度条动画效果
   - 清晰的文本提示

2. **修复文件访问问题**
   - 确保使用完整的 URL（包含协议和域名）
   - 添加服务器端调试日志
   - 优化错误处理

3. **改进用户体验**
   - 上传时显示进度条
   - 完成后自动隐藏
   - 失败时显示具体错误信息

## 技术实现

### 前端实现 (post.html)

#### 1. 进度条样式

```css
.upload-progress {
    display: none;
    margin-top: 15px;
    padding: 15px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    width: 0%;
    transition: width 0.3s ease;
}
```

#### 2. 使用 XMLHttpRequest 监控进度

```javascript
const xhr = new XMLHttpRequest();

// 监听上传进度
xhr.upload.addEventListener('progress', function(e) {
    if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        updateProgress(percentComplete);
    }
});

// 监听完成
xhr.addEventListener('load', function() {
    if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        // 处理成功响应
    }
});

xhr.open('POST', `${API_BASE}/upload/image`);
xhr.send(formData);
```

#### 3. 进度控制函数

```javascript
// 显示进度条
function showProgress(percent) {
    progressDiv.classList.add('show');
    progressBar.style.width = percent + '%';
    progressText.textContent = `上传中... ${percent}%`;
}

// 更新进度
function updateProgress(percent) {
    progressBar.style.width = percent + '%';
    progressText.textContent = `上传中... ${percent}%`;
}

// 隐藏进度条
function hideProgress() {
    progressDiv.classList.remove('show');
}
```

### 后端实现 (server.js)

#### 1. 静态文件服务

```javascript
// 提供上传文件的访问
app.use('/uploads', express.static(UPLOADS_DIR));

// 调试日志
app.use('/uploads', (req, res, next) => {
    console.log(`访问上传文件: ${req.path}`);
    next();
});
```

#### 2. 返回完整 URL

```javascript
// 返回文件的访问URL（相对路径）
const fileUrl = `/uploads/images/${req.file.filename}`;

res.json({
    success: true,
    data: {
        url: fileUrl,  // 前端会拼接完整 URL
        // ...
    }
});
```

## 使用示例

### 上传图片

1. **点击"📤 上传图片"按钮**
2. **选择图片文件**
3. **看到进度条显示**
   ```
   [████████████░░░░░░░░] 上传中... 60%
   ```
4. **上传完成后**
   - 进度条消失
   - 弹出提示："图片上传成功！"
   - 提示输入图片描述
   - Markdown 代码自动插入编辑器

### 上传视频

1. **点击"📤 上传视频"按钮**
2. **选择视频文件**
3. **看到进度条显示**
   ```
   [████████████████░░░░] 上传中... 80%
   ```
4. **上传完成后**
   - 进度条消失
   - 弹出提示："视频上传成功！"
   - HTML5 video 标签自动插入编辑器

## 文件访问 URL

### 本地开发
```
图片: http://localhost:3000/uploads/images/filename.jpg
视频: http://localhost:3000/uploads/videos/filename.mp4
```

### Railway 部署
```
图片: https://your-app.railway.app/uploads/images/filename.jpg
视频: https://your-app.railway.app/uploads/videos/filename.mp4
```

### URL 生成逻辑

```javascript
// 后端返回相对路径
const fileUrl = `/uploads/images/filename.jpg`;

// 前端拼接完整 URL
const imageUrl = window.location.origin + result.data.url;
// 结果: https://your-app.railway.app/uploads/images/filename.jpg
```

## 常见问题

### Q1: 上传后图片/视频无法显示？

**可能原因：**
1. 文件路径不正确
2. 静态文件服务未配置
3. Railway 文件系统问题

**解决方案：**
1. 检查浏览器控制台的网络请求
2. 查看服务器日志中的访问记录
3. 确认文件确实存在于 uploads 目录
4. 检查 URL 是否完整（包含协议和域名）

**调试步骤：**
```javascript
// 在浏览器控制台检查
console.log(window.location.origin);  // 查看当前域名
console.log(result.data.url);         // 查看返回的相对路径
console.log(imageUrl);                // 查看完整 URL
```

### Q2: 进度条不显示？

**可能原因：**
1. 文件太小，上传太快
2. 浏览器不支持 XMLHttpRequest progress 事件

**解决方案：**
- 尝试上传较大的文件（> 1MB）
- 使用现代浏览器（Chrome、Firefox、Edge）

### Q3: 上传失败？

**检查项：**
1. 文件大小是否超过限制
   - 图片：最大 10MB
   - 视频：最大 50MB
2. 文件格式是否支持
3. 网络连接是否正常
4. 服务器是否有足够存储空间

**错误提示：**
- "图片大小不能超过 10MB"
- "图片上传失败: HTTP 413" (文件太大)
- "图片上传失败: 网络错误"

### Q4: Railway 部署后文件丢失？

**重要提示：**
Railway 使用临时文件系统，重启后上传的文件会丢失！

**解决方案：**
1. **使用对象存储服务**（推荐）
   - AWS S3
   - 阿里云 OSS
   - 七牛云
   - Cloudinary

2. **定期备份**
   ```bash
   # 下载 uploads 目录
   railway volume download uploads
   ```

3. **使用外部图床**
   - 上传图片到图床服务
   - 在文章中使用外链 URL

## 性能优化建议

### 1. 图片优化
- 上传前压缩图片
- 使用合适的格式（JPG for photos, PNG for graphics）
- 分辨率不要过高（1920px 宽度足够）

### 2. 视频优化
- 使用 MP4 格式（H.264 编码）
- 码率控制在 2-5 Mbps
- 考虑使用视频托管服务（YouTube、Bilibili）

### 3.  CDN 加速
- 使用 CDN 分发静态文件
- 启用浏览器缓存
- 配置 Cache-Control 头

## 未来改进

### 短期
1. 添加拖拽上传支持
2. 支持批量上传
3. 图片预览功能
4. 上传取消功能

### 长期
1. 集成云存储服务
2. 图片自动压缩
3. 视频转码
4. 缩略图生成
5. 上传历史记录

## 测试清单

- [x] 进度条正常显示
- [x] 进度百分比准确
- [x] 上传完成后进度条隐藏
- [x] 图片可以正常显示
- [x] 视频可以正常播放
- [x] URL 生成正确
- [x] 错误处理完善
- [x] 大文件上传稳定
- [x] 移动端兼容

## 代码位置

### 前端
- **文件**: `post.html`
- **CSS**: 第 280-320 行（进度条样式）
- **HTML**: 第 475-481 行（进度条元素）
- **JS**: 第 750-920 行（上传函数）

### 后端
- **文件**: `server.js`
- **配置**: 第 613-619 行（静态文件服务）
- **API**: 第 461-555 行（上传接口）

---

**享受带进度条的文件上传体验！** 🎉
