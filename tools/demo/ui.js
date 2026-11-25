import {icon} from './icons.js';
export {icon};
export let assets={};
export function setAssets(value){assets=value;}
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const clone=x=>structuredClone(x);
export const num=n=>Number(n).toLocaleString('zh-CN');
export function image(name,classes='avatar'){return assets[name]?`<img class="${classes}" src="${assets[name].src}" alt="">`:`<span class="asset-fallback" aria-hidden="true">${icon('layers')}</span>`;}
export function button(action,label,ico='',kind='',attrs=''){return `<button type="button" class="${kind}" data-action="${action}" ${attrs}>${ico?icon(ico):''}${label}</button>`;}
export function options(values,selected){return values.map(v=>`<option value="${esc(v)}" ${String(v)===String(selected)?'selected':''}>${esc(v)}</option>`).join('');}
export function field(label,control){return `<label class="field">${label}${control}</label>`;}
export function select(label,values,value,bind){return field(label,`<select data-bind="${bind}" aria-label="${esc(label)}">${options(values,value)}</select>`);}
export function input(label,value,bind,type='text',attrs=''){return field(label,`<input type="${type}" data-bind="${bind}" value="${esc(value)}" aria-label="${esc(label)}" ${attrs}>`);}
export function check(label,value,bind){return `<label class="check"><input type="checkbox" data-bind="${bind}" ${value?'checked':''}>${label}</label>`;}
export function pill(label,kind=''){return `<span class="status ${kind}">${label}</span>`;}
export function heading(title,subtitle='',actions=''){return `<div class="page-heading"><div><h1>${title}</h1>${subtitle?`<p>${subtitle}</p>`:''}</div><div class="row">${actions}</div></div>`;}
export function panel(title,body,actions='',extra=''){return `<section class="panel ${extra}"><div class="panel-head"><h2>${title}</h2><div class="row">${actions}</div></div><div class="panel-body">${body}</div></section>`;}
export function toast(message){const node=document.getElementById('toasts');node.innerHTML=`<div class="toast">${esc(message)}</div>`;clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.replaceChildren(),3200);}
let cleanupModal;
export function modal(title,body,{wide=false,submit='',onSubmit,setup,footer}={}){const dlg=document.getElementById('modal');if(dlg.open)dlg.close();cleanupModal?.();dlg.classList.toggle('wide',wide);document.getElementById('modal-title').textContent=title;document.getElementById('modal-body').innerHTML=body;document.getElementById('modal-footer').innerHTML=footer??`${button('','关闭','','','data-close')}${submit?`<button type="submit" class="primary">${submit}</button>`:''}`;const close=()=>dlg.close();dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);document.getElementById('modal-form').onsubmit=e=>{e.preventDefault();onSubmit?.(new FormData(e.target),close,dlg);};dlg.onclose=()=>{cleanupModal?.();cleanupModal=null;};dlg.showModal();cleanupModal=setup?.(dlg,close);return dlg;}
export function confirm(title,description,onConfirm){modal(title,`<p>${esc(description)}</p>`,{submit:'确认',onSubmit:(_,close)=>{close();onConfirm();}});}
export function download(name,data,type='application/json'){const blob=new Blob([typeof data==='string'?data:JSON.stringify(data,null,2)],{type});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已生成 '+name);}
export async function copy(text){try{await navigator.clipboard.writeText(text);toast('已复制');}catch{modal('复制内容',`<textarea readonly aria-label="待复制内容">${esc(text)}</textarea>`,{setup:d=>{d.querySelector('textarea').select();}});}}
export function jsonPreview(title,value){modal(title,`<p class="hint warning">演示文件，不可作为游戏阵容码或正式项目文件使用。</p><pre class="mono" style="margin-top:15px">${esc(JSON.stringify(value,null,2))}</pre>`,{wide:true,submit:'下载演示 JSON',onSubmit:(_,close)=>{download('fireschain-demo.json',value);close();}});}
export function pickAsset(kind,current,onPick){const list=Object.entries(assets).filter(([,v])=>kind==='character'?!!v.rarity:!v.rarity).map(([name])=>name);if(kind==='soul')list.push('散件');modal(kind==='soul'?'选择御魂':'选择式神',`<div class="search">${icon('search')}<input aria-label="搜索素材" placeholder="搜索名称"></div><div class="asset-picker"></div>`,{setup(d,close){const grid=d.querySelector('.asset-picker'),search=d.querySelector('input');const draw=()=>{grid.innerHTML=list.filter(n=>n.includes(search.value.trim())).map(n=>`<button type="button" class="asset-choice ${n===current?'selected':''}" data-choice="${n}">${image(n)}<span>${n}</span>${assets[n]?.rarity?`<small>${assets[n].rarity}</small>`:''}</button>`).join('');};draw();search.oninput=draw;grid.onclick=e=>{const b=e.target.closest('[data-choice]');if(b){onPick(b.dataset.choice);close();}};}});}
