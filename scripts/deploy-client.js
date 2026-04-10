#!/usr/bin/env node

import readline from 'readline';
import http from 'http';

const DEPLOY_SERVICE_URL = 'http://192.168.1.97:3000';

const regions = {
  cn: { name: 'CN', displayName: 'Chine' },
  yd: { name: 'YD', displayName: 'Monde' },
};

function sendDeployEvent(region) {
  return new Promise((resolve, reject) => {
    const endpoint = `${DEPLOY_SERVICE_URL}/deploy/${region}`;
    const url = new URL(endpoint);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            status: 'success',
            statusCode: res.statusCode,
            data: JSON.parse(data),
          });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

function showMenu() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n' + '='.repeat(60));
    console.log('  SÉLECTION DE LA RÉGION DE DÉPLOIEMENT');
    console.log('='.repeat(60) + '\n');

    console.log('Régions disponibles:\n');
    console.log('  1. CN (Chine)');
    console.log('  2. YD (Monde)');
    console.log('  3. Les deux régions\n');

    rl.question('Choisir un numéro (1-3) ou "q" pour quitter: ', (answer) => {
      rl.close();

      switch (answer.trim().toLowerCase()) {
        case '1':
          resolve('cn');
          break;
        case '2':
          resolve('yd');
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
  const args = process.argv.slice(2);
  let region = args[0];

  if (!region) {
    region = await showMenu();
  }

  region = region.toLowerCase();

  if (region === 'both') {
    console.log('\n' + '='.repeat(60));
    console.log('  DÉPLOIEMENT DES DEUX RÉGIONS');
    console.log('='.repeat(60) + '\n');

    try {
      console.log('Envoi signal déploiement CN...');
      const cnResult = await sendDeployEvent('cn');
      console.log(`✓ Signal CN envoyé: ${cnResult.data.status}\n`);

      console.log('Envoi signal déploiement YD...');
      const ydResult = await sendDeployEvent('yd');
      console.log(`✓ Signal YD envoyé: ${ydResult.data.status}\n`);

      console.log('='.repeat(60));
      console.log('Signaux de déploiement envoyés au service.');
      console.log('Le service gère maintenant le build et la synchronisation.');
      console.log('='.repeat(60) + '\n');
    } catch (error) {
      console.error('\nERREUR: Impossible de contacter le service de déploiement');
      console.error(`URL: ${DEPLOY_SERVICE_URL}`);
      console.error(`Message: ${error.message}\n`);
      process.exit(1);
    }
  } else if (region === 'cn' || region === 'yd') {
    const regionName = regions[region].displayName;

    console.log('\n' + '='.repeat(60));
    console.log(`  DÉPLOIEMENT ${region.toUpperCase()} (${regionName})`);
    console.log('='.repeat(60) + '\n');

    try {
      console.log(`Envoi signal déploiement ${region.toUpperCase()}...`);
      const result = await sendDeployEvent(region);
      console.log(`✓ Signal ${region.toUpperCase()} envoyé: ${result.data.status}\n`);

      console.log('='.repeat(60));
      console.log(`Le service gère maintenant le déploiement ${regionName}.`);
      console.log('='.repeat(60) + '\n');
    } catch (error) {
      console.error('\nERREUR: Impossible de contacter le service de déploiement');
      console.error(`URL: ${DEPLOY_SERVICE_URL}`);
      console.error(`Message: ${error.message}\n`);
      process.exit(1);
    }
  } else {
    console.log(`Région invalide: ${region}`);
    console.log('Régions valides: cn, yd, both');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Erreur:', error.message);
  process.exit(1);
});
