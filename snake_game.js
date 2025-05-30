// 获取Canvas元素和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 定义颜色
const colors = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#FF0000',
    deepRed: '#DC143C',
    green: '#00FF00',
    deepGreen: '#228B22',
    lightGreen: '#90EE90',
    gray: '#C8C8C8',
    deepGray: '#646464',
    skyBlue: '#87CEEB',
    gold: '#FFD700',
    purple: '#800080',
    yellow: '#FFFF00'
};

// 游戏参数
const blockSize = 20;
const width = canvas.width;
const height = canvas.height;
let speed = 10;

// 蛇的初始状态
let snake = [];
let snakeLength = 1;
let direction = { x: blockSize, y: 0 };
let score = 0;

// 苹果和炸弹位置
let apple = { x: 0, y: 0 };
let bomb = { x: -100, y: -100 };
let bombExists = false;
let bombTimer = 0;

// 特效变量
let effectFrames = 0;
let effectPosition = null;
let bombEffectFrames = 0;
let bombEffectPosition = null;

// 游戏状态
let gameOver = false;
let gameStarted = false;

// 初始化游戏
function init() {
    snake = [];
    snakeLength = 1;
    direction = { x: blockSize, y: 0 };
    score = 0;
    
    // 蛇的初始位置
    const x = Math.floor(width / 2);
    const y = Math.floor(height / 2);
    snake.push([x, y]);
    
    // 生成第一个苹果
    generateApple();
    
    // 重置炸弹
    bomb = { x: -100, y: -100 };
    bombExists = false;
    bombTimer = 0;
    
    // 重置特效
    effectFrames = 0;
    bombEffectFrames = 0;
    
    gameOver = false;
}

// 生成苹果
function generateApple() {
    apple.x = Math.floor(Math.random() * (width - blockSize) / blockSize) * blockSize;
    apple.y = Math.floor(Math.random() * (height - blockSize) / blockSize) * blockSize;
    
    // 确保苹果不会生成在炸弹或蛇身上
    while ((apple.x === bomb.x && apple.y === bomb.y && bombExists) || 
           snake.some(segment => segment[0] === apple.x && segment[1] === apple.y)) {
        apple.x = Math.floor(Math.random() * (width - blockSize) / blockSize) * blockSize;
        apple.y = Math.floor(Math.random() * (height - blockSize) / blockSize) * blockSize;
    }
}

// 生成炸弹
function generateBomb() {
    if (!bombExists) {
        bombTimer++;
        if (bombTimer >= 50 && Math.random() < 0.1) {
            bomb.x = Math.floor(Math.random() * (width - blockSize) / blockSize) * blockSize;
            bomb.y = Math.floor(Math.random() * (height - blockSize) / blockSize) * blockSize;
            
            // 确保炸弹不会生成在苹果或蛇身上
            while ((bomb.x === apple.x && bomb.y === apple.y) || 
                   snake.some(segment => segment[0] === bomb.x && segment[1] === bomb.y)) {
                bomb.x = Math.floor(Math.random() * (width - blockSize) / blockSize) * blockSize;
                bomb.y = Math.floor(Math.random() * (height - blockSize) / blockSize) * blockSize;
            }
            
            bombExists = true;
            bombTimer = 0;
        }
    }
}

