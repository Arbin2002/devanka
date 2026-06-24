// js/products.js

const SUPABASE_URL = 'https://ysdxpzmijxdjcuublxxq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WlU14Kmk7hTOMObXRuACBA_HKIOS-rL';

// Ensure we don't declare supabaseClient twice if multiple scripts load
if (!window.supabasePublicClient) {
    window.supabasePublicClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('dynamic-products-container');
    if (!container) return;

    // Fetch from portfolio_projects
    const { data, error } = await window.supabasePublicClient
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: true });

    // Use a Map (no prototype chain) to prevent prototype pollution attacks
    const HTML_ESCAPE_MAP = new Map([
        ['&', '&amp;'],
        ['<', '&lt;'],
        ['>', '&gt;'],
        ["'", '&#39;'],
        ['"', '&quot;']
    ]);

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => HTML_ESCAPE_MAP.get(tag) ?? '');
    }

    if (error) {
        const errDiv = document.createElement('div');
        errDiv.className = 'col-12 text-center text-danger';
        errDiv.textContent = 'Error loading products: ' + (error.message || '');
        container.appendChild(errDiv);
        return;
    }

    if (!data || data.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'col-12 text-center text-muted';
        emptyDiv.textContent = 'Coming soon! No products found.';
        container.appendChild(emptyDiv);
        return;
    }

    container.innerHTML = ''; // Clear spinner

    data.forEach((prod, index) => {
        const delay = 0.2 + (index * 0.2);

        const imgUrl = prod.image_url || 'assets/logos/uniscouter_logo.png';
        const logoUrl = prod.category || 'assets/logos/logo1.png';

        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 wow fadeInUp';
        col.setAttribute('data-wow-delay', `${delay}s`);

        // Outer service-item wrapper
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item h-100 d-flex flex-column';

        // Image section
        const serviceImg = document.createElement('div');
        serviceImg.className = 'service-img';

        const mainImg = document.createElement('img');
        mainImg.src = imgUrl;
        mainImg.className = 'img-fluid rounded-top w-100';
        mainImg.alt = prod.title || '';
        mainImg.style.cssText = 'height: 250px; object-fit: cover;';
        serviceImg.appendChild(mainImg);

        const iconDiv = document.createElement('div');
        iconDiv.className = 'service-icon p-1';
        iconDiv.style.cssText = 'background: white; overflow: hidden;';
        const logoImg = document.createElement('img');
        logoImg.src = logoUrl;
        logoImg.alt = 'Logo';
        logoImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain; border-radius: 50%;';
        iconDiv.appendChild(logoImg);
        serviceImg.appendChild(iconDiv);

        serviceItem.appendChild(serviceImg);

        // Content section
        const serviceContent = document.createElement('div');
        serviceContent.className = 'service-content p-4 flex-grow-1 d-flex flex-column';

        const inner = document.createElement('div');
        inner.className = 'service-content-inner';

        const titleLink = document.createElement('a');
        titleLink.href = prod.link || '#';
        titleLink.target = '_blank';
        titleLink.className = 'd-inline-block h4 mb-4';
        titleLink.textContent = prod.title || '';
        inner.appendChild(titleLink);

        const desc = document.createElement('p');
        desc.className = 'mb-4';
        desc.textContent = prod.description || '';
        inner.appendChild(desc);
        serviceContent.appendChild(inner);

        const btnWrap = document.createElement('div');
        btnWrap.className = 'mt-auto pt-3 position-relative';
        btnWrap.style.zIndex = '9';
        const visitBtn = document.createElement('a');
        visitBtn.href = prod.link || '#';
        visitBtn.target = '_blank';
        visitBtn.className = 'btn btn-primary rounded-pill py-2 px-4';
        visitBtn.textContent = 'Visit Platform';
        btnWrap.appendChild(visitBtn);
        serviceContent.appendChild(btnWrap);

        serviceItem.appendChild(serviceContent);
        col.appendChild(serviceItem);
        container.appendChild(col);
    });
});
