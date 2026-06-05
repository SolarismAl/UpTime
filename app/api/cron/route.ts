import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const [websitesSnap, settingsSnap] = await Promise.all([
      adminDb.collection('websites').get(),
      adminDb.collection('settings').doc('global').get()
    ]);
    
    const websites = websitesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    const webhookUrl = settingsSnap.exists ? settingsSnap.data()?.webhookUrl : null;
    
    const batch = adminDb.batch();
    
    const promises = websites.map(async (site) => {
      const startTime = performance.now();
      const controller = new AbortController();
      const timeoutMs = site.timeout || 4000;
      const expectedStatus = site.expectedStatus || 200;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      let result = { status: 'checking', responseTime: null as number | null, timestamp: Date.now() };

      try {
        const response = await fetch(site.url, { signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        const responseTime = performance.now() - startTime;

        if (response.status !== expectedStatus) {
          result = { status: 'error', responseTime, timestamp: Date.now() };
        } else if (site.keyword) {
          const body = await response.text();
          if (!body.includes(site.keyword)) {
            result = { status: 'error', responseTime, timestamp: Date.now() };
          } else {
            result = { status: 'online', responseTime, timestamp: Date.now() };
          }
        } else {
          result = { status: 'online', responseTime, timestamp: Date.now() };
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        result = { status: error.name === 'AbortError' ? 'offline' : 'error', responseTime: null, timestamp: Date.now() };
      }
      
      const previousStatus = site.status;
      const newStatus = result.status;
      const hasStatusChanged = previousStatus !== newStatus && previousStatus !== 'checking';
      
      let offlineSince = site.offlineSince;
      let alertSent = site.alertSent;
      
      if (newStatus === 'offline' || newStatus === 'error') {
        if (!offlineSince) {
          offlineSince = result.timestamp;
        }
      } else if (newStatus === 'online') {
        offlineSince = null;
        alertSent = false;
      }
      
      if (hasStatusChanged) {
        const newIncident = {
          id: crypto.randomUUID(),
          websiteId: site.id,
          websiteName: site.name,
          timestamp: result.timestamp,
          previousStatus,
          newStatus,
          responseTime: result.responseTime,
        };
        const incidentRef = adminDb.collection('incidents').doc(newIncident.id);
        batch.set(incidentRef, newIncident);
      }
      
      // Alert logic
      if ((newStatus === 'offline' || newStatus === 'error') && webhookUrl && !alertSent) {
        const downtime = result.timestamp - (offlineSince || result.timestamp);
        const delay = site.alertDelayMs || 0;
        
        if (downtime >= delay) {
          alertSent = true;
          const downtimeMinutes = Math.floor(downtime / 60000);
          const delayText = downtimeMinutes > 0 ? ` for over ${downtimeMinutes} minute(s)` : '';
          const alertMessage = `🚨 *Alert*: Website *${site.name}* (${site.url}) has been offline${delayText}.`;
          
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
      
      const newHistory = [...(site.history || []), result].slice(-50); // Keep last 50
      
      const websiteRef = adminDb.collection('websites').doc(site.id);
      batch.update(websiteRef, {
        status: newStatus,
        lastChecked: result.timestamp,
        history: newHistory,
        offlineSince,
        alertSent
      });
    });

    await Promise.all(promises);
    await batch.commit();
    
    return NextResponse.json({ success: true, checked: websites.length });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
