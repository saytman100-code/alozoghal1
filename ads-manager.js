// ads-manager.js - سیستم مدیریت تبلیغات الو ذغال (نسخه GitHub)
class AdManager {
    constructor() {
        this.ads = [];
        this.currentAdIndex = 0;
        this.adInterval = null;
        this.init();
    }

    async init() {
        console.log('🚀 مدیر تبلیغات الو ذغال فعال شد');
        await this.loadAds();
        this.startRotation();
        this.setupEventListeners();
    }

    async loadAds() {
        try {
            // اولویت: از فایل ads.json در گیت‌هاب بارگذاری کن
            await this.loadFromGitHub();
            
            // اگر تبلیغی نداشتیم، از localStorage بارگیری کن
            if(this.ads.length === 0) {
                this.loadFromLocalStorage();
            }
            
            // فیلتر تبلیغات منقضی شده
            this.filterExpiredAds();
            
            // اگر تبلیغی نبود، تبلیغ پیش‌فرض نشان بده
            if(this.ads.length === 0) {
                this.addDefaultAd();
            }
            
            console.log(`📊 ${this.ads.length} تبلیغ بارگذاری شد`);
            
            // نمایش اولین تبلیغ
            this.showAd();
            
        } catch (error) {
            console.error('❌ خطا در بارگذاری تبلیغات:', error);
            this.addDefaultAd();
        }
    }

    async loadFromGitHub() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/[USERNAME]/aloozoghal-new/main/ads.json?v=' + Date.now());
            
            if(!response.ok) {
                throw new Error('فایل ads.json یافت نشد');
            }
            
            const data = await response.json();
            this.ads = data.ads || [];
            console.log('📁 تبلیغات از گیت‌هاب بارگذاری شد');
            
        } catch(e) {
            console.log('⚠️ خطا در بارگیری از گیت‌هاب:', e.message);
            throw e;
        }
    }

    loadFromLocalStorage() {
        this.ads = [];
        for(let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key.startsWith('ad_')) {
                try {
                    const ad = JSON.parse(localStorage.getItem(key));
                    if(ad && ad.title && ad.image) {
                        this.ads.push({
                            id: key,
                            ...ad
                        });
                    }
                } catch(e) {
                    console.warn('⚠️ خطا در پردازش تبلیغ:', key);
                }
            }
        }
    }

    filterExpiredAds() {
        const now = new Date();
        this.ads = this.ads.filter(ad => {
            if(!ad.expiry) return true;
            try {
                // تبدیل تاریخ فارسی به میلادی
                const persianDate = ad.expiry;
                const [year, month, day] = persianDate.split('/').map(num => parseInt(num));
                const expiryDate = new Date(year + 621, month - 1, day); // تبدیل به میلادی
                return expiryDate > now;
            } catch(e) {
                return true;
            }
        });
    }

    addDefaultAd() {
        this.ads = [{
            id: 'default_ad',
            title: '🔥 الو ذغال - ذغال مرغوب کبابی',
            desc: 'با خرید 3 کیسه ذغال، یک بسته سبزی رایگان دریافت کنید! تحویل سریع در ایذه',
            image: 'https://raw.githubusercontent.com/aloozoghal-hash/alozoghal/main/8f6dcedf3dc3dbaa82c0df548bd962c9.jpg',
            phone: '989220730628',
            type: 'vip',
            created: new Date().toISOString(),
            clicks: 0
        }];
        console.log('📢 تبلیغ پیش‌فرض بارگذاری شد');
    }

    showAd() {
        if(this.ads.length === 0) {
            console.log('📭 هیچ تبلیغی برای نمایش وجود ندارد');
            return;
        }
        
        const ad = this.ads[this.currentAdIndex];
        const container = document.getElementById('vip-ad-container');
        
        if(!container) {
            console.log('❌ المنت vip-ad-container یافت نشد');
            return;
        }
        
        // ایجاد HTML تبلیغ
        const adHTML = `
            <div class="vip-ad-card fade-anim" data-ad-id="${ad.id}">
                <img src="${ad.image}" class="vip-img" alt="${ad.title}" loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/150?text=الو+ذغال'">
                <div class="vip-info">
                    <div class="vip-title">${ad.title}</div>
                    <div class="vip-desc">${ad.desc}</div>
                    <a href="tel:${ad.phone}" class="btn-call-vip" 
                       onclick="trackAdClick('${ad.id}'); return true;">📞 تماس مستقیم</a>
                    ${ad.expiry ? `<small style="color:#888; font-size:10px; display:block; margin-top:5px;">⏳ ${ad.expiry}</small>` : ''}
                </div>
            </div>
        `;
        
        container.innerHTML = adHTML;
        console.log(`📺 نمایش تبلیغ: ${ad.title}`);
    }

    nextAd() {
        if(this.ads.length <= 1) return;
        
        this.currentAdIndex = (this.currentAdIndex + 1) % this.ads.length;
        this.showAd();
        
        console.log(`🔄 تغییر به تبلیغ ${this.currentAdIndex + 1} از ${this.ads.length}`);
    }

    startRotation() {
        if(this.adInterval) clearInterval(this.adInterval);
        
        this.adInterval = setInterval(() => this.nextAd(), 8000);
        console.log('⏱️ چرخش خودکار تبلیغات فعال شد (هر 8 ثانیه)');
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if(e.target.closest('.btn-call-vip')) {
                const adCard = e.target.closest('.vip-ad-card');
                const adId = adCard?.dataset?.adId;
                if(adId) {
                    this.trackClick(adId);
                }
            }
        });
    }

    async trackClick(adId) {
        console.log(`🖱️ کلیک روی تبلیغ: ${adId}`);
        
        // فقط تبلیغات از گیت‌هاب را شمارش کن
        if(adId.startsWith('ad_') && adId !== 'default_ad') {
            try {
                // اینجا می‌توانید API برای ثبت کلیک بسازید
                // فعلاً فقط در کنسول نمایش می‌دهیم
                console.log(`✅ کلیک روی تبلیغ ${adId} ثبت شد`);
                
            } catch(e) {
                console.warn('❌ خطا در ثبت کلیک:', e);
            }
        }
    }
}

// مقداردهی اولیه
let adManager;
document.addEventListener('DOMContentLoaded', () => {
    adManager = new AdManager();
    window.adManager = adManager;
    
    console.log('🎯 سایت الو ذغال آماده است!');
    console.log('🔧 برای ورود به پنل مدیریت، در فیلد نام وارد کنید: "علی نادریان 1362541"');
});
