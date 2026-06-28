// ===== MOCK DATA =====
const DB = {
  company: {
    name: "GreenCycle Recyclers Pvt. Ltd.",
    founder: "Arun Sharma",
    email: "arun@greencycle.in",
    mobile: "98XXXXXXXX",
    address: "Plot 45, Industrial Area",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411019",
    gst: "27AAACG1234A1ZN"
  },
  documents: [
    { id: 1, name: "GST Certificate", uploaded: "2024-01-10", expiry: "2026-01-09", status: "Verified", file: "gst_cert.pdf" },
    { id: 2, name: "PAN Card", uploaded: "2024-01-10", expiry: "N/A", status: "Verified", file: "pan_card.pdf" },
    { id: 3, name: "Factory License", uploaded: "2024-02-15", expiry: "2025-02-14", status: "Pending", file: "factory_lic.pdf" },
    { id: 4, name: "EPR Authorization Certificate", uploaded: "2024-03-01", expiry: "2025-03-01", status: "Verified", file: "epr_auth.pdf" }
  ],
  collectors: [
    { id: "COL001", name: "Ramesh Patil", company: "Patil Waste Mgmt", mobile: "91XXXXXXXX", gst: "27AABCP5678B1ZM", address: "123, MG Road, Pune" },
    { id: "COL002", name: "Suresh Yadav", company: "Yadav Scrap Works", mobile: "90XXXXXXXX", gst: "27AACSY9012C2ZP", address: "45, Shivaji Nagar, Mumbai" },
    { id: "COL003", name: "Priya Nair", company: "Nair Eco Solutions", mobile: "89XXXXXXXX", gst: "32AADPN3456D3ZQ", address: "78, Marine Drive, Kochi" },
    { id: "COL004", name: "Vikram Singh", company: "Singh Recycling", mobile: "88XXXXXXXX", gst: "07AAESVS7890E4ZR", address: "12, Connaught Place, Delhi" }
  ],
  purchases: [
    { id: "PUR001", date: "2025-01-05", collector: "COL001", type: "PET Bottles", qty: 500, rate: 18, quality: "Grade A" },
    { id: "PUR002", date: "2025-01-12", collector: "COL002", type: "HDPE", qty: 320, rate: 22, quality: "Grade B" },
    { id: "PUR003", date: "2025-01-18", collector: "COL001", type: "LDPE Film", qty: 200, rate: 14, quality: "Grade A" },
    { id: "PUR004", date: "2025-02-03", collector: "COL003", type: "PP Granules", qty: 450, rate: 25, quality: "Grade A" },
    { id: "PUR005", date: "2025-02-14", collector: "COL004", type: "PVC Scrap", qty: 180, rate: 12, quality: "Grade C" },
    { id: "PUR006", date: "2025-03-01", collector: "COL002", type: "PET Bottles", qty: 600, rate: 19, quality: "Grade A" }
  ],
  buyers: [
    { id: "BUY001", company: "EcoPlast Industries", contact: "Mohit Jain", gst: "27AAHCE1234F1ZA", address: "Phase 2, MIDC, Pune", mobile: "97XXXXXXXX", email: "mohit@ecoplast.in" },
    { id: "BUY002", company: "GreenMat Corp", contact: "Anita Desai", gst: "27AAGCG5678G2ZB", address: "Andheri East, Mumbai", mobile: "96XXXXXXXX", email: "anita@greenmat.in" },
    { id: "BUY003", company: "PlastiForm Ltd.", contact: "Rajesh Kumar", gst: "06AAHPF9012H3ZC", address: "Sector 58, Gurugram", mobile: "95XXXXXXXX", email: "rajesh@plastiform.in" }
  ],
  deliveries: [
    { id: "DEL001", buyer: "BUY001", date: "2025-01-20", qty: 800, status: "Delivered" },
    { id: "DEL002", buyer: "BUY002", date: "2025-02-10", qty: 500, status: "In Transit" },
    { id: "DEL003", buyer: "BUY001", date: "2025-02-25", qty: 1200, status: "Delivered" },
    { id: "DEL004", buyer: "BUY003", date: "2025-03-05", qty: 400, status: "Pending" }
  ],
  payments: [
    { id: "PAY001", company: "EcoPlast Industries", invoice: "INV-2025-001", amount: 184000, date: "2025-01-25", status: "Paid" },
    { id: "PAY002", company: "GreenMat Corp", invoice: "INV-2025-002", amount: 97500, date: "2025-02-15", status: "Pending" },
    { id: "PAY003", company: "PlastiForm Ltd.", invoice: "INV-2025-003", amount: 68200, date: "2025-02-20", status: "Overdue" },
    { id: "PAY004", company: "EcoPlast Industries", invoice: "INV-2025-004", amount: 215600, date: "2025-03-01", status: "Paid" }
  ],
  eprCerts: [
    { id: 1, company: "EcoPlast Industries", required: 500, sent: 480, certNo: "EPR-MH-2025-001", date: "2025-01-01", remarks: "Pending balance 20 MT" },
    { id: 2, company: "GreenMat Corp", required: 300, sent: 300, certNo: "EPR-MH-2025-002", date: "2025-02-01", remarks: "Complete" },
    { id: 3, company: "PlastiForm Ltd.", required: 200, sent: 150, certNo: "EPR-DL-2025-003", date: "2025-02-15", remarks: "Partial - follow up needed" }
  ],
  notifications: [
    { id: 1, msg: "New purchase record added for COL001", time: "2 min ago", color: "var(--green)" },
    { id: 2, msg: "Invoice INV-2025-003 is overdue", time: "1 hr ago", color: "var(--red)" },
    { id: 3, msg: "Delivery DEL002 is in transit", time: "3 hrs ago", color: "var(--blue)" },
    { id: 4, msg: "Factory License expires in 30 days", time: "1 day ago", color: "var(--yellow)" }
  ]
};
