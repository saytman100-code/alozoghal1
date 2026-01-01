// ads-manager.js - سیستم مدیریت تبلیغات الو ذغال
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
            // اولویت ۱: از localStorage بارگذاری کن
            this.loadFromLocalStorage();
            
            // اگر تبلیغی نداشتیم، از فایل JSON لود کنیم
            if(this.ads.length === 0) {
                await this.loadFromJSON();
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

    async loadFromJSON() {
        try {
            const response = await fetch('ads.json?v=' + Date.now());
            if(response.ok) {
                const data = await response.json();
                this.ads = data.ads || [];
                console.log('📁 تبلیغات از فایل JSON بارگذاری شد');
            }
        } catch(e) {
            console.log('فایل ads.json یافت نشد.');
        }
    }

    filterExpiredAds() {
        const now = new Date();
        this.ads = this.ads.filter(ad => {
            if(!ad.expiry) return true;
            try {
                const expiryDate = new Date(ad.expiry);
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
        
        // نمایش شماره تبلیغ فعلی در کنسول
        console.log(`🔄 تغییر به تبلیغ ${this.currentAdIndex + 1} از ${this.ads.length}`);
    }

    startRotation() {
        // پاک کردن اینتروال قبلی
        if(this.adInterval) clearInterval(this.adInterval);
        
        // تنظیم اینتروال جدید (هر 8 ثانیه)
        this.adInterval = setInterval(() => this.nextAd(), 8000);
        console.log('⏱️ چرخش خودکار تبلیغات فعال شد (هر 8 ثانیه)');
    }

    setupEventListeners() {
        // کلیک روی تبلیغ
        document.addEventListener('click', (e) => {
            if(e.target.closest('.btn-call-vip')) {
                const adCard = e.target.closest('.vip-ad-card');
                const adId = adCard?.dataset?.adId;
                if(adId) {
                    this.trackClick(adId);
                }
            }
        });
        
        // توقف چرخش وقتی کاربر روی تبلیغ هاور می‌کند
        const container = document.getElementById('vip-ad-container');
        if(container) {
            container.addEventListener('mouseenter', () => {
                if(this.adInterval) {
                    clearInterval(this.adInterval);
                    console.log('⏸️ چرخش تبلیغات متوقف شد (هاور)');
                }
            });
            
            container.addEventListener('mouseleave', () => {
                this.startRotation();
            });
        }
    }

    trackClick(adId) {
        console.log(`🖱️ کلیک روی تبلیغ: ${adId}`);
        
        // افزایش تعداد کلیک‌ها
        if(adId === 'default_ad') return; // تبلیغ پیش‌فرض را شمارش نکن
        
        for(let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key === adId) {
                try {
                    const ad = JSON.parse(localStorage.getItem(key));
                    ad.clicks = (ad.clicks || 0) + 1;
                    ad.lastClick = new Date().toISOString();
                    localStorage.setItem(key, JSON.stringify(ad));
                    
                    console.log(`✅ کلیک ثبت شد: ${ad.title} (${ad.clicks} کلیک)`);
                    
                    // نمایش نوتیفیکیشن (اختیاری)
                    this.showClickNotification(ad.title);
                    
                    break;
                } catch(e) {
                    console.warn('❌ خطا در ثبت کلیک:', e);
                }
            }
        }
    }

    showClickNotification(adTitle) {
        // می‌توانید این بخش را فعال کنید اگر می‌خواهید نوتیفیکیشن نشان دهید
        /*
        const notification = document.createElement('div');
        notification.innerHTML = `📊 کلیک روی: ${adTitle}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: #25D366;
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            z-index: 9999;
            font-size: 12px;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
        */
    }

    // اضافه کردن تبلیغ جدید (از پنل مدیریت)
    addAd(adData) {
        const newAd = {
            id: 'ad_' + Date.now(),
            ...adData,
            created: new Date().toISOString(),
            clicks: 0
        };
        
        this.ads.push(newAd);
        localStorage.setItem(newAd.id, JSON.stringify(newAd));
        this.showAd();
        
        console.log(`➕ تبلیغ جدید اضافه شد: ${newAd.title}`);
        return newAd.id;
    }

    // حذف تبلیغ
    removeAd(adId) {
        this.ads = this.ads.filter(ad => ad.id !== adId);
        localStorage.removeItem(adId);
        this.showAd();
        console.log(`🗑️ تبلیغ حذف شد: ${adId}`);
    }

    // گرفتن آمار
    getStats() {
        let totalClicks = 0;
        let activeAds = 0;
        
        for(let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key.startsWith('ad_')) {
                try {
                    const ad = JSON.parse(localStorage.getItem(key));
                    totalClicks += (ad.clicks || 0);
                    activeAds++;
                } catch(e) {}
            }
        }
        
        return {
            totalAds: activeAds,
            totalClicks: totalClicks,
            activeAdsCount: this.ads.length
        };
    }
}

// تابع کلیک تبلیغ برای استفاده در HTML
function trackAdClick(adId) {
    if(window.adManager) {
        window.adManager.trackClick(adId);
    } else {
        console.log('⚠️ مدیر تبلیغات هنوز بارگذاری نشده است');
    }
}

// تابع برای ریفرش تبلیغات (در صورت نیاز)
function refreshAds() {
    if(window.adManager) {
        window.adManager.loadAds();
        return '🔄 تبلیغات در حال بروزرسانی...';
    }
    return '❌ مدیر تبلیغات موجود نیست';
}

// مقداردهی اولیه مدیر تبلیغات
let adManager;

document.addEventListener('DOMContentLoaded', () => {
    adManager = new AdManager();
    window.adManager = adManager; // در دسترس قرار دادن در سطح جهانی
    
    // نمایش اطلاعات در کنسول
    console.log('🎯 سایت الو ذغال آماده است!');
    console.log('🔧 برای ورود به پنل مدیریت، در فیلد نام وارد کنید: "علی نادریان 1362541"');
    
    // اضافه کردن کلید میانبر برای توسعه دهندگان (اختیاری)
    window.addEventListener('keydown', (e) => {
        // Ctrl+Alt+M برای باز کردن پنل مدیریت
        if(e.ctrlKey && e.altKey && e.key === 'm') {
            window.open('admin-login.html', '_blank');
        }
        
        // Ctrl+Alt+R برای ریفرش تبلیغات
        if(e.ctrlKey && e.altKey && e.key === 'r') {
            refreshAds();
        }
    });
});

// تابع برای توسعه دهندگان
if(typeof window !== 'undefined') {
    window.الوذغال = {
        version: '1.0.0',
        refreshAds: refreshAds,
        getStats: () => window.adManager ? window.adManager.getStats() : null,
        addTestAd: () => {
            if(window.adManager) {
                const testAd = {
                    title: '🔥 تبلیغ تستی',
                    desc: 'این یک تبلیغ تستی است برای بررسی عملکرد سیستم',
                    image: 'https://via.placeholder.com/150',
                    phone: '989220730628',
                    type: 'test'
                };
                return window.adManager.addAd(testAd);
            }
            return null;
        }
    };
          }
