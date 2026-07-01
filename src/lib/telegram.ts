const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export const sendTelegramNotification = async (name: string, phone: string) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram bot token atau chat ID belum di-setting di environment variables.");
    return;
  }
  
  const text = `*Pendaftaran Baru (Sobat Guru!)*\n\nNama: ${name}\nNo WA: ${phone}\n\nSilakan cek panel admin untuk menyetujui dan membuatkan token.`;
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    });
    
    if (!response.ok) {
      console.warn("Telegram API merespon dengan error:", response.status);
    }
  } catch (error) {
    console.warn("Pemberitahuan Telegram tidak terkirim (mungkin masalah jaringan atau CORS).");
  }
};
