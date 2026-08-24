const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot hkurxf đang Auto-Proxy càn quét 3FMC!'));
app.listen(process.env.PORT || 10000);

const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');
const https = require('https');

const DEST_IP = '171.244.24.2';
const DEST_PORT = 25565;
const DOMAIN = '3fmc.com';

let proxyList = [];

// Kéo danh sách proxy SOCKS5 từ 3 nguồn lớn
async function fetchProxyList() {
  console.log('>>> [AUTO] Đang tải danh sách Proxy SOCKS5 từ các nguồn toàn cầu...');
  const urls = [
    'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=5000&country=all&ssl=all&anonymity=all',
    'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt'
  ];

  let combined = [];
  for (const url of urls) {
    try {
      const data = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(body));
        }).on('error', reject);
      });
      const lines = data.replace(/\r/g, '').split('\n').filter(p => p.trim().includes(':'));
      combined.push(...lines);
    } catch (e) {}
  }

  const unique = [...new Set(combined)];
  proxyList = unique.map(p => {
    const [host, port] = p.trim().split(':');
    return { host, port: parseInt(port) };
  }).filter(p => p.host && !isNaN(p.port));

  console.log(`>>> [AUTO] Đã thu thập ${proxyList.length} Proxy! Bắt đầu càn quét...`);
}

// Thử kết nối 1 proxy
function testProxy(proxy) {
  return new Promise((resolve, reject) => {
    SocksClient.createConnection({
      proxy: {
        host: proxy.host,
        port: proxy.port,
        type: 5
      },
      command: 'connect',
      destination: {
        host: DEST_IP,
        port: DEST_PORT
      },
      timeout: 3000
    }, (err, info) => {
      if (err) return reject(err);
      resolve({ proxy, socket: info.socket });
    });
  });
}

// Lọc proxy ngon bằng cách quét lô 15 cái cùng lúc
async function findWorkingSocket() {
  if (proxyList.length < 15) {
    await fetchProxyList();
  }

  while (proxyList.length > 0) {
    const batch = proxyList.splice(0, 15);
    console.log(`>>> Đang quét lô 15 Proxy cùng lúc... (Còn lại: ${proxyList.length})`);
    
    const results = await Promise.allSettled(batch.map(p => testProxy(p)));
    const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);

    if (successful.length > 0) {
      const chosen = successful[0];
      console.log(`>>> [THÀNH CÔNG] Đã chọn Proxy ngon: ${chosen.proxy.host}:${chosen.proxy.port}`);
      // Đóng các socket thừa
      for (let i = 1; i < successful.length; i++) {
        successful[i].socket.destroy();
      }
      return chosen.socket;
    }
  }
  
  return findWorkingSocket();
}

async function startBot() {
  let socket;
  try {
    socket = await findWorkingSocket();
  } catch (err) {
    console.log('Lỗi tìm proxy, quét lại sau 3s...');
    return setTimeout(startBot, 3000);
  }

  console.log('>>> Thông tuyến TCP! Đang gửi Handshake vào 3FMC...');

  const bot = mineflayer.createBot({
    stream: socket,
    host: DOMAIN, // Bắt buộc dùng domain 3fmc.com để Handshake không bị BungeeCord drop
    port: DEST_PORT,
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
    console.log(`Mất kết nối (${reason})! Đang tự động quét Proxy mới...`);
    socket.destroy();
    setTimeout(startBot, 3000);
  });

  bot.on('error', err => {
    console.log('Lỗi Bot:', err.message);
    socket.destroy();
  });
}

startBot();
