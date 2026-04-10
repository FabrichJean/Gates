#!/usr/bin/env node

/**
 * Test server - Simule le streaming SSE pour tester le client
 * Usage: node scripts/test-deploy-server.js
 */

import http from 'http';

const PORT = 9000;

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(404);
    res.end();
    return;
  }

  const region = req.url.split('/').pop();

  if (req.url === `/deploy/${region}` && (region === 'cn' || region === 'yd')) {
    // Headers SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Simulation du déploiement
    simulateDeployment(res, region);
  } else {
    res.writeHead(404);
    res.end();
  }
});

function sendEvent(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

async function simulateDeployment(res, region) {
  try {
    const startTime = Date.now();

    // Event 1: Start
    sendEvent(res, {
      type: 'deployment_started',
      region: region,
      timestamp: new Date().toISOString(),
    });

    await delay(500);

    // Event 2: Build step
    sendEvent(res, {
      type: 'deployment_progress',
      step: 'build',
      output: 'Démarrage de la compilation...',
    });

    await delay(1000);

    // Event 3: Build progress
    sendEvent(res, {
      type: 'deployment_progress',
      step: 'build',
      output: '✓ TypeScript compilation',
      percentage: 25,
    });

    await delay(1500);

    sendEvent(res, {
      type: 'deployment_progress',
      step: 'build',
      output: '✓ Vite bundling',
      percentage: 50,
    });

    await delay(1500);

    sendEvent(res, {
      type: 'deployment_progress',
      step: 'build',
      output: '✓ Optimisation des assets',
      percentage: 75,
    });

    await delay(1000);

    sendEvent(res, {
      type: 'deployment_progress',
      step: 'build',
      output: '✓ Génération des sourcemaps',
      percentage: 100,
    });

    await delay(500);

    // Event 4: Build completed
    sendEvent(res, {
      type: 'deployment_step_completed',
      step: 'build',
      duration: 5.5,
    });

    await delay(1000);

    // Event 5: Rsync step
    sendEvent(res, {
      type: 'deployment_progress',
      step: 'rsync',
      output: 'Synchronisation des fichiers...',
    });

    await delay(500);

    sendEvent(res, {
      type: 'deployment_progress',
      step: 'rsync',
      output: '✓ index.html',
      percentage: 15,
    });

    await delay(1000);

    sendEvent(res, {
      type: 'deployment_progress',
      step: 'rsync',
      output: '✓ assets/app.js (2.5MB)',
      percentage: 45,
    });

    await delay(1000);

    sendEvent(res, {
      type: 'deployment_progress',
      step: 'rsync',
      output: '✓ assets/app.css (1.2MB)',
      percentage: 70,
    });

    await delay(1000);

    sendEvent(res, {
      type: 'deployment_progress',
      step: 'rsync',
      output: '✓ Tous les fichiers synchronisés',
      percentage: 100,
    });

    await delay(500);

    // Event 6: Rsync completed
    sendEvent(res, {
      type: 'deployment_step_completed',
      step: 'rsync',
      duration: 4.2,
    });

    await delay(1000);

    // Event 7: Completed
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    sendEvent(res, {
      type: 'deployment_completed',
      region: region,
      duration: parseFloat(duration),
      timestamp: new Date().toISOString(),
    });

    res.end();
  } catch (error) {
    sendEvent(res, {
      type: 'deployment_error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    res.end();
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║     Deploy Test Server - SSE Streaming                         ║
╠════════════════════════════════════════════════════════════════╣
║ Port: ${PORT}                                                      ║
║                                                                ║
║ Test avec curl:                                                ║
║   curl -N http://localhost:${PORT}/deploy/cn                     ║
║   curl -N http://localhost:${PORT}/deploy/yd                     ║
║                                                                ║
║ Ou depuis le client:                                           ║
║   DEPLOY_SERVICE_URL=http://localhost:${PORT} npm run deploy:cn  ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

process.on('SIGINT', () => {
  console.log('\nServeur arrêté');
  server.close();
  process.exit(0);
});
