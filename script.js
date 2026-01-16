document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const invoiceData = {
        type: 'invoice',
        currency: 'USD',
        number: 'INV-001',
        date: new Date().toISOString().split('T')[0],
        from: '',
        to: '',
        items: [
            { id: 1, desc: 'Web Design Service', qty: 1, price: 500.00 }
        ],
        notes: ''
    };

    const currencySymbols = {
        USD: '$',
        GBP: '£',
        EUR: '€',
        NGN: '₦'
    };

    // --- Elements ---
    const elements = {
        docType: document.getElementById('doc-type'),
        currency: document.getElementById('currency'),
        numberIn: document.getElementById('invoice-number'),
        dateIn: document.getElementById('invoice-date'),
        fromIn: document.getElementById('from-details'),
        toIn: document.getElementById('to-details'),
        notesIn: document.getElementById('notes'),
        itemsList: document.getElementById('items-list'),
        addItemBtn: document.getElementById('add-item-btn'),
        downloadBtn: document.getElementById('download-btn'),
        themeToggle: document.getElementById('theme-toggle'),

        // Preview Elements
        prevTitle: document.querySelector('.inv-title'),
        prevNumber: document.getElementById('preview-number'),
        prevDate: document.getElementById('preview-date'),
        prevFrom: document.getElementById('preview-from'),
        prevTo: document.getElementById('preview-to'),
        prevItemsBody: document.getElementById('preview-items-body'),
        prevSubtotal: document.getElementById('preview-subtotal'),
        prevTotal: document.getElementById('preview-total'),
        prevNotes: document.getElementById('preview-notes')
    };

    // --- Initialization ---
    function init() {
        // Set initial values from state to inputs
        elements.docType.value = invoiceData.type;
        elements.currency.value = invoiceData.currency;
        elements.numberIn.value = invoiceData.number;
        elements.dateIn.value = invoiceData.date;
        elements.fromIn.value = invoiceData.from;
        elements.toIn.value = invoiceData.to;
        elements.notesIn.value = invoiceData.notes;

        // Render initial items
        renderEditorItems();
        updatePreview();

        // Event Listeners
        elements.docType.addEventListener('change', (e) => {
            invoiceData.type = e.target.value;
            updatePreview();
        });

        elements.currency.addEventListener('change', (e) => {
            invoiceData.currency = e.target.value;
            updatePreview();
        });

        elements.numberIn.addEventListener('input', (e) => {
            invoiceData.number = e.target.value;
            updatePreview();
        });
        elements.dateIn.addEventListener('input', (e) => {
            invoiceData.date = e.target.value;
            updatePreview();
        });
        elements.fromIn.addEventListener('input', (e) => {
            invoiceData.from = e.target.value;
            updatePreview();
        });
        elements.toIn.addEventListener('input', (e) => {
            invoiceData.to = e.target.value;
            updatePreview();
        });
        elements.notesIn.addEventListener('input', (e) => {
            invoiceData.notes = e.target.value;
            updatePreview();
        });

        elements.addItemBtn.addEventListener('click', addItem);
        elements.downloadBtn.addEventListener('click', generatePDF);
        elements.themeToggle.addEventListener('click', toggleTheme);

        // Auto-resize textareas
        document.querySelectorAll('textarea').forEach(el => {
            el.addEventListener('input', autoResize);
        });

        // Global access for inline onclicks (not ideal but quick)
        window.updateItemInState = (id, field, value) => updateItem(id, field, value);
        window.removeItemFromState = (id) => removeItem(id);

        // Initial resize check
        setTimeout(resizePreview, 100);
    }

    // --- Logic ---

    function addItem() {
        const newItem = {
            id: Date.now(),
            desc: '',
            qty: 1,
            price: 0
        };
        invoiceData.items.push(newItem);
        renderEditorItems();
        updatePreview();
    }

    function removeItem(id) {
        invoiceData.items = invoiceData.items.filter(item => item.id !== id);
        renderEditorItems();
        updatePreview();
    }

    function updateItem(id, field, value) {
        const item = invoiceData.items.find(i => i.id === id);
        if (item) {
            item[field] = field === 'desc' ? value : parseFloat(value) || 0;
            updatePreview();
        }
    }

    function renderEditorItems() {
        elements.itemsList.innerHTML = '';
        invoiceData.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <input type="text" placeholder="Description" value="${item.desc}" oninput="updateItemInState(${item.id}, 'desc', this.value)">
                <input type="number" placeholder="Qty" value="${item.qty}" min="1" oninput="updateItemInState(${item.id}, 'qty', this.value)">
                <input type="number" placeholder="Price" value="${item.price}" min="0" step="0.01" oninput="updateItemInState(${item.id}, 'price', this.value)">
                <button type="button" class="item-remove" onclick="removeItemFromState(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            elements.itemsList.appendChild(row);
        });
    }

    function updatePreview() {
        // Title & Meta
        elements.prevTitle.textContent = invoiceData.type.toUpperCase();
        elements.prevNumber.textContent = '#' + (invoiceData.number || '');
        elements.prevDate.textContent = invoiceData.date;
        elements.prevFrom.textContent = invoiceData.from || 'Company Name';
        elements.prevTo.textContent = invoiceData.to || 'Client Name';
        elements.prevNotes.textContent = invoiceData.notes;

        // Items
        elements.prevItemsBody.innerHTML = '';
        let subtotal = 0;

        invoiceData.items.forEach(item => {
            const total = item.qty * item.price;
            subtotal += total;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="col-desc">${item.desc || 'Item'}</td>
                <td class="col-qty">${item.qty}</td>
                <td class="col-price">${formatCurrency(item.price)}</td>
                <td class="col-total">${formatCurrency(total)}</td>
            `;
            elements.prevItemsBody.appendChild(tr);
        });

        elements.prevSubtotal.textContent = formatCurrency(subtotal);
        elements.prevTotal.textContent = formatCurrency(subtotal);

        // Ensure resize is called after content update
        resizePreview();
    }

    function formatCurrency(amount) {
        // NGN often uses 'NGN' code in Intl if symbol isn't supported, but we force symbol here manually for consistency or use Intl
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: invoiceData.currency,
            currencyDisplay: 'narrowSymbol'
        }).format(amount);
    }

    function autoResize(e) {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }

    // Theme toggle
    let isDark = false;
    function toggleTheme() {
        isDark = !isDark;
        elements.themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';

        if (isDark) {
            document.documentElement.style.setProperty('--bg-app', '#0f172a');
            document.documentElement.style.setProperty('--bg-card', '#1e293b');
            document.documentElement.style.setProperty('--text-main', '#e2e8f0');
            document.documentElement.style.setProperty('--text-light', '#94a3b8');
            document.documentElement.style.setProperty('--border-color', '#334155');

            // New input variables
            document.documentElement.style.setProperty('--bg-input', '#0f172a'); // Inset dark
            document.documentElement.style.setProperty('--border-input', '#334155');

        } else {
            document.documentElement.style.removeProperty('--bg-app');
            document.documentElement.style.removeProperty('--bg-card');
            document.documentElement.style.removeProperty('--text-main');
            document.documentElement.style.removeProperty('--text-light');
            document.documentElement.style.removeProperty('--border-color');

            document.documentElement.style.removeProperty('--bg-input');
            document.documentElement.style.removeProperty('--border-input');
        }
    }

    // --- Responsive Scaling ---
    // --- Mobile Preview Toggle ---
    const mobilePreviewBtn = document.getElementById('mobile-preview-btn');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    const previewSection = document.getElementById('preview-section');

    if (mobilePreviewBtn) {
        mobilePreviewBtn.addEventListener('click', () => {
            previewSection.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent bg scroll
            setTimeout(resizePreview, 50); // Trigger resize immediately after display block
        });
    }

    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', () => {
            previewSection.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // --- Responsive Scaling ---
    function resizePreview() {
        const container = document.querySelector('.paper-scroll-container');
        const paper = document.getElementById('invoice-preview');

        if (!container || !paper) return;

        const containerWidth = container.offsetWidth;
        const paperWidth = 790; // Fixed width in CSS

        // If container < paper, scale down
        if (containerWidth < paperWidth) {
            const scale = containerWidth / paperWidth;
            paper.style.transform = `scale(${scale})`;

            // Adjust height container to match scaled height
            const visualHeight = paper.scrollHeight * scale;
            container.style.height = `${visualHeight}px`;
        } else {
            paper.style.transform = 'scale(1)';
            container.style.height = 'auto';
        }
    }

    window.addEventListener('resize', resizePreview);

    function generatePDF() {
        const element = document.getElementById('invoice-preview');
        // Update title for filename
        const filename = `${invoiceData.type}_${invoiceData.number}.pdf`;

        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        const btn = elements.downloadBtn;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
        btn.disabled = true;

        // Reset scale before generating to ensure full resolution structure
        const currentTransform = element.style.transform;
        const currentContainerHeight = document.querySelector('.paper-scroll-container').style.height;

        element.style.transform = 'scale(1)';
        document.querySelector('.paper-scroll-container').style.height = 'auto';

        html2pdf().set(opt).from(element).save().then(() => {
            // Restore scale
            element.style.transform = currentTransform;
            document.querySelector('.paper-scroll-container').style.height = currentContainerHeight;

            btn.innerHTML = originalText;
            btn.disabled = false;
        }).catch(err => {
            // Safe restore in case of error
            element.style.transform = currentTransform;
            document.querySelector('.paper-scroll-container').style.height = currentContainerHeight;
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    }

    // Run
    init();
});
