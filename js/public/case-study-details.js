// js/case-study-details.js

const SUPABASE_URL = 'https://ysdxpzmijxdjcuublxxq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WlU14Kmk7hTOMObXRuACBA_HKIOS-rL';

if (!window.supabasePublicClient) {
    window.supabasePublicClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const headerContainer = document.getElementById('header-container');
    const container = document.getElementById('single-case-container');

    if (!id) {
        headerContainer.innerHTML = '<h1 class="display-3 text-white mb-3">Case Study Not Found</h1>';
        return;
    }

    const { data: item, error } = await window.supabasePublicClient
        .from('case_studies')
        .select('*')
        .eq('id', id)
        .single();

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

    if (error || !item) {
        headerContainer.innerHTML = `<h1 class="display-3 text-white mb-3">Error Loading Case Study</h1>`;
        container.innerHTML = `<div class="alert alert-danger text-center">Case study not found or an error occurred.</div>`;
        return;
    }

    const safeTitle = escapeHTML(item.title);
    const safeSubtitle = escapeHTML(item.subtitle);
    const safeProblem = escapeHTML(item.problem || '').replace(/\n/g, '<br>');
    const safeSolution = escapeHTML(item.solution || '').replace(/\n/g, '<br>');
    const safeLink = escapeHTML(item.website_url || '#');
    const safeImg = escapeHTML(item.hero_image || 'img/default-case.jpg');

    // Update Header (using native Devanka breadcrumb style)
    headerContainer.innerHTML = `
        <h1 class="display-3 text-white mb-3 animated slideInDown">${safeTitle}</h1>
        <nav aria-label="breadcrumb animated slideInDown">
            <ol class="breadcrumb justify-content-center mb-0">
                <li class="breadcrumb-item"><a class="text-white" href="index.html">Home</a></li>
                <li class="breadcrumb-item"><a class="text-white" href="case-studies.html">Case Studies</a></li>
                <li class="breadcrumb-item text-white active" aria-current="page">${safeTitle}</li>
            </ol>
        </nav>
    `;

    // Parse features
    let featuresArr = [];
    if (item.features && Array.isArray(item.features)) {
        featuresArr = item.features;
    }

    let featuresHTML = '';
    if (featuresArr.length > 0) {
        featuresHTML = `
        <div class="container-fluid service py-5">
            <div class="container py-5">
                <div class="text-center mx-auto pb-5 wow fadeInUp" data-wow-delay="0.2s" style="max-width: 800px;">
                    <h4 class="text-primary">Key Features</h4>
                    <h1 class="display-4 mb-4">What Makes It Special</h1>
                </div>
                <div class="row g-4 justify-content-center">
        `;
        featuresArr.forEach((f, index) => {
            if (f.name) {
                const delay = 0.2 + (index * 0.2);
                featuresHTML += `
                <div class="col-md-6 col-lg-6 col-xl-4 wow fadeInUp" data-wow-delay="${delay}s">
                    <div class="service-item bg-light rounded p-4 h-100 d-flex flex-column text-center">
                        <div class="mb-4">
                            <i class="fas fa-check-circle fa-3x text-primary"></i>
                        </div>
                        <a href="#" class="d-inline-block h4 mb-3">${escapeHTML(f.name)}</a>
                        <p class="mb-0 text-dark">${escapeHTML(f.description)}</p>
                    </div>
                </div>`;
            }
        });
        featuresHTML += '</div></div></div>';
    }

    // Tech Stack
    let techHTML = '';
    if (item.tech_stack && Array.isArray(item.tech_stack) && item.tech_stack.length > 0) {
        techHTML = `
        <div class="py-5 bg-light rounded px-4 wow fadeInUp" data-wow-delay="0.2s">
            <h4 class="text-primary text-center mb-4">Technology Stack</h4>
            <div class="d-flex flex-wrap justify-content-center gap-2">
        `;
        item.tech_stack.forEach(t => {
            techHTML += `<span class="badge bg-primary text-white p-2 px-3 fs-6 rounded-pill"><i class="fas fa-cog me-2"></i>${escapeHTML(t)}</span>`;
        });
        techHTML += '</div></div>';
    }

    // Metrics / Results using About section counter-item pattern
    let metricsHTML = '';
    if (item.results && Array.isArray(item.results) && item.results.length > 0) {
        metricsHTML = `
        <div class="row g-4 justify-content-center mt-5 wow fadeInUp" data-wow-delay="0.2s">
            <div class="col-12 text-center mb-3">
                <h4 class="text-primary">Impact & Results</h4>
            </div>
        `;
        item.results.forEach((m, idx) => {
            metricsHTML += `
                <div class="col-sm-6 col-md-3 text-center">
                    <div class="counter-item bg-light rounded p-4 h-100 shadow-sm border-bottom border-primary border-4">
                        <h2 class="display-5 text-primary mb-2 fw-bold" data-toggle="counter-up">${escapeHTML(m.value)}</h2>
                        <h5 class="mb-0 text-dark">${escapeHTML(m.label)}</h5>
                    </div>
                </div>
            `;
        });
        metricsHTML += '</div>';
    }

    // Build the page
    container.innerHTML = `
        <div class="row g-5 align-items-center mb-5">
            <div class="col-lg-6 wow fadeInLeft" data-wow-delay="0.2s">
                <div class="about-img rounded">
                    <img src="${safeImg}" class="img-fluid rounded shadow-sm w-100" alt="${safeTitle}" style="max-height: 500px; object-fit: cover;">
                </div>
            </div>
            <div class="col-lg-6 wow fadeInRight" data-wow-delay="0.4s">
                <h4 class="text-primary">Project Overview</h4>
                <h1 class="display-5 mb-4">${safeSubtitle}</h1>
                <p class="mb-4 text-dark"><i class="fa fa-angle-right text-primary me-2"></i><strong>The Challenge:</strong><br>${safeProblem}</p>
                <p class="mb-4 text-dark"><i class="fa fa-angle-right text-primary me-2"></i><strong>Our Solution:</strong><br>${safeSolution}</p>
                ${item.website_url ? `<a href="${safeLink}" target="_blank" class="btn btn-primary rounded-pill py-3 px-5 mt-3">Visit Website</a>` : ''}
            </div>
        </div>

        ${featuresHTML}
        
        <div class="container py-5">
            ${techHTML}
            ${metricsHTML}
        </div>
    `;

    // Initialize counter up
    if ($('[data-toggle="counter-up"]').length > 0) {
        $('[data-toggle="counter-up"]').counterUp({
            delay: 10,
            time: 2000
        });
    }
});
