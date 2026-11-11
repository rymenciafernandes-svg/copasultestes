const crypto=require('node:crypto');
const {configured,query,auth,send}=require('./_shared');
const BASE=process.env.SUPABASE_URL,KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
const trim=(x,n=500)=>typeof x==='string'?x.trim().slice(0,n):'';
const email=x=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)&&x.length<=254;
async function storage(path,method,body){const url=BASE+'/storage/v1/object/'+(method==='GET'?'sign/':'')+'oc-documentos/'+path;const r=await fetch(url,{method,headers:{apikey:KEY,Authorization:'Bearer '+KEY,...(method==='POST'&&body?.type==='Buffer'?{'Content-Type':'application/pdf','x-upsert':'false'}:{'Content-Type':'application/json'})},body:body?.type==='Buffer'?Buffer.from(body.data):body?JSON.stringify(body):undefined});const t=await r.text();if(!r.ok)throw Error('Arquivo: '+r.status+' '+t.slice(0,180));return JSON.parse(t)}
module.exports=async(req,res)=>{try{
 if(!configured())return send(res,503,{error:'Configuração privada indisponível'});
 const user=await auth(req);if(!user)return send(res,401,{error:'Sessão expirada. Entre novamente no sistema.'});
 if(req.method==='GET'){
  if(req.query?.file){const id=trim(req.query.file,60);if(!/^[0-9a-f-]{36}$/i.test(id))return send(res,400,{error:'Documento inválido'});const rows=await query('oc_anexos',{select:'arquivo_path',id:'eq.'+id,limit:'1'});if(!rows?.[0])return send(res,404,{error:'Documento não encontrado'});const result=await storage(rows[0].arquivo_path,'POST',{expiresIn:60});return send(res,200,{url:BASE+'/storage/v1'+result.signedURL})}
  const rows=await query('oc_anexos',{select:'id,numero,fornecedor,data_compra,produtos,valor_total,remetente,destinatarios,assunto,mensagem,arquivo_nome,status_envio,enviado_em,enviado_por,erro_envio,criado_por,criado_em',order:'criado_em.desc',limit:'200'});return send(res,200,{items:rows});
 }
 if(req.method!=='POST')return send(res,405,{error:'Método não permitido'});
 const b=req.body||{};const numero=trim(b.numero,80),fornecedor=trim(b.fornecedor,160),data=trim(b.data,10),remetente=trim(b.remetente,254),destinatarios=trim(b.destinatarios,1000),assunto=trim(b.assunto,200),produtos=trim(b.produtos,3000),mensagem=trim(b.mensagem,5000);
 const to=destinatarios.split(/[;,]/).map(x=>x.trim()).filter(Boolean);
 if(!numero||!fornecedor||!/^\d{4}-\d{2}-\d{2}$/.test(data)||!email(remetente)||!to.length||to.length>20||!to.every(email)||!assunto)return send(res,400,{error:'Preencha número, fornecedor, data, e-mails válidos e assunto.'});
 const pdf=trim(b.pdf,7500000);if(!/^JVBER/i.test(pdf)||pdf.length>7000000)return send(res,400,{error:'Selecione um PDF válido de até 5 MB.'});
 const bytes=Buffer.from(pdf,'base64');if(bytes.length>5242880||bytes.subarray(0,5).toString()!=='%PDF-')return send(res,400,{error:'O anexo deve ser um PDF de até 5 MB.'});
 const path=crypto.randomUUID()+'.pdf';await storage(path,'POST',{type:'Buffer',data:[...bytes]});
 try{const value=b.valor===''||b.valor==null?null:Number(b.valor);if(value!==null&&(!Number.isFinite(value)||value<0||value>999999999999))throw Error('Valor inválido');const rows=await query('oc_anexos',{},'POST',{numero,fornecedor,data_compra:data,produtos,valor_total:value,remetente,destinatarios:to.join(', '),assunto,mensagem,arquivo_path:path,arquivo_nome:trim(b.nomeArquivo,180)||numero+'.pdf',criado_por:user.nome||user.usuario});return send(res,200,{ok:true,item:rows[0]})}catch(err){await fetch(BASE+'/storage/v1/object/oc-documentos/'+path,{method:'DELETE',headers:{apikey:KEY,Authorization:'Bearer '+KEY}}).catch(()=>{});throw err}
 }catch(err){console.error('OC API',err);return send(res,500,{error:'Não foi possível concluir a operação. Consulte os logs da Vercel.'})}};
