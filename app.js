// -----------------------
// UTILS
// -----------------------

function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function shortAddress(addr) {
  if (!addr || addr.length < 8) return addr || "";
  return addr.slice(0, 4) + "..." + addr.slice(-4);
}

// -----------------------
// CONTRACT ADDRESS COPY
// -----------------------

const caBox = document.getElementById("caBox");
const caText = document.getElementById("caText");

caBox.addEventListener("click", async () => {
  const text = caText.textContent.trim();
  if (!navigator.clipboard) {
    alert("Address: " + text);
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    // flash border to orange for feedback
    const prevBorder = caBox.style.borderColor;
    caBox.style.borderColor = "var(--ds-orange)";
    setTimeout(() => {
      caBox.style.borderColor = prevBorder || "#000000";
    }, 1200);
  } catch (e) {
    console.error(e);
  }
});

// -----------------------
// WALLET INTEGRATION (FRONTEND ONLY – PHANTOM EXAMPLE)
// -----------------------

let connectedWallet = null;
let isHolder = false; // should be set from backend balance check

const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletStatusEl = document.getElementById("walletStatus");

async function connectWallet() {
  try {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
      alert(
        "Phantom wallet not found. Please install Phantom (or integrate wallet adapter for more wallets)."
      );
      return;
    }
    const resp = await provider.connect();
    connectedWallet = resp.publicKey.toString();
    walletStatusEl.textContent = "Connected: " + shortAddress(connectedWallet);
    connectWalletBtn.textContent = "Wallet Connected";

    // TODO: call your backend to check actual $DSANTA balance.
    // Example:
    // const res = await fetch(`/api/balance/dsanta?wallet=${connectedWallet}`);
    // const data = await res.json();
    // isHolder = data.balance >= 150000;
    // For now, simulate:
    isHolder = true;

    updateHolderUI();
  } catch (e) {
    console.error(e);
    walletStatusEl.textContent = "Wallet connection failed";
  }
}

function updateHolderUI() {
  const pfpStatus = document.getElementById("pfpStatus");
  if (connectedWallet && isHolder) {
    pfpStatus.textContent =
      "Holder verified – you can generate your Dank Santa PFP.";
  } else if (connectedWallet) {
    pfpStatus.textContent =
      "Connected wallet doesn't meet 150,000 $DSANTA threshold.";
  } else {
    pfpStatus.textContent =
      "Connect your wallet and hold 150,000 $DSANTA to unlock.";
  }
}

connectWalletBtn.addEventListener("click", connectWallet);

// -----------------------
// PFP LAB – UPLOAD + GENERATE (FRONTEND STUB)
// -----------------------

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const uploadHint = document.getElementById("uploadHint");
const generatePfpBtn = document.getElementById("generatePfpBtn");
const picturePreview = document.getElementById("picturePreview");
const pfpStyle = document.getElementById("pfpStyle");

let uploadedFile = null;

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  uploadedFile = file || null;
  if (file) {
    uploadHint.textContent = "Selected: " + file.name;
  } else {
    uploadHint.textContent = "No file selected yet.";
  }
});

generatePfpBtn.addEventListener("click", async () => {
  const pfpStatus = document.getElementById("pfpStatus");
  if (!connectedWallet) {
    pfpStatus.textContent = "Connect your wallet first.";
    return;
  }
  if (!isHolder) {
    pfpStatus.textContent =
      "This wallet doesn't meet the 150,000 $DSANTA requirement.";
    return;
  }
  if (!uploadedFile) {
    pfpStatus.textContent = "Please upload a selfie or avatar first.";
    return;
  }

  pfpStatus.textContent =
    "Summoning Dank Santa... (this should call your backend AI service)";
  generatePfpBtn.disabled = true;

  // FRONTEND MOCK: show the uploaded image directly.
  const reader = new FileReader();
  reader.onload = () => {
    picturePreview.innerHTML = "";
    const img = document.createElement("img");
    img.src = reader.result;
    img.alt = "Generated PFP";
    picturePreview.appendChild(img);
    pfpStatus.textContent =
      "Mock preview shown. Wire this to your AI endpoint for real outputs.";
    generatePfpBtn.disabled = false;
  };
  reader.onerror = () => {
    pfpStatus.textContent = "Failed to read file.";
    generatePfpBtn.disabled = false;
  };
  reader.readAsDataURL(uploadedFile);

  // Example real flow:
  // const formData = new FormData();
  // formData.append("image", uploadedFile);
  // formData.append("wallet", connectedWallet);
  // formData.append("style", pfpStyle.value);
  // const res = await fetch("/api/dank-santa/pfp", { method: "POST", body: formData });
  // const data = await res.json();
  // picturePreview.innerHTML = `<img src="${data.imageUrl}" alt="Dank Santa PFP" />`;
});

