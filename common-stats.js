/**
 * Common Visitor Statistics - Desa Kalemago
 * Sinkron di semua halaman menggunakan localStorage
 * 
 * ⚠️ GitHub tidak punya API publik untuk traffic.
 * Kamu bisa update angka di bawah ini secara manual dari:
 * https://github.com/BiskuitZ/desakalemago2/graphs/traffic
 */

const GITHUB_BASE_TOTAL = 1148;   // ← Update manual dari GitHub (Unique visitors)
const GITHUB_BASE_TODAY = 87;     // ← Update manual dari GitHub (Total views hari ini)

function loadSharedVisitorStats() {
  const elements = {
    total: document.getElementById('totalVisitors'),
    today: document.getElementById('todayVisitors'),
    online: document.getElementById('onlineVisitors')
  };

  if (!elements.total && !elements.today && !elements.online) return;

  // Ambil data dari localStorage (simulasi sinkron antar halaman)
  let total = parseInt(localStorage.getItem('dk_totalVisitors') || GITHUB_BASE_TOTAL);
  let today = parseInt(localStorage.getItem('dk_todayVisitors') || GITHUB_BASE_TODAY);
  let online = parseInt(localStorage.getItem('dk_onlineVisitors') || '12');

  // Increment sekali per session (simulasi kunjungan baru)
  const sessionKey = 'dk_session_visited';
  if (!sessionStorage.getItem(sessionKey)) {
    total += Math.floor(Math.random() * 3) + 1;   // tambah 1-3
    today += 1;
    sessionStorage.setItem(sessionKey, 'true');

    // Simpan ke localStorage agar sinkron antar halaman
    localStorage.setItem('dk_totalVisitors', total);
    localStorage.setItem('dk_todayVisitors', today);
  }

  // Update tampilan
  if (elements.total) elements.total.textContent = total.toLocaleString('id-ID');
  if (elements.today) elements.today.textContent = today.toLocaleString('id-ID');
  if (elements.online) elements.online.textContent = online;

  // Update "Sedang Online" berdasarkan user aktif
  function updateOnlineUsers() {
    if (!elements.online) return;

    let activeUsers = parseInt(localStorage.getItem('dk_activeUsers') || '3');
    const variance = Math.floor(Math.random() * 3) - 1;
    const displayOnline = Math.max(2, Math.min(7, activeUsers + variance));

    elements.online.textContent = displayOnline;
    localStorage.setItem('dk_onlineVisitors', displayOnline);
  }

  updateOnlineUsers();
  setInterval(updateOnlineUsers, 30000);
}

// Jalankan saat halaman dimuat
loadSharedVisitorStats();

// Auto refresh tampilan setiap 60 detik
setInterval(loadSharedVisitorStats, 60000);

// Export
window.loadSharedVisitorStats = loadSharedVisitorStats;
