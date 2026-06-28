/* ===== PLASTICCONNECT.AI — APP.JS ===== */

// ── State ──────────────────────────────────────────────────────────────────
let currentPage = 'dashboard';
let charts = {};
let confirmCallback = null;

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderNavItems();
  navigate('dashboard');
  initTopbar();
  initSidebar();
  initSearch();
  initNotifications();
  renderNotifList();
});

// ── Navigation ─────────────────────────────────────────────────────────────
function renderNavItems() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const page = item.dataset.page;
      navigate(page);
      closeMobileSidebar();
    });
  });
}

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  destroyCharts();
  const renderer = pages[page];
  if (renderer) document.getElementById('pageContent').innerHTML = renderer();
  afterRender(page);
}

function afterRender(page) {
  if (page === 'dashboard') initDashboardCards();
  if (page === 'collectors') initCollectors();
  if (page === 'buyers') initBuyers();
  if (page === 'analytics') { initTabs('analytics'); setTimeout(renderCharts, 80); }
  if (page === 'payments') initPayments();
  if (page === 'profile') initProfile();
  initTabs(page);
}

function destroyCharts() {
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
  charts = {};
}

// ── Page Map ───────────────────────────────────────────────────────────────
const pages = {
  dashboard: renderDashboard,
  profile: renderProfile,
  collectors: renderCollectors,
  buyers: renderBuyers,
  analytics: renderAnalytics,
  payments: renderPayments
};

// ── Tabs ───────────────────────────────────────────────────────────────────
function initTabs(page) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.tabs-group');
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      document.querySelectorAll(`.tab-pane[data-tab]`).forEach(p => {
        p.classList.toggle('active', p.dataset.tab === target);
      });
      if (page === 'analytics' && target === 'charts') setTimeout(renderCharts, 80);
    });
  });
}

// ── Topbar ─────────────────────────────────────────────────────────────────
function initTopbar() {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('notifBtn').addEventListener('click', () => {
    document.getElementById('notifPanel').classList.toggle('hidden');
  });
  document.getElementById('clearNotif').addEventListener('click', () => {
    DB.notifications = [];
    renderNotifList();
    document.getElementById('notifBadge').textContent = '0';
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#notifBtn') && !e.target.closest('#notifPanel'))
      document.getElementById('notifPanel').classList.add('hidden');
  });
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeToggle').innerHTML = isDark
    ? '<i class="fa-solid fa-moon"></i>'
    : '<i class="fa-solid fa-sun"></i>';
}

function renderNotifList() {
  const list = document.getElementById('notifList');
  if (!DB.notifications.length) {
    list.innerHTML = `<div class="empty-state" style="padding:30px"><i class="fa-regular fa-bell-slash"></i><p>No notifications</p></div>`;
    return;
  }
  list.innerHTML = DB.notifications.map(n => `
    <div class="notif-item">
      <div class="notif-dot" style="background:${n.color}"></div>
      <div><div class="notif-text">${n.msg}</div><div class="notif-time">${n.time}</div></div>
    </div>`).join('');
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function initSidebar() {
  const toggle = document.getElementById('menuToggle');
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebarOverlay';
  document.body.appendChild(overlay);
  toggle.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    overlay.classList.toggle('show');
  });
  overlay.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  const ov = document.getElementById('sidebarOverlay');
  if (ov) ov.classList.remove('show');
}

// ── Global Search ──────────────────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('globalSearch');
  const dropdown = document.getElementById('searchDropdown');
  const searchIndex = [
    { label: 'Dashboard', page: 'dashboard', icon: 'fa-gauge-high' },
    { label: 'Company Profile', page: 'profile', icon: 'fa-building' },
    { label: 'Collector Records', page: 'collectors', icon: 'fa-users' },
    { label: 'Buyer Management', page: 'buyers', icon: 'fa-handshake' },
    { label: 'Analytics', page: 'analytics', icon: 'fa-chart-line' },
    { label: 'Payments & Accounts', page: 'payments', icon: 'fa-credit-card' },
    ...DB.collectors.map(c => ({ label: c.name + ' (Collector)', page: 'collectors', icon: 'fa-user' })),
    ...DB.buyers.map(b => ({ label: b.company + ' (Buyer)', page: 'buyers', icon: 'fa-building' }))
  ];
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.classList.remove('show'); return; }
    const results = searchIndex.filter(s => s.label.toLowerCase().includes(q)).slice(0, 8);
    if (!results.length) { dropdown.classList.remove('show'); return; }
    dropdown.innerHTML = results.map(r =>
      `<div class="search-item" onclick="navigate('${r.page}');document.getElementById('globalSearch').value='';document.getElementById('searchDropdown').classList.remove('show')">
        <i class="fa-solid ${r.icon}"></i>${r.label}
      </div>`).join('');
    dropdown.classList.add('show');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.global-search')) dropdown.classList.remove('show');
  });
}

// ── Modal Helpers ──────────────────────────────────────────────────────────
function openModal(title, bodyHTML, footerHTML = '') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalFooter').innerHTML = footerHTML;
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('modalClose').onclick = closeModal;
  document.getElementById('modalOverlay').onclick = e => { if (e.target.id === 'modalOverlay') closeModal(); };
}
function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }

function openConfirm(msg, cb) {
  confirmCallback = cb;
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmOverlay').classList.remove('hidden');
  document.getElementById('confirmOk').onclick = () => { cb(); document.getElementById('confirmOverlay').classList.add('hidden'); };
  document.getElementById('confirmCancel').onclick = () => document.getElementById('confirmOverlay').classList.add('hidden');
}

