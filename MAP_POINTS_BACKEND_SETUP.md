# PETUNJUK LENGKAP: Sinkronisasi Peta ke Semua Perangkat (PC + HP)

## LANGKAH 1: Backend (WAJIB)

### 1. Buat folder & file berikut di backend kamu:

#### File 1: `models/MapPoint.js`
```js
const mongoose = require('mongoose');

const MapPointSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'fa-map-marker-alt' }
}, { timestamps: true });

module.exports = mongoose.model('MapPoint', MapPointSchema);
```

#### File 2: `routes/mapPoints.js`
```js
const express = require('express');
const router = express.Router();
const MapPoint = require('../models/MapPoint');

// GET semua titik
router.get('/', async (req, res) => {
  try {
    const points = await MapPoint.find().sort({ createdAt: -1 });
    res.json(points);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST titik baru
router.post('/', async (req, res) => {
  try {
    const point = new MapPoint(req.body);
    await point.save();
    res.status(201).json(point);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update titik
router.put('/:id', async (req, res) => {
  try {
    const point = await MapPoint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!point) return res.status(404).json({ success: false, message: 'Titik tidak ditemukan' });
    res.json(point);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE titik
router.delete('/:id', async (req, res) => {
  try {
    const point = await MapPoint.findByIdAndDelete(req.params.id);
    if (!point) return res.status(404).json({ success: false, message: 'Titik tidak ditemukan' });
    res.json({ success: true, message: 'Titik berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

### 2. Daftarkan Route di `app.js` atau `server.js`

Tambahkan baris ini di file utama backend kamu:

```js
const mapPointsRouter = require('./routes/mapPoints');
app.use('/api/map-points', mapPointsRouter);
```

### 3. Restart Backend

```bash
npm start
# atau
node server.js
```

---

## LANGKAH 2: Frontend (Developer Dashboard)

Buka file `developer-dashboard.html` dan **ganti seluruh bagian "MAP POINTS MANAGEMENT"** dengan kode berikut:

```js
// ==================== MAP POINTS MANAGEMENT (Backend Sync) ====================
let mapPoints = [];

