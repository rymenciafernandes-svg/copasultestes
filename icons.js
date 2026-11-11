/* Ícones visuais: substituição não invasiva de emojis no conteúdo exibido. */
(function () {
'use strict';
const paths = {
 shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
 unlock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.5-2"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
 message:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8z"/>',
 cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2 2-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21h-3v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06-2-2 .06-.06A1.65 1.65 0 0 0 7.4 15a1.65 1.65 0 0 0-1.51-1H5v-3h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06 2-2 .06.06A1.65 1.65 0 0 0 10.09 6a1.65 1.65 0 0 0 1-1.51V4h3v.49a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06 2 2-.06.06A1.65 1.65 0 0 0 18.6 10a1.65 1.65 0 0 0 1.51 1H21v3h-.89A1.65 1.65 0 0 0 19.4 15z"/>',
 tag:'<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-8.2-8.2V3h9.4l8.8 8.8a2 2 0 0 1 0 1.6z"/><circle cx="7.5" cy="7.5" r="1"/>',
 logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14-5L4 8M4 4v4h4M4 13a8 8 0 0 0 14 5l2-2M20 20v-4h-4"/>',
 search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
 camera:'<path d="M14 4h-4L8 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z"/><circle cx="12" cy="14" r="3"/>',
 printer:'<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8"/>',
 check:'<path d="m20 6-11 11-5-5"/>',
 warning:'<path d="m10.3 3.9-8.2 14a2 2 0 0 0 1.7 3h16.4a2 2 0 0 0 1.7-3l-8.2-14a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
 chart:'<path d="M3 3v18h18M7 16v-4M12 16V7M17 16v-7"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
 building:'<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01"/>',
 folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 truck:'<path d="M1 5h14v12H1zM15 9h4l4 4v4h-8M5 17a2 2 0 1 0 4 0M17 17a2 2 0 1 0 4 0"/>',
 phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.8L7.1 10a16 16 0 0 0 6.9 6.9l1.7-1.9a2 2 0 0 1 1.8-.6l2.8.5a2 2 0 0 1 1.7 2z"/>',
 edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4z"/>',
 package:'<path d="m12 2 9 5-9 5-9-5 9-5zM3 7v10l9 5 9-5V7M12 12v10"/>',
 id:'<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M5 16c1-3 5-3 6 0M14 9h5M14 13h5"/>',
 pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2"/>',
 send:'<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>'
};
const entries = [
 ['🛡️','shield'],['🔓','unlock'],['👥','users'],['🖼️','image'],['📄','file'],['📋','file'],['📅','calendar'],['💬','message'],['🛒','cart'],['⚙️','settings'],['🏷️','tag'],['🚪','logout'],['🔄','refresh'],['🔍','search'],['📷','camera'],['🖨️','printer'],['➕','plus'],['💾','save'],['✔️','check'],['✅','check'],['✓','check'],['⚠️','warning'],['❌','x'],['📊','chart'],['🎯','target'],['📩','mail'],['✉️','mail'],['🏢','building'],['📁','folder'],['🚚','truck'],['📱','phone'],['📞','phone'],['✏️','edit'],['📦','package'],['🪪','id'],['📍','pin'],['💰','chart'],['🧑‍💼','users'],['▶','send'],['🟢','check'],['🟡','warning'],['🟠','warning'],['🔴','warning']
].sort((a,b)=>b[0].length-a[0].length);
const pattern = new RegExp(entries.map(x=>x[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
function makeIcon(name) {
 const span=document.createElement('span');span.className='stock-line-icon';span.setAttribute('aria-hidden','true');
 span.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
 return span;
}
function update(root){
 if(root.nodeType===3){
  const parent=root.parentElement;if(!parent||parent.closest('script,style,svg,textarea,.stock-line-icon'))return;
  const str=root.nodeValue;if(!pattern.test(str)){pattern.lastIndex=0;return;}pattern.lastIndex=0;
  if(parent.closest('option')){root.nodeValue=str.replace(pattern,'').trim();return;}
  const fragment=document.createDocumentFragment();let last=0;str.replace(pattern,(match,pos)=>{
   if(pos>last)fragment.appendChild(document.createTextNode(str.slice(last,pos)));
   fragment.appendChild(makeIcon(entries.find(x=>x[0]===match)[1]));last=pos+match.length;
  });if(last<str.length)fragment.appendChild(document.createTextNode(str.slice(last)));
  root.replaceWith(fragment);return;
 }
 if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
 if(root.nodeType===1&&root.matches('script,style,svg,textarea,.stock-line-icon'))return;
 Array.from(root.childNodes).forEach(update);
}
let queued=false;const pending=new Set();
function flush(){queued=false;const list=Array.from(pending);pending.clear();list.forEach(update);}
function schedule(node){pending.add(node);if(!queued){queued=true;queueMicrotask(flush);}}
function start(){update(document.body);new MutationObserver(changes=>{
 changes.forEach(c=>{if(c.type==='characterData')schedule(c.target);else c.addedNodes.forEach(schedule);});
 }).observe(document.body,{childList:true,characterData:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
