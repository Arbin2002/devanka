// js/admin-cases.js
// Handles all Case Study CRUD in the admin panel.

let currentCaseId = null; // null = creating new, string = editing existing

// ─── Navigation ──────────────────────────────────────────────────────────────

function showCaseEditor(caseData = null) {
    document.getElementById('case-list-view').classList.add('d-none');
    const editorView = document.getElementById('case-editor-view');
    editorView.classList.remove('d-none');

    const title = editorView.querySelector('h4');

    if (caseData) {
        currentCaseId = caseData.id;
        title.innerHTML = '<span style="cursor:pointer" onclick="showCaseList()"><i class="fas fa-arrow-left me-2 text-primary"></i></span> Edit Case Study';
        populateCaseEditor(caseData);
    } else {
        currentCaseId = null;
        title.innerHTML = '<span style="cursor:pointer" onclick="showCaseList()"><i class="fas fa-arrow-left me-2 text-primary"></i></span> Create New Case Study';
        resetCaseEditor();
    }
}

function showCaseList() {
    document.getElementById('case-editor-view').classList.add('d-none');
    document.getElementById('case-list-view').classList.remove('d-none');
    loadCases();
}

// ─── Load ─────────────────────────────────────────────────────────────────────

async function loadCases() {
    const tbody = document.getElementById('caseTableBody');
    if (!tbody) return;

    const { data, error } = await window.supabaseAdminClient
        .from('case_studies')
        .select('id, title, project_type, status')
        .order('created_at', { ascending: false });

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
        td.textContent = 'No case studies yet. Click "Add New Case Study" to create one.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    data.forEach(cs => {
        const tr = document.createElement('tr');

        const tdTitle = document.createElement('td');
        tdTitle.className = 'py-3 px-4 fw-bold';
        tdTitle.textContent = cs.title || '—';

        const tdType = document.createElement('td');
        tdType.className = 'py-3 text-muted small';
        tdType.textContent = cs.project_type || '—';

        const tdStatus = document.createElement('td');
        tdStatus.className = 'py-3';
        const badge = document.createElement('span');
        badge.className = cs.status === 'Live'
            ? 'badge bg-success'
            : cs.status === 'Recently Launched'
                ? 'badge bg-primary'
                : 'badge bg-secondary';
        badge.textContent = cs.status || 'Unknown';
        tdStatus.appendChild(badge);

        const tdAction = document.createElement('td');
        tdAction.className = 'py-3 px-4 text-end';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary me-2';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => fetchAndEditCase(cs.id));

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-sm btn-outline-danger';
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', () => deleteCase(cs.id));

        tdAction.appendChild(editBtn);
        tdAction.appendChild(delBtn);

        tr.appendChild(tdTitle);
        tr.appendChild(tdType);
        tr.appendChild(tdStatus);
        tr.appendChild(tdAction);
        tbody.appendChild(tr);
    });
}

async function fetchAndEditCase(id) {
    const { data, error } = await window.supabaseAdminClient
        .from('case_studies')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        alert('Error loading case study: ' + error.message);
        return;
    }
    showCaseEditor(data);
}

// ─── Populate / Reset Editor ──────────────────────────────────────────────────

function populateCaseEditor(cs) {
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };
    set('csTitle', cs.title);
    set('csType', cs.project_type);
    set('csStatus', cs.status);
    set('csIndustry', cs.industry);
    set('csUrl', cs.website_url);
    set('csHeadline', cs.subtitle);   // stored as subtitle in DB
    set('csSummary', cs.summary);
    set('csProblem', cs.problem);
    set('csSolution', cs.solution);
    set('csSlug', cs.slug);
    set('csMetaTitle', cs.meta_title);
    set('csMetaDesc', cs.meta_description);
    set('csStartDate', cs.start_date);
    set('csLaunchDate', cs.launch_date);
    set('csDuration', cs.duration);
    set('csTestiName', cs.testimonial_name);
    set('csTestiRole', cs.testimonial_role);
    set('csTestiCompany', cs.testimonial_company);
    set('csTestiQuote', cs.testimonial_quote);

    // features is array of {name, description} objects
    renderFeatureFields(cs.features || []);
    renderChallengeFields(cs.challenges || []);
    renderMetricFields(cs.results || []);  // column is 'results' in DB

    // Tech badges
    const techContainer = document.getElementById('techBadgesContainer');
    if (techContainer) {
        techContainer.innerHTML = '';
        (cs.tech_stack || []).forEach(t => addTechBadgeValue(t));
    }
}

