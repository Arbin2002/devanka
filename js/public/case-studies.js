// js/case-studies.js

const SUPABASE_URL = 'https://ysdxpzmijxdjcuublxxq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WlU14Kmk7hTOMObXRuACBA_HKIOS-rL';

if (!window.supabasePublicClient) {
    window.supabasePublicClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('dynamic-cases-container');
    if (!container) return;

    const { data, error } = await window.supabasePublicClient
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false });

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    if (error) {
        container.innerHTML = `<div class="col-12 text-center text-danger">Error loading case studies: ${escapeHTML(error.message)}</div>`;
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">Case studies coming soon!</div>`;
        return;
    }

    container.innerHTML = ''; // Clear spinner

    data.forEach((item, index) => {
        const delay = 0.1 + ((index % 3) * 0.2); 
        
        const safeTitle = escapeHTML(item.title);
        const safeSubtitle = escapeHTML(item.subtitle);
        
        // Shorten the problem for the card description
        let shortDesc = item.problem || item.solution || '';
        if (shortDesc.length > 120) {
            shortDesc = shortDesc.substring(0, 120) + '...';
        }
        const safeDesc = escapeHTML(shortDesc);
        
        const safeLink = escapeHTML(item.website_url || '#');
        const safeImg = escapeHTML(item.hero_image || 'img/default-case.jpg');
        const safeId = escapeHTML(item.id || '');
        const safeIndustry = escapeHTML(item.industry || 'Project');

        const col = document.createElement('div');
        col.className = `col-lg-4 col-md-6 wow fadeInUp`;
        col.setAttribute('data-wow-delay', `${delay}s`);

        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm rounded overflow-hidden d-flex flex-column">
                <img src="${safeImg}" class="card-img-top" alt="${safeTitle}" style="height: 220px; object-fit: cover;">
                <div class="card-body p-4 flex-grow-1">
                    <span class="badge bg-secondary mb-3">${safeIndustry}</span>
                    <a href="${safeLink}" target="_blank" class="text-decoration-none">
                        <h4 class="card-title text-primary mb-2">${safeTitle}</h4>
                    </a>
                    <h6 class="card-subtitle mb-3 text-dark fw-bold" style="line-height: 1.4;">${safeSubtitle}</h6>
                    <p class="card-text text-muted mb-0">${safeDesc}</p>
                </div>
                <div class="card-footer bg-white border-0 p-4 pt-0">
                    <a href="case-study-details?id=${safeId}" class="btn btn-outline-primary w-100 rounded-pill py-2">View more details <i class="fas fa-arrow-right ms-2"></i></a>
                </div>
            </div>
        `;

        container.appendChild(col);
    });
});
