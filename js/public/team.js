// js/team.js

var SUPABASE_URL = 'https://ysdxpzmijxdjcuublxxq.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_WlU14Kmk7hTOMObXRuACBA_HKIOS-rL';

// Ensure we don't declare supabaseClient twice if multiple scripts load
if (!window.supabasePublicClient) {
    window.supabasePublicClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('dynamic-team-container');
    if (!container) return;

    // Fetch from team_members
    const { data, error } = await window.supabasePublicClient
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true });

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
        container.innerHTML = `<div class="col-12 text-center text-danger">Error loading team: ${escapeHTML(error.message)}</div>`;
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="col-12 text-center text-muted">Team members coming soon!</div>`;
        return;
    }

    container.innerHTML = ''; // Clear spinner

    data.forEach((member, index) => {
        const delay = 0.2 + (index * 0.2); // 0.2s, 0.4s, 0.6s
        
        let imgUrl = member.image_url || 'img/default-user.jpg';
        const safeName = escapeHTML(member.name);
        const safeRole = escapeHTML(member.position);
        const safeImg = escapeHTML(imgUrl);

        // Social Links
        let socialLinksHTML = '';
        if (member.social_links) {
            if (member.social_links.facebook) socialLinksHTML += `<a class="btn btn-primary btn-sm-square rounded-circle me-3" href="${escapeHTML(member.social_links.facebook)}" target="_blank"><i class="fab fa-facebook-f"></i></a>`;
            if (member.social_links.twitter) socialLinksHTML += `<a class="btn btn-primary btn-sm-square rounded-circle me-3" href="${escapeHTML(member.social_links.twitter)}" target="_blank"><i class="fab fa-twitter"></i></a>`;
            if (member.social_links.linkedin) socialLinksHTML += `<a class="btn btn-primary btn-sm-square rounded-circle me-3" href="${escapeHTML(member.social_links.linkedin)}" target="_blank"><i class="fab fa-linkedin-in"></i></a>`;
            if (member.social_links.instagram) socialLinksHTML += `<a class="btn btn-primary btn-sm-square rounded-circle me-0" href="${escapeHTML(member.social_links.instagram)}" target="_blank"><i class="fab fa-instagram"></i></a>`;
        }
        
        const col = document.createElement('div');
        col.className = `col-md-6 col-lg-6 col-xl-3 wow fadeInUp`;
        col.setAttribute('data-wow-delay', `${delay}s`);
        
        col.innerHTML = `
            <div class="team-item">
                <div class="team-img">
                    <img src="${safeImg}" class="img-fluid rounded-top w-100" alt="${safeName}" style="height: 300px; object-fit: cover;">
                    <div class="team-icon">
                        ${socialLinksHTML}
                    </div>
                </div>
                <div class="team-title p-4 text-center">
                    <h4 class="mb-0">${safeName}</h4>
                    <p class="mb-0">${safeRole}</p>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
});
