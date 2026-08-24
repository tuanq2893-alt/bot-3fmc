const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot hkurxf đang tu luyện 24/7!'));
app.listen(process.env.PORT || 3000);

const mineflayer = require('mineflayer');

function createBot() {
  console.log('Đang kết nối bot hkurxf vào 3fmc.com...');
  
  const bot = mineflayer.createBot({
    host: '3fmc.com',
    port: 25565,
    username: 'hkurxf',
    auth: 'offline',
    version: '1.20.1'
  });

  bot.on('spawn', () => {
    console.log('>>> hkurxf ĐÃ VÀO SERVER LOBBY! <<<');

    // BƯỚC 1: Đăng nhập (Chờ 3s)
    setTimeout(() => {
      bot.chat('/login 24102014(Tuan)');
      console.log('1. hkurxf đã gửi lệnh đăng nhập!');
    }, 3000);

    // BƯỚC 2: Cầm ô số 5 (Index 4) & Click chuột phải mở La Bàn (Chờ 7s)
    setTimeout(() => {
      bot.setQuickBarSlot(4);
      console.log('2. hkurxf đã chuyển sang ô số 5 (La bàn)');
      
      setTimeout(() => {
        bot.activateItem();
        console.log('3. hkurxf đã click chuột phải mở La Bàn!');
      }, 1000);
    }, 7000);

    // BƯỚC 3: Lắng nghe Menu GUI mở ra & Bấm chọn 'SMP Tu Tiên'
    bot.once('windowOpen', async (window) => {
      console.log('4. Đã mở Menu La Bàn! Đang tìm icon SMP Tu Tiên...');
      
      // Tìm vật phẩm có tên chứa 'Tu Tiên' hoặc 'SMP'
      const tuTienItem = window.slots.find(item => 
        item && item.customName && (item.customName.includes('Tu Tiên') || item.customName.includes('SMP'))
      );

      if (tuTienItem) {
        await bot.clickWindow(tuTienItem.slot, 0, 0);
        console.log(`5. Đã click vào ô ${tuTienItem.slot} (SMP Tu Tiên)!`);
      } else {
        // Nếu không quét được tên, mặc định click vào ô giữa Menu (thường là ô 13 hoặc 14)
        await bot.clickWindow(13, 0, 0); 
        console.log('5. Đã click chọn chuyển server SMP!');
      }
    });

    // BƯỚC 4: Vào Tu Tiên SMP -> Gõ /tuluyen & Đổi ô 1 - 2 mỗi 10s (Chờ 16s)
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
    console.log('hkurxf mất kết nối! Đang kết nối lại sau 5s...');
    setTimeout(createBot, 5000);
  });

  bot.on('error', err => console.log('Lỗi Bot:', err.message));
}

createBot();
