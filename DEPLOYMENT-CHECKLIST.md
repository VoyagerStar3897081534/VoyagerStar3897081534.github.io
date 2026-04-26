# ✅ 部署检查清单

## 部署前准备

- [ ] 项目代码已提交到 GitHub
- [ ] `package.json` 包含正确的 `start` 脚本
- [ ] `server.js` 使用 `process.env.PORT`
- [ ] `data/` 目录中的文件已提交

## Railway 部署

- [ ] 访问 https://railway.app 并登录
- [ ] 点击 "New Project" → "Deploy from GitHub repo"
- [ ] 选择仓库并部署
- [ ] 等待部署完成（约 1-2 分钟）
- [ ] 点击 "Settings" → "Domains" → "Generate Domain"
- [ ] 复制域名（例如：`xxx-production.up.railway.app`）
- [ ] 修改 `auth.js` 中的 `API_BASE`
- [ ] 提交并推送代码
- [ ] 测试 API：访问 `https://你的域名/api/posts`
- [ ] 测试前端：访问 GitHub Pages

## Render 部署（备选）

- [ ] 访问 https://render.com 并登录
- [ ] 点击 "New +" → "Web Service"
- [ ] 连接 GitHub 仓库
- [ ] 配置：
  - Name: `voyagerstar-blog`
  - Environment: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Plan: `Free`
- [ ] 等待部署完成
- [ ] 复制分配的域名
- [ ] 修改 `auth.js` 中的 `API_BASE`
- [ ] 提交并推送代码
- [ ] 测试功能

## 验证清单

- [ ] API 返回 JSON 数据
- [ ] 博客文章列表正常显示
- [ ] 登录功能正常工作
- [ ] 发文功能正常工作
- [ ] 多语言切换正常
- [ ] 背景图片正常加载

## 部署后的维护

- [ ] Railway：监控 $5 额度使用情况
- [ ] Render：注意 15 分钟休眠策略
- [ ] 定期检查部署日志
- [ ] 推送代码后确认自动部署成功

---

**提示**：部署完成后，删除此文件即可。
