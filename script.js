const gameBox = document.getElementById("gameBox");
const basket = document.getElementById("basket");
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let timeLeft = 60;
let gameInterval;
let spawnInterval;
let isGameOver = false;

// 籃子移動（電腦）
document.addEventListener("mousemove", (e) => {
  const boxRect = gameBox.getBoundingClientRect();
  let x = e.clientX - boxRect.left;
  x = Math.max(0, Math.min(boxRect.width, x));
  basket.style.left = `${x}px`;
});

// 籃子移動（手機）
document.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  const boxRect = gameBox.getBoundingClientRect();
  let x = touch.clientX - boxRect.left;
  x = Math.max(0, Math.min(boxRect.width, x));
  basket.style.left = `${x}px`;
});

// 掉落物
function spawnItem() {
  if (isGameOver) return;

  const item = document.createElement("img");

  // ⬇️ 根據時間決定炸彈機率（0~30秒：漸增至20%，30~60秒：再升到35%）
  let bombChance;
  if (timeLeft > 30) {
    bombChance = 0.05 + (30 - (timeLeft - 30)) * (0.15 / 30); // 緩慢增
  } else {
    bombChance = 0.20 + (30 - timeLeft) * (0.15 / 30); // 快速增
  }
  bombChance = Math.min(bombChance, 0.35); // 安全上限

  const rand = Math.random();
  let type;

  if (rand < bombChance) {
    type = "bad";
    item.src = "img04.png";
  } else if (rand < bombChance + 0.2) {
    type = "rare";
    item.src = "img02.png";
  } else {
    type = "normal";
    item.src = "img01.png";
  }

  item.classList.add("falling");

  const boxWidth = gameBox.clientWidth;
  const startX = Math.random() * (boxWidth - 40);
  const speed = 2 + Math.random() * 3;

  item.style.left = `${startX}px`;
  item.style.top = `0px`;
  gameBox.appendChild(item);

  const fallInterval = setInterval(() => {
    if (isGameOver) {
      clearInterval(fallInterval);
      item.remove();
      return;
    }

    let top = parseFloat(item.style.top);
    item.style.top = `${top + speed}px`;

    const itemRect = item.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    if (
      itemRect.bottom >= basketRect.top &&
      itemRect.left < basketRect.right &&
      itemRect.right > basketRect.left
    ) {
      if (type === "bad") {
        score -= 1000;
      } else if (type === "rare") {
        score += 500;
      } else {
        score += 100;
      }
      scoreText.textContent = `分數：${score}`;
      clearInterval(fallInterval);
      item.remove();
    } else if (top > gameBox.clientHeight) {
      clearInterval(fallInterval);
      item.remove();
    }
  }, 16);
}




// 開始遊戲
function startGame() {
  isGameOver = false;
  score = 0;
  timeLeft = 60;
  scoreText.textContent = `分數：${score}`;
  timerText.textContent = `時間：${timeLeft}`;
  restartBtn.style.display = "none";

  // 清除掉落物
  document.querySelectorAll(".falling").forEach(el => el.remove());

  gameInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = `時間：${timeLeft}`;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  spawnInterval = setInterval(spawnItem, 700);
}

// 結束遊戲
function endGame() {
  isGameOver = true;
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  restartBtn.style.display = "block";
}

// 按下重新開始
restartBtn.addEventListener("click", startGame);

startGame();
