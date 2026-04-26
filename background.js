// 根据时间设置背景图片
function setBackgroundByTime() {
    const hour = new Date().getHours();
    const background = document.getElementById('background');

    let lowResImage;
    let highResImage;

    if (hour >= 6 && hour < 12) {
        // 早晨 6:00 - 11:59
        lowResImage = 'image/background/morning-low.png';
        highResImage = 'image/background/morning.png';
    } else if (hour >= 12 && hour < 18) {
        // 中午 12:00 - 17:59
        lowResImage = 'image/background/noon-low.png';
        highResImage = 'image/background/noon.png';
    } else {
        // 夜晚 18:00 - 5:59
        lowResImage = 'image/background/night-low.png';
        highResImage = 'image/background/night.png';
    }

    // 先显示低分辨率背景图片
    background.style.backgroundImage = `url("${lowResImage}")`;

    // 预加载高分辨率图片，加载完成后替换
    const img = new Image();
    img.onload = function() {
        background.style.backgroundImage = `url("${highResImage}")`;
    };
    img.src = highResImage;
}

// 页面加载时设置背景
setBackgroundByTime();

// 每分钟检查一次时间，更新背景（可选）
setInterval(setBackgroundByTime, 60000);