// ── Toast ──────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const icons = { success: 'fa-check-circle', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type]}"></i> ${msg}`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── Utility ────────────────────────────────────────────────────────────────
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN') : '—'; }
function fmtCurr(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function uid(prefix) { return prefix + Date.now().toString(36).toUpperCase(); }
function getCollectorName(id) { const c = DB.collectors.find(x => x.id === id); return c ? c.name : id; }
function getBuyerName(id) { const b = DB.buyers.find(x => x.id === id); return b ? b.company : id; }

function statusBadge(s) {
  const map = { Verified: 'success', Pending: 'warning', Expired: 'danger', Paid: 'success', Overdue: 'danger', Delivered: 'success', 'In Transit': 'info', 'Grade A': 'success', 'Grade B': 'info', 'Grade C': 'warning', Complete: 'success', Partial: 'warning' };
  const cls = map[s] || 'info';
  return `<span class="status status-${cls}">${s}</span>`;
}

function buildTableSearchFilter(inputId, tableId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    document.querySelectorAll(`#${tableId} tbody tr`).forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

function buildPagination(containerId, total, perPage, page, cb) {
  const pages = Math.ceil(total / perPage);
  const el = document.getElementById(containerId);
  if (!el || pages <= 1) return;
  let html = '';
  for (let i = 1; i <= pages; i++)
    html += `<div class="page-btn ${i === page ? 'active' : ''}" onclick="(${cb})(${i})">${i}</div>`;
  el.innerHTML = `<div class="pagination">${html}</div>`;
}

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ══════════════════════════════════════════════════════════════════════════
function renderDashboard() {
  const cards = [
    { page: 'profile', color: '#2563EB', accent: 'rgba(37,99,235,.06)', icon: 'fa-building', title: 'Company Profile', desc: 'Manage company information, legal documents & certifications.' },
    { page: 'collectors', color: '#22C55E', accent: 'rgba(34,197,94,.06)', icon: 'fa-users', title: 'Collector Records', desc: 'Track plastic purchases, manage collectors & generate invoices.' },
    { page: 'buyers', color: '#8B5CF6', accent: 'rgba(139,92,246,.06)', icon: 'fa-handshake', title: 'Buyer Management', desc: 'Manage buyers, contracts, deliveries & sales invoices.' },
    { page: 'analytics', color: '#F59E0B', accent: 'rgba(245,158,11,.06)', icon: 'fa-chart-line', title: 'Recycler Analytics', desc: 'View KPIs, revenue trends & recycling performance insights.' },
    { page: 'payments', color: '#EF4444', accent: 'rgba(239,68,68,.06)', icon: 'fa-credit-card', title: 'Payments & Accounts', desc: 'Track payments, manage EPR certificates & account status.' }
  ];
  return `
    <div class="section-header">
      <h1><span class="emoji">👋</span>Welcome to PlasticConnect.AI</h1>
      <p>Manage your recycling business from one centralized dashboard.</p>
    </div>
    <div class="dashboard-grid">
      ${cards.map(c => `
        <div class="dash-card" data-page="${c.page}" style="--card-color:${c.color};--card-accent:${c.accent}">
          <div class="dash-card-icon" style="background:${c.accent};color:${c.color}">
            <i class="fa-solid ${c.icon}"></i>
          </div>
          <div class="dash-card-body">
            <h3>${c.title}</h3>
            <p>${c.desc}</p>
          </div>
          <div class="dash-card-arrow">
            <span>Open Module</span>
            <i class="fa-solid fa-arrow-right"></i>
          </div>
        </div>`).join('')}
    </div>`;
}

function initDashboardCards() {
  document.querySelectorAll('.dash-card').forEach(card => {
    card.addEventListener('click', () => navigate(card.dataset.page));
  });
}

// ══════════════════════════════════════════════════════════════════════════
// COMPANY PROFILE
// ══════════════════════════════════════════════════════════════════════════
function renderProfile() {
  const c = DB.company;
  return `
    <div class="section-header">
      <h1><i class="fa-solid fa-building" style="color:var(--blue);margin-right:8px"></i>Company Profile</h1>
      <p>Manage recycler company information and legal documents.</p>
    </div>
    <div class="tabs-group">
      <div class="page-tabs">
        <button class="tab-btn active" data-tab="compInfo">Company Information</button>
        <button class="tab-btn" data-tab="compDocs">Documents</button>
      </div>
    </div>

    <div class="tab-pane active" data-tab="compInfo">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Company Information</span>
          <button class="btn btn-primary btn-sm" onclick="editCompany()"><i class="fa-solid fa-pen"></i> Edit</button>
        </div>
        <div class="form-grid" id="companyDisplay">
          ${profileField('Company Name', c.name)}
          ${profileField('Founder Name', c.founder)}
          ${profileField('Email Address', c.email)}
          ${profileField('Mobile Number', c.mobile)}
          ${profileField('GST Number', c.gst)}
          ${profileField('Company Address', c.address)}
          ${profileField('City', c.city)}
          ${profileField('State', c.state)}
          ${profileField('Pincode', c.pincode)}
        </div>
      </div>
    </div>

    <div class="tab-pane" data-tab="compDocs">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Legal Documents</span>
          <button class="btn btn-primary btn-sm" onclick="uploadDoc()"><i class="fa-solid fa-upload"></i> Upload Document</button>
        </div>
        <div class="doc-grid" id="docGrid">${renderDocGrid()}</div>
      </div>
    </div>`;
}

function profileField(label, value) {
  return `<div class="form-group"><label>${label}</label><div style="padding:9px 13px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;font-size:.85rem">${value || '—'}</div></div>`;
}

function renderDocGrid() {
  return DB.documents.map(d => `
    <div class="doc-card">
      <div class="doc-card-top">
        <div class="doc-icon"><i class="fa-solid fa-file-pdf"></i></div>
        <div>${statusBadge(d.status)}</div>
      </div>
      <div class="doc-info"><h4>${d.name}</h4></div>
      <div class="doc-meta">
        <span>Uploaded: ${fmtDate(d.uploaded)}</span>
        <span>Expiry: ${d.expiry === 'N/A' ? 'N/A' : fmtDate(d.expiry)}</span>
      </div>
      <div class="doc-actions">
        <button class="btn btn-ghost btn-sm" onclick="toast('Downloading ${d.name}…','info')"><i class="fa-solid fa-download"></i> Download</button>
        <button class="btn btn-ghost btn-sm" onclick="replaceDoc(${d.id})"><i class="fa-solid fa-rotate"></i> Replace</button>
      </div>
    </div>`).join('');
}

function initProfile() {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      b.closest('.tabs-group').querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.tab === b.dataset.tab));
    });
  });
}

