// js/admin.js

const SUPABASE_URL = 'https://ysdxpzmijxdjcuublxxq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WlU14Kmk7hTOMObXRuACBA_HKIOS-rL';
const supabaseAdminClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseAdminClient = supabaseAdminClient;

/**
 * Escapes special HTML characters to prevent XSS.
 * Uses a Map (no prototype chain) to prevent prototype pollution attacks.
 */
const HTML_ESCAPE_MAP = new Map([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#x27;'],
    ['`', '&#x60;'],
]);

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"'`]/g, (ch) => HTML_ESCAPE_MAP.get(ch));
}

// ─── Auth ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseAdminClient.auth.getSession();
    if (session) {
        showDashboard();
    }

    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const msgEl = document.getElementById('loginMessage');

    msgEl.className = 'alert alert-info';
    msgEl.textContent = 'Signing in...';

    const { error } = await supabaseAdminClient.auth.signInWithPassword({ email, password });

    if (error) {
        msgEl.className = 'alert alert-danger';
        msgEl.textContent = 'Login failed: ' + error.message;
    } else {
        showDashboard();
    }
}

async function handleLogout() {
    await supabaseAdminClient.auth.signOut();
    document.getElementById('dashboard-section').classList.add('d-none');
    document.getElementById('login-section').classList.remove('d-none');
    document.getElementById('adminLoginForm').reset();
    const msgEl = document.getElementById('loginMessage');
    msgEl.className = 'd-none';
}

function showDashboard() {
    document.getElementById('login-section').classList.add('d-none');
    document.getElementById('dashboard-section').classList.remove('d-none');
    loadSubmissions();
    loadProducts();
    loadTeam();
}

// ─── Contact Submissions ─────────────────────────────────────────────────────

async function loadSubmissions() {
    const tbody = document.getElementById('submissionsTableBody');
    if (!tbody) return;

    const { data, error } = await supabaseAdminClient
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

    tbody.innerHTML = '';

    if (error) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.className = 'text-center text-danger py-4';
        td.textContent = 'Error loading submissions: ' + error.message;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    if (!data || data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 7;
        td.className = 'text-center text-muted py-4';
        td.textContent = 'No submissions yet.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        const date = new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const cells = [date, row.name, row.email, row.phone, row.project, row.subject, row.message];
        cells.forEach(val => {
            const td = document.createElement('td');
            td.className = 'py-3 px-3';
            td.textContent = val || '—';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// ─── Products ────────────────────────────────────────────────────────────────

async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const { data, error } = await supabaseAdminClient
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });

    tbody.innerHTML = '';

    if (error) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.className = 'text-center text-danger py-4';
        td.textContent = 'Error: ' + error.message;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    if (!data || data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.className = 'text-center text-muted py-4';
        td.textContent = 'No products yet.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    data.forEach(product => {
        const tr = document.createElement('tr');

        const tdTitle = document.createElement('td');
        tdTitle.className = 'py-3 px-4 fw-bold';
        tdTitle.textContent = product.title || '—';

        const tdLink = document.createElement('td');
        tdLink.className = 'py-3';
        if (product.link) {
            const a = document.createElement('a');
            a.href = product.link;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'text-primary small';
            a.textContent = product.link;
            tdLink.appendChild(a);
        } else {
            tdLink.textContent = '—';
        }

        const tdAction = document.createElement('td');
        tdAction.className = 'py-3 px-4 text-end';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary me-2';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => openEditProductModal(product));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteProduct(product.id));

        tdAction.appendChild(editBtn);
        tdAction.appendChild(deleteBtn);

        tr.appendChild(tdTitle);
        tr.appendChild(tdLink);
        tr.appendChild(tdAction);
        tbody.appendChild(tr);
    });
}

const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = addProductForm.querySelector('button[type="submit"]');
        btn.textContent = 'Saving...';
        btn.disabled = true;

        try {
            const title = document.getElementById('prodTitle').value.trim();
            const desc = document.getElementById('prodDesc').value.trim();
            const link = document.getElementById('prodLink').value.trim();
            const imgFile = document.getElementById('prodImgFile').files[0];
            const logoFile = document.getElementById('prodLogoFile').files[0];

            const imgPath = `products/${Date.now()}_${imgFile.name}`;
            const logoPath = `products/${Date.now()}_logo_${logoFile.name}`;

            const { error: imgErr } = await supabaseAdminClient.storage.from('portfolio_images').upload(imgPath, imgFile);
            if (imgErr) throw imgErr;
            const { error: logoErr } = await supabaseAdminClient.storage.from('portfolio_images').upload(logoPath, logoFile);
            if (logoErr) throw logoErr;

            const { data: { publicUrl: imgUrl } } = supabaseAdminClient.storage.from('portfolio_images').getPublicUrl(imgPath);
            const { data: { publicUrl: logoUrl } } = supabaseAdminClient.storage.from('portfolio_images').getPublicUrl(logoPath);

            const { error } = await supabaseAdminClient.from('portfolio_projects').insert([{
                title, description: desc, link: link, image_url: imgUrl, category: logoUrl
            }]);
            if (error) throw error;

            addProductForm.reset();
            await loadProducts();
            alert('Product saved successfully!');
        } catch (err) {
            alert('Error saving product: ' + err.message);
        } finally {
            btn.textContent = 'Save Product';
            btn.disabled = false;
        }
    });
}

function openEditProductModal(product) {
    document.getElementById('editProdId').value = product.id;
    document.getElementById('editProdCurrentImg').value = product.image_url || '';
    document.getElementById('editProdCurrentLogo').value = product.logo_url || '';
    document.getElementById('editProdTitle').value = product.title || '';
    document.getElementById('editProdDesc').value = product.description || '';
    document.getElementById('editProdLink').value = product.link_url || '';

    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    modal.show();
}