// 绘制背景
function drawBackground() {
    ctx.fillStyle = colors.skyBlue;
    ctx.fillRect(0, 0, width, height);
    
    // 添加一些纹理
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const brightness = Math.floor(Math.random() * 50 + 150);
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        // 创建蛇身渐变色
        const ratio = index / Math.max(1, snake.length - 1);
        const r = Math.floor(colors.deepGreen[0] + (colors.lightGreen[0] - colors.deepGreen[0]) * ratio);
        const g = Math.floor(colors.deepGreen[1] + (colors.lightGreen[1] - colors.deepGreen[1]) * ratio);
        const b = Math.floor(colors.deepGreen[2] + (colors.lightGreen[2] - colors.deepGreen[2]) * ratio);
        
        // 绘制圆角矩形作为蛇身
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.strokeStyle = colors.deepGreen;
        ctx.lineWidth = 1;
        
        // 绘制圆角矩形
        roundRect(ctx, segment[0], segment[1], blockSize, blockSize, 5, true, true);
        
        // 如果是蛇头，添加眼睛和舌头
        if (index === snake.length - 1) {
            // 眼睛
            ctx.fillStyle = colors.white;
            ctx.beginPath();
            ctx.arc(segment[0] + blockSize * 0.3, segment[1] + blockSize * 0.3, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(segment[0] + blockSize * 0.7, segment[1] + blockSize * 0.3, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = colors.black;
            ctx.beginPath();
            ctx.arc(segment[0] + blockSize * 0.3, segment[1] + blockSize * 0.3, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(segment[0] + blockSize * 0.7, segment[1] + blockSize * 0.3, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // 舌头（根据移动方向调整）
            if (snake.length > 1) {
                const prevSegment = snake[index - 1];
                const dx = segment[0] - prevSegment[0];
                const dy = segment[1] - prevSegment[1];
                
                ctx.strokeStyle = colors.red;
                ctx.lineWidth = 2;
                
                if (dx > 0) { // 向右
                    ctx.beginPath();
                    ctx.moveTo(segment[0] + blockSize, segment[1] + blockSize / 2);
                    ctx.lineTo(segment[0] + blockSize + 8, segment[1] + blockSize / 2);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(segment[0] + blockSize + 8, segment[1] + blockSize / 2);
                    ctx.lineTo(segment[0] + blockSize + 5, segment[1] + blockSize / 2 - 3);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(segment[0] + blockSize + 8, segment[1] + blockSize / 2);
                    ctx.lineTo(segment[0] + blockSize + 5, segment[1] + blockSize / 2 + 3);
                    ctx.stroke();
                } else if (dx < 0) { // 向左
                    // 类似的代码处理其他方向
                    // ...
                }
            }
        }
    });
}

// 绘制苹果
function drawApple() {
    // 苹果主体
    ctx.fillStyle = colors.deepRed;
    ctx.beginPath();
    ctx.arc(apple.x + blockSize / 2, apple.y + blockSize / 2, blockSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 高光效果
    ctx.fillStyle = colors.red;
    ctx.beginPath();
    ctx.arc(apple.x + blockSize / 3, apple.y + blockSize / 3, blockSize / 6, 0, Math.PI * 2);
    ctx.fill();
    
    // 苹果茎
    ctx.fillStyle = colors.deepGreen;
    ctx.fillRect(apple.x + blockSize / 2 - 2, apple.y - 5, 4, 5);
    
    // 叶子
    ctx.fillStyle = colors.green;
    ctx.beginPath();
    ctx.ellipse(apple.x + blockSize / 2 + 6, apple.y - 3, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制炸弹
function drawBomb() {
    if (bombExists) {
        // 炸弹主体
        ctx.fillStyle = colors.black;
        ctx.beginPath();
        ctx.arc(bomb.x + blockSize / 2, bomb.y + blockSize / 2, blockSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 高光效果
        ctx.fillStyle = colors.deepGray;
        ctx.beginPath();
        ctx.arc(bomb.x + blockSize / 3, bomb.y + blockSize / 3, blockSize / 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 炸弹引线
        ctx.strokeStyle = colors.gray;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bomb.x + blockSize / 2, bomb.y);
        ctx.lineTo(bomb.x + blockSize / 2 + 5, bomb.y - 8);
        ctx.stroke();
        
        // 火花
        ctx.fillStyle = colors.yellow;
        ctx.beginPath();
        ctx.arc(bomb.x + blockSize / 2 + 5, bomb.y - 8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = colors.red;
        ctx.beginPath();
        ctx.arc(bomb.x + blockSize / 2 + 5, bomb.y - 8, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制特效
function drawEffect() {
    if (effectFrames > 0 && effectPosition) {
        const maxRadius = 30;
        const radius = Math.floor(maxRadius * (effectFrames / 10));
        const alpha = 1 - effectFrames / 10;
        
        ctx.fillStyle = `rgba(128, 0, 128, ${alpha})`;
        ctx.beginPath();
        ctx.arc(effectPosition.x, effectPosition.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        effectFrames--;
    }
    
    if (bombEffectFrames > 0 && bombEffectPosition) {
        const maxRadius = 30;
        const radius = Math.floor(maxRadius * (bombEffectFrames / 10));
        const alpha = 1 - bombEffectFrames / 10;
        
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(bombEffectPosition.x, bombEffectPosition.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        bombEffectFrames--;
    }
}

// 显示分数
function drawScore() {
    const scoreColor = score > 10 ? colors.gold : colors.black;
    ctx.font = '30px Arial';
    ctx.fillStyle = colors.white;
    ctx.fillRect(5, 5, 150, 40);
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = scoreColor;
    ctx.globalAlpha = 1.0;
    ctx.fillText(`分数: ${score}`, 15, 35);
}

// 绘制开始界面
function drawStartScreen() {
    // 背景
    drawBackground();
    
    // 标题背景
    ctx.fillStyle = colors.deepGreen;
    roundRect(ctx, width / 2 - 150, height / 4 - 40, 300, 80, 15, true, false);
    ctx.strokeStyle = colors.black;
    ctx.lineWidth = 2;
    roundRect(ctx, width / 2 - 150, height / 4 - 40, 300, 80, 15, false, true);
    
    // 标题
    ctx.font = '50px Arial';
    ctx.fillStyle = colors.white;
    const titleText = '贪吃蛇游戏';
    const titleWidth = ctx.measureText(titleText).width;
    ctx.fillText(titleText, width / 2 - titleWidth / 2, height / 4 + 20);
    
    // 开始按钮
    const startBtnX = width / 2 - 100;
    const startBtnY = height / 2;
    const startBtnWidth = 200;
    const startBtnHeight = 50;
    
    ctx.fillStyle = colors.deepGreen;
    roundRect(ctx, startBtnX, startBtnY, startBtnWidth, startBtnHeight, 10, true, false);
    ctx.strokeStyle = colors.black;
    ctx.lineWidth = 2;
    roundRect(ctx, startBtnX, startBtnY, startBtnWidth, startBtnHeight, 10, false, true);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = colors.white;
    const startText = '开始游戏';
    const startTextWidth = ctx.measureText(startText).width;
    ctx.fillText(startText, startBtnX + (startBtnWidth - startTextWidth) / 2, startBtnY + 35);
    
    // 游戏说明背景
    ctx.fillStyle = colors.white;
    roundRect(ctx, width / 2 - 150, height / 2 + 70, 300, 120, 10, true, false);
    ctx.strokeStyle = colors.black;
    ctx.lineWidth = 1;
    roundRect(ctx, width / 2 - 150, height / 2 + 70, 300, 120, 10, false, true);
    
    // 游戏说明
    ctx.font = '20px Arial';
    ctx.fillStyle = colors.black;
    const instructions = [
        '使用方向键控制蛇的移动',
        '吃苹果增加长度和分数',
        '吃炸弹会减少一半长度和分数',
        '按P键暂停游戏'
    ];
    
    instructions.forEach((text, index) => {
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, width / 2 - textWidth / 2, height / 2 + 100 + index * 20);
    });
    
    // 装饰性的蛇和苹果
    drawApple();
    // 这里可以添加装饰性的蛇和炸弹
}

// 绘制游戏结束界面
function drawGameOverScreen() {
    ctx.fillStyle = colors.white;
    ctx.fillRect(0, 0, width, height);
    
    ctx.font = '50px Arial';
    ctx.fillStyle = colors.black;
    const gameOverText = '游戏结束！';
    const gameOverWidth = ctx.measureText(gameOverText).width;
    ctx.fillText(gameOverText, width / 2 - gameOverWidth / 2, height / 3);
    
    ctx.font = '30px Arial';
    const scoreText = `最终分数: ${score}`;
    const scoreWidth = ctx.measureText(scoreText).width;
    ctx.fillText(scoreText, width / 2 - scoreWidth / 2, height / 2);
    
    // 重新开始按钮
    const restartBtnX = width / 2 - 100;
    const restartBtnY = height / 2 + 50;
    const btnWidth = 200;
    const btnHeight = 50;
    
    ctx.fillStyle = colors.deepGreen;
    roundRect(ctx, restartBtnX, restartBtnY, btnWidth, btnHeight, 10, true, false);
    ctx.strokeStyle = colors.black;
    ctx.lineWidth = 2;
    roundRect(ctx, restartBtnX, restartBtnY, btnWidth, btnHeight, 10, false, true);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = colors.white;
    const restartText = '重新开始';
    const restartWidth = ctx.measureText(restartText).width;
    ctx.fillText(restartText, restartBtnX + (btnWidth - restartWidth) / 2, restartBtnY + 35);
}

// 辅助函数：绘制圆角矩形
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

// 游戏主循环
function gameLoop() {
    if (!gameStarted) {
        drawStartScreen();
        return;
    }
    
    if (gameOver) {
        drawGameOverScreen();
        return;
    }
    
    // 移动蛇
    const head = snake[snake.length - 1].slice();
    head[0] += direction.x;
    head[1] += direction.y;
    snake.push(head);
    
    // 检查边界碰撞
    if (head[0] >= width || head[0] < 0 || head[1] >= height || head[1] < 0) {
        gameOver = true;
        return;
    }
    
    // 检查蛇是否撞到自己
    for (let i = 0; i < snake.length - 1; i++) {
        if (snake[i][0] === head[0] && snake[i][1] === head[1]) {
            gameOver = true;
            return;
        }
    }
    
    // 如果蛇身长度超过应有长度，删除多余部分
    while (snake.length > snakeLength) {
        snake.shift();
    }
    
    // 检查是否吃到苹果
    const headRect = { x: head[0], y: head[1], width: blockSize, height: blockSize };
    const appleRect = { x: apple.x, y: apple.y, width: blockSize, height: blockSize };
    
    if (isColliding(headRect, appleRect)) {
        // 生成新苹果
        generateApple();
        
        // 增加蛇长度和分数
        snakeLength++;
        score++;
        
        // 触发特效
        effectFrames = 10;
        effectPosition = { x: head[0] + blockSize / 2, y: head[1] + blockSize / 2 };
    }
    
    // 处理炸弹生成和碰撞
    generateBomb();
    
    if (bombExists) {
        const bombRect = { x: bomb.x, y: bomb.y, width: blockSize, height: blockSize };
        
        if (isColliding(headRect, bombRect)) {
            // 蛇的长度减半，但最小为1
            snakeLength = Math.max(1, Math.floor(snakeLength / 2));
            // 分数也减半，但最小为0
            score = Math.max(0, Math.floor(score / 2));
            
            // 如果蛇身长度超过新的蛇长度，删除多余部分
            while (snake.length > snakeLength) {
                snake.shift();
            }
            
            // 炸弹消失
            bombExists = false;
            bombTimer = 0;
            
            // 触发炸弹特效
            bombEffectFrames = 10;
            bombEffectPosition = { x: head[0] + blockSize / 2, y: head[1] + blockSize / 2 };
        }
    }
    
    // 绘制游戏元素
    drawBackground();
    drawApple();
    if (bombExists) drawBomb();
    drawSnake();
    drawScore();
    drawEffect();
}

// 碰撞检测函数
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 键盘事件处理
document.addEventListener('keydown', function(event) {
    // 如果游戏还没开始，按任意键开始
    if (!gameStarted) {
        gameStarted = true;
        init();
        return;
    }
    
    // 如果游戏结束，按任意键重新开始
    if (gameOver) {
        gameOver = false;
        init();
        return;
    }
    
    // 方向控制
    switch(event.key) {
        case 'ArrowLeft':
            if (direction.x === 0) { // 防止180度转弯
                direction = { x: -blockSize, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (direction.x === 0) {
                direction = { x: blockSize, y: 0 };
            }
            break;
        case 'ArrowUp':
            if (direction.y === 0) {
                direction = { x: 0, y: -blockSize };
            }
            break;
        case 'ArrowDown':
            if (direction.y === 0) {
                direction = { x: 0, y: blockSize };
            }
            break;
        case 'p':
        case 'P':
            // 暂停功能可以在这里实现
            break;
    }
});

// 鼠标点击事件处理（用于开始界面的按钮）
canvas.addEventListener('click', function(event) {
    if (!gameStarted) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // 检查是否点击了开始按钮
        const startBtnX = width / 2 - 100;
        const startBtnY = height / 2;
        const btnWidth = 200;
        const btnHeight = 50;
        
        if (clickX >= startBtnX && clickX <= startBtnX + btnWidth &&
            clickY >= startBtnY && clickY <= startBtnY + btnHeight) {
            gameStarted = true;
            init();
        }
    } else if (gameOver) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // 检查是否点击了重新开始按钮
        const restartBtnX = width / 2 - 100;
        const restartBtnY = height / 2 + 50;
        const btnWidth = 200;
        const btnHeight = 50;
        
        if (clickX >= restartBtnX && clickX <= restartBtnX + btnWidth &&
            clickY >= restartBtnY && clickY <= restartBtnY + btnHeight) {
            gameOver = false;
            init();
        }
    }
});

// 启动游戏循环
function startGame() {
    setInterval(gameLoop, 1000 / speed);
    drawStartScreen();
}

// 开始游戏
startGame();