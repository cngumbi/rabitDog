const MedicalLogs = {
    vignette: () => {
        // Add event listeners or any interactive behavior here if needed
    },
    render: async () => {

        return `
            <div class="wrap">
                ${DashboardMenu.render({ selected: 'medicallogs' })}
                <div class="main">
                  <div class="order-list">
                  <h1>Medical Logs</h1>
                  <p>This is the medical logs page.</p>
                  </div>
                </div>
            </div>
        `;
    }
};

export default MedicalLogs;