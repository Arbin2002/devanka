// js/testimonials.js

var SUPABASE_URL = 'https://ysdxpzmijxdjcuublxxq.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_WlU14Kmk7hTOMObXRuACBA_HKIOS-rL';

// Initialize Supabase if not already done by other scripts
if (!window.supabasePublicClient) {
    window.supabasePublicClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', async () => {
    const carouselContainer = $('#dynamic-testimonial-carousel');
    if (carouselContainer.length === 0) return;

    try {
        const { data, error } = await window.supabasePublicClient
            .from('testimonials')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        let html = '';

        if (!data || data.length === 0) {
            html = `
                <div class="text-center w-100 p-5">
                    <p class="text-muted">No testimonials available yet.</p>
                </div>
            `;
        } else {
            data.forEach(item => {
                const safeName = window.escapeHTML ? window.escapeHTML(item.client_name) : item.client_name;
                const safeRole = item.role ? (window.escapeHTML ? window.escapeHTML(item.role) : item.role) : '';
                const safeCompany = item.company ? (window.escapeHTML ? window.escapeHTML(item.company) : item.company) : '';
                const safeQuote = window.escapeHTML ? window.escapeHTML(item.content || item.quote || '') : (item.content || item.quote || '');
                const safePhoto = item.image_url ? item.image_url : 'img/testimonial-1.jpg'; // fallback

                let professionText = safeRole;
                if (safeCompany) {
                    professionText = professionText ? `${professionText}, ${safeCompany}` : safeCompany;
                }
                
                // Add default stars if rating isn't present, or loop if it is
                const rating = item.rating ? parseInt(item.rating) : 5;
                let starsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= rating) {
                        starsHtml += '<i class="fas fa-star"></i> ';
                    } else {
                        starsHtml += '<i class="fas fa-star text-body"></i> ';
                    }
                }

                html += `
                    <div class="testimonial-item bg-light rounded">
                        <div class="row g-0">
                            <div class="col-4 col-lg-4 col-xl-3">
                                <div class="h-100">
                                    <img src="${safePhoto}" class="img-fluid h-100 rounded" style="object-fit: cover;" alt="${safeName}">
                                </div>
                            </div>
                            <div class="col-8 col-lg-8 col-xl-9">
                                <div class="d-flex flex-column my-auto text-start p-4">
                                    <h4 class="text-dark mb-0">${safeName}</h4>
                                    <p class="mb-3">${professionText}</p>
                                    <div class="d-flex text-primary mb-3">
                                        ${starsHtml}
                                    </div>
                                    <p class="mb-0">${safeQuote}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        carouselContainer.html(html);

        // Initialize Owl Carousel AFTER items are loaded
        if (data && data.length > 0) {
            carouselContainer.owlCarousel({
                autoplay: true,
                smartSpeed: 1500,
                center: false,
                dots: false,
                loop: data.length > 1, // Only loop if more than 1 item
                margin: 25,
                nav : true,
                navText : [
                    '<i class="fa fa-arrow-right"></i>',
                    '<i class="fa fa-arrow-left"></i>'
                ],
                responsiveClass: true,
                responsive: {
                    0:{ items:1 },
                    576:{ items:1 },
                    768:{ items:2 },
                    992:{ items:2 },
                    1200:{ items:2 }
                }
            });
        }

    } catch (error) {
        console.error("Error loading testimonials:", error);
        carouselContainer.html(`
            <div class="text-center w-100 p-5">
                <p class="text-danger">Failed to load testimonials.</p>
            </div>
        `);
    }
});
