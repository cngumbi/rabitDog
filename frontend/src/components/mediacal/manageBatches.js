import DashboardMenu from '../dashboard/dashboardMenu';
import { livestockAPI } from '../../connection/livestockAPI';
import { livestockUtils } from '../../utils/livestockUtils';

const ManageBatches = {
    data: {
        batches: [],
        loading: false,
        selectedBatch: null,
        healthRecords: [],
        showHealthForm: false,
        formData: {}
    },

    async fetchBatches() {
        this.data.loading = true;
        try {
            const response = await livestockAPI.getAllBatches();
            this.data.batches = response.data || [];
        } catch (error) {
            console.error('Error fetching batches:', error);
            const errorMsg = livestockUtils.parseError(error);
            alert('Error: ' + errorMsg);
        } finally {
            this.data.loading = false;
        }
    },

    async fetchBatchHealthRecords(batchId) {
        this.data.loading = true;
        try {
            const response = await livestockAPI.getAllHealthRecords({ batch: batchId });
            this.data.healthRecords = response.data || [];
        } catch (error) {
            console.error('Error fetching health records:', error);
            const errorMsg = livestockUtils.parseError(error);
            alert('Error: ' + errorMsg);
        } finally {
            this.data.loading = false;
        }
    },

    async createHealthRecord() {
        try {
            this.data.loading = true;
            const formData = {
                ...this.data.formData,
                batch: this.data.selectedBatch
            };
            await livestockAPI.createHealthRecord(formData);
            alert('Health record created successfully!');
            this.data.formData = {};
            this.data.showHealthForm = false;
            await this.fetchBatchHealthRecords(this.data.selectedBatch);
            this.updateView();
        } catch (error) {
            console.error('Error creating health record:', error);
            const errorMsg = livestockUtils.parseError(error);
            alert('Error: ' + errorMsg);
        } finally {
            this.data.loading = false;
        }
    },

    async deleteHealthRecord(recordId) {
        if (confirm('Are you sure you want to delete this health record?')) {
            try {
                await livestockAPI.deleteHealthRecord(recordId);
                alert('Health record deleted successfully!');
                await this.fetchBatchHealthRecords(this.data.selectedBatch);
                this.updateView();
            } catch (error) {
                console.error('Error deleting health record:', error);
                const errorMsg = livestockUtils.parseError(error);
                alert('Error: ' + errorMsg);
            }
        }
    },

    selectBatch(batchId, batchName) {
        this.data.selectedBatch = batchId;
        this.fetchBatchHealthRecords(batchId);
    },

    renderBatchList() {
        const { batches, loading, selectedBatch } = this.data;

        if (loading) {
            return '<div class="loading-spinner"><p>Loading batches...</p></div>';
        }

        if (batches.length === 0) {
            return `
                <div class="empty-state">
                    <p>No livestock batches found. <a href="/#/livestock">Create one in Livestock Management</a></p>
                </div>
            `;
        }

        return `
            <div class="batches-list">
                <h3>Select a Batch</h3>
                <div style="display: grid; gap: 10px;">
                    ${batches.map(batch => `
                        <div style="padding: 15px; border: 1px solid ${selectedBatch === batch._id ? '#007bff' : '#ddd'}; background: ${selectedBatch === batch._id ? '#e7f3ff' : '#fff'}; border-radius: 4px; cursor: pointer;" onclick="window.manageBatchesInstance.selectBatch('${batch._id}', '${batch.batchName}');">
                            <div style="font-weight: bold; color: ${selectedBatch === batch._id ? '#007bff' : '#333'};">${batch.batchName}</div>
                            <div style="font-size: 0.9em; color: #666;">Type: ${batch.livestockType?.name || 'N/A'} | Quantity: ${batch.currentQuantity}/${batch.quantity}</div>
                            <div style="font-size: 0.85em; color: #999;">Code: ${batch.batchCode} | Status: <span class="status ${batch.status.toLowerCase()}">${batch.status}</span></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderHealthForm() {
        const { showHealthForm, formData } = this.data;

        if (!showHealthForm) {
            return '';
        }

        return `
            <div class="form-container" style="margin-top: 20px;">
                <h3>Add Health Record</h3>
                <div class="form-group">
                    <label>Record Type:</label>
                    <select onchange="window.manageBatchesInstance.data.formData.recordType = this.value;">
                        <option value="">Select Type</option>
                        <option value="Illness">Illness</option>
                        <option value="Vaccination">Vaccination</option>
                        <option value="Treatment">Treatment</option>
                        <option value="Routine Check">Routine Check</option>
                        <option value="Injury">Injury</option>
                        <option value="Mortality">Mortality</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea onchange="window.manageBatchesInstance.data.formData.description = this.value;">${formData.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Severity:</label>
                    <select onchange="window.manageBatchesInstance.data.formData.severity = this.value;">
                        <option value="">Select Severity</option>
                        <option value="Mild">Mild</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button onclick="window.manageBatchesInstance.createHealthRecord();" class="btn-submit">Add Record</button>
                    <button onclick="window.manageBatchesInstance.data.showHealthForm = false; window.manageBatchesInstance.updateView();" class="btn-cancel">Cancel</button>
                </div>
            </div>
        `;
    },

    renderHealthRecords() {
        const { healthRecords, loading, selectedBatch } = this.data;

        if (!selectedBatch) {
            return '<p style="text-align: center; color: #666;">Select a batch to view health records</p>';
        }

        if (loading) {
            return '<div class="loading-spinner"><p>Loading health records...</p></div>';
        }

        if (healthRecords.length === 0) {
            return `
                <div class="empty-state">
                    <p>No health records for this batch</p>
                    <button onclick="window.manageBatchesInstance.data.showHealthForm = true; window.manageBatchesInstance.updateView();" class="btn-create">+ Add Health Record</button>
                </div>
            `;
        }

        return `
            <div class="health-records">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3>Health Records</h3>
                    <button onclick="window.manageBatchesInstance.data.showHealthForm = true; window.manageBatchesInstance.updateView();" class="btn-create">+ Add Record</button>
                </div>
                <table class="health-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Severity</th>
                            <th>Description</th>
                            <th>Outcome</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${healthRecords.map(record => `
                            <tr>
                                <td>${livestockUtils.formatDate(record.recordDate)}</td>
                                <td>${record.recordType}</td>
                                <td><span class="status ${livestockUtils.getStatusColor(record.severity)}">${record.severity}</span></td>
                                <td>${record.description || 'N/A'}</td>
                                <td>${record.outcome || 'Pending'}</td>
                                <td>
                                    <button onclick="if(confirm('Delete record?')) window.manageBatchesInstance.deleteHealthRecord('${record._id}');" class="btn-danger">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${this.renderHealthForm()}
            </div>
        `;
    },

    render() {
        return `
            <div class="livestock-container">
                ${DashboardMenu.render({ selected: 'medicallogs' })}
                <div class="livestock-content">
                    <h1>Manage Health Records</h1>
                    <p style="color: #666; margin-bottom: 20px;">Manage health records for your livestock batches. Select a batch to view and add health records.</p>
                    <div style="display: grid; grid-template-columns: 300px 1fr; gap: 20px;">
                        <div>${this.renderBatchList()}</div>
                        <div>${this.renderHealthRecords()}</div>
                    </div>
                </div>
            </div>

            <style>
                .batches-list h3 { margin-top: 0; }
                .health-table { width: 100%; border-collapse: collapse; background: white; }
                .health-table thead { background-color: #007bff; color: white; }
                .health-table th, .health-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                .health-table tbody tr:hover { background-color: #f5f5f5; }
                .btn-danger { padding: 6px 12px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; }
                .btn-danger:hover { background-color: #c82333; }
                .btn-create { padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
                .btn-create:hover { background-color: #218838; }
                .form-container { background: #f5f5f5; padding: 15px; border-radius: 4px; }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-weight: bold; margin-bottom: 5px; }
                .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
                .form-actions { display: flex; gap: 10px; margin-top: 15px; }
                .btn-submit { flex: 1; padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
                .btn-cancel { flex: 1; padding: 10px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; }
                .status { padding: 4px 8px; border-radius: 4px; font-weight: bold; display: inline-block; }
                .status.active { background-color: #d4edda; color: #155724; }
                .status.completed { background-color: #cfe2ff; color: #084298; }
                .status.suspended { background-color: #fff3cd; color: #664d03; }
                .status.archived { background-color: #e2e3e5; color: #383d41; }
                .status.mild { background-color: #d4edda; color: #155724; }
                .status.moderate { background-color: #fff3cd; color: #856404; }
                .status.severe { background-color: #f8d7da; color: #721c24; }
                .status.critical { background-color: #e2e3e5; color: #383d41; }
                .empty-state { text-align: center; padding: 40px 20px; color: #666; }
                .loading-spinner { text-align: center; padding: 20px; }
            </style>
        `;
    },

    updateView() {
        const container = document.getElementById('main-content');
        if (container) {
            container.innerHTML = this.render();
        }
    },

    vignette() {
        this.init();
    },

    init() {
        window.manageBatchesInstance = this;
        this.fetchBatches();
        this.updateView();
    }
};

export default ManageBatches;
