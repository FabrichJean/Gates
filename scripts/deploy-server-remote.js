#!/usr/bin/env node

import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Détecter le chemin du projet (le script est dans scripts/)
const PROJECT_ROOT = process.env.PROJECT_ROOT || path.join(__dirname, '..');

// Vérifier que le projet existe
if (!fs.existsSync(PROJECT_ROOT)) {
  console.error(`ERROR: Project root not found at ${PROJECT_ROOT}`);
  console.error(`Set PROJECT_ROOT environment variable: export PROJECT_ROOT=/path/to/project`);
  process.exit(1);
}

const PORT = process.env.DEPLOY_PORT || 9000;

class DeploymentServer {
  constructor() {
    this.isDeploying = false;
    this.deployQueue = [];
    this.deployHistory = [];
  }

  async handleDeployment(region) {
    if (this.isDeploying) {
      this.deployQueue.push(region);
      return;
    }

    this.isDeploying = true;
    const startTime = new Date();

    try {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`  DÉPLOIEMENT ${region.toUpperCase()} - ${startTime.toLocaleString()}`);
      console.log(`${'='.repeat(70)}\n`);

      await this.runBuild(region);
      await this.runRsync(region);

      const duration = ((new Date() - startTime) / 1000).toFixed(2);
      console.log(`\n✓ Déploiement ${region.toUpperCase()} complété en ${duration}s\n`);

      this.deployHistory.push({
        region,
        status: 'success',
        timestamp: startTime,
        duration: parseFloat(duration),
      });
    } catch (error) {
      console.error(`\n✗ Erreur déploiement ${region.toUpperCase()}: ${error.message}\n`);
      this.deployHistory.push({
        region,
        status: 'error',
        timestamp: startTime,
        error: error.message,
      });
    } finally {
      this.isDeploying = false;

      if (this.deployQueue.length > 0) {
        const nextRegion = this.deployQueue.shift();
        await this.handleDeployment(nextRegion);
      }
    }
  }

  runBuild(region) {
    return new Promise((resolve, reject) => {
      const buildScript = region === 'cn' ? 'build:cn' : 'build:yd';
      console.log(`[STEP 1/2] Build ${region.toUpperCase()}...`);

      const child = spawn('npm', ['run', buildScript], {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
        shell: true,
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✓ Build ${region.toUpperCase()} réussi\n`);
          resolve();
        } else {
          reject(new Error(`Build ${region} échoué (exit code: ${code})`));
        }
      });

      child.on('error', reject);
    });
  }

  runRsync(region) {
    return new Promise((resolve, reject) => {
      const remotePath =
        region === 'cn' ? '/www/wwwroot/cn_vms_front.com/' : '/www/wwwroot/vms-front.com/';

      console.log(`[STEP 2/2] Rsync vers ${remotePath}...`);

      const distPath = path.join(PROJECT_ROOT, 'dist') + '/';
      const rsyncCommand = `rsync -av --delete ${distPath} ${remotePath}`;

      const child = spawn('bash', ['-c', rsyncCommand], {
        stdio: 'inherit',
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✓ Rsync ${region.toUpperCase()} réussi`);
          resolve();
        } else {
          reject(new Error(`Rsync ${region} échoué (exit code: ${code})`));
        }
      });

      child.on('error', reject);
    });
  }

  createServer() {
    return http.createServer((req, res) => {
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
        res.writeHead(202);
        res.end(JSON.stringify({ status: 'Déploiement CN lancé' }));
        this.handleDeployment('cn');
      } else if (req.method === 'POST' && pathname === '/deploy/yd') {
        res.writeHead(202);
        res.end(JSON.stringify({ status: 'Déploiement YD lancé' }));
        this.handleDeployment('yd');
      } else if (req.method === 'POST' && pathname === '/deploy/both') {
        res.writeHead(202);
        res.end(JSON.stringify({ status: 'Déploiement des deux régions lancé' }));
        this.handleDeployment('cn');
        this.handleDeployment('yd');
      } else if (req.method === 'GET' && pathname === '/health') {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            status: 'ok',
            service: 'Deploy Service',
            uptime: process.uptime(),
            isDeploying: this.isDeploying,
            queueLength: this.deployQueue.length,
            lastDeployments: this.deployHistory.slice(-5),
          })
        );
      } else if (req.method === 'GET' && pathname === '/') {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            service: 'VMS Deploy Service',
            version: '1.0.0',
            status: 'operational',
            endpoints: {
              'POST /deploy/cn': 'Déclencher déploiement CN',
              'POST /deploy/yd': 'Déclencher déploiement YD',
              'POST /deploy/both': 'Déclencher les deux déploiements',
              'GET /health': 'État du service',
              'GET /history': 'Historique des déploiements',
            },
          })
        );
      } else if (req.method === 'GET' && pathname === '/history') {
        res.writeHead(200);
        res.end(JSON.stringify({ history: this.deployHistory }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint non trouvé' }));
      }
    });
  }
}

const server = new DeploymentServer();
const httpServer = server.createServer();

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║     Deploy Service - Serveur en écoute                         ║
╠════════════════════════════════════════════════════════════════╣
║ Port: ${PORT}                                                      ║
║ URL: http://localhost:${PORT}                                     ║
║                                                                ║
║ Endpoints disponibles:                                         ║
║   POST /deploy/cn   - Déclencher déploiement CN              ║
║   POST /deploy/yd   - Déclencher déploiement YD              ║
║   POST /deploy/both - Déclencher les deux                    ║
║   GET  /health      - État du service                        ║
║   GET  /history     - Historique                             ║
║                                                                ║
║ Test: curl http://localhost:${PORT}/health                      ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

process.on('SIGINT', () => {
  console.log('\n\nShutdown signal reçu...');
  httpServer.close(() => {
    console.log('Service déploiement arrêté.');
    process.exit(0);
  });
});
