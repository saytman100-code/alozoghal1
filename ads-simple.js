// سیستم تبلیغات الو ذغال
const adsList = [
  {
    "title": "علی",
    "desc": "تست",
    "image": "https://i.postimg.cc/G2srP7Sd/378b50ae-027e-42e6-b087-00a7f8c2edb6.jpg",
    "phone": "989220730628",
    "expiry": "بدون انقضا"
  }
];

let currentAd = 0;
let timer = null;

function showAd() {
  const container = document.getElementById('vip-ad-container');
  if (!container || !adsList.length) return;
  
  const ad = adsList[currentAd];
  
  container.innerHTML = `
    <div class="vip-ad-card fade-anim">
      <img src="${ad.image}" class="vip-img" alt="${ad.title}">
      <div class="vip-info">
        <div class="vip-title">${ad.title}</div>
        <div class="vip-desc">${ad.desc}</div>
        <a href="tel:${ad.phone}" class="btn-call-vip">📞 تماس مستقیم</a>
        ${ad.expiry ? `<small style="color:#888; font-size:10px; margin-top:5px; display:block;">⏳ ${ad.expiry}</small>` : ''}
      </div>
    </div>
  `;
}

function startRotation() {
  if (adsList.length <= 1) return;
  
  if (timer) clearInterval(timer);
  
  timer = setInterval(() => {
    currentAd = (currentAd + 1) % adsList.length;
    showAd();
  }, 8000);
}

document.addEventListener('DOMContentLoaded', () => {
  showAd();
  startRotation();
  
  const container = document.getElementById('vip-ad-container');
  if (container) {
    container.addEventListener('mouseenter', () => clearInterval(timer));
    container.addEventListener('mouseleave', () => startRotation());
  }
});
