const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot hkurxf 3FMC đang tu luyện 24/7!'));
app.listen(process.env.PORT || 3000);

const mineflayer = require('mineflayer');

function createBot() {
  const bot = mineflayer.createBot({
    host: '3fmc.com',
    port: 25565,
    username: 'hkurxf',
    version: '1.20.1'
  });

  bot.on('spawn', () => {
    console.log('Đã kết nối vào 3fmc.com!');

    // BƯỚC 1: Đăng nhập
    setTimeout(() => {
      bot.chat('/login 24102014(Tuan)');
      console.log('Đã gửi lệnh đăng nhập!');
    }, 2000);

    // BƯỚC 2: Cầm la bàn ô số 5
    setTimeout(() => {
      bot.setQuickBarSlot(4);
      console.log('Đã chuyển sang ô số 5 (La bàn)');
    }, 5000);

    // BƯỚC 3: Mở la bàn & chọn Tu tiên SMP
    setTimeout(() => {
      bot.activateItem();
      console.log('Đã mở la bàn!');

      bot.once('windowOpen', async (window) => {
        const tuTienItem = window.slots.find(item => 
          item && item.customName && item.customName.includes('Tu tiên')
        );

        if (tuTienItem) {
          await bot.clickWindow(tuTienItem.slot, 0, 0);
          console.log('Đã click chọn Tu Tiên SMP!');
        } else {
          await bot.clickWindow(13, 0, 0); 
          console.log('Đã click chuyển server!');
        }
      });
    }, 7000);

    // BƯỚC 4: Vào Tu Tiên SMP -> /tuluyen & Đổi ô 1 - 2 mỗi 10s
    setTimeout(() => {
      bot.chat('/tuluyen');
      console.log('Đã gõ lệnh /tuluyen!');

      let currentSlot = 0; 

      setInterval(() => {
        currentSlot = currentSlot === 0 ? 1 : 0;
        bot.setQuickBarSlot(currentSlot);
        bot.activateItem(); 
        console.log(`Đã chuyển sang ô số ${currentSlot + 1} và sử dụng!`);
      }, 10000);

    }, 15000);
  });

  bot.on('end', () => {
    console.log('Mất kết nối! Đang kết nối lại...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', err => console.log('Lỗi Bot:', err));
}

createBot();
