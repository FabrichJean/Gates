#!/usr/bin/env node

import readline from 'readline';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Charger les configurations des régions depuis .env.prod-*
function loadRegionConfigs() {
  const configs = {};
  const regions = ['cn', 'yd'];

  regions.forEach((region) => {
    const envFile = path.join(projectRoot, `.env.prod-${region}`);
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf-8');
      const config = {};

      content.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          config[match[1].trim()] = match[2].trim();
        }
      });

      configs[region] = config;
    }
  });

  return configs;
}

const DEPLOY_SERVICE_URL = process.env.DEPLOY_SERVICE_URL || 'http://192.168.1.97:9000';
const regionConfigs = loadRegionConfigs();

function sendDeployEvent(region) {
  return new Promise((resolve, reject) => {
    const config = regionConfigs[region];
    if (!config) {
      reject(new Error(`Configuration non trouvée pour la région: ${region}`));
      return;
    }

    // Utiliser le VITE_SERVER de la configuration régionale pour le service
    const serviceUrl = config.VITE_SERVER;
    const endpoint = `${serviceUrl}/api/v1/deploy/${region}`;
    const url = new URL(endpoint);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0,
        Accept: 'text/event-stream',
      },
      timeout: 3600000, // 1 hour timeout for long deployments
    };
    

    const req = http.request(options, (res) => {
      let buffer = '';

      // Afficher les événements en streaming
      res.on('data', (chunk) => {
        buffer += chunk.toString();

        // Traiter les événements SSE complets
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Garder la dernière ligne incomplète

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.substring(6));
              handleStreamEvent(jsonData);
            } catch (e) {
              // Ignorer les lignes qui ne sont pas du JSON valide
            }
          }
        }
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            status: 'success',
            statusCode: res.statusCode,
          });
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });

      res.on('error', (error) => {
        reject(error);
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout: Déploiement trop long'));
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

function handleStreamEvent(event) {
  const timestamp = new Date().toLocaleTimeString('fr-FR');

  switch (event.type) {
    case 'deployment_started':
      console.log(`\n[${timestamp}] ⏳ Déploiement démarré`);
      console.log(`    Région: ${event.region.toUpperCase()}`);
      break;

    case 'deployment_progress':
      if (event.step) {
        console.log(`\n[${timestamp}] 📍 Étape: ${event.step.toUpperCase()}`);
      }
      if (event.output) {
        console.log(`    ${event.output}`);
      }
      if (event.percentage !== undefined) {
        const bar = generateProgressBar(event.percentage);
        console.log(`    Progression: ${bar} ${event.percentage}%`);
      }
      break;

    case 'deployment_step_completed':
      console.log(`[${timestamp}] ✓ ${event.step} complété (${event.duration}s)`);
      break;

    case 'deployment_completed':
      console.log(`\n[${timestamp}] ✅ Déploiement réussi!`);
      console.log(`    Durée totale: ${event.duration}s`);
      console.log(`    Région: ${event.region.toUpperCase()}`);
      break;

    case 'deployment_error':
      console.error(`\n[${timestamp}] ❌ Erreur de déploiement`);
      console.error(`    ${event.error}`);
      if (event.step) {
        console.error(`    Étape échouée: ${event.step}`);
      }
      break;

    case 'deployment_warning':
      console.warn(`\n[${timestamp}] ⚠️  Avertissement: ${event.message}`);
      break;

    default:
      if (event.message) {
        console.log(`[${timestamp}] ℹ️  ${event.message}`);
      }
  }
}

function generateProgressBar(percentage, width = 30) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}]`;
}

function showMenu() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n' + '='.repeat(70));
    console.log('  SÉLECTION DE LA RÉGION DE DÉPLOIEMENT');
    console.log('='.repeat(70) + '\n');

    console.log('Régions disponibles:\n');

    Object.entries(regionConfigs).forEach(([key, config], index) => {
      const apiUrl = config.VITE_API_URL || 'N/A';
      const language = config.VITE_DEFAULT_UI_LANGUAGE || 'N/A';
      console.log(
        `  ${index + 1}. ${key.toUpperCase()} - API: ${apiUrl} - Langue: ${language}`
      );
    });

    console.log('  3. Les deux régions\n');

    rl.question('Choisir un numéro (1-3) ou "q" pour quitter: ', (answer) => {
      rl.close();

      const regions = Object.keys(regionConfigs);

      switch (answer.trim().toLowerCase()) {
        case '1':
          resolve(regions[0]);
          break;
        case '2':
          resolve(regions[1]);
          break;
        case '3':
          resolve('both');
          break;
        case 'q':
          console.log('Annulé.');
          process.exit(0);
          break;
        default:
          console.log('Choix invalide. Réessayez.');
          resolve(showMenu());
          break;
      }
    });
  });
}

async function main() {
  if (Object.keys(regionConfigs).length === 0) {
    console.error('Erreur: Aucune configuration de région trouvée.');
    console.error('Vérifiez les fichiers .env.prod-cn et .env.prod-yd');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let region = args[0];

  if (!region) {
    region = await showMenu();
  }

  region = region.toLowerCase();

  if (region === 'both') {
    console.log('\n' + '='.repeat(70));
    console.log('  DÉPLOIEMENT DES DEUX RÉGIONS');
    console.log('='.repeat(70));

    for (const reg of Object.keys(regionConfigs)) {
      await deployRegion(reg);
    }
  } else if (Object.keys(regionConfigs).includes(region)) {
    await deployRegion(region);
  } else {
    console.log(`Région invalide: ${region}`);
    console.log(`Régions valides: ${Object.keys(regionConfigs).join(', ')}, both`);
    process.exit(1);
  }
}

async function deployRegion(region) {
  console.log('\n' + '='.repeat(70));
  console.log(`  DÉPLOIEMENT ${region.toUpperCase()}`);
  console.log('='.repeat(70) + '\n');

  const config = regionConfigs[region];
  if (!config) {
    throw new Error(`Configuration non trouvée pour la région: ${region}`);
  }

  console.log('Configuration de la région:');
  console.log(`  - URL API de l'app: ${config.VITE_API_URL}`);
  console.log(`  - Langue: ${config.VITE_DEFAULT_UI_LANGUAGE}`);
  console.log(`  - Code région: ${config.VITE_REGION}`);
  console.log('\nService de déploiement:');
  console.log(`  - URL: ${config.VITE_SERVER}`);
  console.log('\n' + '='.repeat(70));
  console.log('  PROGRESSION DU DÉPLOIEMENT');
  console.log('='.repeat(70));

  try {
    await sendDeployEvent(region);

    console.log('\n' + '='.repeat(70));
    console.log('Déploiement terminé. Consultez les logs ci-dessus pour les détails.');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('ERREUR: Impossible de contacter le service de déploiement');
    console.error(`Service URL: ${config.VITE_SERVER}`);
    console.error(`Région: ${region.toUpperCase()}`);
    console.error(`Endpoint: POST ${config.VITE_SERVER}/api/v1/deploy/${region}`);
    console.error(`Message: ${error.message}`);
    console.error('='.repeat(70) + '\n');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Erreur:', error.message);
  process.exit(1);
});