function resetCaseEditor() {
    ['csTitle', 'csHeadline', 'csSummary', 'csProblem', 'csSolution',
        'csIndustry', 'csUrl', 'csSlug', 'csMetaTitle', 'csMetaDesc',
        'csStartDate', 'csLaunchDate', 'csDuration',
        'csTestiName', 'csTestiRole', 'csTestiCompany', 'csTestiQuote'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const featuresList = document.getElementById('featuresList');
    if (featuresList) featuresList.innerHTML = '';
    const challengesList = document.getElementById('challengesList');
    if (challengesList) challengesList.innerHTML = '';
    const metricsList = document.getElementById('metricsList');
    if (metricsList) metricsList.innerHTML = '';
    const techContainer = document.getElementById('techBadgesContainer');
    if (techContainer) techContainer.innerHTML = '';
}

// ─── Dynamic Fields ───────────────────────────────────────────────────────────

// features = [{name, description}] objects
function addFeatureField(feature = {}) {
    const container = document.getElementById('featuresList');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'border rounded p-3 mb-2 position-relative';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'form-control mb-2 feature-name-input';
    nameInput.placeholder = 'Feature name (e.g. University Search)';
    nameInput.value = feature.name || '';
    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.className = 'form-control feature-desc-input';
    descInput.placeholder = 'Short description';
    descInput.value = feature.description || '';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-danger btn-sm position-absolute top-0 end-0 m-2';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => div.remove());
    div.appendChild(nameInput);
    div.appendChild(descInput);
    div.appendChild(removeBtn);
    container.appendChild(div);
}

function renderFeatureFields(features) {
    const container = document.getElementById('featuresList');
    if (container) container.innerHTML = '';
    // features can be [{name,description}] or plain strings for backward compat
    features.forEach(f => addFeatureField(typeof f === 'string' ? { name: f, description: '' } : f));
}

function addChallengeField(challenge = '', solution = '') {
    const container = document.getElementById('challengesList');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'border rounded p-3 mb-3 position-relative';
    const challengeInput = document.createElement('input');
    challengeInput.type = 'text';
    challengeInput.className = 'form-control mb-2 challenge-input';
    challengeInput.placeholder = 'Challenge description';
    challengeInput.value = challenge;
    const solutionInput = document.createElement('input');
    solutionInput.type = 'text';
    solutionInput.className = 'form-control challenge-solution-input';
    solutionInput.placeholder = 'How it was resolved';
    solutionInput.value = solution;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-danger btn-sm position-absolute top-0 end-0 m-2';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => div.remove());
    div.appendChild(challengeInput);
    div.appendChild(solutionInput);
    div.appendChild(removeBtn);
    container.appendChild(div);
}

function renderChallengeFields(challenges) {
    const container = document.getElementById('challengesList');
    if (container) container.innerHTML = '';
    challenges.forEach(c => addChallengeField(c.challenge || '', c.solution || ''));
}

function addMetricField(value = '', label = '') {
    const container = document.getElementById('metricsList');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'd-flex align-items-center mb-2 gap-2';
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'form-control metric-value';
    valueInput.placeholder = 'e.g. 2,000+';
    valueInput.value = value;
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'form-control metric-label';
    labelInput.placeholder = 'e.g. Students Registered';
    labelInput.value = label;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-danger btn-sm flex-shrink-0';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', () => div.remove());
    div.appendChild(valueInput);
    div.appendChild(labelInput);
    div.appendChild(removeBtn);
    container.appendChild(div);
}

function renderMetricFields(metrics) {
    const container = document.getElementById('metricsList');
    if (container) container.innerHTML = '';
    metrics.forEach(m => addMetricField(m.value || '', m.label || ''));
}

// ─── Tech Stack ───────────────────────────────────────────────────────────────

function handleTechInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addTechBadge();
    }
}

function addTechBadge() {
    const input = document.getElementById('techInput');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    addTechBadgeValue(val);
    input.value = '';
}

function addTechBadgeValue(tech) {
    const container = document.getElementById('techBadgesContainer');
    if (!container) return;
    const badge = document.createElement('span');
    badge.className = 'badge bg-primary fs-6 fw-normal d-flex align-items-center gap-1 py-2 px-3';
    const text = document.createElement('span');
    text.textContent = tech;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-close btn-close-white';
    btn.style.cssText = 'font-size:0.6rem';
    btn.setAttribute('aria-label', 'Remove ' + tech);
    btn.addEventListener('click', () => badge.remove());
    badge.appendChild(text);
    badge.appendChild(btn);
    container.appendChild(badge);
}

// ─── Save ─────────────────────────────────────────────────────────────────────

