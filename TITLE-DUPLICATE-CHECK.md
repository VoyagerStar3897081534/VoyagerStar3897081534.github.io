# 标题重复检查功能说明

## 功能概述

博客系统现已支持标题重复检查，防止发布标题相同的文章。

## 功能特性

### ✅ 创建文章时检查
- 自动检测新文章标题是否与现有文章重复
- 不区分大小写比较（"Hello" 和 "hello" 视为相同）
- 发现重复时阻止发布并显示友好提示

### ✅ 更新文章时检查
- 编辑文章时也会检查标题重复
- 自动排除当前文章本身
- 只检查其他文章的标题

### ✅ 用户友好的提示
- 清晰显示哪个标题已存在
- 自动聚焦到标题输入框
- 选中标题文本方便修改

## 使用示例

### 场景 1：创建重复标题的文章

**操作步骤：**
1. 已有一篇文章标题为："我的第一篇博客"
2. 尝试创建新文章，标题也为："我的第一篇博客"

**系统响应：**
```
❌ 标题 "我的第一篇博客" 已存在，请使用不同的标题
```

**用户体验：**
- 显示红色错误消息
- 光标自动定位到标题输入框
- 标题文本被选中，方便直接修改

### 场景 2：大小写不同的标题

**操作步骤：**
1. 已有文章标题："Hello World"
2. 尝试创建标题："hello world"

**系统响应：**
```
❌ 标题 "Hello World" 已存在，请使用不同的标题
```

**说明：**
- 系统不区分大小写
- "Hello World"、"HELLO WORLD"、"hello world" 都视为相同

### 场景 3：编辑文章时保持原标题

**操作步骤：**
1. 编辑文章 "我的博客"
2. 修改内容但不改标题
3. 保存文章

**系统响应：**
```
✅ 更新成功
```

**说明：**
- 系统会排除当前文章
- 允许保持原标题不变

### 场景 4：编辑时改为与其他文章重复的标题

**操作步骤：**
1. 已有文章 A 标题："技术分享"
2. 编辑文章 B，将标题改为："技术分享"

**系统响应：**
```
❌ 标题 "技术分享" 已存在，请使用不同的标题
```

## 技术实现

### 后端实现 (server.js)

#### 1. 创建文章时的检查

```javascript
// 检查是否有重复标题
const files = fs.readdirSync(BLOG_DIR);
let hasDuplicateTitle = false;
let duplicatePostTitle = '';

for (const file of files) {
    if (file.endsWith('.json')) {
        const filePath = path.join(BLOG_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const existingPost = JSON.parse(fileContent);
        
        // 比较标题（不区分大小写）
        if (existingPost.title.toLowerCase() === trimmedTitle.toLowerCase()) {
            hasDuplicateTitle = true;
            duplicatePostTitle = existingPost.title;
            break;
        }
    }
}

if (hasDuplicateTitle) {
    return res.status(409).json({
        success: false,
        message: `标题 "${duplicatePostTitle}" 已存在，请使用不同的标题`
    });
}
```

#### 2. 更新文章时的检查

```javascript
// 检查是否有重复标题（排除当前文章）
for (const file of files) {
    // 排除当前文章文件
    if (file.endsWith('.json') && file !== `${timestamp}.json`) {
        // ... 检查逻辑同上
    }
}
```

### 前端实现 (post.html)

```javascript
// 处理服务器响应
if (result.success) {
    // 成功处理
} else {
    // 显示错误消息
    messageDiv.className = 'message error';
    messageDiv.textContent = result.message || '发布失败，请重试';
    
    // 如果是标题重复错误（HTTP 409），聚焦到标题输入框
    if (response.status === 409) {
        document.getElementById('title').focus();
        document.getElementById('title').select();
    }
}
```

## HTTP 状态码

- **200 OK**: 创建/更新成功
- **400 Bad Request**: 标题或内容为空
- **409 Conflict**: 标题重复
- **500 Internal Server Error**: 服务器错误

## API 响应示例

### 成功响应
```json
{
  "success": true,
  "message": "发布成功",
  "data": {
    "title": "我的博客",
    "content": "...",
    "timestamp": 1714200000000,
    "date": "2026-04-27T01:40:00.000Z",
    "formattedDate": "2026/04/27 09:40:00"
  }
}
```

### 标题重复响应
```json
{
  "success": false,
  "message": "标题 \"我的博客\" 已存在，请使用不同的标题"
}
```

## 最佳实践

### 1. 标题命名建议
- 使用描述性的标题
- 避免过于通用的标题（如"测试"、"笔记"）
- 可以在标题中加入日期或版本号
  - ✅ "2026年4月技术总结"
  - ✅ "React 学习笔记 v2"
  - ❌ "测试"
  - ❌ "笔记"

### 2. 处理重复标题
如果确实需要相似的标题，可以：
- 添加副标题或序号
  - "技术分享（一）"
  - "技术分享（二）"
- 添加日期
  - "周报 - 2026年第1周"
  - "周报 - 2026年第2周"
- 添加具体主题
  - "JavaScript 基础教程"
  - "JavaScript 高级技巧"

### 3. 编辑文章
- 修改内容时可以保持标题不变
- 如需修改标题，确保不与现有文章重复
- 系统会自动排除当前文章，所以可以保存原标题

## 常见问题

### Q: 为什么不允许多篇文章有相同标题？
A: 
- 便于管理和查找文章
- 避免混淆
- 有利于 SEO（搜索引擎优化）
- 提高用户体验

### Q: 如果我真的需要相同标题怎么办？
A: 
建议在标题中添加区分标识：
- 序号：Part 1, Part 2
- 日期：2026-04-26, 2026-04-27
- 版本：v1, v2
- 副标题：主标题 - 副标题

### Q: 检查是否区分大小写？
A: 
不区分大小写。"Hello"、"HELLO"、"hello" 都被视为相同标题。

### Q: 旧文章会受影响吗？
A: 
不会。只有在新建或更新文章时才会检查。已有的重复标题文章不会被修改。

### Q: 删除文章后，标题可以重用吗？
A: 
可以。删除文章后，该标题就可以再次使用。

## 性能考虑

### 检查效率
- 遍历所有文章文件
- 对于少量文章（< 1000篇），性能影响可忽略
- 对于大量文章，可以考虑：
  - 建立标题索引
  - 使用数据库
  - 缓存标题列表

### 优化建议
如果文章数量很多：
1. 在内存中维护标题索引
2. 只在启动时加载一次
3. 创建/删除/更新时同步更新索引
4. 使用 Set 数据结构快速查找

## 未来改进

### 短期
1. 添加标题相似度检测（ fuzzy matching）
2. 提供标题建议功能
3. 显示类似标题列表

### 长期
1. 使用数据库存储文章
2. 添加全文搜索
3. 支持标签和分类
4. 标题自动去重建议

## 测试清单

- [x] 创建重复标题的文章被阻止
- [x] 大小写不同的重复标题被检测到
- [x] 更新文章时保持原标题可以成功
- [x] 更新文章时改为重复标题被阻止
- [x] 错误消息清晰易懂
- [x] 光标自动聚焦到标题输入框
- [x] 标题文本被选中方便修改
- [x] HTTP 状态码正确（409）

---

**享受无重复标题的整洁博客！** 🎉
