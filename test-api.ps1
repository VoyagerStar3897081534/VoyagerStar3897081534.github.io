# PowerShell 测试脚本 - 验证博客系统功能

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VoyagerStar 博客系统 - 功能测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$API_BASE = "http://localhost:3000/api"
$testPassed = 0
$testFailed = 0

# 测试1：检查服务器是否运行
Write-Host "[测试 1/5] 检查服务器连接..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/posts" -Method Get -ErrorAction Stop
    Write-Host "✓ 服务器连接成功" -ForegroundColor Green
    $testPassed++
} catch {
    Write-Host "✗ 无法连接到服务器" -ForegroundColor Red
    Write-Host "  请确保已运行 'start.bat' 或 'npm start'" -ForegroundColor Red
    $testFailed++
    exit 1
}

# 测试2：检查初始文章
Write-Host ""
Write-Host "[测试 2/5] 检查文章列表..." -ForegroundColor Yellow
try {
    $posts = (Invoke-RestMethod -Uri "$API_BASE/posts").data
    Write-Host "✓ 获取到 $($posts.Count) 篇文章" -ForegroundColor Green
    if ($posts.Count -gt 0) {
        Write-Host "  第一篇文章: $($posts[0].title)" -ForegroundColor Gray
    }
    $testPassed++
} catch {
    Write-Host "✗ 获取文章列表失败" -ForegroundColor Red
    Write-Host "  错误: $_" -ForegroundColor Red
    $testFailed++
}

# 测试3：创建新文章
Write-Host ""
Write-Host "[测试 3/5] 创建测试文章..." -ForegroundColor Yellow
$testTitle = "PowerShell测试文章 $(Get-Date -Format 'HH:mm:ss')"
$testContent = "这是一篇通过PowerShell自动创建的测试文章。`n时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

try {
    $body = @{
        title = $testTitle
        content = $testContent
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "$API_BASE/posts" -Method Post -Body $body -ContentType "application/json"
    
    if ($result.success) {
        Write-Host "✓ 文章创建成功" -ForegroundColor Green
        Write-Host "  标题: $($result.data.title)" -ForegroundColor Gray
        Write-Host "  时间戳: $($result.data.timestamp)" -ForegroundColor Gray
        $testPassed++
        
        # 保存时间戳用于后续测试
        $newPostTimestamp = $result.data.timestamp
    } else {
        throw $result.message
    }
} catch {
    Write-Host "✗ 创建文章失败" -ForegroundColor Red
    Write-Host "  错误: $_" -ForegroundColor Red
    $testFailed++
}

# 测试4：验证文件是否创建
Write-Host ""
Write-Host "[测试 4/5] 验证文件存储..." -ForegroundColor Yellow
if ($newPostTimestamp) {
    $filePath = "E:\VoyagerStar3897081534.github.io\data\blog\$newPostTimestamp.json"
    if (Test-Path $filePath) {
        Write-Host "✓ 文件已创建: $newPostTimestamp.json" -ForegroundColor Green
        
        # 读取并验证文件内容
        $fileContent = Get-Content $filePath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($fileContent.title -eq $testTitle) {
            Write-Host "✓ 文件内容验证通过" -ForegroundColor Green
            $testPassed++
        } else {
            Write-Host "✗ 文件内容不匹配" -ForegroundColor Red
            $testFailed++
        }
    } else {
        Write-Host "✗ 文件未找到: $filePath" -ForegroundColor Red
        $testFailed++
    }
}

# 测试5：获取单篇文章
Write-Host ""
Write-Host "[测试 5/5] 获取单篇文章..." -ForegroundColor Yellow
if ($newPostTimestamp) {
    try {
        $singlePost = Invoke-RestMethod -Uri "$API_BASE/posts/$newPostTimestamp"
        if ($singlePost.success) {
            Write-Host "✓ 单篇文章获取成功" -ForegroundColor Green
            Write-Host "  标题: $($singlePost.data.title)" -ForegroundColor Gray
            $testPassed++
        } else {
            throw $singlePost.message
        }
    } catch {
        Write-Host "✗ 获取单篇文章失败" -ForegroundColor Red
        Write-Host "  错误: $_" -ForegroundColor Red
        $testFailed++
    }
}

# 清理测试数据（可选）
Write-Host ""
Write-Host "是否删除测试文章？(Y/N)" -ForegroundColor Cyan
$cleanup = Read-Host
if ($cleanup -eq "Y" -or $cleanup -eq "y") {
    if ($newPostTimestamp) {
        try {
            Invoke-RestMethod -Uri "$API_BASE/posts/$newPostTimestamp" -Method Delete | Out-Null
            Write-Host "测试文章已删除" -ForegroundColor Green
        } catch {
            Write-Host "删除测试文章失败" -ForegroundColor Yellow
        }
    }
}

# 显示测试结果
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试结果汇总" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "通过: $testPassed" -ForegroundColor Green
Write-Host "失败: $testFailed" -ForegroundColor $(if ($testFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($testFailed -eq 0) {
    Write-Host "🎉 所有测试通过！系统运行正常。" -ForegroundColor Green
    Write-Host ""
    Write-Host "可以访问以下页面：" -ForegroundColor Cyan
    Write-Host "  首页: http://localhost:3000" -ForegroundColor White
    Write-Host "  登录: http://localhost:3000/login.html" -ForegroundColor White
    Write-Host "  博客: http://localhost:3000/blog.html" -ForegroundColor White
    Write-Host "  API测试: http://localhost:3000/api-test.html" -ForegroundColor White
} else {
    Write-Host "❌ 部分测试失败，请检查上述错误信息。" -ForegroundColor Red
    Write-Host ""
    Write-Host "建议：" -ForegroundColor Yellow
    Write-Host "  1. 确保服务器正在运行" -ForegroundColor White
    Write-Host "  2. 检查浏览器控制台错误" -ForegroundColor White
    Write-Host "  3. 查看 TROUBLESHOOTING.md 文档" -ForegroundColor White
}
Write-Host ""
