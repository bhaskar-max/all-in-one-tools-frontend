// CONFIG
const backendURL = "https://all-in-one-tools-backend.onrender.com"; // <- set your backend URL

// small helper for status messages
function showStatus(id, msg, color = "#2f8a5f") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.color = color;
  el.classList.add("show");
  setTimeout(()=> el.classList.remove("show"), 4000);
}

/* ------------------------------
   Existing tools handlers (keep your current code)
   - encryptBtn, decryptBtn, mergeBtn, convertImgBtn etc.
   Assume these event listeners already present in your site and unchanged.
   ------------------------------ */

/* ------------------------------
   New Tools
   ------------------------------ */

/* 1) Text-to-Speech (browser) */
async function populateVoices() {
  const sel = document.getElementById("ttsVoice");
  sel.innerHTML = "";
  const voices = speechSynthesis.getVoices();
  voices.forEach(v=>{
    const o = document.createElement("option");
    o.value = v.name;
    o.textContent = `${v.name} (${v.lang})`;
    sel.appendChild(o);
  });
}
populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = populateVoices;

document.getElementById("ttsSpeakBtn").addEventListener("click", ()=>{
  const text = document.getElementById("ttsText").value.trim();
  if(!text) return showStatus("ttsStatus","Type some text first","crimson");
  const voiceName = document.getElementById("ttsVoice").value;
  const u = new SpeechSynthesisUtterance(text);
  if (voiceName) {
    const v = speechSynthesis.getVoices().find(x=>x.name===voiceName);
    if(v) u.voice = v;
  }
  speechSynthesis.speak(u);
  showStatus("ttsStatus","Speaking...");
});
document.getElementById("ttsStopBtn").addEventListener("click", ()=>{
  speechSynthesis.cancel();
  showStatus("ttsStatus","Stopped","#888");
});

/* 2) QR Code Generator (qrcode lib) */
document.getElementById("qrGenBtn").addEventListener("click", async ()=>{
  const text = document.getElementById("qrText").value.trim();
  const el = document.getElementById("qrCanvas");
  el.innerHTML = "";
  if(!text) return showStatus("qrStatus","Enter text or URL","crimson");
  try{
    await QRCode.toCanvas(el, text, { width: 240 });
    showStatus("qrStatus","QR generated");
  }catch(e){
    console.error(e); showStatus("qrStatus","QR generation failed","crimson");
  }
});
document.getElementById("qrDownloadBtn").addEventListener("click", ()=>{
  const el = document.querySelector("#qrCanvas canvas");
  if(!el) return showStatus("qrStatus","Generate first","crimson");
  const url = el.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url; a.download = "qr.png"; a.click();
});

/* 3) Password Generator */
function generatePassword(len, opts){
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{};:,.<>/?";
  let pool = "";
  if(opts.upper) pool += upper;
  if(opts.lower) pool += lower;
  if(opts.digits) pool += digits;
  if(opts.symbols) pool += symbols;
  if(!pool) return "";
  let pw = "";
  for(let i=0;i<len;i++) pw += pool[Math.floor(Math.random()*pool.length)];
  return pw;
}
document.getElementById("pwdGenBtn").addEventListener("click", ()=>{
  const len = Number(document.getElementById("pwdLen").value) || 16;
  const opts = {
    upper: document.getElementById("pwdUpper").checked,
    lower: document.getElementById("pwdLower").checked,
    digits: document.getElementById("pwdDigits").checked,
    symbols: document.getElementById("pwdSymbols").checked
  };
  const p = generatePassword(len, opts);
  document.getElementById("pwdResult").value = p;
});
document.getElementById("pwdCopyBtn").addEventListener("click", async ()=>{
  const v = document.getElementById("pwdResult").value;
  if(!v) return showStatus("pwdResult","No password to copy","crimson");
  await navigator.clipboard.writeText(v);
  showStatus("pwdResult","Password copied");
});

/* 4) Image Compressor (client-side) */
let lastCompressedBlob = null;
document.getElementById("compressBtn").addEventListener("click", ()=>{
  const f = document.getElementById("compFile").files[0];
  if(!f) return showStatus("compStatus","Select an image","crimson");
  const quality = Number(document.getElementById("compQuality").value) / 100;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img,0,0);
      canvas.toBlob(blob => {
        lastCompressedBlob = blob;
        document.getElementById("compPreview").src = URL.createObjectURL(blob);
        showStatus("compStatus","Compressed successfully");
      }, 'image/jpeg', quality);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(f);
});
document.getElementById("downloadCompressedBtn").addEventListener("click", ()=>{
  if(!lastCompressedBlob) return showStatus("compStatus","Compress first","crimson");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(lastCompressedBlob);
  a.download = "compressed.jpg";
  a.click();
});

