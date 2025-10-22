const backendURL = "https://all-in-one-tools-backend.onrender.com";


// ===== ALERT FUNCTION =====
function showAlert(message, type = "success") {
  const alertBox = document.getElementById("alertBox");
  alertBox.textContent = message;
  alertBox.style.background = type === "error" ? "#e74c3c" : "#27ae60";
  alertBox.style.opacity = "1";
  setTimeout(() => { alertBox.style.opacity = "0"; }, 2500);
}

// ========== ENCRYPTION ==========
document.getElementById("encryptBtn").addEventListener("click", async () => {
  const file = document.getElementById("encFile").files[0];
  if (!file) return showAlert("Please select a file!", "error");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${backendURL}/api/encrypt`, { method: "POST", body: formData });
  if (res.ok) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "encrypted.enc";
    a.click();
    document.getElementById("encStatus").textContent = "✅ File encrypted successfully!";
    showAlert("File encrypted successfully!");
  } else {
    document.getElementById("encStatus").textContent = "❌ Encryption failed!";
    showAlert("Encryption failed!", "error");
  }
});

document.getElementById("decryptBtn").addEventListener("click", async () => {
  const file = document.getElementById("encFile").files[0];
  if (!file) return showAlert("Please select the encrypted file!", "error");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${backendURL}/api/decrypt`, { method: "POST", body: formData });
  if (res.ok) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decrypted_file";
    a.click();
    document.getElementById("encStatus").textContent = "✅ File decrypted successfully!";
    showAlert("File decrypted successfully!");
  } else {
    document.getElementById("encStatus").textContent = "❌ Decryption failed!";
    showAlert("Decryption failed!", "error");
  }
});

// ========== PDF MERGE ==========
document.getElementById("mergeBtn").addEventListener("click", async () => {
  const files = document.getElementById("pdfFiles").files;
  if (files.length < 2) return showAlert("Select at least 2 PDFs!", "error");

  const formData = new FormData();
  for (let f of files) formData.append("pdfs", f);

  const res = await fetch(`${backendURL}/api/pdf/merge`, { method: "POST", body: formData });
  if (res.ok) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    a.click();
    document.getElementById("pdfStatus").textContent = "✅ PDFs merged successfully!";
    showAlert("PDFs merged successfully!");
  } else {
    document.getElementById("pdfStatus").textContent = "❌ Merge failed!";
    showAlert("Merge failed!", "error");
  }
});

// ========== IMAGE CONVERTER ==========
document.getElementById("convertBtn").addEventListener("click", async () => {
  const file = document.getElementById("imgFile").files[0];
  const format = document.getElementById("imgFormat").value;
  if (!file) return showAlert("Please select an image!", "error");

  const formData = new FormData();
  formData.append("image", file);
  formData.append("format", format);

  const res = await fetch(`${backendURL}/api/convert`, { method: "POST", body: formData });
  if (res.ok) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${format}`;
    a.click();
    document.getElementById("imgStatus").textContent = "✅ Image converted successfully!";
    showAlert("Image converted successfully!");
  } else {
    document.getElementById("imgStatus").textContent = "❌ Conversion failed!";
    showAlert("Conversion failed!", "error");
  }
});
