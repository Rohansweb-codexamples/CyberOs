const express=require('express');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');

const app=express();
const PORT=process.env.PORT||3000;
const DB=path.join(__dirname,'business-users.json');
const sessions=new Map();

app.use(cors({origin:true,credentials:true}));
app.use(express.json({limit:'100kb'}));
app.use(cookieParser());
app.use(express.static(__dirname));

function loadUsers(){
  try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return []}
}
function saveUsers(users){
  try{fs.writeFileSync(DB,JSON.stringify(users,null,2))}catch{}
}
function hash(password,salt=crypto.randomBytes(16).toString('hex')){
  return salt+':'+crypto.scryptSync(password,salt,64).toString('hex');
}
function verify(password,stored){
  const [salt,key]=stored.split(':');
  if(!salt||!key)return false;
  const actual=crypto.scryptSync(password,salt,64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual),Buffer.from(key));
}
function validEmail(v){return typeof v==='string'&&/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v)}
function sessionUser(req){
  const id=req.cookies.cyberos_session;
  return id?sessions.get(id):null;
}

app.get('/api/health',(req,res)=>res.json({ok:true,service:'CyberOS Business Server',time:new Date().toISOString()}));

app.post('/api/register',(req,res)=>{
  const name=String(req.body.name||'').trim();
  const email=String(req.body.email||'').trim().toLowerCase();
  const password=String(req.body.password||'');
  if(name.length<2)return res.status(400).json({error:'Enter your name.'});
  if(!validEmail(email))return res.status(400).json({error:'Enter a valid email.'});
  if(password.length<8)return res.status(400).json({error:'Password must be at least 8 characters.'});
  const users=loadUsers();
  if(users.some(u=>u.email===email))return res.status(409).json({error:'An account with this email already exists.'});
  const user={id:crypto.randomUUID(),name,email,passwordHash:hash(password),createdAt:new Date().toISOString()};
  users.push(user);saveUsers(users);
  const sid=crypto.randomUUID();sessions.set(sid,user.id);
  res.cookie('cyberos_session',sid,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:1000*60*60*24*7});
  res.json({message:'Business account created.',user:{id:user.id,name:user.name,email:user.email}});
});

app.post('/api/login',(req,res)=>{
  const email=String(req.body.email||'').trim().toLowerCase();
  const password=String(req.body.password||'');
  const user=loadUsers().find(u=>u.email===email);
  if(!user||!verify(password,user.passwordHash))return res.status(401).json({error:'Invalid email or password.'});
  const sid=crypto.randomUUID();sessions.set(sid,user.id);
  res.cookie('cyberos_session',sid,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:1000*60*60*24*7});
  res.json({message:'Signed in.',user:{id:user.id,name:user.name,email:user.email}});
});

app.post('/api/logout',(req,res)=>{
  const sid=req.cookies.cyberos_session;sessions.delete(sid);
  res.clearCookie('cyberos_session');res.json({message:'Signed out.'});
});

app.get('/api/me',(req,res)=>{
  const id=sessionUser(req);
  const user=id&&loadUsers().find(u=>u.id===id);
  if(!user)return res.status(401).json({authenticated:false});
  res.json({authenticated:true,user:{id:user.id,name:user.name,email:user.email}});
});

app.get('/api',(req,res)=>res.json({service:'CyberOS Business Server',endpoints:['/api/health','/api/register','/api/login','/api/logout','/api/me']}));
app.listen(PORT,()=>console.log('CyberOS Business Server listening on '+PORT));