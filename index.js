const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot hkurxf đang tu luyện 24/7!'));
app.listen(process.env.PORT || 3000);

const mineflayer = require('mineflayer');

function createBot() {
  console.log('Đang khởi tạo bot hkurxf...');
  
  const bot = mineflayer.createBot({
    host: '3fmc.com',
    port: 25565,
    username: 'hkurxf',
    version: '1.20.1'
  });

  bot.on('spawn', () => {
    console.log('hkurxf đã kết nối vào 3fmc.com!');

    // BƯỚC 1: Đăng nhập (Chờ 3 giây)
    setTimeout(() => {
      bot.chat('/login 24102014(Tuan)');
      console.log('hkurxf đã gửi lệnh đăng nhập!');
    }, 3000);

    // BƯỚC 2: Vào Tu Tiên SMP (Chờ 8 giây)
    setTimeout(() => {
      bot.chat('/tutien'); 
      console.log('hkurxf đã gõ lệnh chuyển sang Tu Tiên!');
    }, 8000);

    // BƯỚC 3: Gõ /tuluyen & Đổi ô 1 - 2 mỗi 10s (Chờ 15 giây)
    setTimeout(() => {
      bot.chat('/tuluyen');
      console.log('hkurxf đã gõ lệnh /tuluyen!');

      let currentSlot = 0; 

      setInterval(() => {
        currentSlot = currentSlot === 0 ? 1 : 0;
        bot.setQuickBarSlot(currentSlot);
        bot.activateItem(); 
        console.log(`hkurxf đang dùng ô số ${currentSlot + 1}`);
      }, 10000);

    }, 15000);
  });

  bot.on('end', () => {
    console.log('hkurxf mất kết nối! Đang kết nối lại sau 5s...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', err => console.log('Lỗi Bot:', err));
}

createBot();
