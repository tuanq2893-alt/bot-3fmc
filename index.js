const express = require('express');
const app = express();
const dns = require('dns');

app.get('/', (req, res) => res.send('Bot hkurxf đang tu luyện 24/7!'));
app.listen(process.env.PORT || 10000);

const mineflayer = require('mineflayer');

function createBot() {
  console.log('>>> [1/5] Đang phân giải IP IPv4 cho 3fmc.com...');

  // Bắt buộc giải mã ra IP IPv4 (IPv4 family = 4)
  dns.resolve4('3fmc.com', (err, addresses) => {
    if (err || !addresses.length) {
      console.log('Không lấy được IP IPv4, thử lại sau 5s...');
      setTimeout(createBot, 5000);
      return;
    }

    const ipV4 = addresses[0];
    console.log(`>>> Lấy thành công IPv4: ${ipV4}. Đang kết nối...`);

    const bot = mineflayer.createBot({
      host: ipV4,
      port: 25565,
      username: 'hkurxf',
      auth: 'offline',
      version: '1.20.1',
      checkTimeoutInterval: 120000
    });

    bot.on('spawn', () => {
      console.log('>>> [2/5] hkurxf ĐÃ VÀO SERVER SUCCESS! <<<');

      setTimeout(() => {
        bot.chat('/login 24102014(Tuan)');
        console.log('>>> [3/5] Đã gửi lệnh đăng nhập!');
      }, 3000);

      setTimeout(() => {
        bot.setQuickBarSlot(4);
        setTimeout(() => {
          bot.activateItem();
          console.log('>>> [4/5] Đã mở La Bàn!');
        }, 1000);
      }, 7000);

      bot.once('windowOpen', async (window) => {
        console.log('>>> [5/5] Đã chọn SMP Tu Tiên...');
        const tuTienItem = window.slots.find(item => 
          item && item.customName && (item.customName.includes('Tu Tiên') || item.customName.includes('SMP'))
        );

        if (tuTienItem) {
          await bot.clickWindow(tuTienItem.slot, 0, 0);
        } else {
          await bot.clickWindow(13, 0, 0); 
        }
      });

      setTimeout(() => {
        bot.chat('/tuluyen');
        console.log('>>> BẮT ĐẦU TU LUYỆN 24/7! <<<');

        let currentSlot = 0; 
        setInterval(() => {
          currentSlot = currentSlot === 0 ? 1 : 0;
          bot.setQuickBarSlot(currentSlot);
          bot.activateItem(); 
        }, 10000);

      }, 16000);
    });

    bot.on('end', (reason) => {
      console.log(`Mất kết nối (${reason})! Đang kết nối lại sau 5s...`);
      setTimeout(createBot, 5000);
    });

    bot.on('error', err => console.log('Lỗi Bot:', err.message));
  });
}

createBot();