function editCompany() {
  const c = DB.company;
  const fields = [
    ['name','Company Name',c.name],['founder','Founder Name',c.founder],
    ['email','Email Address',c.email],['mobile','Mobile Number',c.mobile],
    ['gst','GST Number',c.gst],['address','Company Address',c.address],
    ['city','City',c.city],['state','State',c.state],['pincode','Pincode',c.pincode]
  ];
  const body = `<div class="form-grid">${fields.map(([id,label,val]) =>
    `<div class="form-group"><label>${label}</label><input class="form-control" id="ec_${id}" value="${val}"></div>`
  ).join('')}</div>`;
  openModal('Edit Company Information', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveCompany()">Save Changes</button>`);
}

function saveCompany() {
  const fields = ['name','founder','email','mobile','gst','address','city','state','pincode'];
  fields.forEach(f => { const el = document.getElementById('ec_'+f); if(el) DB.company[f] = el.value; });
  closeModal();
  navigate('profile');
  toast('Company information updated!');
}

function uploadDoc() {
  const body = `<div class="form-grid">
    <div class="form-group"><label>Document Name</label><input class="form-control" id="nd_name" placeholder="e.g. Trade License"></div>
    <div class="form-group"><label>Upload Date</label><input type="date" class="form-control" id="nd_upload" value="${new Date().toISOString().split('T')[0]}"></div>
    <div class="form-group"><label>Expiry Date</label><input type="date" class="form-control" id="nd_expiry"></div>
    <div class="form-group"><label>File (simulated)</label><input type="file" class="form-control" id="nd_file"></div>
  </div>`;
  openModal('Upload Document', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveDoc()">Upload</button>`);
}

function saveDoc() {
  const name = document.getElementById('nd_name').value.trim();
  if (!name) { toast('Please enter document name', 'error'); return; }
  DB.documents.push({ id: Date.now(), name, uploaded: document.getElementById('nd_upload').value, expiry: document.getElementById('nd_expiry').value || 'N/A', status: 'Pending', file: name.replace(/\s+/g,'_')+'.pdf' });
  closeModal(); navigate('profile'); toast('Document uploaded!');
}

function replaceDoc(id) {
  const doc = DB.documents.find(d => d.id === id);
  toast(`Replacing "${doc?.name}"... (simulated)`, 'info');
}

// ══════════════════════════════════════════════════════════════════════════
// COLLECTOR RECORDS
// ══════════════════════════════════════════════════════════════════════════
function renderCollectors() {
  return `
    <div class="section-header">
      <h1><i class="fa-solid fa-users" style="color:var(--green);margin-right:8px"></i>Collector Records</h1>
      <p>Manage collectors, plastic purchases, and purchase invoices.</p>
    </div>
    <div class="tabs-group">
      <div class="page-tabs">
        <button class="tab-btn active" data-tab="colInfo">Collectors</button>
        <button class="tab-btn" data-tab="colPurchase">Purchase Records</button>
        <button class="tab-btn" data-tab="colInvoice">GST Purchase Invoice</button>
      </div>
    </div>
    <div class="tab-pane active" data-tab="colInfo">${renderCollectorTable()}</div>
    <div class="tab-pane" data-tab="colPurchase">${renderPurchaseTable()}</div>
    <div class="tab-pane" data-tab="colInvoice">${renderInvoiceGen()}</div>`;
}

function renderCollectorTable() {
  const rows = DB.collectors.map(c => `
    <tr>
      <td><span class="status status-info">${c.id}</span></td>
      <td><strong>${c.name}</strong></td>
      <td>${c.company}</td>
      <td>${c.mobile}</td>
      <td style="font-size:.78rem;color:var(--text-muted)">${c.gst}</td>
      <td style="font-size:.8rem">${c.address}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="viewCollector('${c.id}')" title="View"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editCollector('${c.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteCollector('${c.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
  return `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Collectors <span style="color:var(--text-muted);font-weight:400">(${DB.collectors.length})</span></span>
        <div class="card-actions">
          <div class="table-search"><i class="fa-solid fa-magnifying-glass"></i><input id="colSearch" placeholder="Search collectors…"></div>
          <button class="btn btn-primary btn-sm" onclick="addCollector()"><i class="fa-solid fa-plus"></i> Add Collector</button>
        </div>
      </div>
      <div class="table-wrap">
        <table><thead><tr><th>ID</th><th>Name</th><th>Company</th><th>Mobile</th><th>GST</th><th>Address</th><th>Actions</th></tr></thead>
        <tbody id="colTable">${rows}</tbody></table>
      </div>
      <div id="colPagination"></div>
    </div>`;
}

function renderPurchaseTable() {
  const rows = DB.purchases.map(p => `
    <tr>
      <td><span class="status status-info">${p.id}</span></td>
      <td>${fmtDate(p.date)}</td>
      <td>${getCollectorName(p.collector)}</td>
      <td>${p.type}</td>
      <td>${p.qty} kg</td>
      <td>${fmtCurr(p.rate)}/kg</td>
      <td><strong>${fmtCurr(p.qty * p.rate)}</strong></td>
      <td>${statusBadge(p.quality)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editPurchase('${p.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deletePurchase('${p.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
  return `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Plastic Purchase Records <span style="color:var(--text-muted);font-weight:400">(${DB.purchases.length})</span></span>
        <div class="card-actions">
          <div class="table-search"><i class="fa-solid fa-magnifying-glass"></i><input id="purSearch" placeholder="Search purchases…"></div>
          <button class="btn btn-ghost btn-sm" onclick="exportTableToCSV('purTable','purchases')"><i class="fa-solid fa-file-excel"></i> Export</button>
          <button class="btn btn-primary btn-sm" onclick="addPurchase()"><i class="fa-solid fa-plus"></i> Add Purchase</button>
        </div>
      </div>
      <div class="table-wrap">
        <table><thead><tr><th>ID</th><th>Date</th><th>Collector</th><th>Plastic Type</th><th>Qty</th><th>Rate</th><th>Total</th><th>Quality</th><th>Actions</th></tr></thead>
        <tbody id="purTable">${rows}</tbody></table>
      </div>
    </div>`;
}

function renderInvoiceGen() {
  const collectorOpts = DB.collectors.map(c => `<option value="${c.id}">${c.name} (${c.company})</option>`).join('');
  return `
    <div class="card">
      <div class="card-header"><span class="card-title">Generate GST Purchase Invoice</span></div>
      <div class="form-grid">
        <div class="form-group"><label>Invoice Number</label><input class="form-control" id="inv_no" value="PINV-${Date.now().toString().slice(-6)}"></div>
        <div class="form-group"><label>Invoice Date</label><input type="date" class="form-control" id="inv_date" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-group"><label>Collector</label><select class="form-control" id="inv_collector">${collectorOpts}</select></div>
        <div class="form-group"><label>Plastic Type</label><input class="form-control" id="inv_type" placeholder="e.g. PET Bottles"></div>
        <div class="form-group"><label>Quantity (kg)</label><input type="number" class="form-control" id="inv_qty" placeholder="0" oninput="calcInvoice()"></div>
        <div class="form-group"><label>Rate per kg (₹)</label><input type="number" class="form-control" id="inv_rate" placeholder="0" oninput="calcInvoice()"></div>
        <div class="form-group"><label>GST %</label>
          <select class="form-control" id="inv_gst" onchange="calcInvoice()">
            <option value="5">5%</option><option value="12">12%</option><option value="18" selected>18%</option><option value="28">28%</option>
          </select>
        </div>
        <div class="form-group"><label>Supply Type</label>
          <select class="form-control" id="inv_supply" onchange="calcInvoice()">
            <option value="intra">Intra-State (CGST+SGST)</option>
            <option value="inter">Inter-State (IGST)</option>
          </select>
        </div>
      </div>
      <div id="invPreview" style="margin-top:20px"></div>
    </div>`;
}

function calcInvoice() {
  const qty = parseFloat(document.getElementById('inv_qty')?.value) || 0;
  const rate = parseFloat(document.getElementById('inv_rate')?.value) || 0;
  const gstPct = parseFloat(document.getElementById('inv_gst')?.value) || 18;
  const supply = document.getElementById('inv_supply')?.value || 'intra';
  const taxable = qty * rate;
  const totalGST = taxable * gstPct / 100;
  const isIntra = supply === 'intra';
  const cgst = isIntra ? totalGST / 2 : 0;
  const sgst = isIntra ? totalGST / 2 : 0;
  const igst = !isIntra ? totalGST : 0;
  const grand = taxable + totalGST;
  const invNo = document.getElementById('inv_no')?.value || '';
  const invDate = document.getElementById('inv_date')?.value || '';
  const collectorId = document.getElementById('inv_collector')?.value || '';
  const collectorName = getCollectorName(collectorId);
  const ptype = document.getElementById('inv_type')?.value || '';

  if (!qty || !rate) { document.getElementById('invPreview').innerHTML = ''; return; }

  document.getElementById('invPreview').innerHTML = `
    <div class="invoice-preview">
      <div class="inv-header">
        <div>
          <div class="inv-title"><i class="fa-solid fa-recycle"></i> PlasticConnect.AI</div>
          <div style="font-size:.78rem;color:var(--text-muted)">${DB.company.name}</div>
          <div style="font-size:.78rem;color:var(--text-muted)">GST: ${DB.company.gst}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700;font-size:1rem">PURCHASE INVOICE</div>
          <div style="font-size:.8rem;color:var(--text-muted)">Invoice No: ${invNo}</div>
          <div style="font-size:.8rem;color:var(--text-muted)">Date: ${fmtDate(invDate)}</div>
        </div>
      </div>
      <div style="background:var(--bg);padding:10px 14px;border-radius:8px;font-size:.8rem;margin-bottom:12px">
        <strong>Collector:</strong> ${collectorName}
      </div>
      <table class="inv-table">
        <thead><tr><th>#</th><th>Description</th><th>Qty (kg)</th><th>Rate/kg</th><th>Taxable Amount</th></tr></thead>
        <tbody><tr><td>1</td><td>${ptype || 'Plastic Material'}</td><td>${qty}</td><td>${fmtCurr(rate)}</td><td>${fmtCurr(taxable)}</td></tr></tbody>
      </table>
      <table class="inv-totals" style="margin-left:auto">
        <tbody>
          <tr><td>Taxable Amount</td><td style="text-align:right">${fmtCurr(taxable)}</td></tr>
          ${isIntra ? `<tr><td>CGST (${gstPct/2}%)</td><td style="text-align:right">${fmtCurr(cgst)}</td></tr>
          <tr><td>SGST (${gstPct/2}%)</td><td style="text-align:right">${fmtCurr(sgst)}</td></tr>` :
          `<tr><td>IGST (${gstPct}%)</td><td style="text-align:right">${fmtCurr(igst)}</td></tr>`}
          <tr class="inv-grand"><td>Grand Total</td><td style="text-align:right">${fmtCurr(grand)}</td></tr>
        </tbody>
      </table>
    </div>
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn btn-primary" onclick="toast('Invoice generated!','success')"><i class="fa-solid fa-file-invoice"></i> Generate Invoice</button>
      <button class="btn btn-blue" onclick="printInvoice()"><i class="fa-solid fa-print"></i> Print</button>
      <button class="btn btn-ghost" onclick="toast('Downloading PDF…','info')"><i class="fa-solid fa-download"></i> Download PDF</button>
    </div>`;
}

function printInvoice() {
  const content = document.getElementById('invPreview')?.innerHTML || '';
  const win = window.open('', '_blank');
  win.document.write(`<html><head><title>Invoice</title></head><body style="font-family:sans-serif;padding:40px">${content}</body></html>`);
  win.print(); win.close();
}

function initCollectors() {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      b.closest('.tabs-group').querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.tab === b.dataset.tab));
    });
  });
  setTimeout(() => {
    buildTableSearchFilter('colSearch', 'colTable');
    buildTableSearchFilter('purSearch', 'purTable');
  }, 50);
}