/* 5) Currency converter (uses exchangerate.host free API) */
async function populateCurrencySelects(){
  try{
    const res = await fetch("https://api.exchangerate.host/symbols");
    const json = await res.json();
    const symbols = Object.keys(json.symbols);
    const from = document.getElementById("curFrom");
    const to = document.getElementById("curTo");
    symbols.forEach(s=>{
      const o1 = document.createElement("option"); o1.value=s; o1.textContent=s;
      const o2 = document.createElement("option"); o2.value=s; o2.textContent=s;
      from.appendChild(o1); to.appendChild(o2);
    });
    from.value = "USD"; to.value = "INR";
  }catch(e){ console.error(e) }
}
populateCurrencySelects();

document.getElementById("curConvertBtn").addEventListener("click", async ()=>{
  const amt = Number(document.getElementById("curAmount").value) || 1;
  const from = document.getElementById("curFrom").value;
  const to = document.getElementById("curTo").value;
  if(!from||!to) return showStatus("curResult","Select currencies","crimson");
  try{
    showStatus("curResult","Fetching rate...", "#2b7de9");
    const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amt}`);
    const j = await res.json();
    if(j && j.result!=null){
      showStatus("curResult", `${amt} ${from} = ${j.result.toFixed(4)} ${to}`, "#0a7a5f");
    }else showStatus("curResult","Conversion failed","crimson");
  }catch(e){ console.error(e); showStatus("curResult","Conversion failed","crimson"); }
});

/* 6) YouTube Preview & Embed (NO downloader) */
function parseYouTubeId(url){
  try{
    const u = new URL(url);
    if(u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if(u.hostname.includes("youtu.be")) return u.pathname.slice(1);
  }catch(e){}
  return null;
}
document.getElementById("ytPreviewBtn").addEventListener("click", ()=>{
  const url = document.getElementById("ytUrl").value.trim();
  const id = parseYouTubeId(url);
  const target = document.getElementById("ytPreview");
  target.innerHTML = "";
  if(!id) return showStatus("ytStatus","Invalid YouTube URL","crimson");
  const iframe = document.createElement("iframe");
  iframe.width = "100%"; iframe.height = "200";
  iframe.src = `https://www.youtube.com/embed/${id}`;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  target.appendChild(iframe);
  showStatus("ytStatus","Preview loaded");
});
document.getElementById("ytCopyBtn").addEventListener("click", ()=>{
  const url = document.getElementById("ytUrl").value.trim();
  if(!url) return showStatus("ytStatus","Paste a YouTube URL","crimson");
  navigator.clipboard.writeText(url);
  showStatus("ytStatus","Link copied");
});

/* 7) File converter: TXT -> PDF using jsPDF */
document.getElementById("txtToPdfBtn").addEventListener("click", async ()=>{
  const f = document.getElementById("txtFile").files[0];
  if(!f) return showStatus("txtConvStatus","Choose a TXT file","crimson");
  const txt = await f.text();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:'pt', format:'a4'});
  const margin = 40;
  const lineHeight = 14;
  const pageWidth = doc.internal.pageSize.getWidth() - margin*2;
  const words = doc.splitTextToSize(txt, pageWidth);
  doc.text(words, margin, margin);
  const blob = doc.output('blob');
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = f.name.replace(/\.txt$/i,"") + ".pdf";
  a.click();
  showStatus("txtConvStatus","Converted to PDF");
});

/* 8) AI Chat (frontend) -> backend /api/chat proxy (optional)
   - If your backend has a /api/chat route that proxies to OpenAI, this will work.
   - Otherwise, it shows an informative message.
*/
document.getElementById("aiSendBtn").addEventListener("click", async ()=>{
  const prompt = document.getElementById("aiPrompt").value.trim();
  if(!prompt) return showStatus("aiStatus","Type a prompt","crimson");
  showStatus("aiStatus","Thinking...", "#2b7de9");
  try{
    const res = await fetch(`${backendURL}/api/chat`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ prompt })
    });
    if(res.ok){
      const j = await res.json();
      document.getElementById("aiResponse").textContent = j.text || JSON.stringify(j);
      showStatus("aiStatus","Response received");
    } else {
      const txt = await res.text();
      document.getElementById("aiResponse").textContent = "AI backend not enabled. " + txt;
      showStatus("aiStatus","No backend", "crimson");
    }
  }catch(e){ console.error(e); showStatus("aiStatus","AI request failed","crimson"); }
});
document.getElementById("aiClearBtn").addEventListener("click", ()=>{
  document.getElementById("aiResponse").textContent = "";
  document.getElementById("aiPrompt").value = "";
});

/* initialize search-friendly defaults/sample values */
document.addEventListener("DOMContentLoaded", ()=>{
  // keep existing initializations if any
});
