const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot hkurxf đang tu luyện 24/7!'));
app.listen(process.env.PORT || 10000);

const mineflayer = require('mineflayer');
const { SocksProxyAgent } = require('socks-proxy-agent');

// Proxy Webshare của mi
const PROXY_HOST = '31.59.20.176';
const PROXY_PORT = 6754; 
const PROXY_USER = 'upviidqh';
const PROXY_PASS = 'm848moodxeot';

function createBot() {
  console.log('>>> Đang kết nối bot hkurxf qua SOCKS5 Proxy Webshare...');

  const proxyUrl = `socks5://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`;
  const agent = new SocksProxyAgent(proxyUrl);

  const bot = mineflayer.createBot({
    host: '3fmc.com',
    port: 25565,
    username: 'hkurxf',
    auth: 'offline',
    version: '1.20.1',
    agent: agent
  });

  bot.on('spawn', () => {
    console.log('>>> hkurxf ĐÃ VÀO SERVER LOBBY SUCCESS! <<<');

    setTimeout(() => {
      bot.chat('/login 24102014(Tuan)');
      console.log('1. hkurxf đã gửi lệnh đăng nhập!');
    }, 3000);

    setTimeout(() => {
      bot.setQuickBarSlot(4);
      console.log('2. hkurxf đã chuyển sang ô số 5 (La bàn)');
      
      setTimeout(() => {
        bot.activateItem();
        console.log('3. hkurxf đã click chuột phải mở La Bàn!');
      }, 1000);
    }, 7000);

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

  bot.on('end', (reason) => {
    console.log(`hkurxf mất kết nối (${reason})! Thử lại sau 10s...`);
    setTimeout(createBot, 10000);
  });

  bot.on('error', err => console.log('Lỗi Bot/Proxy:', err.message));
}

createBot();
