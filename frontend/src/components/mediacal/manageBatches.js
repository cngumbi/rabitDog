import DashboardMenu from '../dashboard/dashboardMenu';

const ManageBatches = {
    vignette: () => {
        const form = document.getElementById('add-batch-form');
        const batchesContainer = document.getElementById('batches-list-container');
        const statusMessage = document.getElementById('batch-status-message');

        // Get batches from localStorage
        const getBatchesFromStorage = () => {
            const stored = localStorage.getItem('poultryBatches');
            return stored ? JSON.parse(stored) : [
                'Batch A-12',
                'Batch B-06',
                'House 3',
                'House 4'
            ];
        };

        const saveBatchesToStorage = (batches) => {
            localStorage.setItem('poultryBatches', JSON.stringify(batches));
        };

        const renderBatches = () => {
            const batches = getBatchesFromStorage();
            if (!batches.length) {
                batchesContainer.innerHTML = '<p class="text-muted">No batches added yet. Add your first batch above.</p>';
                return;
            }
            batchesContainer.innerHTML = batches.map((batch, index) => `
                <div class="batch-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 0.5rem; background: #fafafa;">
                    <span>${batch}</span>
                    <button type="button" class="btn-red text-white batch-delete-btn" data-index="${index}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Delete</button>
                </div>
            `).join('');

            // Attach delete listeners
            document.querySelectorAll('.batch-delete-btn').forEach((btn) => {
                btn.addEventListener('click', (event) => {
                    const index = parseInt(event.target.dataset.index, 10);
                    if (confirm('Are you sure you want to delete this batch?')) {
                        batches.splice(index, 1);
                        saveBatchesToStorage(batches);
                        renderBatches();
                        if (statusMessage) {
                            statusMessage.textContent = 'Batch deleted successfully.';
                            statusMessage.className = 'form-success';
                            setTimeout(() => {
                                statusMessage.textContent = '';
                                statusMessage.className = '';
                            }, 3000);
                        }
                    }
                });
            });
        };

        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const batchName = document.getElementById('batch-name')?.value?.trim();

                if (!batchName) {
                    if (statusMessage) {
                        statusMessage.textContent = 'Batch name is required.';
                        statusMessage.className = 'form-error';
                    }
                    return;
                }

                const batches = getBatchesFromStorage();
                if (batches.includes(batchName)) {
                    if (statusMessage) {
                        statusMessage.textContent = 'This batch already exists.';
                        statusMessage.className = 'form-error';
                    }
                    return;
                }

                batches.push(batchName);
                saveBatchesToStorage(batches);

                if (statusMessage) {
                    statusMessage.textContent = 'Batch added successfully.';
                    statusMessage.className = 'form-success';
                }

                form.reset();
                renderBatches();
                setTimeout(() => {
                    statusMessage.textContent = '';
                    statusMessage.className = '';
                }, 3000);
            });
        }

        renderBatches();
    },
    render: async () => {
        return `
            <div class="wrap">
                ${DashboardMenu.render({ selected: 'medicallogs' })}
                <div class="main">
                    <div class="page-header">
                        <div>
                            <h1 class="font-xl">Manage Batches & Houses</h1>
                            <p class="text-muted">Create and manage the batches or houses you want to track health records for.</p>
                        </div>
                        <div>
                            <a class="btn-secondary" href="/#/medicallogs">Back to Health Records</a>
                        </div>
                    </div>

                    <div class="grid-two" style="margin-top: 1.5rem;">
                        <section class="panel">
                            <div class="card-title">Add New Batch / House</div>
                            <form id="add-batch-form">
                                <div id="batch-status-message" class="mb-2"></div>

                                <label class="form-label">Batch / House Name</label>
                                <input id="batch-name" class="form-control" type="text" name="batchName" placeholder="e.g., Batch A-12, House 3, Coop North" required>

                                <p class="text-muted" style="font-size: 0.9rem; margin-top: 0.75rem; margin-bottom: 0;">Examples: Batch A-12, House 3, Coop North, Shed East</p>

                                <div class="mt-3" style="display:flex;gap:0.5rem;">
                                    <button type="submit" class="btn-primary text-white">Add Batch</button>
                                    <button type="reset" class="btn-secondary">Clear</button>
                                </div>
                            </form>
                        </section>

                        <section class="panel">
                            <div class="card-title">Current Batches & Houses</div>
                            <div id="batches-list-container">
                                <p class="text-muted">Loading…</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        `;
    }
};

export default ManageBatches;
