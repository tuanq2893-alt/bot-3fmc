const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot hkurxf đang Auto-Proxy càn quét 3FMC!'));
app.listen(process.env.PORT || 10000);

const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');
const https = require('https');

let proxies = [];
let proxyIndex = 0;

// Hàm tự động kéo hàng ngàn Proxy SOCKS5 miễn phí từ API
function fetchProxies() {
  return new Promise((resolve, reject) => {
    console.log('>>> [AUTO] Đang tải danh sách Proxy SOCKS5 toàn cầu...');
    https.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=5000&country=all&ssl=all&anonymity=all', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Lọc và làm sạch dữ liệu
        const list = data.replace(/\r/g, '').split('\n').filter(p => p.trim() !== '');
        proxies = list.map(p => {
          const [host, port] = p.split(':');
          return { host, port: parseInt(port) };
        });
        console.log(`>>> [AUTO] Đã tải thành công ${proxies.length} Proxy SOCKS5! Bắt đầu càn quét...`);
        resolve();
      });
    }).on('error', (err) => {
      console.log('Lỗi tải proxy:', err.message);
      resolve(); 
    });
  });
}

async function createBot() {
  // Nếu hết proxy hoặc chưa có, kéo list mới
  if (proxies.length === 0 || proxyIndex >= proxies.length) {
    await fetchProxies();
    proxyIndex = 0; // reset lại từ đầu
  }

  const currentProxy = proxies[proxyIndex];
  if (!currentProxy) return setTimeout(createBot, 5000);

  // Thử kết nối qua Proxy hiện tại
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
    timeout: 4000 // Chờ tối đa 4s, không được thì bỏ qua luôn cho lẹ
  }, (err, info) => {
    if (err) {
      // Proxy chết hoặc bận -> Chuyển ngay sang cái tiếp theo
      proxyIndex++;
      createBot(); 
      return;
    }

    console.log(`>>> [THÀNH CÔNG] Đã thông tuyến qua Proxy: ${currentProxy.host}:${currentProxy.port}! Đang vào 3FMC...`);

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
      console.log(`Mất kết nối (${reason})! IP Proxy này có thể đã ngỏm.`);
      info.socket.destroy();
      proxyIndex++; // Bỏ qua proxy cũ
      createBot(); // Chạy lại với proxy mới
    });

    bot.on('error', err => {
      console.log('Lỗi Bot:', err.message);
      info.socket.destroy();
    });
  });
}

createBot();
