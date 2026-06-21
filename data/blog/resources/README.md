# 博客媒体资源使用说明

## 目录结构

```
data/blog/
├── resources/
│   ├── images/          # 存放图片文件
│   │   ├── sample.jpg
│   │   └── photo.png
│   └── videos/          # 存放视频文件
│       └── demo.mp4
├── index.json           # 博客索引文件
├── 1714118400000.json   # 博客文章1
└── 1714200000000.json   # 博客文章2
```

## 在博客中使用图片

### Markdown 语法

```markdown
![图片描述](images/filename.jpg)
```

### 示例

```markdown
![示例图片](images/sample.jpg)

这是一张示例图片的说明文字。
```

### 支持的图片格式
- JPG/JPEG
- PNG
- GIF
- WebP
- SVG

## 在博客中使用视频

### Markdown 语法

```markdown
![视频描述](videos/filename.mp4)
```

### 示例

```markdown
![示例视频](videos/demo.mp4)

视频播放器的说明文字。
```

### 支持的视频格式
- MP4 (推荐)
- WebM
- Ogg

## 完整示例

```json
{
  "timestamp": 1714200000000,
  "title": "支持图片和视频的博客文章",
  "content": "# 欢迎\n\n## 图片展示\n\n![示例图片](images/sample.jpg)\n\n## 视频内容\n\n![示例视频](videos/demo.mp4)",
  "formattedDate": "2026-06-21 15:00:00",
  "media": {
    "images": ["sample.jpg"],
    "videos": ["demo.mp4"]
  }
}
```

## 注意事项

1. **文件命名**：建议使用英文文件名，避免特殊字符
2. **文件大小**：
   - 图片建议压缩到 500KB 以下
   - 视频建议压缩到 10MB 以下
3. **路径规则**：
   - 图片使用 `images/文件名`
   - 视频使用 `videos/文件名`
4. **自动转换**：系统会自动将相对路径转换为完整路径

## 添加新媒体的步骤

1. 将图片文件放入 `data/blog/resources/images/` 目录
2. 将视频文件放入 `data/blog/resources/videos/` 目录
3. 在博客 JSON 文件的 content 字段中使用 Markdown 语法引用
4. （可选）在 media 字段中记录使用的媒体文件列表
