import http from 'http';
import DeployService from './deploy-service.js';

const PORT = process.env.DEPLOY_SERVICE_PORT || 9000;
const service = new DeployService();

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === 'POST' && pathname === '/deploy/cn') {
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Déploiement CN lancé' }));
    service.emit('deploy:cn');
  } else if (req.method === 'POST' && pathname === '/deploy/yd') {
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Déploiement YD lancé' }));
    service.emit('deploy:yd');
  } else if (req.method === 'POST' && pathname === '/deploy/both') {
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Déploiement des deux régions lancé' }));
    service.emit('deploy:both');
  } else if (req.method === 'GET' && pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'Deploy Service',
      uptime: process.uptime(),
      isDeploying: service.isDeploying,
      queueLength: service.deployQueue.length
    }));
  } else if (req.method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'VMS Deploy Service',
      version: '1.0.0',
      endpoints: {
        'POST /deploy/cn': 'Déployer la région CN',
        'POST /deploy/yd': 'Déployer la région YD',
        'POST /deploy/both': 'Déployer les deux régions',
        'GET /health': 'État du service'
      }
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint non trouvé' }));
  }
});

service.on('deploy:start', ({ region }) => {
  console.log(`[${new Date().toISOString()}] Déploiement ${region} en cours...`);
});

service.on('deploy:success', ({ region }) => {
  console.log(`[${new Date().toISOString()}] Déploiement ${region} réussi`);
});

service.on('deploy:error', ({ region, error }) => {
  console.error(`[${new Date().toISOString()}] Déploiement ${region} échoué: ${error.message}`);
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║     Deploy Service - HTTP Server                   ║
╠════════════════════════════════════════════════════╣
║ Server listening on port ${PORT}                      ║
║                                                    ║
║ Endpoints:                                         ║
║   POST /deploy/cn   - Deploy region CN            ║
║   POST /deploy/yd   - Deploy region YD            ║
║   POST /deploy/both - Deploy both regions         ║
║   GET  /health      - Service health              ║
║                                                    ║
║ Test: curl http://localhost:${PORT}/health         ║
╚════════════════════════════════════════════════════╝
  `);
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
