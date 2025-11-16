// static/script.js
const checkBtn = document.getElementById("checkBtn");
const urlInput = document.getElementById("urlInput");
const resultBox = document.getElementById("result");

checkBtn.addEventListener("click", async () => {
  const url = (urlInput.value || "").trim();
  if (!url) {
    alert("Please enter a URL");
    return;
  }

  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `<div>🔎 Analyzing <strong>${escapeHtml(url)}</strong> ...</div>`;

  try {
    const resp = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await resp.json();

    if (data.error) {
      resultBox.innerHTML = `<div class="bad">❌ Error: ${escapeHtml(data.error)}</div>`;
      return;
    }

    const label = data.label;
    const conf = data.confidence ? (data.confidence * 100).toFixed(1) + "%" : "N/A";
    const reasons = data.reasons || [];

    const labelHtml = label === "Phishing"
      ? `<h3 class="bad">🚨 ${label}</h3>`
      : `<h3 class="good">✅ ${label}</h3>`;

    const reasonsHtml = reasons.length ? `<div class="reasons"><strong>Reasons:</strong><ul>${reasons.map(r => `<li>${escapeHtml(r)}</li>`).join("")}</ul></div>` : "";

    resultBox.innerHTML = `
      ${labelHtml}
      <div class="conf">Confidence: ${conf}</div>
      ${reasonsHtml}
      <div style="margin-top:12px;"><a href="${escapeAttr(url)}" target="_blank" rel="noopener" style="color:#fff;text-decoration:underline">Open link in new tab</a></div>
    `;
  } catch (err) {
    console.error(err);
    resultBox.innerHTML = `<div class="bad">⚠️ Network or server error. Try again.</div>`;
  }
});

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, t=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[t])); }
function escapeAttr(s){ return escapeHtml(s).replace(/"/g, '&quot;'); }
