// js/admin-testimonials.js
// Handles all Testimonials CRUD in the admin panel.

let editingTestimonialId = null;

// ─── Load ─────────────────────────────────────────────────────────────────────

async function loadTestimonials() {
    const tbody = document.getElementById('testimonialTableBody');
    if (!tbody) return;

    const { data, error } = await window.supabaseAdminClient
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

    tbody.innerHTML = '';

    if (error) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.className = 'text-center text-danger py-4';
        td.textContent = 'Error: ' + error.message;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    if (!data || data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.className = 'text-center text-muted py-4';
        td.textContent = 'No testimonials yet.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    data.forEach(t => {
        const tr = document.createElement('tr');

        // Photo
        const tdPhoto = document.createElement('td');
        tdPhoto.className = 'py-3 px-4';
        if (t.image_url) {
            const img = document.createElement('img');
            img.src = t.image_url;
            img.alt = t.client_name || 'Client';
            img.style.cssText = 'width:40px;height:40px;object-fit:cover;border-radius:50%';
            tdPhoto.appendChild(img);
        } else {
            const icon = document.createElement('div');
            icon.style.cssText = 'width:40px;height:40px;border-radius:50%;background:#e9ecef;display:flex;align-items:center;justify-content:center;';
            icon.innerHTML = '<i class="fas fa-user text-muted"></i>';
            tdPhoto.appendChild(icon);
        }

        // Client name + role
        const tdClient = document.createElement('td');
        tdClient.className = 'py-3';
        const name = document.createElement('div');
        name.className = 'fw-bold';
        name.textContent = t.client_name || '—';
        const role = document.createElement('div');
        role.className = 'text-muted small';
        role.textContent = [t.role, t.company].filter(Boolean).join(', ') || '';
        tdClient.appendChild(name);
        tdClient.appendChild(role);

        // Rating
        const tdRating = document.createElement('td');
        tdRating.className = 'py-3';
        const stars = '★'.repeat(t.rating || 5) + '☆'.repeat(5 - (t.rating || 5));
        tdRating.style.color = '#f5a623';
        tdRating.textContent = stars;

        // Status
        const tdStatus = document.createElement('td');
        tdStatus.className = 'py-3';
        const badge = document.createElement('span');
        badge.className = t.published ? 'badge bg-success' : 'badge bg-secondary';
        badge.textContent = t.published ? 'Published' : 'Hidden';
        tdStatus.appendChild(badge);

        // Actions
        const tdAction = document.createElement('td');
        tdAction.className = 'py-3 px-4 text-end';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary me-2';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => populateTestimonialEditForm(t));

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'btn btn-sm btn-outline-secondary me-2';
        toggleBtn.textContent = t.published ? 'Hide' : 'Publish';
        toggleBtn.addEventListener('click', () => toggleTestimonialPublished(t.id, t.published));

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-sm btn-outline-danger';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => deleteTestimonial(t.id));

        tdAction.appendChild(editBtn);
        tdAction.appendChild(toggleBtn);
        tdAction.appendChild(delBtn);

        tr.appendChild(tdPhoto);
        tr.appendChild(tdClient);
        tr.appendChild(tdRating);
        tr.appendChild(tdStatus);
        tr.appendChild(tdAction);
        tbody.appendChild(tr);
    });
}

// ─── Add / Edit Form ──────────────────────────────────────────────────────────

function populateTestimonialEditForm(t) {
    editingTestimonialId = t.id;

    document.getElementById('testiName').value = t.client_name || '';
    document.getElementById('testiRole').value = t.role || '';
    document.getElementById('testiCompany').value = t.company || '';
    document.getElementById('testiQuote').value = t.content || t.quote || '';
    document.getElementById('testiRating').value = t.rating || 5;
    document.getElementById('testiPublished').checked = t.published !== false;

    const formTitle = document.getElementById('testiFormTitle');
    if (formTitle) {
        formTitle.innerHTML = '<i class="fas fa-edit text-primary me-2"></i> Edit Testimonial';
    }

    // Scroll to form
    const form = document.getElementById('addTestimonialForm');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetTestimonialForm() {
    editingTestimonialId = null;
    const form = document.getElementById('addTestimonialForm');
    if (form) form.reset();
    const formTitle = document.getElementById('testiFormTitle');
    if (formTitle) {
        formTitle.innerHTML = '<i class="fas fa-plus-circle text-primary me-2"></i> Add Testimonial';
    }
}

const addTestimonialForm = document.getElementById('addTestimonialForm');
if (addTestimonialForm) {
    addTestimonialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = addTestimonialForm.querySelector('button[type="submit"]');
        btn.textContent = 'Saving...';
        btn.disabled = true;

        try {
            const name = document.getElementById('testiName').value.trim();
            const role = document.getElementById('testiRole').value.trim();
            const company = document.getElementById('testiCompany').value.trim();
            const quote = document.getElementById('testiQuote').value.trim();
            const rating = parseInt(document.getElementById('testiRating').value, 10);
            const is_published = document.getElementById('testiPublished').checked;
            const photoFile = document.getElementById('testiPhoto').files[0];

            let image_url = null;
            if (photoFile) {
                const path = `testimonials/${Date.now()}_${photoFile.name}`;
                const { error: upErr } = await window.supabaseAdminClient.storage.from('portfolio_images').upload(path, photoFile);
                if (upErr) throw upErr;
                const { data: { publicUrl } } = window.supabaseAdminClient.storage.from('portfolio_images').getPublicUrl(path);
                image_url = publicUrl;
            }

            const payload = { client_name: name, role, company, content: quote, rating, published: is_published };
            if (image_url) payload.image_url = image_url;

            let error;
            if (editingTestimonialId) {
                ({ error } = await window.supabaseAdminClient.from('testimonials').update(payload).eq('id', editingTestimonialId));
            } else {
                ({ error } = await window.supabaseAdminClient.from('testimonials').insert([payload]));
            }
            if (error) throw error;

            resetTestimonialForm();
            await loadTestimonials();
        } catch (err) {
            alert('Error saving testimonial: ' + err.message);
        } finally {
            btn.textContent = 'Save Testimonial';
            btn.disabled = false;
        }
    });
}

// ─── Actions ──────────────────────────────────────────────────────────────────

async function toggleTestimonialPublished(id, currentState) {
    const { error } = await window.supabaseAdminClient
        .from('testimonials')
        .update({ published: !currentState })
        .eq('id', id);

    if (error) {
        alert('Error: ' + error.message);
    } else {
        await loadTestimonials();
    }
}

async function deleteTestimonial(id) {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    const { error } = await window.supabaseAdminClient
        .from('testimonials')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Error: ' + error.message);
    } else {
        await loadTestimonials();
    }
}

// ─── Auto-load on tab activation ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const testimonialsTab = document.getElementById('testimonials-tab');
    if (testimonialsTab) {
        testimonialsTab.addEventListener('shown.bs.tab', () => loadTestimonials());
    }
});
