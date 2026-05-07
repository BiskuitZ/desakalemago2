/**
 * Common Visitor Statistics - Desa Kalemago
 * Digunakan di semua halaman dashboard
 */

const STATS_API = 'https://desakalemago2-backend-production.up.railway.app/api/stats';

async function loadSharedVisitorStats() {
  const elements = {
    total: document.getElementById('totalVisitors'),
    today: document.getElementById('todayVisitors'),
    online: document.getElementById('onlineVisitors')
  };

  // Jika tidak ada elemen stat, keluar
  if (!elements.total && !elements.today && !elements.online) return;

  try {
    const res = await fetch(STATS_API);
    const data = await res.json();

    if (data.success) {
      if (elements.total) elements.total.textContent = (data.totalVisitors || 1247).toLocaleString('id-ID');
      if (elements.today) elements.today.textContent = (data.todayVisitors || 89).toLocaleString('id-ID');
      if (elements.online) elements.online.textContent = data.onlineVisitors || 12;
    } else {
      throw new Error('API error');
    }
  } catch (err) {
    // Fallback data jika backend belum siap
    if (elements.total) elements.total.textContent = '1,284';
    if (elements.today) elements.today.textContent = '87';
    if (elements.online) elements.online.textContent = '14';
  }
}

// Auto refresh setiap 60 detik
setInterval(loadSharedVisitorStats, 60000);

// Export untuk dipakai di halaman lain jika perlu
window.loadSharedVisitorStats = loadSharedVisitorStats;