# PlasticConnect.AI — Recycler Dashboard

A modern, enterprise-grade Recycler Dashboard built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools, no dependencies — just open and run.

---

## Quick Start

### Option 1 — Python Server (Recommended)

```bash
cd "path/to/Plastic"
python -m http.server 8080
```

Then open **http://localhost:8080** in your browser.

### Option 2 — Open Directly

Double-click `index.html` to open it in your browser. Most features work without a server.

---

## Project Structure

```
Plastic/
├── index.html      # App shell — sidebar, topbar, modals, toast container
├── styles.css      # All styling — variables, components, responsive layout
├── data.js         # Mock data (DB object) — collectors, buyers, payments, etc.
└── app.js          # All application logic — routing, CRUD, charts, exports
```

---

## Features

### Dashboard Homepage
- 5 large clickable module cards with hover animations
- Opens directly — no login or authentication required

### Company Profile
- View and edit company details (name, founder, GST, address, etc.)
- Document management — GST Certificate, PAN Card, Factory License, EPR Authorization
- Each document shows upload date, expiry date, verification status
- Download and Replace document actions

### Collector Records
- **Collectors tab** — Add, Edit, Delete, View collectors with full details
- **Purchase Records tab** — Track plastic purchases with type, quantity, rate, quality grade
- **GST Invoice tab** — Live invoice calculator with CGST/SGST (intra-state) or IGST (inter-state), print and download support

### Buyer Management
- **Buyers tab** — Full CRUD for buyer company details
- **Deliveries tab** — Track delivery records with status (Pending / In Transit / Delivered)
- **Invoice History tab** — View and download sales invoices per buyer

### Recycler Analytics
- KPI cards — Total Collected, Total Recycled, Total Sales, Pending Payments, Revenue Received
- **Monthly Collection Trend** — Line chart
- **Monthly Revenue Trend** — Bar chart
- **Plastic Type Distribution** — Doughnut chart
- **Payment Status Overview** — Pie chart
- Summary data table with CSV export

### Payments & Accounts
- Payment summary KPIs — Paid, Pending, Overdue totals
- Filter payments by status
- Full CRUD for payment records
- **EPR Certificate Management** — Upload, Send, Download certificates per buyer company

---

## Global Features

| Feature | Details |
|---|---|
| Dark / Light Mode | Toggle via moon/sun icon in topbar |
| Global Search | Searches modules, collectors, and buyers |
| Notifications | Bell icon with badge count and clear-all |
| Toast Notifications | Success, error, info, warning toasts |
| Confirm Dialogs | Shown before every delete action |
| Searchable Tables | Live filter on every data table |
| CSV Export | Export button on all major tables |
| Print Support | Print-ready GST invoice generation |
| Responsive Layout | 3 columns (desktop) → 2 (tablet) → 1 (mobile) |
| Loading Skeletons | CSS shimmer animation class available |
| Empty States | Shown when lists are empty |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 with custom properties (variables) |
| Logic | Vanilla JavaScript (ES6+) |
| Charts | Chart.js 4.4 (CDN) |
| Icons | Font Awesome 6.5 (CDN) |
| Data | In-memory JS object (no backend) |

---

## Color Palette

| Role | Color | Hex |
|---|---|---|
| Primary (Green) | Actions, active states | `#22C55E` |
| Secondary (Blue) | Info, buyer badges | `#2563EB` |
| Warning (Yellow) | Pending status | `#F59E0B` |
| Danger (Red) | Overdue, delete | `#EF4444` |
| Purple | Buyer IDs, analytics | `#8B5CF6` |
| Background | Light mode | `#F8FAFC` |
| Background | Dark mode | `#0F172A` |

---

## Sample Data

The app ships with realistic mock data in `data.js`:

- **4 collectors** — Ramesh Patil, Suresh Yadav, Priya Nair, Vikram Singh
- **6 purchase records** — PET Bottles, HDPE, LDPE Film, PP Granules, PVC Scrap
- **3 buyers** — EcoPlast Industries, GreenMat Corp, PlastiForm Ltd.
- **4 deliveries** — across all buyers with mixed statuses
- **4 payment records** — Paid, Pending, Overdue examples
- **3 EPR certificate entries**
- **4 notifications**

All data is in-memory — changes persist only for the current browser session.

---

## Extending the App

### Add a new module
1. Add a nav item in `index.html` with `data-page="yourpage"`
2. Add a card in `renderDashboard()` in `app.js`
3. Write a `renderYourPage()` function and register it in the `pages` object

### Connect a real backend
Replace the `DB` object in `data.js` with `fetch()` calls to your API. All render functions accept the same data shape.

### Persist data locally
Wrap `DB` reads/writes with `localStorage.getItem` / `localStorage.setItem` to survive page refreshes without a backend.

---

## Browser Support

Works in all modern browsers — Chrome, Edge, Firefox, Safari. No polyfills required.

---

## License

Built for PlasticConnect.AI. All rights reserved.