async function loadMapPoints() {
  const tbody = document.getElementById('mapTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-500">Memuat data peta...</td></tr>';
  
  try {
    const res = await fetch(`${API_URL}/api/map-points`);
    if (res.ok) {
      mapPoints = await res.json();
    } else {
      mapPoints = JSON.parse(localStorage.getItem('mapPoints') || '[]');
    }
  } catch (e) {
    mapPoints = JSON.parse(localStorage.getItem('mapPoints') || '[]');
  }
  
  tbody.innerHTML = '';
  if (mapPoints.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-500">Belum ada titik peta</td></tr>';
    return;
  }
  
  mapPoints.forEach((point, index) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-100 hover:bg-gray-50';
    row.innerHTML = `
      <td class="py-3 px-4">${index + 1}</td>
      <td class="py-3 px-4 font-semibold">${point.name}</td>
      <td class="py-3 px-4 font-mono text-xs">${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</td>
      <td class="py-3 px-4 text-sm text-gray-600">${point.description || '-'}</td>
      <td class="py-3 px-4 text-center">
        <button onclick="editMapPoint(${index})" class="text-blue-600 hover:text-blue-800 mx-1"><i class="fas fa-edit"></i></button>
        <button onclick="deleteMapPoint(${index})" class="text-red-600 hover:text-red-800 mx-1"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showAddMapPointModal(editIndex = null) {
  const point = editIndex !== null ? mapPoints[editIndex] : null;
  
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]';
  modal.innerHTML = `
    <div onclick="event.target.remove()" class="absolute inset-0"></div>
    <div onclick="event.stopImmediatePropagation()" class="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-purple-800 mb-4">${point ? 'Edit Titik Peta' : 'Tambah Titik Peta Baru'}</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Nama Lokasi</label>
          <input type="text" id="mapPointName" value="${point ? point.name : ''}" class="w-full px-4 py-2 border border-gray-300 rounded-2xl">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
            <input type="number" step="0.0001" id="mapPointLat" value="${point ? point.lat : '-1.5123'}" class="w-full px-4 py-2 border border-gray-300 rounded-2xl">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
            <input type="number" step="0.0001" id="mapPointLng" value="${point ? point.lng : '120.4300'}" class="w-full px-4 py-2 border border-gray-300 rounded-2xl">
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
          <textarea id="mapPointDesc" class="w-full px-4 py-2 border border-gray-300 rounded-2xl h-20">${point ? point.description || '' : ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Icon Lokasi</label>
          <div class="grid grid-cols-4 gap-2" id="icon-selector">
            <div onclick="selectIcon(this, 'fa-church')" class="icon-option flex flex-col items-center p-2 border rounded-xl cursor-pointer hover:bg-purple-50">
              <i class="fas fa-church text-2xl text-purple-600"></i><span class="text-xs mt-1">Gereja</span>
            </div>
            <div onclick="selectIcon(this, 'fa-mosque')" class="icon-option flex flex-col items-center p-2 border rounded-xl cursor-pointer hover:bg-purple-50">
              <i class="fas fa-mosque text-2xl text-emerald-600"></i><span class="text-xs mt-1">Mesjid</span>
            </div>
            <div onclick="selectIcon(this, 'fa-landmark')" class="icon-option flex flex-col items-center p-2 border rounded-xl cursor-pointer hover:bg-purple-50">
              <i class="fas fa-landmark text-2xl text-amber-600"></i><span class="text-xs mt-1">Kantor Desa</span>
            </div>
            <div onclick="selectIcon(this, 'fa-futbol')" class="icon-option flex flex-col items-center p-2 border rounded-xl cursor-pointer hover:bg-purple-50">
              <i class="fas fa-futbol text-2xl text-blue-600"></i><span class="text-xs mt-1">Lapangan</span>
            </div>
            <div onclick="selectIcon(this, 'fa-school')" class="icon-option flex flex-col items-center p-2 border rounded-xl cursor-pointer hover:bg-purple-50">
              <i class="fas fa-school text-2xl text-indigo-600"></i><span class="text-xs mt-1">Sekolah</span>
            </div>
            <div onclick="selectIcon(this, 'fa-hospital')" class="icon-option flex flex-col items-center p-2 border rounded-xl cursor-pointer hover:bg-purple-50">
              <i class="fas fa-hospital text-2xl text-red-600"></i><span class="text-xs mt-1">Puskesmas</span>
            </div>
            <div onclick="selectIcon(this, 'fa-warehouse')" class="icon-option flex flex-col items-center p-2 border rounded-xl cursor-pointer hover:bg-purple-50">
              <i class="fas fa-warehouse text-2xl text-gray-600"></i><span class="text-xs mt-1">Gudang</span>
            </div>
            <div onclick="selectIcon(this, 'fa-home')" class="icon-option flex flex-col items-center p-2 border rounded-xl cursor-pointer hover:bg-purple-50">
              <i class="fas fa-home text-2xl text-orange-600"></i><span class="text-xs mt-1">Rumah Warga</span>
            </div>
          </div>
          <input type="hidden" id="mapPointIcon" value="${point ? point.icon || 'fa-map-marker-alt' : 'fa-map-marker-alt'}">
        </div>
      </div>
      
      <div class="flex gap-3 mt-6">
        <button onclick="saveMapPoint(${editIndex})" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-2xl font-semibold">Simpan</button>
        <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-2xl font-semibold">Batal</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  if (point && point.icon) {
    setTimeout(() => {
      const selected = document.querySelector(`.icon-option[onclick*="${point.icon}"]`);
      if (selected) selected.classList.add('ring-2', 'ring-purple-500', 'bg-purple-50');
    }, 50);
  }
}

function selectIcon(element, iconClass) {
  document.querySelectorAll('#icon-selector .icon-option').forEach(el => {
    el.classList.remove('ring-2', 'ring-purple-500', 'bg-purple-50');
  });
  element.classList.add('ring-2', 'ring-purple-500', 'bg-purple-50');
  document.getElementById('mapPointIcon').value = iconClass;
}

async function saveMapPoint(editIndex) {
  const name = document.getElementById('mapPointName').value.trim();
  const lat = parseFloat(document.getElementById('mapPointLat').value);
  const lng = parseFloat(document.getElementById('mapPointLng').value);
  const description = document.getElementById('mapPointDesc').value.trim();
  const icon = document.getElementById('mapPointIcon').value || 'fa-map-marker-alt';
  
  if (!name || isNaN(lat) || isNaN(lng)) {
    alert('Nama dan koordinat wajib diisi!');
    return;
  }
  
  const pointData = { name, lat, lng, description, icon };
  
  try {
    let success = false;
    if (editIndex !== null) {
      const res = await fetch(`${API_URL}/api/map-points/${mapPoints[editIndex]._id || mapPoints[editIndex].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pointData)
      });
      success = res.ok;
    } else {
      const res = await fetch(`${API_URL}/api/map-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pointData)
      });
      success = res.ok;
    }
    
    if (success) {
      await loadMapPoints();
      document.querySelector('.fixed').remove();
      alert('✅ Titik peta berhasil disimpan! (Tersinkron ke semua perangkat)');
    } else {
      throw new Error('Backend error');
    }
  } catch (e) {
    // Fallback ke localStorage
    if (editIndex !== null) {
      mapPoints[editIndex] = pointData;
    } else {
      mapPoints.push(pointData);
    }
    localStorage.setItem('mapPoints', JSON.stringify(mapPoints));
    loadMapPoints();
    document.querySelector('.fixed').remove();
    alert('✅ Titik peta berhasil disimpan! (Mode lokal - backend belum siap)');
  }
}

async function deleteMapPoint(index) {
  if (!confirm('Hapus titik ini?')) return;
  
  try {
    const pointId = mapPoints[index]._id || mapPoints[index].id;
    const res = await fetch(`${API_URL}/api/map-points/${pointId}`, { method: 'DELETE' });
    if (res.ok) {
      await loadMapPoints();
      return;
    }
  } catch (e) {}
  
  // Fallback
  mapPoints.splice(index, 1);
  localStorage.setItem('mapPoints', JSON.stringify(mapPoints));
  loadMapPoints();
}

function editMapPoint(index) {
  showAddMapPointModal(index);
}

// Auto load saat halaman dibuka
setTimeout(() => {
  if (document.getElementById('mapTableBody')) {
    loadMapPoints();
  }
}, 600);
```

---

## LANGKAH 3: Update `listing.html`

Buka `listing.html` dan **ganti bagian load peta** dengan kode berikut:

```js
// Load from backend (sinkron ke semua perangkat)
let points = [];
try {
  const res = await fetch('https://desakalemago2-backend-production.up.railway.app/api/map-points');
  if (res.ok) {
    points = await res.json();
  } else {
    points = JSON.parse(localStorage.getItem('mapPoints') || '[]');
  }
} catch (e) {
  points = JSON.parse(localStorage.getItem('mapPoints') || '[]');
}
```

---

## LANGKAH 4: Test

1. Restart backend
2. Buka Developer Dashboard → Manajemen Peta Desa
3. Tambah titik baru
4. Buka `listing.html` di HP Android/iPhone → titik harus muncul!

---

**Selesai!** Sekarang titik peta akan tersinkron di semua perangkat.