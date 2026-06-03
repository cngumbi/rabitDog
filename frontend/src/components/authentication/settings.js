import DashboardMenu from "../dashboard/dashboardMenu";


const Settings = {
    vignette: ()=>{
        // Tab navigation
        document.querySelectorAll('.settings-nav button').forEach(function(button){
          button.addEventListener('click', function(){
            document.querySelectorAll('.settings-nav button').forEach(i=>i.classList.remove('active'));
            button.classList.add('active');
            const tab = button.getAttribute('data-tab');
            document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
            const panel = document.getElementById('tab-' + tab);
            if(panel) panel.classList.add('active');
          });
        });
    
        // Simple switch toggles
        function toggleSwitch(el){
          el.classList.toggle('on');
          const pressed = el.classList.contains('on');
          el.setAttribute('aria-pressed', pressed ? 'true' : 'false');
        }
        document.querySelectorAll('.switch').forEach(function(s){
          s.addEventListener('click', function(){ toggleSwitch(s); });
        });
    
        // Save & reset (local demo only)
        document.getElementById('saveBtn').addEventListener('click', function(){
          const cfg = {
            currency: document.getElementById('currency').value,
            dateformat: document.getElementById('dateformat').value,
            workspaceName: document.getElementById('workspaceName').value,
            businessEmail: document.getElementById('businessEmail').value,
            emailAlerts: document.getElementById('emailSwitch').classList.contains('on'),
            lowStockAlerts: document.getElementById('lowstockSwitch').classList.contains('on'),
            digestTime: document.getElementById('digestTime').value,
            sessionTimeout: document.getElementById('sessionTimeout').value
          };
          localStorage.setItem('poultryhub.settings', JSON.stringify(cfg));
          alert('Settings saved');
        });
    
        document.getElementById('resetBtn').addEventListener('click', function(){
          if(confirm('Reset settings to defaults?')){
            localStorage.removeItem('poultryhub.settings');
            location.reload();
          }
        });
    
        // Load persisted settings on page load
        window.addEventListener('DOMContentLoaded', function(){
          try{
            const s = JSON.parse(localStorage.getItem('poultryhub.settings') || '{}');
            if(s.currency) document.getElementById('currency').value = s.currency;
            if(s.dateformat) document.getElementById('dateformat').value = s.dateformat;
            if(s.workspaceName) document.getElementById('workspaceName').value = s.workspaceName;
            if(s.businessEmail) document.getElementById('businessEmail').value = s.businessEmail;
            if(s.digestTime) document.getElementById('digestTime').value = s.digestTime;
            if(s.sessionTimeout) document.getElementById('sessionTimeout').value = s.sessionTimeout;
            if(s.emailAlerts) document.getElementById('emailSwitch').classList.add('on');
            if(s.lowStockAlerts) document.getElementById('lowstockSwitch').classList.add('on');
          }catch(e){/* ignore */}
        });
    },
    render: ()=>{
        return `
        <div id="sidebarOverlay" class="sidebar-overlay"></div>
        <div class="wrap">
            ${DashboardMenu.render({selected: ''})}
            <!--start of dashboard-->
            <div class="main" id="dashboard">
                <!--start of page header-->
                <div class="page-header">
                  <div>
                    <h1>Workspace Settings</h1>
                    <p>Configure preferences for your poultry operations dashboard, from workspace defaults to alerts and security settings.</p>
                  </div>
                  <a class="btn btn-outline-primary" href="/#/profile">View profile</a>
                </div>
                <!--end of page header-->
                <!--settiing panel-->
                <div class="settings-panel">
                <!--start of setting nav section-->
                <nav class="settings-nav" aria-label="Settings sections">
                  <h2>Sections</h2>
                  <ul>
                    <li><button type="button" class="tab-button active" data-tab="system">General</button></li>
                    <li><button type="button" class="tab-button" data-tab="notifications">Notifications</button></li>
                    <li><button type="button" class="tab-button" data-tab="security">Security</button></li>
                    <li><button type="button" class="tab-button" data-tab="integrations">Integrations</button></li>
                    <li><button type="button" class="tab-button" data-tab="about">About</button></li>
                  </ul>
                </nav>
                <!--setting content section-->
                <!--end of setting section-->
                <section class="settings-content">
                  <div class="settings-note"><strong>Tip:</strong> Save your changes after switching tabs to preserve your workspace preferences.</div>

                  <div id="tab-system" class="tab-panel active">
                    <div class="card">
                      <div class="card-header">
                        <h3>General settings</h3>
                        <span class="card-meta">Workspace defaults and branding</span>
                      </div>
                      <p class="card-description">Control how your team sees the dashboard, how dates and currency appear, and the default naming for your farm workspace.</p>
                      <div class="field-grid">
                        <div class="field-group">
                          <label for="workspaceName">Workspace name</label>
                          <input class="form-input" id="workspaceName" placeholder="e.g. Panze Farm" />
                          <p>Use a name that reflects your farm or company for all internal reports.</p>
                        </div>
                        <div class="field-group">
                          <label for="currency">Default currency</label>
                          <select class="form-select" id="currency"><option>Ksh</option><option>USD</option><option>EUR</option></select>
                          <p>Set the base currency used across invoices and financial reports.</p>
                        </div>
                        <div class="field-group">
                          <label for="dateformat">Date format</label>
                          <select class="form-select" id="dateformat"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option></select>
                          <p>Choose the date format that matches your local convention.</p>
                        </div>
                        <div class="field-group">
                          <label for="businessEmail">Business email</label>
                          <input class="form-input" id="businessEmail" placeholder="admin@panze-farm.com" />
                          <p>This email will be used for notifications and account recovery.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="tab-notifications" class="tab-panel">
                    <div class="card">
                      <div class="card-header">
                        <h3>Notifications</h3>
                        <span class="card-meta">Alert preferences and schedule</span>
                      </div>
                      <p class="card-description">Choose which alerts your team receives and when dashboard notifications should be sent.</p>
                      <div class="field-grid">
                        <div class="field-group">
                          <label>Email alerts</label>
                          <div class="switch" id="emailSwitch" role="button" aria-pressed="false"><span></span></div>
                        </div>
                        <div class="field-group">
                          <label>Low stock alerts</label>
                          <div class="switch on" id="lowstockSwitch" role="button" aria-pressed="true"><span></span></div>
                        </div>
                        <div class="field-group">
                          <label for="digestTime">Daily digest time</label>
                          <input type="time" class="form-input" id="digestTime" value="06:00" />
                          <p>Pick a time to receive a summary of the day’s activity.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="tab-security" class="tab-panel">
                    <div class="card">
                      <div class="card-header">
                        <h3>Security</h3>
                        <span class="card-meta">Access controls and session settings</span>
                      </div>
                      <p class="card-description">Protect your workspace with authentication and session policies that fit your team.</p>
                      <div class="field-grid">
                        <div class="field-group">
                          <label>Require 2FA for admin</label>
                          <div class="switch on" id="admin2fa" role="button" aria-pressed="true"><span></span></div>
                        </div>
                        <div class="field-group">
                          <label for="sessionTimeout">Session timeout (mins)</label>
                          <input type="number" min="5" class="form-input" id="sessionTimeout" value="120" />
                          <p>Automatically sign out inactive users after the selected time.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="tab-integrations" class="tab-panel">
                    <div class="card">
                      <div class="card-header">
                        <h3>Integrations</h3>
                        <span class="card-meta">Connect external services</span>
                      </div>
                      <p class="card-description">Link third-party tools for accounting, messaging, or farm management integrations.</p>
                      <div class="field-grid">
                        <div class="field-group">
                          <label>Accounting</label>
                          <select class="form-select"><option>None</option><option>Xero</option><option>QuickBooks</option></select>
                        </div>
                        <div class="field-group">
                          <label>SMS provider</label>
                          <select class="form-select"><option>None</option><option>Twilio</option><option>Nexmo</option></select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="tab-about" class="tab-panel">
                    <div class="card">
                      <div class="card-header">
                        <h3>About PoultryHub</h3>
                        <span class="card-meta">Product details and support</span>
                      </div>
                      <p class="card-description">Review your app version, license information, and how to reach support for help.</p>
                      <div class="field-grid">
                        <div class="field-group">
                          <label>Application version</label>
                          <input class="form-input" value="1.0.0" readonly />
                        </div>
                        <div class="field-group">
                          <label>Support email</label>
                          <input class="form-input" value="support@poultryhub.example" readonly />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="actions">
                    <button class="btn btn-outline" id="resetBtn" type="button">Reset</button>
                    <button class="btn btn-primary" id="saveBtn" type="button">Save changes</button>
                  </div>
                </section>
                <!--end of setting nav-->
                </div>
                <!--end of setting panel-->
            </div>
            <!--end of dashboard-->
        </div>
        `;
    }
};
export default Settings;