import DashboardMenu from "../dashboard/dashboardMenu";
import { getSettings as getServerSettings, updateSettings } from "../../connection/api";
import { getSettings as getLocalSettings, setSettings as setLocalSettings } from "../../localStorage";
import { hideLoading, showLoading, showMessage } from "../../utils";

const Settings = {
    vignette: async ()=>{
        const settingsKey = 'poultryhub.settings';
        const getById = (id) => document.getElementById(id);

        const setSwitchState = (switchEl, enabled) => {
          if (!switchEl) return;
          if (enabled) {
            switchEl.classList.add('on');
          } else {
            switchEl.classList.remove('on');
          }
          switchEl.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        };

        const toggleSwitch = (el) => {
          if (!el) return;
          setSwitchState(el, !el.classList.contains('on'));
        };

        const loadSettings = async () => {
          try {
            const localSettings = getLocalSettings();
            const response = await getServerSettings();
            const s = response.error ? localSettings : { ...localSettings, ...response.settings };
            if (s.currency) getById('currency').value = s.currency;
            if (s.dateformat) getById('dateformat').value = s.dateformat;
            if (s.workspaceName) getById('workspaceName').value = s.workspaceName;
            if (s.businessEmail) getById('businessEmail').value = s.businessEmail;
            if (s.digestTime) getById('digestTime').value = s.digestTime;
            if (s.sessionTimeout) getById('sessionTimeout').value = s.sessionTimeout;
            setSwitchState(getById('emailSwitch'), !!s.emailAlerts);
            setSwitchState(getById('lowstockSwitch'), !!s.lowStockAlerts);
            setSwitchState(getById('admin2fa'), !!s.admin2fa);
            if (!response.error) {
              localStorage.setItem(settingsKey, JSON.stringify(response.settings));
            }
          } catch (e) {
            console.warn('Unable to load settings', e);
          }
        };

        const saveSettings = async () => {
          const cfg = {
            currency: getById('currency')?.value || 'Ksh',
            dateformat: getById('dateformat')?.value || 'DD/MM/YYYY',
            workspaceName: getById('workspaceName')?.value || '',
            businessEmail: getById('businessEmail')?.value || '',
            emailAlerts: getById('emailSwitch')?.classList.contains('on'),
            lowStockAlerts: getById('lowstockSwitch')?.classList.contains('on'),
            digestTime: getById('digestTime')?.value || '06:00',
            sessionTimeout: Number(getById('sessionTimeout')?.value) || 120,
            admin2fa: getById('admin2fa')?.classList.contains('on')
          };
          localStorage.setItem(settingsKey, JSON.stringify(cfg));
          setLocalSettings(cfg);
          try {
            showLoading();
            const response = await updateSettings(cfg);
            hideLoading();
            if (response.error) {
              showMessage(response.error);
              return;
            }
            setLocalSettings(response.settings || cfg);
            showMessage('Settings saved successfully');
          } catch (error) {
            hideLoading();
            showMessage(error.message || 'Unable to save settings');
          }
        };

        const navButtons = Array.from(document.querySelectorAll('.settings-nav .tab-button'));
        const activateTab = (button) => {
          navButtons.forEach(i => i.classList.remove('active'));
          document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
          button.classList.add('active');
          const tab = button.getAttribute('data-tab');
          const panel = document.getElementById('tab-' + tab);
          if (panel) panel.classList.add('active');
        };

        navButtons.forEach(function(button){
          button.addEventListener('click', function(){ activateTab(button); });
        });
        document.querySelectorAll('.settings-nav li').forEach(function(item){
          item.addEventListener('click', function(event){
            if (event.target.closest('.tab-button')) return;
            const button = item.querySelector('.tab-button');
            if (button) activateTab(button);
          });
        });

        document.querySelectorAll('.switch').forEach(function(s){
          s.addEventListener('click', function(){ toggleSwitch(s); });
        });

        const saveBtn = getById('saveBtn');
        if (saveBtn) {
          saveBtn.addEventListener('click', async function(){
            await saveSettings();
          });
        }

        const resetBtn = getById('resetBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', async function(){
            if(confirm('Reset settings to defaults?')){
              localStorage.removeItem(settingsKey);
              try {
                showLoading();
                const response = await getServerSettings();
                hideLoading();
                if (!response.error && response.settings) {
                  setLocalSettings(response.settings);
                }
              } catch (error) {
                hideLoading();
              }
              await loadSettings();
            }
          });
        }

        await loadSettings();
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
                  <h2>Settings</h2>
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