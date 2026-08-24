const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot hkurxf đang tu luyện 24/7 trên Render!'));
app.listen(process.env.PORT || 10000);

const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');

// Danh sách IP Proxy SOCKS5 trung gian cho Render
const PROXIES = [
  { host: '103.178.233.15', port: 1080 },
  { host: '118.70.67.11', port: 1080 },
  { host: '113.176.118.150', port: 1080 }
];

let proxyIndex = 0;

function createBot() {
  const currentProxy = PROXIES[proxyIndex];
  console.log(`>>> [1/5] Render đang thử kết nối qua Relay (${currentProxy.host}:${currentProxy.port})...`);

  SocksClient.createConnection({
    proxy: {
      host: currentProxy.host,
      port: currentProxy.port,
      type: 5
    },
    command: 'connect',
    destination: {
      host: '171.244.24.2',
      port: 25565
    },
    timeout: 10000
  }, (err, info) => {
    if (err) {
      console.log(`Relay ${currentProxy.host} bận, đổi Relay tiếp theo...`);
      proxyIndex = (proxyIndex + 1) % PROXIES.length;
      setTimeout(createBot, 3000);
      return;
    }

    console.log('>>> Thông tuyến Relay thành công! Đang đăng nhập 3FMC...');

    const bot = mineflayer.createBot({
      stream: info.socket,
      host: '171.244.24.2',
      port: 25565,
      username: 'hkurxf',
      auth: 'offline',
      version: '1.20.1'
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
      console.log(`Mất kết nối (${reason})! Đang thử lại...`);
      setTimeout(createBot, 5000);
    });

    bot.on('error', err => console.log('Lỗi Bot:', err.message));
  });
}

createBot();
