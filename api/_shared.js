const crypto=require('node:crypto');
const BASE_URL=process.env.SUPABASE_URL, KEY=process.env.SUPABASE_SERVICE_ROLE_KEY, SECRET=process.env.SESSION_SECRET;
function configured(){return BASE_URL&&KEY&&SECRET&&SECRET.length>=32}
async function query(table,params={},method='GET',body){const u=new URL('/rest/v1/'+table,BASE_URL);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));const r=await fetch(u,{method,headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});const t=await r.text();if(!r.ok)throw Error('Banco: '+r.status+' '+t.slice(0,300));return t?JSON.parse(t):null}
function sign(value){return crypto.createHmac('sha256',SECRET).update(value).digest('base64url')}
function cookie(user){const data=Buffer.from(JSON.stringify({id:user.id,usuario:user.usuario,exp:Date.now()+8*3600e3})).toString('base64url');return data+'.'+sign(data)}
function session(req){const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('copasul_uni_session='))?.split('=')[1];if(!token)return null;const [data,sig]=token.split('.');if(!data||!sig)return null;const expected=sign(data);if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;const obj=JSON.parse(Buffer.from(data,'base64url').toString());return obj.exp>Date.now()?obj:null}
async function auth(req){const s=session(req);if(!s)return null;const rows=await query('usuarios',{select:'id,usuario,nome,status,funcao,permissoes',id:'eq.'+s.id,limit:'1'});return rows?.[0]?.status==='APROVADO'&&rows[0].usuario===s.usuario?rows[0]:null}
function send(res,status,obj){res.status(status).setHeader('Cache-Control','no-store').json(obj)}
module.exports={configured,query,cookie,auth,send};
