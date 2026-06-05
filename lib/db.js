const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(process.cwd(), 'data.json');

const defaultState = {
  websites: [],
  incidents: [],
  webhookUrl: '',
};

function getDb() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading db:', error);
  }
  return defaultState;
}

function saveDb(state) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing db:', error);
  }
}

function addWebsite(website) {
  const state = getDb();
  const newWebsite = {
    ...website,
    id: crypto.randomUUID(),
    status: 'checking',
    lastChecked: null,
    history: [],
    offlineSince: null,
    alertSent: false,
    alertDelayMs: website.alertDelayMs || 0
  };
  state.websites.push(newWebsite);
  saveDb(state);
  return newWebsite;
}

function removeWebsite(id) {
  const state = getDb();
  state.websites = state.websites.filter((w) => w.id !== id);
  state.incidents = state.incidents.filter((i) => i.websiteId !== id);
  saveDb(state);
}

function updateWebhook(url) {
  const state = getDb();
  state.webhookUrl = url;
  saveDb(state);
}

function updateWebsiteStatus(id, result, webhookUrl) {
  const state = getDb();
  const website = state.websites.find((w) => w.id === id);
  if (!website) return state;

  const previousStatus = website.status;
  const newStatus = result.status;
  const hasStatusChanged = previousStatus !== newStatus && previousStatus !== 'checking';

  website.history.push(result);
  if (website.history.length > 100) {
    website.history.shift(); // Keep max 100
  }

  website.status = newStatus;
  website.lastChecked = result.timestamp;

  if (newStatus === 'offline' || newStatus === 'error') {
    if (!website.offlineSince) {
      website.offlineSince = result.timestamp;
    }
  } else if (newStatus === 'online') {
    website.offlineSince = null;
    website.alertSent = false;
  }

  if (hasStatusChanged) {
    const newIncident = {
      id: crypto.randomUUID(),
      websiteId: website.id,
      websiteName: website.name,
      timestamp: result.timestamp,
      previousStatus,
      newStatus,
      responseTime: result.responseTime,
    };
    state.incidents.unshift(newIncident);
  }

  // Check alert thresholds
  if ((newStatus === 'offline' || newStatus === 'error') && webhookUrl && !website.alertSent) {
    const downtime = result.timestamp - website.offlineSince;
    const delay = website.alertDelayMs || 0;
    
    if (downtime >= delay) {
      website.alertSent = true;
      const downtimeMinutes = Math.floor(downtime / 60000);
      const delayText = downtimeMinutes > 0 ? ` for over ${downtimeMinutes} minute(s)` : '';
      const alertMessage = `🚨 *Alert*: Website *${website.name}* (${website.url}) has been offline${delayText}.`;
      
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: alertMessage, // For Discord
          text: alertMessage,    // For Slack
        }),
      }).catch((err) => console.error('Webhook failed:', err));
    }
  }

  saveDb(state);
  return state;
}

module.exports = {
  getDb,
  saveDb,
  addWebsite,
  removeWebsite,
  updateWebhook,
  updateWebsiteStatus
};