// -----------------------
// NFT RECENT MINTS – placeholder hook
// -----------------------

async function fetchRecentMints() {
  // TODO: Replace this with a real call to LaunchMyNFT / your backend.
  // const res = await fetch("/api/nfts/recent");
  // const data = await res.json();
  // renderRecentMints(data);
}

function renderRecentMints(nfts) {
  const grid = document.getElementById("recentMintsGrid");
  grid.innerHTML = "";
  nfts.forEach((nft) => {
    const card = document.createElement("div");
    card.className = "nft-card";
    card.innerHTML = `
      <img src="${nft.image}" alt="${nft.name}" />
      <div class="nft-card-body">
        <div class="nft-card-title">${nft.name}</div>
        <div class="nft-card-owner">Owner: ${shortAddress(nft.owner)}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// -----------------------
// WHEEL GAME – DEMO LOGIC
// -----------------------

const wheelInner = document.getElementById("wheelInner");
const spinBtn = document.getElementById("spinBtn");
const wagerInput = document.getElementById("wagerInput");
const wheelStatus = document.getElementById("wheelStatus");
const modePill = document.getElementById("modePill");
const demoToggleBtn = document.getElementById("demoToggleBtn");

let isDemoMode = true;
let spinning = false;

demoToggleBtn.addEventListener("click", () => {
  isDemoMode = !isDemoMode;
  updateModePill();
});

function updateModePill() {
  if (isDemoMode) {
    modePill.textContent =
      "Demo Mode · Connect wallet to play for real $DSANTA";
  } else {
    modePill.textContent =
      "Real Mode (stub) · Use backend + tx to make this live";
  }
}

updateModePill();

spinBtn.addEventListener("click", async () => {
  if (spinning) return;
  const wager = parseFloat(wagerInput.value || "0");
  if (!Number.isFinite(wager) || wager <= 0) {
    wheelStatus.textContent = "Enter a valid wager amount in $DSANTA.";
    return;
  }

  if (!isDemoMode) {
    if (!connectedWallet) {
      wheelStatus.textContent = "Connect your wallet to spin in real mode.";
      return;
    }
    // In real mode, you'd call your backend:
    // const res = await fetch("/api/wheel/spin", {
    //   method:"POST",
    //   body: JSON.stringify({ wallet: connectedWallet, wager })
    // });
    // const data = await res.json();
    // const outcome = data.outcome; // "naughty" | "nice" | "dank"
    // const angle = data.angle;
    // animateWheel(angle, outcome, wager, false);
  }

   // DEMO: pick outcome based on target odds
  // Naughty: 49%, Nice: 49%, DANK: 2%
  const r = Math.random();
  let outcome;
  if (r < 0.49) outcome = "naughty";
  else if (r < 0.98) outcome = "nice";
  else outcome = "dank";

  // base angles for each segment (starting reference)
  const baseAngles = {
    naughty: 60, // center of top segment
    nice: 180, // bottom-left
    dank: 300, // bottom-right
  };

  const base = baseAngles[outcome];
  // multiply to get a few full spins
  const extraSpins = 3 + Math.floor(Math.random() * 2);
  const finalAngle = 360 * extraSpins + base;

  animateWheel(finalAngle, outcome, wager, isDemoMode);
});

function animateWheel(angle, outcome, wager, demoMode) {
  spinning = true;
  wheelInner.style.transition =
    "transform 3s cubic-bezier(0.23, 1, 0.32, 1)";
  wheelInner.style.transform = `rotate(${angle}deg)`;

  let status;
  if (outcome === "naughty") {
    status = `Naughty! You lose your wager of ${wager} $DSANTA.`;
  } else if (outcome === "nice") {
    status = `Nice! You win 2× your wager: ${wager * 2} $DSANTA.`;
  } else {
    status = `DANK!! You win 5× your wager: ${wager * 5} $DSANTA.`;
  }
  wheelStatus.textContent = "Spinning...";

  setTimeout(() => {
    wheelStatus.textContent = (demoMode ? "[Demo] " : "[Real] ") + status;
    spinning = false;
    pushBannerEvent(outcome, wager);
  }, 3000);
}

// -----------------------
// WIN/LOSS BANNER – MOCK EVENTS
// -----------------------

const bannerTrack = document.getElementById("bannerTrack");

const sampleAddrs = [
  "4Hk3nFYuZ2pQ9FxRcv9dNg1sL9mA",
  "8DqPL78s9vks1eGaFpZzCk3r1MnT",
  "2Mx9sPq7Ytbk3QvwL1sD8a9Z0yKx",
  "9FsK12pTqL90vNsZ7cW14rDpQzRq",
  "3PwRjZc87nL0tVc5sDcQ9wPxkNa7",
];

function randomAddr() {
  return sampleAddrs[Math.floor(Math.random() * sampleAddrs.length)];
}

function pushBannerEvent(outcome, wager) {
  const addr = shortAddress(randomAddr());
  let text;
  let cls;
  if (outcome === "naughty") {
    cls = "result-naughty";
    text = `is on the naughty list and loses ${wager} $DSANTA.`;
  } else if (outcome === "nice") {
    cls = "result-nice";
    text = `is on the nice list and just won ${wager * 2} $DSANTA!`;
  } else {
    cls = "result-dank";
    text = `is DANK and won ${wager * 5} $DSANTA!!`;
  }

  const item = document.createElement("div");
  item.className = "banner-item";
  item.innerHTML = `<span class="addr">${addr}</span> <span class="${cls}">${text}</span>`;
  bannerTrack.appendChild(item);

  // keep items manageable
  if (bannerTrack.children.length > 30) {
    bannerTrack.removeChild(bannerTrack.firstChild);
  }
}

// Seed the banner with some mock items
["naughty", "nice", "dank", "nice", "naughty"].forEach((outcome, i) => {
  setTimeout(() => pushBannerEvent(outcome, 10 + i * 5), 200 * i);
});

// -----------------------
// BACKGROUND MUSIC
// -----------------------

const bgMusic = document.getElementById("bgMusic");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const musicDot = document.getElementById("musicDot");
let musicPlaying = false;

async function toggleMusic() {
  if (!musicPlaying) {
    try {
      await bgMusic.play();
      musicPlaying = true;
      musicDot.classList.remove("paused");
    } catch (e) {
      console.error("Music play blocked:", e);
    }
  } else {
    bgMusic.pause();
    musicPlaying = false;
    musicDot.classList.add("paused");
  }
}

musicToggleBtn.addEventListener("click", toggleMusic);

// -----------------------
// CLICK / TAP FX SPRITES
// -----------------------

const sprites = ["🍬", "❄️", "🍪", "🎁", "🍭", "🎄"];

document.addEventListener("click", (e) => {
  // ignore clicks on inputs & buttons to avoid annoyance
  const tag = e.target.tagName.toLowerCase();
  if (["input", "button", "select", "textarea"].includes(tag)) return;

  const sprite = document.createElement("div");
  sprite.className = "click-sprite";
  sprite.textContent = sprites[Math.floor(Math.random() * sprites.length)];
  sprite.style.left = e.clientX + "px";
  sprite.style.top = e.clientY + "px";
  document.body.appendChild(sprite);
  setTimeout(() => sprite.remove(), 950);
});
