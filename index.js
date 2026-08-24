const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot hkurxf đang lách tường lửa 3FMC!'));
app.listen(process.env.PORT || 10000);

const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');
const net = require('net');
const https = require('https');

const DEST_IP = '171.244.24.2';
const DEST_PORT = 25565;
const DOMAIN = '3fmc.com';

let proxyList = [];

// Tải riêng danh sách Proxy IP Việt Nam (VN)
async function fetchVNProxies() {
  console.log('>>> [AUTO] Đang tải danh sách IP Proxy VIỆT NAM...');
  const urls = [
    'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5,http&timeout=5000&country=VN&ssl=all&anonymity=all',
    'https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-vietnam.txt',
    'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt'
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

  console.log(`>>> [AUTO] Đã tìm thấy ${proxyList.length} Proxy IP Việt Nam! Bắt đầu thử...`);
}

// Thử kết nối SOCKS5
function testSocks5(proxy) {
  return new Promise((resolve, reject) => {
    SocksClient.createConnection({
      proxy: { host: proxy.host, port: proxy.port, type: 5 },
      command: 'connect',
      destination: { host: DEST_IP, port: DEST_PORT },
      timeout: 3000
    }, (err, info) => err ? reject(err) : resolve({ proxy, socket: info.socket }));
  });
}

// Thử kết nối HTTP CONNECT Tunnel
function testHttpConnect(proxy) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(proxy.port, proxy.host, () => {
      socket.write(`CONNECT ${DEST_IP}:${DEST_PORT} HTTP/1.1\r\nHost: ${DEST_IP}:${DEST_PORT}\r\n\r\n`);
    });
    socket.setTimeout(3000);
    socket.once('data', (data) => {
      if (data.toString().includes('200')) resolve({ proxy, socket });
      else { socket.destroy(); reject(new Error('Tunnel Failed')); }
    });
    socket.on('error', err => { socket.destroy(); reject(err); });
    socket.on('timeout', () => { socket.destroy(); reject(new Error('Timeout')); });
  });
}

async function findWorkingSocket() {
  if (proxyList.length < 10) await fetchVNProxies();

  while (proxyList.length > 0) {
    const batch = proxyList.splice(0, 10);
    console.log(`>>> Đang test 10 IP Việt Nam... (Còn lại: ${proxyList.length})`);

    const tests = batch.flatMap(p => [testSocks5(p), testHttpConnect(p)]);
    const results = await Promise.allSettled(tests);
    const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);

    if (successful.length > 0) {
      const chosen = successful[0];
      console.log(`>>> [NGON] Đã tìm thấy IP Proxy VN chuẩn: ${chosen.proxy.host}:${chosen.proxy.port}`);
      for (let i = 1; i < successful.length; i++) successful[i].socket.destroy();
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
    return setTimeout(startBot, 3000);
  }

  console.log('>>> Đang gửi Handshake IP VN vào 3FMC...');

  const bot = mineflayer.createBot({
    stream: socket,
    host: DOMAIN,
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
    console.log(`Mất kết nối (${reason})! Đang tìm Proxy VN khác...`);
    socket.destroy();
    setTimeout(startBot, 3000);
  });

  bot.on('error', err => {
    console.log('Lỗi Bot:', err.message);
    socket.destroy();
  });
}

startBot();