async function saveCaseStudy() {
    const saveBtn = document.querySelector('[onclick="saveCaseStudy()"]');
    if (saveBtn) { saveBtn.textContent = 'Saving...'; saveBtn.disabled = true; }

    try {
        // Collect features as [{name, description}] objects
        const featureBlocks = document.querySelectorAll('#featuresList .border');
        const features = Array.from(featureBlocks).map(block => ({
            name: block.querySelector('.feature-name-input')?.value.trim() || '',
            description: block.querySelector('.feature-desc-input')?.value.trim() || ''
        })).filter(f => f.name);

        // Collect challenges
        const challengeBlocks = document.querySelectorAll('#challengesList .border');
        const challenges = Array.from(challengeBlocks).map(block => ({
            challenge: block.querySelector('.challenge-input')?.value.trim() || '',
            solution: block.querySelector('.challenge-solution-input')?.value.trim() || ''
        })).filter(c => c.challenge);

        // Collect metrics/results
        const metricRows = document.querySelectorAll('#metricsList .d-flex');
        const results = Array.from(metricRows).map(row => ({
            value: row.querySelector('.metric-value')?.value.trim() || '',
            label: row.querySelector('.metric-label')?.value.trim() || ''
        })).filter(m => m.value);

        // Collect tech stack
        const tech_stack = Array.from(document.querySelectorAll('#techBadgesContainer span.badge > span'))
            .map(el => el.textContent.trim()).filter(Boolean);

        const payload = {
            title: document.getElementById('csTitle')?.value.trim() || '',
            project_type: document.getElementById('csType')?.value || 'Client Project',
            status: document.getElementById('csStatus')?.value || 'Live',
            industry: document.getElementById('csIndustry')?.value.trim() || '',
            website_url: document.getElementById('csUrl')?.value.trim() || '',
            subtitle: document.getElementById('csHeadline')?.value.trim() || '',   // stored as subtitle
            summary: document.getElementById('csSummary')?.value.trim() || '',
            problem: document.getElementById('csProblem')?.value.trim() || '',
            solution: document.getElementById('csSolution')?.value.trim() || '',
            slug: document.getElementById('csSlug')?.value.trim() || '',
            meta_title: document.getElementById('csMetaTitle')?.value.trim() || '',
            meta_description: document.getElementById('csMetaDesc')?.value.trim() || '',
            start_date: document.getElementById('csStartDate')?.value.trim() || '',
            launch_date: document.getElementById('csLaunchDate')?.value.trim() || '',
            duration: document.getElementById('csDuration')?.value.trim() || '',
            testimonial_name: document.getElementById('csTestiName')?.value.trim() || '',
            testimonial_role: document.getElementById('csTestiRole')?.value.trim() || '',
            testimonial_company: document.getElementById('csTestiCompany')?.value.trim() || '',
            testimonial_quote: document.getElementById('csTestiQuote')?.value.trim() || '',
            features,
            challenges,
            results,       // DB column is 'results'
            tech_stack
        };

        // Handle hero image upload
        const heroFile = document.getElementById('csHeroImage')?.files[0];
        if (heroFile) {
            const heroPath = `case_studies/${Date.now()}_hero_${heroFile.name}`;
            const { error: upErr } = await window.supabaseAdminClient.storage.from('portfolio_images').upload(heroPath, heroFile);
            if (upErr) throw upErr;
            const { data: { publicUrl } } = window.supabaseAdminClient.storage.from('portfolio_images').getPublicUrl(heroPath);
            payload.hero_image = publicUrl;  // DB column is 'hero_image'
        }

        // Handle gallery upload
        const galleryFiles = document.getElementById('csGalleryFiles')?.files;
        if (galleryFiles && galleryFiles.length > 0) {
            const galleryUrls = [];
            for (const file of galleryFiles) {
                const path = `case_studies/${Date.now()}_gallery_${file.name}`;
                const { error: upErr } = await window.supabaseAdminClient.storage.from('portfolio_images').upload(path, file);
                if (upErr) throw upErr;
                const { data: { publicUrl } } = window.supabaseAdminClient.storage.from('portfolio_images').getPublicUrl(path);
                galleryUrls.push(publicUrl);
            }
            payload.gallery_images = galleryUrls;
        }

        let error;
        if (currentCaseId) {
            ({ error } = await window.supabaseAdminClient.from('case_studies').update(payload).eq('id', currentCaseId));
        } else {
            ({ error } = await window.supabaseAdminClient.from('case_studies').insert([payload]));
        }
        if (error) throw error;

        alert(currentCaseId ? 'Case study updated!' : 'Case study created!');
        showCaseList();
    } catch (err) {
        alert('Error saving case study: ' + err.message);
    } finally {
        if (saveBtn) { saveBtn.innerHTML = '<i class="fas fa-save me-2"></i> Save Case Study'; saveBtn.disabled = false; }
    }
}

async function deleteCase(id) {
    if (!confirm('Delete this case study? This cannot be undone.')) return;
    const { error } = await window.supabaseAdminClient.from('case_studies').delete().eq('id', id);
    if (error) {
        alert('Error: ' + error.message);
    } else {
        await loadCases();
    }
}

// Auto-load cases when tab is activated
document.addEventListener('DOMContentLoaded', () => {
    const casesTab = document.getElementById('cases-tab');
    if (casesTab) {
        casesTab.addEventListener('shown.bs.tab', () => loadCases());
    }
});
