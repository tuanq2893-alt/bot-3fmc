const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot hkurxf đang tu luyện 24/7!'));
app.listen(process.env.PORT || 3000);

const mineflayer = require('mineflayer');
const { SocksProxyAgent } = require('socks-proxy-agent');

function createBot() {
  console.log('Đang kết nối bot hkurxf qua Proxy VN...');
  
  // Gắn IP Proxy VN của mi vào đây
  const agent = new SocksProxyAgent('socks5://103.109.187.33:1080');

  const bot = mineflayer.createBot({
    host: '3fmc.com',
    port: 25565,
    username: 'hkurxf',
    auth: 'offline',
    version: '1.20.1',
    agent: agent
  });

  bot.on('spawn', () => {
    console.log('>>> hkurxf ĐÃ VÀO SERVER SUCCESS (Qua Proxy VN)! <<<');

    // BƯỚC 1: Đăng nhập
    setTimeout(() => {
      bot.chat('/login 24102014(Tuan)');
      console.log('1. hkurxf đã gửi lệnh đăng nhập!');
    }, 3000);

    // BƯỚC 2: Cầm ô số 5 (La bàn) & Mở
    setTimeout(() => {
      bot.setQuickBarSlot(4);
      console.log('2. hkurxf đã chuyển sang ô số 5 (La bàn)');
      
      setTimeout(() => {
        bot.activateItem();
        console.log('3. hkurxf đã click chuột phải mở La Bàn!');
      }, 1000);
    }, 7000);

    // BƯỚC 3: Chọn Tu Tiên
    bot.once('windowOpen', async (window) => {
      console.log('4. Đã mở Menu La Bàn! Đang chọn SMP Tu Tiên...');
      
      const tuTienItem = window.slots.find(item => 
        item && item.customName && (item.customName.includes('Tu Tiên') || item.customName.includes('SMP'))
      );

      if (tuTienItem) {
        await bot.clickWindow(tuTienItem.slot, 0, 0);
        console.log(`5. Đã click ô ${tuTienItem.slot} (Tu Tiên)!`);
      } else {
        await bot.clickWindow(13, 0, 0); 
        console.log('5. Đã click chuyển server!');
      }
    });

    // BƯỚC 4: /tuluyen & Đổi ô 1 - 2
    setTimeout(() => {
      bot.chat('/tuluyen');
      console.log('6. hkurxf đã gõ lệnh /tuluyen!');

      let currentSlot = 0; 

      setInterval(() => {
        currentSlot = currentSlot === 0 ? 1 : 0;
        bot.setQuickBarSlot(currentSlot);
        bot.activateItem(); 
        console.log(`[TU LUYỆN] hkurxf đang dùng ô số ${currentSlot + 1}`);
      }, 10000);

    }, 16000);
  });

  bot.on('end', () => {
    console.log('hkurxf mất kết nối! Thử lại sau 5s...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', err => console.log('Lỗi Bot/Proxy:', err.message));
}

createBot();
