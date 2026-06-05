const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { getDb, updateWebsiteStatus } = require('./lib/db');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function checkStatus(site, webhookUrl) {
  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutMs = site.timeout || 4000;
  const expectedStatus = site.expectedStatus || 200;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(site.url, {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    if (response.status !== expectedStatus) {
      return { status: 'error', responseTime, message: `Expected ${expectedStatus}, got ${response.status}` };
    }

    if (site.keyword) {
      const body = await response.text();
      if (!body.includes(site.keyword)) {
        return { status: 'error', responseTime, message: `Keyword '${site.keyword}' not found` };
      }
    }

    return { status: 'online', responseTime, timestamp: Date.now() };
  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error.name === 'AbortError';
    return { status: isTimeout ? 'offline' : 'error', responseTime: null, timestamp: Date.now() };
  }
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.emit('state_sync', getDb());

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Background polling loop
  setInterval(async () => {
    const state = getDb();
    const currentWebsites = state.websites || [];
    let stateChanged = false;

    for (const site of currentWebsites) {
      const result = await checkStatus(site, state.webhookUrl);
      const previousStatus = site.status;
      
      const updatedState = updateWebsiteStatus(site.id, {
        timestamp: result.timestamp,
        status: result.status,
        responseTime: result.responseTime
      }, state.webhookUrl);
      
      if (updatedState) {
        stateChanged = true;
      }
    }

    if (stateChanged) {
      io.emit('state_sync', getDb());
    }

  }, 5000);

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
