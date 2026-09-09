const express = require("express");
const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "CHANGE_THIS_ADMIN_KEY";

const db = new Database("complaints.db");
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT,
  address TEXT NOT NULL,
  problem TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New Request',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function ticket(){
  return "OWS-" + crypto.randomInt(1000000, 9999999);
}
function admin(req,res,next){
  if(req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(401).json({error:"Unauthorized"});
  next();
}

app.post("/api/complaints", (req,res)=>{
  const {name,phone,service,date,address,problem}=req.body||{};
  if(!name||!phone||!service||!address||!problem) return res.status(400).json({error:"Missing required fields"});
  if(!/^\d{10}$/.test(phone)) return res.status(400).json({error:"Invalid mobile number"});
  let t;
  for(let i=0;i<10;i++){
    t=ticket();
    try{
      db.prepare(`INSERT INTO complaints(ticket,name,phone,service,date,address,problem)
        VALUES(?,?,?,?,?,?,?)`).run(t,name,phone,service,date||"",address,problem);
      break;
    }catch(e){ if(i===9) return res.status(500).json({error:"Could not create complaint"}); }
  }
  res.json({ticket:t,status:"New Request"});
});

app.get("/api/complaints/:ticket",(req,res)=>{
  const x=db.prepare(`SELECT ticket,service,status,created_at,updated_at FROM complaints WHERE ticket=?`).get(req.params.ticket.toUpperCase());
  if(!x) return res.status(404).json({error:"Complaint not found"});
  res.json(x);
});

app.get("/api/admin/complaints",admin,(req,res)=>{
  const rows=db.prepare(`SELECT * FROM complaints ORDER BY id DESC`).all();
  res.json(rows);
});

app.patch("/api/admin/complaints/:ticket",admin,(req,res)=>{
  const allowed=["New Request","Contacted","Technician Assigned","In Progress","Completed","Cancelled"];
  const status=req.body?.status;
  if(!allowed.includes(status)) return res.status(400).json({error:"Invalid status"});
  const r=db.prepare(`UPDATE complaints SET status=?,updated_at=CURRENT_TIMESTAMP WHERE ticket=?`)
    .run(status,req.params.ticket.toUpperCase());
  if(!r.changes) return res.status(404).json({error:"Complaint not found"});
  res.json({ok:true});
});

app.get("/admin", (req,res)=>res.sendFile(path.join(__dirname,"admin.html")));
app.listen(PORT,()=>console.log(`Out of Warranty live system running on port ${PORT}`));