function addCollector() {
  const body = `<div class="form-grid">
    <div class="form-group"><label>Collector Name</label><input class="form-control" id="nc_name" placeholder="Full Name"></div>
    <div class="form-group"><label>Company Name</label><input class="form-control" id="nc_company" placeholder="Company Name"></div>
    <div class="form-group"><label>Mobile Number</label><input class="form-control" id="nc_mobile" placeholder="10-digit number"></div>
    <div class="form-group"><label>GST Number</label><input class="form-control" id="nc_gst" placeholder="GST Number"></div>
    <div class="form-group col-span-2"><label>Address</label><input class="form-control" id="nc_address" placeholder="Full address"></div>
  </div>`;
  openModal('Add Collector', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveNewCollector()">Save</button>`);
}

function saveNewCollector() {
  const name = document.getElementById('nc_name').value.trim();
  if (!name) { toast('Name is required','error'); return; }
  DB.collectors.push({ id: uid('COL'), name, company: document.getElementById('nc_company').value, mobile: document.getElementById('nc_mobile').value, gst: document.getElementById('nc_gst').value, address: document.getElementById('nc_address').value });
  closeModal(); navigate('collectors'); toast('Collector added!');
}

function editCollector(id) {
  const c = DB.collectors.find(x => x.id === id);
  const body = `<div class="form-grid">
    <div class="form-group"><label>Collector Name</label><input class="form-control" id="ec_name" value="${c.name}"></div>
    <div class="form-group"><label>Company Name</label><input class="form-control" id="ec_company" value="${c.company}"></div>
    <div class="form-group"><label>Mobile Number</label><input class="form-control" id="ec_mobile" value="${c.mobile}"></div>
    <div class="form-group"><label>GST Number</label><input class="form-control" id="ec_gst" value="${c.gst}"></div>
    <div class="form-group col-span-2"><label>Address</label><input class="form-control" id="ec_address" value="${c.address}"></div>
  </div>`;
  openModal('Edit Collector', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveEditCollector('${id}')">Save</button>`);
}

function saveEditCollector(id) {
  const c = DB.collectors.find(x => x.id === id);
  c.name = document.getElementById('ec_name').value;
  c.company = document.getElementById('ec_company').value;
  c.mobile = document.getElementById('ec_mobile').value;
  c.gst = document.getElementById('ec_gst').value;
  c.address = document.getElementById('ec_address').value;
  closeModal(); navigate('collectors'); toast('Collector updated!');
}

function deleteCollector(id) {
  openConfirm('Delete this collector? All their purchase records will remain.', () => {
    DB.collectors = DB.collectors.filter(x => x.id !== id);
    navigate('collectors'); toast('Collector deleted','warning');
  });
}

function viewCollector(id) {
  const c = DB.collectors.find(x => x.id === id);
  const purchases = DB.purchases.filter(p => p.collector === id);
  const total = purchases.reduce((s, p) => s + p.qty * p.rate, 0);
  const body = `
    <div class="form-grid" style="margin-bottom:16px">
      ${profileField('Collector ID', c.id)}
      ${profileField('Name', c.name)}
      ${profileField('Company', c.company)}
      ${profileField('Mobile', c.mobile)}
      ${profileField('GST', c.gst)}
      ${profileField('Address', c.address)}
    </div>
    <div style="padding:14px;background:var(--bg);border-radius:10px;margin-top:4px">
      <strong>Total Purchases:</strong> ${purchases.length} records &nbsp;|&nbsp; <strong>Total Value:</strong> ${fmtCurr(total)}
    </div>`;
  openModal('Collector Details — ' + c.name, body, `<button class="btn btn-primary" onclick="closeModal()">Close</button>`);
}

function addPurchase() {
  const collectorOpts = DB.collectors.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const body = `<div class="form-grid">
    <div class="form-group"><label>Purchase Date</label><input type="date" class="form-control" id="np_date" value="${new Date().toISOString().split('T')[0]}"></div>
    <div class="form-group"><label>Collector</label><select class="form-control" id="np_collector">${collectorOpts}</select></div>
    <div class="form-group"><label>Plastic Type</label>
      <select class="form-control" id="np_type">
        <option>PET Bottles</option><option>HDPE</option><option>LDPE Film</option><option>PP Granules</option><option>PVC Scrap</option><option>ABS Plastic</option>
      </select>
    </div>
    <div class="form-group"><label>Quantity (kg)</label><input type="number" class="form-control" id="np_qty"></div>
    <div class="form-group"><label>Rate per kg (₹)</label><input type="number" class="form-control" id="np_rate"></div>
    <div class="form-group"><label>Quality Status</label>
      <select class="form-control" id="np_quality"><option>Grade A</option><option>Grade B</option><option>Grade C</option></select>
    </div>
  </div>`;
  openModal('Add Purchase Record', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveNewPurchase()">Save</button>`);
}

function saveNewPurchase() {
  DB.purchases.push({
    id: uid('PUR'), date: document.getElementById('np_date').value,
    collector: document.getElementById('np_collector').value,
    type: document.getElementById('np_type').value,
    qty: parseFloat(document.getElementById('np_qty').value) || 0,
    rate: parseFloat(document.getElementById('np_rate').value) || 0,
    quality: document.getElementById('np_quality').value
  });
  closeModal(); navigate('collectors');
  document.querySelector('.tab-btn[data-tab="colPurchase"]')?.click();
  toast('Purchase record added!');
}

function editPurchase(id) {
  const p = DB.purchases.find(x => x.id === id);
  const collectorOpts = DB.collectors.map(c => `<option value="${c.id}" ${c.id===p.collector?'selected':''}>${c.name}</option>`).join('');
  const body = `<div class="form-grid">
    <div class="form-group"><label>Purchase Date</label><input type="date" class="form-control" id="ep_date" value="${p.date}"></div>
    <div class="form-group"><label>Collector</label><select class="form-control" id="ep_collector">${collectorOpts}</select></div>
    <div class="form-group"><label>Plastic Type</label><input class="form-control" id="ep_type" value="${p.type}"></div>
    <div class="form-group"><label>Quantity (kg)</label><input type="number" class="form-control" id="ep_qty" value="${p.qty}"></div>
    <div class="form-group"><label>Rate per kg (₹)</label><input type="number" class="form-control" id="ep_rate" value="${p.rate}"></div>
    <div class="form-group"><label>Quality</label>
      <select class="form-control" id="ep_quality"><option ${p.quality==='Grade A'?'selected':''}>Grade A</option><option ${p.quality==='Grade B'?'selected':''}>Grade B</option><option ${p.quality==='Grade C'?'selected':''}>Grade C</option></select>
    </div>
  </div>`;
  openModal('Edit Purchase', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveEditPurchase('${id}')">Save</button>`);
}

function saveEditPurchase(id) {
  const p = DB.purchases.find(x => x.id === id);
  p.date = document.getElementById('ep_date').value;
  p.collector = document.getElementById('ep_collector').value;
  p.type = document.getElementById('ep_type').value;
  p.qty = parseFloat(document.getElementById('ep_qty').value) || 0;
  p.rate = parseFloat(document.getElementById('ep_rate').value) || 0;
  p.quality = document.getElementById('ep_quality').value;
  closeModal(); navigate('collectors');
  setTimeout(() => document.querySelector('.tab-btn[data-tab="colPurchase"]')?.click(), 100);
  toast('Purchase updated!');
}

function deletePurchase(id) {
  openConfirm('Delete this purchase record?', () => {
    DB.purchases = DB.purchases.filter(x => x.id !== id);
    navigate('collectors');
    setTimeout(() => document.querySelector('.tab-btn[data-tab="colPurchase"]')?.click(), 100);
    toast('Purchase deleted','warning');
  });
}

// ══════════════════════════════════════════════════════════════════════════
// BUYER MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════
function renderBuyers() {
  return `
    <div class="section-header">
      <h1><i class="fa-solid fa-handshake" style="color:#8B5CF6;margin-right:8px"></i>Buyer Management</h1>
      <p>Manage buyers, product requirements, deliveries and invoice history.</p>
    </div>
    <div class="tabs-group">
      <div class="page-tabs">
        <button class="tab-btn active" data-tab="buyerList">Buyers</button>
        <button class="tab-btn" data-tab="buyerDelivery">Deliveries</button>
        <button class="tab-btn" data-tab="buyerInvoice">Invoice History</button>
      </div>
    </div>
    <div class="tab-pane active" data-tab="buyerList">${renderBuyerTable()}</div>
    <div class="tab-pane" data-tab="buyerDelivery">${renderDeliveryTable()}</div>
    <div class="tab-pane" data-tab="buyerInvoice">${renderBuyerInvoiceTable()}</div>`;
}

function renderBuyerTable() {
  const rows = DB.buyers.map(b => `
    <tr>
      <td><span class="status status-purple">${b.id}</span></td>
      <td><strong>${b.company}</strong></td>
      <td>${b.contact}</td>
      <td style="font-size:.78rem;color:var(--text-muted)">${b.gst}</td>
      <td>${b.mobile}</td>
      <td style="font-size:.8rem">${b.email}</td>
      <td style="font-size:.8rem">${b.address}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="viewBuyer('${b.id}')" title="View"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editBuyer('${b.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteBuyer('${b.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
  return `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Buyers <span style="color:var(--text-muted);font-weight:400">(${DB.buyers.length})</span></span>
        <div class="card-actions">
          <div class="table-search"><i class="fa-solid fa-magnifying-glass"></i><input id="buySearch" placeholder="Search buyers…"></div>
          <button class="btn btn-primary btn-sm" onclick="addBuyer()"><i class="fa-solid fa-plus"></i> Add Buyer</button>
        </div>
      </div>
      <div class="table-wrap">
        <table><thead><tr><th>ID</th><th>Company</th><th>Contact</th><th>GST</th><th>Mobile</th><th>Email</th><th>Address</th><th>Actions</th></tr></thead>
        <tbody id="buyTable">${rows}</tbody></table>
      </div>
    </div>`;
}

function renderDeliveryTable() {
  const rows = DB.deliveries.map(d => `
    <tr>
      <td><span class="status status-info">${d.id}</span></td>
      <td>${getBuyerName(d.buyer)}</td>
      <td>${fmtDate(d.date)}</td>
      <td>${d.qty} kg</td>
      <td>${statusBadge(d.status)}</td>
      <td>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editDelivery('${d.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteDelivery('${d.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');
  return `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Delivery Records</span>
        <div class="card-actions">
          <button class="btn btn-ghost btn-sm" onclick="exportTableToCSV('delTable','deliveries')"><i class="fa-solid fa-file-excel"></i> Export</button>
          <button class="btn btn-primary btn-sm" onclick="addDelivery()"><i class="fa-solid fa-plus"></i> Add Delivery</button>
        </div>
      </div>
      <div class="table-wrap">
        <table><thead><tr><th>ID</th><th>Buyer</th><th>Date</th><th>Qty (kg)</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="delTable">${rows}</tbody></table>
      </div>
    </div>`;
}

function renderBuyerInvoiceTable() {
  const rows = DB.payments.map(p => `
    <tr>
      <td>${p.invoice}</td>
      <td>${p.company}</td>
      <td><strong>${fmtCurr(p.amount)}</strong></td>
      <td>${fmtDate(p.date)}</td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-blue btn-sm" onclick="toast('Viewing invoice ${p.invoice}','info')"><i class="fa-solid fa-eye"></i> View</button>
          <button class="btn btn-ghost btn-sm" onclick="toast('Downloading ${p.invoice}…','info')"><i class="fa-solid fa-download"></i></button>
        </div>
      </td>
    </tr>`).join('');
  return `
    <div class="card">
      <div class="card-header">
        <span class="card-title">Invoice History</span>
        <button class="btn btn-ghost btn-sm" onclick="exportTableToCSV('invTable','invoices')"><i class="fa-solid fa-file-excel"></i> Export</button>
      </div>
      <div class="table-wrap">
        <table><thead><tr><th>Invoice No</th><th>Company</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="invTable">${rows}</tbody></table>
      </div>
    </div>`;
}

function initBuyers() {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      b.closest('.tabs-group').querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.tab === b.dataset.tab));
    });
  });
  setTimeout(() => buildTableSearchFilter('buySearch', 'buyTable'), 50);
}

function addBuyer() {
  const body = `<div class="form-grid">
    <div class="form-group"><label>Company Name</label><input class="form-control" id="nb_company"></div>
    <div class="form-group"><label>Contact Person</label><input class="form-control" id="nb_contact"></div>
    <div class="form-group"><label>GST Number</label><input class="form-control" id="nb_gst"></div>
    <div class="form-group"><label>Mobile</label><input class="form-control" id="nb_mobile"></div>
    <div class="form-group"><label>Email</label><input type="email" class="form-control" id="nb_email"></div>
    <div class="form-group col-span-2"><label>Address</label><input class="form-control" id="nb_address"></div>
  </div>`;
  openModal('Add Buyer', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveNewBuyer()">Save</button>`);
}

function saveNewBuyer() {
  const company = document.getElementById('nb_company').value.trim();
  if (!company) { toast('Company name required','error'); return; }
  DB.buyers.push({ id: uid('BUY'), company, contact: document.getElementById('nb_contact').value, gst: document.getElementById('nb_gst').value, mobile: document.getElementById('nb_mobile').value, email: document.getElementById('nb_email').value, address: document.getElementById('nb_address').value });
  closeModal(); navigate('buyers'); toast('Buyer added!');
}

function editBuyer(id) {
  const b = DB.buyers.find(x => x.id === id);
  const body = `<div class="form-grid">
    <div class="form-group"><label>Company Name</label><input class="form-control" id="eb_company" value="${b.company}"></div>
    <div class="form-group"><label>Contact Person</label><input class="form-control" id="eb_contact" value="${b.contact}"></div>
    <div class="form-group"><label>GST Number</label><input class="form-control" id="eb_gst" value="${b.gst}"></div>
    <div class="form-group"><label>Mobile</label><input class="form-control" id="eb_mobile" value="${b.mobile}"></div>
    <div class="form-group"><label>Email</label><input class="form-control" id="eb_email" value="${b.email}"></div>
    <div class="form-group col-span-2"><label>Address</label><input class="form-control" id="eb_address" value="${b.address}"></div>
  </div>`;
  openModal('Edit Buyer', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveEditBuyer('${id}')">Save</button>`);
}

function saveEditBuyer(id) {
  const b = DB.buyers.find(x => x.id === id);
  b.company = document.getElementById('eb_company').value;
  b.contact = document.getElementById('eb_contact').value;
  b.gst = document.getElementById('eb_gst').value;
  b.mobile = document.getElementById('eb_mobile').value;
  b.email = document.getElementById('eb_email').value;
  b.address = document.getElementById('eb_address').value;
  closeModal(); navigate('buyers'); toast('Buyer updated!');
}

function deleteBuyer(id) {
  openConfirm('Delete this buyer?', () => {
    DB.buyers = DB.buyers.filter(x => x.id !== id);
    navigate('buyers'); toast('Buyer deleted','warning');
  });
}

function viewBuyer(id) {
  const b = DB.buyers.find(x => x.id === id);
  const deliveries = DB.deliveries.filter(d => d.buyer === id);
  const body = `<div class="form-grid" style="margin-bottom:16px">
    ${profileField('Buyer ID', b.id)}${profileField('Company', b.company)}
    ${profileField('Contact', b.contact)}${profileField('GST', b.gst)}
    ${profileField('Mobile', b.mobile)}${profileField('Email', b.email)}
    ${profileField('Address', b.address)}
  </div>
  <div style="padding:12px 14px;background:var(--bg);border-radius:10px">
    <strong>Total Deliveries:</strong> ${deliveries.length} &nbsp;|&nbsp; <strong>Total Qty:</strong> ${deliveries.reduce((s,d)=>s+d.qty,0)} kg
  </div>`;
  openModal('Buyer Details — ' + b.company, body, `<button class="btn btn-primary" onclick="closeModal()">Close</button>`);
}

function addDelivery() {
  const buyerOpts = DB.buyers.map(b => `<option value="${b.id}">${b.company}</option>`).join('');
  const body = `<div class="form-grid">
    <div class="form-group"><label>Buyer</label><select class="form-control" id="nd_buyer">${buyerOpts}</select></div>
    <div class="form-group"><label>Delivery Date</label><input type="date" class="form-control" id="nd_date" value="${new Date().toISOString().split('T')[0]}"></div>
    <div class="form-group"><label>Quantity (kg)</label><input type="number" class="form-control" id="nd_qty"></div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="nd_status"><option>Pending</option><option>In Transit</option><option>Delivered</option></select>
    </div>
  </div>`;
  openModal('Add Delivery Record', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveNewDelivery()">Save</button>`);
}

function saveNewDelivery() {
  DB.deliveries.push({ id: uid('DEL'), buyer: document.getElementById('nd_buyer').value, date: document.getElementById('nd_date').value, qty: parseFloat(document.getElementById('nd_qty').value)||0, status: document.getElementById('nd_status').value });
  closeModal(); navigate('buyers');
  setTimeout(() => document.querySelector('.tab-btn[data-tab="buyerDelivery"]')?.click(), 100);
  toast('Delivery record added!');
}

function editDelivery(id) {
  const d = DB.deliveries.find(x => x.id === id);
  const buyerOpts = DB.buyers.map(b => `<option value="${b.id}" ${b.id===d.buyer?'selected':''}>${b.company}</option>`).join('');
  const body = `<div class="form-grid">
    <div class="form-group"><label>Buyer</label><select class="form-control" id="ed_buyer">${buyerOpts}</select></div>
    <div class="form-group"><label>Delivery Date</label><input type="date" class="form-control" id="ed_date" value="${d.date}"></div>
    <div class="form-group"><label>Quantity (kg)</label><input type="number" class="form-control" id="ed_qty" value="${d.qty}"></div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="ed_status">
        <option ${d.status==='Pending'?'selected':''}>Pending</option>
        <option ${d.status==='In Transit'?'selected':''}>In Transit</option>
        <option ${d.status==='Delivered'?'selected':''}>Delivered</option>
      </select>
    </div>
  </div>`;
  openModal('Edit Delivery', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveEditDelivery('${id}')">Save</button>`);
}

function saveEditDelivery(id) {
  const d = DB.deliveries.find(x => x.id === id);
  d.buyer = document.getElementById('ed_buyer').value;
  d.date = document.getElementById('ed_date').value;
  d.qty = parseFloat(document.getElementById('ed_qty').value)||0;
  d.status = document.getElementById('ed_status').value;
  closeModal(); navigate('buyers');
  setTimeout(() => document.querySelector('.tab-btn[data-tab="buyerDelivery"]')?.click(), 100);
  toast('Delivery updated!');
}

function deleteDelivery(id) {
  openConfirm('Delete this delivery record?', () => {
    DB.deliveries = DB.deliveries.filter(x => x.id !== id);
    navigate('buyers');
    setTimeout(() => document.querySelector('.tab-btn[data-tab="buyerDelivery"]')?.click(), 100);
    toast('Delivery deleted','warning');
  });
}

// ══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════════════════
function renderAnalytics() {
  const totalCollected = DB.purchases.reduce((s, p) => s + p.qty, 0);
  const totalSales = DB.payments.reduce((s, p) => s + p.amount, 0);
  const pending = DB.payments.filter(p => p.status !== 'Paid').reduce((s, p) => s + p.amount, 0);
  const monthlyRev = DB.payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);

  const kpis = [
    { label: 'Total Plastic Collected', value: totalCollected.toLocaleString() + ' kg', icon: 'fa-cubes-stacked', color: 'var(--green)', bg: 'var(--green-light)' },
    { label: 'Total Plastic Recycled', value: Math.round(totalCollected * 0.82).toLocaleString() + ' kg', icon: 'fa-recycle', color: 'var(--blue)', bg: 'var(--blue-light)' },
    { label: 'Total Sales', value: fmtCurr(totalSales), icon: 'fa-indian-rupee-sign', color: '#8B5CF6', bg: 'var(--purple-light)' },
    { label: 'Pending Payments', value: fmtCurr(pending), icon: 'fa-clock', color: 'var(--yellow)', bg: 'var(--yellow-light)' },
    { label: 'Revenue Received', value: fmtCurr(monthlyRev), icon: 'fa-circle-check', color: 'var(--green-dark)', bg: 'var(--green-light)' }
  ];

  return `
    <div class="section-header">
      <h1><i class="fa-solid fa-chart-line" style="color:var(--yellow);margin-right:8px"></i>Recycler Analytics</h1>
      <p>Recycling performance, revenue trends and business insights.</p>
    </div>
    <div class="kpi-grid">
      ${kpis.map(k => `
        <div class="kpi-card">
          <div class="kpi-icon" style="background:${k.bg};color:${k.color}"><i class="fa-solid ${k.icon}"></i></div>
          <div class="kpi-label">${k.label}</div>
          <div class="kpi-value" style="color:${k.color}">${k.value}</div>
        </div>`).join('')}
    </div>
    <div class="tabs-group">
      <div class="page-tabs">
        <button class="tab-btn active" data-tab="charts">Charts</button>
        <button class="tab-btn" data-tab="analyticsTable">Data Table</button>
      </div>
    </div>
    <div class="tab-pane active" data-tab="charts">
      <div class="charts-grid">
        <div class="chart-card"><h3>Monthly Collection Trend (kg)</h3><div class="chart-wrap"><canvas id="chartCollection"></canvas></div></div>
        <div class="chart-card"><h3>Monthly Revenue Trend (₹)</h3><div class="chart-wrap"><canvas id="chartRevenue"></canvas></div></div>
        <div class="chart-card"><h3>Plastic Type Distribution</h3><div class="chart-wrap"><canvas id="chartDist"></canvas></div></div>
        <div class="chart-card"><h3>Payment Status Overview</h3><div class="chart-wrap"><canvas id="chartPayStatus"></canvas></div></div>
      </div>
    </div>
    <div class="tab-pane" data-tab="analyticsTable">
      <div class="card">
        <div class="card-header"><span class="card-title">Purchase Summary by Plastic Type</span>
          <button class="btn btn-ghost btn-sm" onclick="exportTableToCSV('anaTable','analytics')"><i class="fa-solid fa-file-excel"></i> Export</button>
        </div>
        <div class="table-wrap">
          <table><thead><tr><th>Plastic Type</th><th>Total Qty (kg)</th><th>Total Value</th><th>Avg Rate</th><th>Records</th></tr></thead>
          <tbody id="anaTable">${renderAnalyticsTable()}</tbody></table>
        </div>
      </div>
    </div>`;
}

function renderAnalyticsTable() {
  const summary = {};
  DB.purchases.forEach(p => {
    if (!summary[p.type]) summary[p.type] = { qty: 0, value: 0, count: 0 };
    summary[p.type].qty += p.qty;
    summary[p.type].value += p.qty * p.rate;
    summary[p.type].count++;
  });
  return Object.entries(summary).map(([type, s]) => `
    <tr>
      <td><strong>${type}</strong></td>
      <td>${s.qty.toLocaleString()} kg</td>
      <td>${fmtCurr(s.value)}</td>
      <td>${fmtCurr(Math.round(s.value / s.qty))}/kg</td>
      <td>${s.count}</td>
    </tr>`).join('');
}

function renderCharts() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun'];

  // Collection trend
  const colByMonth = [500, 320, 850, 430, 720, 650];
  const c1 = document.getElementById('chartCollection');
  if (c1) charts.collection = new Chart(c1, {
    type: 'line',
    data: { labels: months, datasets: [{ label: 'kg Collected', data: colByMonth, borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,.12)', tension: .4, fill: true }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  // Revenue trend
  const revByMonth = [120000, 98000, 215000, 145000, 185000, 162000];
  const c2 = document.getElementById('chartRevenue');
  if (c2) charts.revenue = new Chart(c2, {
    type: 'bar',
    data: { labels: months, datasets: [{ label: '₹ Revenue', data: revByMonth, backgroundColor: 'rgba(37,99,235,.75)', borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });

  // Plastic type distribution
  const typeMap = {};
  DB.purchases.forEach(p => { typeMap[p.type] = (typeMap[p.type]||0) + p.qty; });
  const c3 = document.getElementById('chartDist');
  if (c3) charts.dist = new Chart(c3, {
    type: 'doughnut',
    data: { labels: Object.keys(typeMap), datasets: [{ data: Object.values(typeMap), backgroundColor: ['#22C55E','#2563EB','#F59E0B','#8B5CF6','#EF4444','#06B6D4'] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
  });

  // Payment status
  const paid = DB.payments.filter(p => p.status === 'Paid').length;
  const pendingP = DB.payments.filter(p => p.status === 'Pending').length;
  const overdue = DB.payments.filter(p => p.status === 'Overdue').length;
  const c4 = document.getElementById('chartPayStatus');
  if (c4) charts.payStatus = new Chart(c4, {
    type: 'pie',
    data: { labels: ['Paid','Pending','Overdue'], datasets: [{ data: [paid, pendingP, overdue], backgroundColor: ['#22C55E','#F59E0B','#EF4444'] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}

// ══════════════════════════════════════════════════════════════════════════
// PAYMENTS & ACCOUNTS
// ══════════════════════════════════════════════════════════════════════════
function renderPayments() {
  return `
    <div class="section-header">
      <h1><i class="fa-solid fa-credit-card" style="color:var(--red);margin-right:8px"></i>Payments &amp; Accounts</h1>
      <p>Track payments, outstanding invoices and EPR certificate management.</p>
    </div>
    <div class="tabs-group">
      <div class="page-tabs">
        <button class="tab-btn active" data-tab="payRecords">Payment Records</button>
        <button class="tab-btn" data-tab="eprCerts">EPR Certificates</button>
      </div>
    </div>
    <div class="tab-pane active" data-tab="payRecords">${renderPaymentTable()}</div>
    <div class="tab-pane" data-tab="eprCerts">${renderEPRTable()}</div>`;
}

function renderPaymentTable() {
  const totalPaid = DB.payments.filter(p=>p.status==='Paid').reduce((s,p)=>s+p.amount,0);
  const totalPending = DB.payments.filter(p=>p.status==='Pending').reduce((s,p)=>s+p.amount,0);
  const totalOverdue = DB.payments.filter(p=>p.status==='Overdue').reduce((s,p)=>s+p.amount,0);

  const rows = DB.payments.map(p => `
    <tr>
      <td>${p.invoice}</td>
      <td><strong>${p.company}</strong></td>
      <td>${fmtCurr(p.amount)}</td>
      <td>${fmtDate(p.date)}</td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editPayment('${p.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deletePayment('${p.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');

  return `
    <div class="kpi-grid" style="margin-bottom:20px">
      <div class="kpi-card"><div class="kpi-icon" style="background:var(--green-light);color:var(--green)"><i class="fa-solid fa-circle-check"></i></div><div class="kpi-label">Paid</div><div class="kpi-value" style="color:var(--green)">${fmtCurr(totalPaid)}</div></div>
      <div class="kpi-card"><div class="kpi-icon" style="background:var(--yellow-light);color:var(--yellow)"><i class="fa-solid fa-clock"></i></div><div class="kpi-label">Pending</div><div class="kpi-value" style="color:var(--yellow)">${fmtCurr(totalPending)}</div></div>
      <div class="kpi-card"><div class="kpi-icon" style="background:var(--red-light);color:var(--red)"><i class="fa-solid fa-triangle-exclamation"></i></div><div class="kpi-label">Overdue</div><div class="kpi-value" style="color:var(--red)">${fmtCurr(totalOverdue)}</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">Payment Records</span>
        <div class="card-actions">
          <div class="table-search"><i class="fa-solid fa-magnifying-glass"></i><input id="paySearch" placeholder="Search payments…"></div>
          <select class="form-control" style="width:auto;height:36px;font-size:.82rem" id="payFilter" onchange="filterPayments()">
            <option value="">All Status</option><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Overdue">Overdue</option>
          </select>
          <button class="btn btn-ghost btn-sm" onclick="exportTableToCSV('payTable','payments')"><i class="fa-solid fa-file-excel"></i> Export</button>
          <button class="btn btn-primary btn-sm" onclick="addPayment()"><i class="fa-solid fa-plus"></i> Add Payment</button>
        </div>
      </div>
      <div class="table-wrap">
        <table><thead><tr><th>Invoice No</th><th>Company</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="payTable">${rows}</tbody></table>
      </div>
    </div>`;
}

function renderEPRTable() {
  const rows = DB.eprCerts.map(e => `
    <tr>
      <td><strong>${e.company}</strong></td>
      <td>${e.required} MT</td>
      <td>${e.sent} MT</td>
      <td style="font-size:.8rem;font-family:monospace">${e.certNo}</td>
      <td>${fmtDate(e.date)}</td>
      <td style="font-size:.8rem;color:var(--text-muted)">${e.remarks}</td>
      <td>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-blue btn-sm" onclick="toast('Uploading certificate…','info')"><i class="fa-solid fa-upload"></i></button>
          <button class="btn btn-primary btn-sm" onclick="sendEPR(${e.id})"><i class="fa-solid fa-paper-plane"></i></button>
          <button class="btn btn-ghost btn-sm" onclick="toast('Downloading EPR certificate…','info')"><i class="fa-solid fa-download"></i></button>
        </div>
      </td>
    </tr>`).join('');
  return `
    <div class="card">
      <div class="card-header">
        <span class="card-title">EPR Certificate Management</span>
        <button class="btn btn-primary btn-sm" onclick="addEPR()"><i class="fa-solid fa-plus"></i> Add Entry</button>
      </div>
      <div class="table-wrap">
        <table><thead><tr><th>Company</th><th>Required</th><th>Sent</th><th>Certificate No</th><th>Date</th><th>Remarks</th><th>Actions</th></tr></thead>
        <tbody id="eprTable">${rows}</tbody></table>
      </div>
    </div>`;
}

function initPayments() {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      b.closest('.tabs-group').querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.tab === b.dataset.tab));
    });
  });
  setTimeout(() => buildTableSearchFilter('paySearch', 'payTable'), 50);
}

function filterPayments() {
  const val = document.getElementById('payFilter')?.value || '';
  document.querySelectorAll('#payTable tr').forEach(row => {
    row.style.display = (!val || row.textContent.includes(val)) ? '' : 'none';
  });
}

function addPayment() {
  const body = `<div class="form-grid">
    <div class="form-group"><label>Company Name</label><input class="form-control" id="np2_company"></div>
    <div class="form-group"><label>Invoice Number</label><input class="form-control" id="np2_invoice" value="INV-2025-${String(DB.payments.length+1).padStart(3,'0')}"></div>
    <div class="form-group"><label>Amount (₹)</label><input type="number" class="form-control" id="np2_amount"></div>
    <div class="form-group"><label>Payment Date</label><input type="date" class="form-control" id="np2_date" value="${new Date().toISOString().split('T')[0]}"></div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="np2_status"><option>Paid</option><option>Pending</option><option>Overdue</option></select>
    </div>
  </div>`;
  openModal('Add Payment Record', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveNewPayment()">Save</button>`);
}

function saveNewPayment() {
  DB.payments.push({ id: uid('PAY'), company: document.getElementById('np2_company').value, invoice: document.getElementById('np2_invoice').value, amount: parseFloat(document.getElementById('np2_amount').value)||0, date: document.getElementById('np2_date').value, status: document.getElementById('np2_status').value });
  closeModal(); navigate('payments'); toast('Payment record added!');
}

function editPayment(id) {
  const p = DB.payments.find(x => x.id === id);
  const body = `<div class="form-grid">
    <div class="form-group"><label>Company Name</label><input class="form-control" id="ep2_company" value="${p.company}"></div>
    <div class="form-group"><label>Invoice Number</label><input class="form-control" id="ep2_invoice" value="${p.invoice}"></div>
    <div class="form-group"><label>Amount (₹)</label><input type="number" class="form-control" id="ep2_amount" value="${p.amount}"></div>
    <div class="form-group"><label>Payment Date</label><input type="date" class="form-control" id="ep2_date" value="${p.date}"></div>
    <div class="form-group"><label>Status</label>
      <select class="form-control" id="ep2_status">
        <option ${p.status==='Paid'?'selected':''}>Paid</option>
        <option ${p.status==='Pending'?'selected':''}>Pending</option>
        <option ${p.status==='Overdue'?'selected':''}>Overdue</option>
      </select>
    </div>
  </div>`;
  openModal('Edit Payment', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveEditPayment('${id}')">Save</button>`);
}

function saveEditPayment(id) {
  const p = DB.payments.find(x => x.id === id);
  p.company = document.getElementById('ep2_company').value;
  p.invoice = document.getElementById('ep2_invoice').value;
  p.amount = parseFloat(document.getElementById('ep2_amount').value)||0;
  p.date = document.getElementById('ep2_date').value;
  p.status = document.getElementById('ep2_status').value;
  closeModal(); navigate('payments'); toast('Payment updated!');
}

function deletePayment(id) {
  openConfirm('Delete this payment record?', () => {
    DB.payments = DB.payments.filter(x => x.id !== id);
    navigate('payments'); toast('Payment deleted','warning');
  });
}

function addEPR() {
  const body = `<div class="form-grid">
    <div class="form-group"><label>Company Name</label><input class="form-control" id="ne_company"></div>
    <div class="form-group"><label>EPR Required (MT)</label><input type="number" class="form-control" id="ne_required"></div>
    <div class="form-group"><label>EPR Sent (MT)</label><input type="number" class="form-control" id="ne_sent"></div>
    <div class="form-group"><label>Certificate Number</label><input class="form-control" id="ne_certno"></div>
    <div class="form-group"><label>Certificate Date</label><input type="date" class="form-control" id="ne_date" value="${new Date().toISOString().split('T')[0]}"></div>
    <div class="form-group col-span-2"><label>Remarks</label><input class="form-control" id="ne_remarks"></div>
  </div>`;
  openModal('Add EPR Entry', body,
    `<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveNewEPR()">Save</button>`);
}

function saveNewEPR() {
  DB.eprCerts.push({ id: Date.now(), company: document.getElementById('ne_company').value, required: parseFloat(document.getElementById('ne_required').value)||0, sent: parseFloat(document.getElementById('ne_sent').value)||0, certNo: document.getElementById('ne_certno').value, date: document.getElementById('ne_date').value, remarks: document.getElementById('ne_remarks').value });
  closeModal(); navigate('payments');
  setTimeout(() => document.querySelector('.tab-btn[data-tab="eprCerts"]')?.click(), 100);
  toast('EPR entry added!');
}

function sendEPR(id) {
  const e = DB.eprCerts.find(x => x.id === id);
  toast(`EPR Certificate sent to ${e?.company}`, 'success');
}

// ── Export to CSV ──────────────────────────────────────────────────────────
function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) { toast('Nothing to export','error'); return; }
  const rows = [...table.closest('table').querySelectorAll('tr')];
  const csv = rows.map(r => [...r.querySelectorAll('th,td')].map(c => '"' + c.textContent.trim().replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename + '.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('Exported to CSV!', 'info');
}
