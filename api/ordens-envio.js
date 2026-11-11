const crypto=require('node:crypto');
const {configured,query,auth,send}=require('./_shared');
const BASE=process.env.SUPABASE_URL,KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
const validEmail=x=>typeof x==='string'&&x.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
async function download(path){const r=await fetch(BASE+'/storage/v1/object/oc-documentos/'+encodeURIComponent(path),{headers:{apikey:KEY,Authorization:'Bearer '+KEY}});if(!r.ok)throw Error('Não foi possível recuperar o PDF');const b=Buffer.from(await r.arrayBuffer());if(b.length>5242880||b.subarray(0,5).toString()!=='%PDF-')throw Error('PDF inválido');return b.toString('base64')}
module.exports=async(req,res)=>{let claimed=false,id;try{
 if(req.method!=='POST')return send(res,405,{error:'Método não permitido'});
 if(!configured())return send(res,503,{error:'Configuração privada indisponível'});
 const u=await auth(req);if(!u)return send(res,401,{error:'Sessão expirada. Entre novamente.'});
 id=req.body?.id;if(!uuid(id)||req.body?.confirmar!==true)return send(res,400,{error:'Confirme o envio da ordem selecionada.'});
 const scriptUrl=String(process.env.OC_APPS_SCRIPT_URL||'').trim();
 const scriptToken=String(process.env.OC_APPS_SCRIPT_TOKEN||'').trim();
 if(!/^https:\/\/script\.google\.com\/macros\/s\//.test(scriptUrl)||scriptToken.length<32)return send(res,503,{error:'Configure OC_APPS_SCRIPT_URL e OC_APPS_SCRIPT_TOKEN na Vercel.'});
 const rows=await query('oc_anexos',{select:'id,numero,fornecedor,remetente,destinatarios,assunto,mensagem,arquivo_path,arquivo_nome,status_envio',id:'eq.'+id,limit:'1'});
 const oc=rows?.[0];if(!oc)return send(res,404,{error:'Ordem não encontrada'});
 const to=oc.destinatarios.split(',').map(x=>x.trim()).filter(Boolean);
 if(!validEmail(oc.remetente)||!to.length||to.length>20||!to.every(validEmail))return send(res,400,{error:'Remetente ou destinatários inválidos'});
 if(oc.status_envio==='enviado')return send(res,409,{error:'Esta ordem já foi enviada. Não é possível disparar novamente.'});
 if(oc.status_envio==='enviando')return send(res,409,{error:'Envio em processamento. Verifique o histórico antes de tentar novamente.'});
 // Claim atômico: impede dois disparos simultâneos da mesma ordem.
 const lock=await query('rpc/oc_reservar_envio',{},'POST',{p_id:id,p_usuario:u.nome||u.usuario});
 if(lock!==true)return send(res,409,{error:'Ordem já enviada ou em processamento. Atualize o histórico.'});claimed=true;
 const pdf=await download(oc.arquivo_path);
 const payload={action:'enviarOrdemCompraEmail',args:[{token:scriptToken,id,remetente:oc.remetente,destinatarios:to,assunto:oc.assunto,mensagem:oc.mensagem||`Encaminho em anexo a ordem de compra ${oc.numero}, fornecedor ${oc.fornecedor}.`,numero:oc.numero,fornecedor:oc.fornecedor,arquivoNome:oc.arquivo_nome.replace(/[\r\n]/g,' ').slice(0,180)||'ordem-compra.pdf',pdfBase64:pdf}]};
 const r=await fetch(scriptUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow',signal:AbortSignal.timeout(60000)});
 const raw=await r.text();let response;try{response=JSON.parse(raw)}catch{throw Error('Apps Script não retornou JSON. Verifique a publicação e as permissões do Web App.')} 
 if(!r.ok||response.sucesso!==true){const msg=String(response.mensagem||'Apps Script recusou o envio').slice(0,300);await query('oc_anexos',{id:'eq.'+id},'PATCH',{status_envio:'falhou',erro_envio:msg});claimed=false;return send(res,502,{error:'Não foi possível enviar: '+msg})}
 await query('oc_anexos',{id:'eq.'+id},'PATCH',{status_envio:'enviado',enviado_em:new Date().toISOString(),enviado_por:u.nome||u.usuario,provedor_id:response.id||null,erro_envio:null});claimed=false;
 return send(res,200,{ok:true,id:response.id||null,remetente_real:response.remetenteReal||'Conta autorizada do Apps Script',reply_to:oc.remetente});
 }catch(e){console.error('OC envio',e);if(claimed){/* Falha incerta: NÃO liberar automaticamente o envio, para evitar duplicatas. */}return send(res,500,{error:claimed?'O resultado do envio é incerto. Verifique o provedor e os logs antes de qualquer nova tentativa.':'Não foi possível processar o envio: '+String(e.message||'erro').slice(0,180)})}};
