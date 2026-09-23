const KEY="vx7x_db_v1";
const seed={
 users:[
  {id:"u1",name:"VX7X Admin",role:"admin",login:"admin",password:"admin123"},
  {id:"u2",name:"Rahul Trainer",role:"trainer",login:"rahul",password:"trainer123",trainerId:"t1"},
  {id:"u3",name:"Priya Parent",role:"parent",login:"priya",password:"parent123",studentIds:["s1"]}
 ],
 trainers:[{id:"t1",name:"Rahul Trainer",phone:"919876543210"},{id:"t2",name:"Sneha Trainer",phone:"919876543211"}],
 batches:[
  {id:"b1",name:"Kids Bollywood",style:"Bollywood",trainerId:"t1",days:"Mon, Wed, Fri",time:"5:00 PM - 6:00 PM",fee:2000},
  {id:"b2",name:"Adults Garba",style:"Garba & Dandiya",trainerId:"t2",days:"Tue, Thu",time:"7:00 PM - 8:00 PM",fee:2500}
 ],
 students:[
  {id:"s1",name:"Aarav Sharma",parent:"Priya Sharma",phone:"919999999999",batchId:"b1",joined:"2026-09-01",status:"Active"},
  {id:"s2",name:"Anaya Rao",parent:"Meena Rao",phone:"918888888888",batchId:"b2",joined:"2026-09-02",status:"Active"}
 ],
 attendance:[
  {id:"a1",studentId:"s1",batchId:"b1",date:"2026-09-22",status:"Present"},
  {id:"a2",studentId:"s2",batchId:"b2",date:"2026-09-22",status:"Present"}
 ],
 payments:[
  {id:"p1",studentId:"s1",amount:2000,month:"September 2026",date:"2026-09-05",status:"Paid",ref:"DEMO123"}
 ],
 announcements:[
  {id:"n1",title:"Garba & Dandiya Classes",body:"Classes start 1st October 2026. Contact the studio for batch details.",date:"2026-09-22",target:"Everyone"}
 ],
 settings:{studio:"VX7X DANCE & FITNESS STUDIO",phone:"918977030101",whatsapp:"918977030101",upi:"",qr:""}
};
let db=JSON.parse(localStorage.getItem(KEY)||"null")||seed;
let session=JSON.parse(localStorage.getItem("vx7x_session")||"null");
let page="home";
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const student=id=>db.students.find(x=>x.id===id);
const batch=id=>db.batches.find(x=>x.id===id);
const trainer=id=>db.trainers.find(x=>x.id===id);
const wa=n=>`https://wa.me/${String(n).replace(/\D/g,"")}`;
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
function loginView(){
 return `<div class="login"><div class="login-card">
 <div class="logo">VX7X</div><h1>Studio Management</h1><p class="muted">Admin • Trainer • Parent</p>
 <form onsubmit="doLogin(event)">
 <div class="field"><label>Username</label><input id="login" required></div>
 <div class="field"><label>Password</label><input id="password" type="password" required></div>
 <button class="btn" style="width:100%">Login</button></form>
 <div class="demo"><b>Demo accounts</b><br>Admin: admin / admin123<br>Trainer: rahul / trainer123<br>Parent: priya / parent123</div>
 </div></div>`;
}
function shell(){
 const menus=session.role==="admin"
 ? [["home","Dashboard"],["students","Students"],["batches","Batches"],["attendance","Attendance"],["fees","Fees"],["updates","Updates"],["reports","Reports"],["settings","Settings"]]
 : session.role==="trainer"
 ? [["home","Dashboard"],["batches","My Batches"],["attendance","Attendance"],["updates","Updates"]]
 : [["home","Home"],["attendance","Attendance"],["fees","Fees"],["updates","Updates"],["profile","Profile"]];
 return `<div class="shell"><div class="top"><div><b>VX7X</b> <span class="muted" style="color:#bbb">DANCE & FITNESS</span></div><div>${esc(session.name)} · <button class="btn secondary" onclick="logout()">Logout</button></div></div>
 <div class="layout"><aside class="side">${menus.map(m=>`<button class="${page===m[0]?"active":""}" onclick="go('${m[0]}')">${m[1]}</button>`).join("")}</aside>
 <main class="main">${renderPage()}</main></div>
 <nav class="bottom">${menus.slice(0,5).map(m=>`<button onclick="go('${m[0]}')">${m[1]}</button>`).join("")}</nav></div>`;
}
function adminStats(){
 const collected=db.payments.filter(p=>p.status==="Paid").reduce((a,p)=>a+Number(p.amount),0);
 const pending=db.students.filter(s=>!db.payments.some(p=>p.studentId===s.id&&p.status==="Paid")).length;
 return `<div class="grid">
 <div class="card">Students<div class="stat">${db.students.length}</div></div>
 <div class="card">Trainers<div class="stat">${db.trainers.length}</div></div>
 <div class="card">Batches<div class="stat">${db.batches.length}</div></div>
 <div class="card">Collected<div class="stat">${money(collected)}</div></div>
 </div>`;
}
function home(){
 if(session.role==="admin") return `${adminStats()}<br><div class="cards2"><div class="card"><div class="section-title"><h2>Quick Actions</h2></div><div class="actions"><button class="btn" onclick="go('students')">+ Add Student</button><button class="btn" onclick="go('batches')">+ Add Batch</button><button class="btn" onclick="go('attendance')">✓ Attendance</button><button class="btn" onclick="go('fees')">₹ Fees</button><button class="btn" onclick="go('updates')">📢 Update</button></div></div><div class="card"><h2>Recent Updates</h2>${updatesList(3)}</div></div>`;
 if(session.role==="trainer"){
  const b=db.batches.filter(b=>b.trainerId===session.trainerId);
  return `<h1>Welcome, ${esc(session.name)}</h1><div class="grid">${b.map(x=>`<div class="card"><b>${esc(x.name)}</b><p>${esc(x.days)}<br>${esc(x.time)}</p><button class="btn" onclick="go('attendance')">Mark Attendance</button></div>`).join("")}</div><br><div class="card"><h2>Updates</h2>${updatesList(5)}</div>`;
 }
 const kids=(session.studentIds||[]).map(student).filter(Boolean);
 return `<h1>Welcome, ${esc(session.name)}</h1>${kids.map(s=>parentCard(s)).join("")}<br><div class="card"><h2>Studio Updates</h2>${updatesList(5)}</div>`;
}
function parentCard(s){
 const b=batch(s.batchId); const paid=db.payments.some(p=>p.studentId===s.id&&p.status==="Paid"&&p.month==="September 2026");
 const att=db.attendance.filter(a=>a.studentId===s.id); const present=att.filter(a=>a.status==="Present").length; const pct=att.length?Math.round(present/att.length*100):0;
 return `<div class="card"><h2>${esc(s.name)}</h2><p>${esc(b?.name||"")} • ${esc(b?.time||"")}</p><div class="grid"><div>Attendance<div class="stat">${pct}%</div></div><div>September Fee<div class="stat">${paid?"Paid":money(b?.fee)}</div></div></div><br><div class="actions"><button class="btn" onclick="go('fees')">Pay Fees</button><button class="btn secondary" onclick="go('attendance')">Attendance</button><a class="btn success" href="${wa(db.settings.whatsapp)}" target="_blank">WhatsApp Studio</a></div></div>`;
}
function studentsPage(){
 return `<div class="section-title"><h1>Students</h1><button class="btn" onclick="studentForm()">+ Add Student</button></div>
 <div class="table-wrap"><table class="table"><tr><th>Name</th><th>Parent</th><th>Batch</th><th>Phone</th><th>Status</th><th></th></tr>${db.students.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.parent)}</td><td>${esc(batch(s.batchId)?.name||"")}</td><td><a href="${wa(s.phone)}" target="_blank">${esc(s.phone)}</a></td><td><span class="pill green">${esc(s.status)}</span></td><td><button class="btn secondary" onclick="studentForm('${s.id}')">Edit</button></td></tr>`).join("")}</table></div>`;
}
function studentForm(id){
 const s=id?student(id):{name:"",parent:"",phone:"",batchId:db.batches[0]?.id||"",joined:new Date().toISOString().slice(0,10),status:"Active"};
 document.getElementById("modal")?.remove();
 const d=document.createElement("div");d.id="modal";d.innerHTML=`<div class="login" style="position:fixed;inset:0;background:#0008;z-index:20"><div class="login-card"><h2>${id?"Edit":"Add"} Student</h2><form onsubmit="saveStudent(event,'${id||""}')">
 <div class="form-grid"><div class="field"><label>Name</label><input id="sn" value="${esc(s.name)}" required></div><div class="field"><label>Parent</label><input id="sp" value="${esc(s.parent)}" required></div><div class="field"><label>WhatsApp/Phone</label><input id="sph" value="${esc(s.phone)}" required></div><div class="field"><label>Batch</label><select id="sb">${db.batches.map(b=>`<option value="${b.id}" ${b.id===s.batchId?"selected":""}>${esc(b.name)}</option>`).join("")}</select></div></div>
 <div class="actions"><button class="btn">Save</button><button type="button" class="btn secondary" onclick="document.getElementById('modal').remove()">Cancel</button></div></form></div></div>`;document.body.appendChild(d);
}
function saveStudent(e,id){e.preventDefault();const x={id:id||"s"+Date.now(),name:sn.value,parent:sp.value,phone:sph.value,batchId:sb.value,joined:new Date().toISOString().slice(0,10),status:"Active"};if(id)Object.assign(student(id),x);else db.students.push(x);save();document.getElementById("modal").remove();render();}
function batchesPage(){
 const canAdd=session.role==="admin";
 const bs=session.role==="trainer"?db.batches.filter(b=>b.trainerId===session.trainerId):db.batches;
 return `<div class="section-title"><h1>${session.role==="trainer"?"My Batches":"Batches"}</h1>${canAdd?`<button class="btn" onclick="batchForm()">+ Add Batch</button>`:""}</div><div class="grid">${bs.map(b=>`<div class="card"><h2>${esc(b.name)}</h2><p>${esc(b.style)}<br>${esc(b.days)}<br>${esc(b.time)}</p><p>Trainer: ${esc(trainer(b.trainerId)?.name||"")}</p><p>Students: ${db.students.filter(s=>s.batchId===b.id).length}</p><b>${money(b.fee)}/month</b></div>`).join("")}</div>`;
}
function batchForm(){
 document.getElementById("modal")?.remove();const d=document.createElement("div");d.id="modal";d.innerHTML=`<div class="login" style="position:fixed;inset:0;background:#0008;z-index:20"><div class="login-card"><h2>Add Batch</h2><form onsubmit="saveBatch(event)"><div class="field"><label>Batch Name</label><input id="bn" required></div><div class="field"><label>Dance Style</label><input id="bs" required></div><div class="field"><label>Trainer</label><select id="bt">${db.trainers.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select></div><div class="field"><label>Days & Time</label><input id="bd" placeholder="Mon, Wed • 5 PM - 6 PM" required></div><div class="field"><label>Monthly Fee</label><input id="bf" type="number" required></div><div class="actions"><button class="btn">Save</button><button type="button" class="btn secondary" onclick="modal.remove()">Cancel</button></div></form></div></div>`;document.body.appendChild(d);
}
function saveBatch(e){e.preventDefault();db.batches.push({id:"b"+Date.now(),name:bn.value,style:bs.value,trainerId:bt.value,days:bd.value,time:"",fee:Number(bf.value)});save();modal.remove();render();}
function attendancePage(){
 let students=db.students;if(session.role==="trainer")students=students.filter(s=>db.batches.some(b=>b.id===s.batchId&&b.trainerId===session.trainerId));if(session.role==="parent")students=(session.studentIds||[]).map(student).filter(Boolean);
 const today=new Date().toISOString().slice(0,10);
 return `<div class="section-title"><h1>Attendance</h1>${session.role!=="parent"?`<input type="date" id="attDate" value="${today}" onchange="render()">`:""}</div>${session.role==="parent"?students.map(s=>attendanceHistory(s)).join(""):`<div class="table-wrap"><table class="table"><tr><th>Student</th><th>Batch</th><th>Present</th><th>Absent</th><th>Mark Today</th></tr>${students.map(s=>{const a=db.attendance.filter(x=>x.studentId===s.id),p=a.filter(x=>x.status==="Present").length,ab=a.filter(x=>x.status==="Absent").length;return `<tr><td>${esc(s.name)}</td><td>${esc(batch(s.batchId)?.name||"")}</td><td>${p}</td><td>${ab}</td><td><button class="btn success" onclick="markAtt('${s.id}','Present')">Present</button> <button class="btn danger" onclick="markAtt('${s.id}','Absent')">Absent</button></td></tr>`}).join("")}</table></div>`}`;
}
function attendanceHistory(s){const a=db.attendance.filter(x=>x.studentId===s.id);return `<div class="card"><h2>${esc(s.name)}</h2>${a.length?a.slice().reverse().map(x=>`<div class="notice">${x.date} — <span class="pill ${x.status==="Present"?"green":"red"}">${x.status}</span></div>`).join(""):"<div class='empty'>No attendance recorded yet.</div>"}</div>`}
function markAtt(sid,status){const date=document.getElementById("attDate")?.value||new Date().toISOString().slice(0,10);const old=db.attendance.find(a=>a.studentId===sid&&a.date===date);if(old)old.status=status;else db.attendance.push({id:"a"+Date.now(),studentId:sid,batchId:student(sid).batchId,date,status});save();render();}
function feesPage(){
 let students=db.students;if(session.role==="parent")students=(session.studentIds||[]).map(student).filter(Boolean);
 return `<div class="section-title"><h1>Fees</h1></div>${session.role==="parent"?`${students.map(feeCard).join("")}<div class="card"><h2>Pay via QR</h2>${db.settings.qr?`<img class="qr" src="${db.settings.qr}">`:"<div class='notice'>Admin has not uploaded a QR yet.</div>"}${db.settings.upi?`<p>UPI: <b>${esc(db.settings.upi)}</b></p>`:""}<p class="muted">After payment, send the transaction reference to the studio for verification.</p><a class="btn success" target="_blank" href="${wa(db.settings.whatsapp)}">WhatsApp Payment Proof</a></div>`:`<div class="table-wrap"><table class="table"><tr><th>Student</th><th>Batch Fee</th><th>Payment</th><th>Status</th><th>Action</th></tr>${students.map(s=>{const b=batch(s.batchId),ps=db.payments.filter(p=>p.studentId===s.id);const p=ps[ps.length-1];return `<tr><td>${esc(s.name)}</td><td>${money(b?.fee)}</td><td>${p?money(p.amount):"—"}</td><td><span class="pill ${p?.status==="Paid"?"green":"yellow"}">${p?.status||"Pending"}</span></td><td><button class="btn success" onclick="recordPayment('${s.id}')">Record Payment</button></td></tr>`}).join("")}</table></div>`}`;
}
function feeCard(s){const b=batch(s.batchId),p=db.payments.filter(x=>x.studentId===s.id).slice(-1)[0];return `<div class="card"><h2>${esc(s.name)}</h2><p>${esc(b?.name||"")}</p><h2>${p?.status==="Paid"?"Paid":money(b?.fee)+" Due"}</h2>${p?`<p>Last payment: ${money(p.amount)} • ${esc(p.date)}</p>`:""}<div class="actions"><a class="btn" href="${db.settings.upi?`upi://pay?pa=${encodeURIComponent(db.settings.upi)}&pn=${encodeURIComponent(db.settings.studio)}&am=${b?.fee||0}&cu=INR`:"#"}">Pay Now</a><button class="btn secondary" onclick="paymentForm('${s.id}')">Submit Payment</button></div></div>`}
function recordPayment(sid){paymentForm(sid,true)}
function paymentForm(sid,admin=false){const s=student(sid);document.getElementById("modal")?.remove();const d=document.createElement("div");d.id="modal";d.innerHTML=`<div class="login" style="position:fixed;inset:0;background:#0008;z-index:20"><div class="login-card"><h2>${admin?"Record":"Submit"} Payment</h2><form onsubmit="savePayment(event,'${sid}',${admin})"><div class="field"><label>Amount</label><input id="pa" type="number" value="${batch(s.batchId)?.fee||0}" required></div><div class="field"><label>Reference</label><input id="pr" placeholder="UPI transaction ID"></div><div class="actions"><button class="btn">Submit</button><button type="button" class="btn secondary" onclick="modal.remove()">Cancel</button></div></form></div></div>`;document.body.appendChild(d)}
function savePayment(e,sid,admin){e.preventDefault();db.payments.push({id:"p"+Date.now(),studentId:sid,amount:Number(pa.value),month:"September 2026",date:new Date().toISOString().slice(0,10),status:admin?"Paid":"Verification Pending",ref:pr.value});save();modal.remove();render();alert(admin?"Payment recorded":"Payment submitted for verification");}
function updatesList(n=10){return db.announcements.slice().reverse().slice(0,n).map(x=>`<div class="notice"><b>${esc(x.title)}</b><br>${esc(x.body)}<br><small class="muted">${esc(x.date)}</small></div>`).join("")||"<div class='empty'>No updates.</div>"}
function updatesPage(){return `<div class="section-title"><h1>Studio Updates</h1>${session.role==="admin"?`<button class="btn" onclick="updateForm()">+ Post Update</button>`:""}</div>${updatesList(50)}`}
function updateForm(){document.getElementById("modal")?.remove();const d=document.createElement("div");d.id="modal";d.innerHTML=`<div class="login" style="position:fixed;inset:0;background:#0008;z-index:20"><div class="login-card"><h2>Post Update</h2><form onsubmit="saveUpdate(event)"><div class="field"><label>Title</label><input id="ut" required></div><div class="field"><label>Message</label><textarea id="ub" rows="5" required></textarea></div><div class="actions"><button class="btn">Publish</button><button type="button" class="btn secondary" onclick="modal.remove()">Cancel</button></div></form></div></div>`;document.body.appendChild(d)}
function saveUpdate(e){e.preventDefault();db.announcements.push({id:"n"+Date.now(),title:ut.value,body:ub.value,date:new Date().toISOString().slice(0,10),target:"Everyone"});save();modal.remove();render();}
function reportsPage(){const paid=db.payments.filter(p=>p.status==="Paid").reduce((a,p)=>a+Number(p.amount),0);const pending=db.payments.filter(p=>p.status!=="Paid").reduce((a,p)=>a+Number(p.amount),0);return `<h1>Reports</h1><div class="grid"><div class="card">Students<div class="stat">${db.students.length}</div></div><div class="card">Paid<div class="stat">${money(paid)}</div></div><div class="card">Pending<div class="stat">${money(pending)}</div></div><div class="card">Announcements<div class="stat">${db.announcements.length}</div></div></div><br><div class="card"><h2>Payment History</h2><div class="table-wrap"><table class="table"><tr><th>Date</th><th>Student</th><th>Amount</th><th>Status</th><th>Reference</th></tr>${db.payments.map(p=>`<tr><td>${p.date}</td><td>${esc(student(p.studentId)?.name||"")}</td><td>${money(p.amount)}</td><td>${esc(p.status)}</td><td>${esc(p.ref)}</td></tr>`).join("")}</table></div></div>`}
function settingsPage(){return `<h1>Settings</h1><div class="card"><form onsubmit="saveSettings(event)"><div class="field"><label>Studio Name</label><input id="setStudio" value="${esc(db.settings.studio)}"></div><div class="field"><label>WhatsApp Number (country code, no +)</label><input id="setWa" value="${esc(db.settings.whatsapp)}"></div><div class="field"><label>UPI ID</label><input id="setUpi" value="${esc(db.settings.upi)}" placeholder="yourupi@bank"></div><div class="field"><label>Payment QR Image</label><input id="setQr" type="file" accept="image/*"></div>${db.settings.qr?`<img class="qr" src="${db.settings.qr}">`:""}<br><br><button class="btn">Save Settings</button></form></div>`}
function saveSettings(e){e.preventDefault();db.settings.studio=setStudio.value;db.settings.whatsapp=setWa.value;db.settings.upi=setUpi.value;const f=setQr.files[0];if(f){const r=new FileReader();r.onload=()=>{db.settings.qr=r.result;save();render()};r.readAsDataURL(f)}else{save();render()}}
function profilePage(){const kids=(session.studentIds||[]).map(student).filter(Boolean);return `<h1>Profile</h1><div class="card"><h2>${esc(session.name)}</h2><p>Parent account</p><h3>Children</h3>${kids.map(s=>`<div class="notice">${esc(s.name)} • ${esc(batch(s.batchId)?.name||"")}</div>`).join("")}</div>`}
function renderPage(){switch(page){case"students":return studentsPage();case"batches":return batchesPage();case"attendance":return attendancePage();case"fees":return feesPage();case"updates":return updatesPage();case"reports":return session.role==="admin"?reportsPage():home();case"settings":return session.role==="admin"?settingsPage():home();case"profile":return profilePage();default:return home()}}
function render(){document.getElementById("app").innerHTML=session?shell():loginView()}
function doLogin(e){e.preventDefault();const u=db.users.find(x=>x.login===login.value&&x.password===password.value);if(!u)return alert("Invalid login");session=u;localStorage.setItem("vx7x_session",JSON.stringify(session));page="home";render()}
function logout(){session=null;localStorage.removeItem("vx7x_session");render()}
function go(p){page=p;render()}
render();