const editProductForm = document.getElementById('editProductForm');
if (editProductForm) {
    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = editProductForm.querySelector('button[type="submit"]');
        btn.textContent = 'Updating...';
        btn.disabled = true;

        try {
            const id = document.getElementById('editProdId').value;
            const updates = {
                title: document.getElementById('editProdTitle').value.trim(),
                description: document.getElementById('editProdDesc').value.trim(),
                link: document.getElementById('editProdLink').value.trim(),
            };

            const newImgFile = document.getElementById('editProdImgFile').files[0];
            const newLogoFile = document.getElementById('editProdLogoFile').files[0];

            if (newImgFile) {
                const imgPath = `products/${Date.now()}_${newImgFile.name}`;
                await supabaseAdminClient.storage.from('portfolio_images').upload(imgPath, newImgFile);
                const { data: { publicUrl } } = supabaseAdminClient.storage.from('portfolio_images').getPublicUrl(imgPath);
                updates.image_url = publicUrl;
            }

            if (newLogoFile) {
                const logoPath = `products/${Date.now()}_logo_${newLogoFile.name}`;
                await supabaseAdminClient.storage.from('portfolio_images').upload(logoPath, newLogoFile);
                const { data: { publicUrl } } = supabaseAdminClient.storage.from('portfolio_images').getPublicUrl(logoPath);
                updates.logo_url = publicUrl;
            }

            const { error } = await supabaseAdminClient.from('portfolio_projects').update(updates).eq('id', id);
            if (error) throw error;

            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
            await loadProducts();
        } catch (err) {
            alert('Error updating product: ' + err.message);
        } finally {
            btn.textContent = 'Update Product';
            btn.disabled = false;
        }
    });
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabaseAdminClient.from('portfolio_projects').delete().eq('id', id);
    if (error) {
        alert('Error deleting: ' + error.message);
    } else {
        await loadProducts();
    }
}

// ─── Team ────────────────────────────────────────────────────────────────────

async function loadTeam() {
    const tbody = document.getElementById('teamTableBody');
    if (!tbody) return;

    const { data, error } = await supabaseAdminClient
        .from('team_members')
        .select('id, name, position, image_url, social_links')
        .order('created_at', { ascending: true });

    tbody.innerHTML = '';

    if (error) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.className = 'text-center text-danger py-4';
        td.textContent = 'Error: ' + error.message;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    if (!data || data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.className = 'text-center text-muted py-4';
        td.textContent = 'No team members yet.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    data.forEach(member => {
        const tr = document.createElement('tr');

        const tdPhoto = document.createElement('td');
        tdPhoto.className = 'py-3 px-4';
        if (member.image_url) {
            const img = document.createElement('img');
            img.src = member.image_url;
            img.alt = member.name || 'Team member';
            img.style.cssText = 'width:48px;height:48px;object-fit:cover;border-radius:50%';
            tdPhoto.appendChild(img);
        } else {
            tdPhoto.textContent = '—';
        }

        const tdName = document.createElement('td');
        tdName.className = 'py-3 fw-bold';
        tdName.textContent = member.name || '—';

        const tdRole = document.createElement('td');
        tdRole.className = 'py-3 text-muted';
        tdRole.textContent = member.position || '—';

        const tdAction = document.createElement('td');
        tdAction.className = 'py-3 px-4 text-end';
        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-sm btn-outline-danger';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => deleteTeamMember(member.id));
        tdAction.appendChild(delBtn);

        tr.appendChild(tdPhoto);
        tr.appendChild(tdName);
        tr.appendChild(tdRole);
        tr.appendChild(tdAction);
        tbody.appendChild(tr);
    });
}

const addTeamForm = document.getElementById('addTeamForm');
if (addTeamForm) {
    addTeamForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = addTeamForm.querySelector('button[type="submit"]');
        btn.textContent = 'Saving...';
        btn.disabled = true;

        try {
            const name = document.getElementById('teamName').value.trim();
            const role = document.getElementById('teamRole').value.trim();
            const photoFile = document.getElementById('teamPhoto').files[0];
            const fb = document.getElementById('teamFb').value.trim();
            const twitter = document.getElementById('teamTwitter').value.trim();
            const linkedin = document.getElementById('teamLinkedin').value.trim();
            const insta = document.getElementById('teamInsta').value.trim();

            let image_url = null;
            if (photoFile) {
                const path = `team_${Date.now()}_${photoFile.name}`;
                const { error: upErr } = await supabaseAdminClient.storage.from('portfolio_images').upload(path, photoFile);
                if (upErr) throw upErr;
                const { data: { publicUrl } } = supabaseAdminClient.storage.from('portfolio_images').getPublicUrl(path);
                image_url = publicUrl;
            }

            const social_links = {};
            if (fb) social_links.facebook = fb;
            if (twitter) social_links.twitter = twitter;
            if (linkedin) social_links.linkedin = linkedin;
            if (insta) social_links.instagram = insta;

            const { error } = await supabaseAdminClient.from('team_members').insert([{
                name, position: role, image_url,
                social_links: Object.keys(social_links).length ? social_links : null
            }]);
            if (error) throw error;

            addTeamForm.reset();
            await loadTeam();
            alert('Team member added!');
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            btn.textContent = 'Save Member';
            btn.disabled = false;
        }
    });
}

async function deleteTeamMember(id) {
    if (!confirm('Delete this team member?')) return;
    const { error } = await supabaseAdminClient.from('team_members').delete().eq('id', id);
    if (error) {
        alert('Error: ' + error.message);
    } else {
        await loadTeam();
    }
}
