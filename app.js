const backendURL = "https://all-in-one-tools-backend.onrender.com"; // Replace with your Render backend URL

// ===== HELPER FUNCTION =====
function showStatus(elementId, message, color) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.style.color = color;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

// ===== ENCRYPTION =====
document.getElementById("encryptBtn").addEventListener("click", async () => {
  const file = document.getElementById("encFile").files[0];
  const key = document.getElementById("encKey").value;
  if (!file || !key) return alert("Select a file and enter a key!");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("key", key);

  try {
    const res = await fetch(`${backendURL}/api/encrypt`, { method: "POST", body: formData });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `encrypted_${file.name}.enc`;
      a.click();
      showStatus("encStatus", "✅ File encrypted successfully!", "#44bd32");
    } else showStatus("encStatus", "❌ Encryption failed!", "#e84118");
  } catch (err) {
    console.error(err);
    showStatus("encStatus", "❌ Encryption failed!", "#e84118");
  }
});

// ===== DECRYPTION =====
document.getElementById("decryptBtn").addEventListener("click", async () => {
  const file = document.getElementById("encFile").files[0];
  const key = document.getElementById("encKey").value;
  if (!file || !key) return alert("Select a file and enter a key!");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("key", key);
  formData.append("originalName", file.name.replace(/^encrypted_\d+_/, "").replace(/\.enc$/, "")); // send original name

  try {
    const res = await fetch(`${backendURL}/api/decrypt`, { method: "POST", body: formData });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/^encrypted_\d+_/, "").replace(/\.enc$/, "");
      a.click();
      showStatus("encStatus", "✅ File decrypted successfully!", "#44bd32");
    } else showStatus("encStatus", "❌ Decryption failed!", "#e84118");
  } catch (err) {
    console.error(err);
    showStatus("encStatus", "❌ Decryption failed!", "#e84118");
  }
});

// ===== PDF MERGER =====
document.getElementById("mergeBtn").addEventListener("click", async () => {
  const files = document.getElementById("pdfFiles").files;
  if (files.length < 2) return alert("Select at least 2 PDFs!");

  const formData = new FormData();
  for (let f of files) formData.append("pdfs", f);

  try {
    const res = await fetch(`${backendURL}/api/pdf/merge`, { method: "POST", body: formData });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      showStatus("pdfStatus", "✅ PDFs merged successfully!", "#44bd32");
    } else showStatus("pdfStatus", "❌ Merge failed!", "#e84118");
  } catch (err) {
    console.error(err);
    showStatus("pdfStatus", "❌ Merge failed!", "#e84118");
  }
});

// ===== IMAGE CONVERTER =====
document.getElementById("convertBtn").addEventListener("click", async () => {
  const file = document.getElementById("imgFile").files[0];
  const format = document.getElementById("imgFormat").value;
  if (!file) return alert("Please select an image!");

  const formData = new FormData();
  formData.append("image", file);
  formData.append("format", format);

  try {
    const res = await fetch(`${backendURL}/api/convert`, { method: "POST", body: formData });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const originalName = file.name.split(".")[0];
      a.download = `${originalName}.${format}`;
      a.click();
      showStatus("imgStatus", "✅ Image converted successfully!", "#44bd32");
    } else showStatus("imgStatus", "❌ Conversion failed!", "#e84118");
  } catch (err) {
    console.error(err);
    showStatus("imgStatus", "❌ Conversion failed!", "#e84118");
  }
});
