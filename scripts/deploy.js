#!/usr/bin/env node

/**
 * Script de déploiement pour envoyer les builds vers un serveur distant
 * Utilisation:
 *   npm run deploy              (menu interactif)
 *   npm run deploy:cn           (déployer CN directement)
 *   npm run deploy:yd           (déployer YD directement)
 *   node scripts/deploy.js cn   (déployer CN)
 *   node scripts/deploy.js yd   (déployer YD)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  remoteUser: 'dell',
  remoteHost: '192.168.1.97',
  remotePassword: 'dellserver123',
  regions: {
    cn: {
      name: 'CN',
      emoji: '🇨🇳',
      remoteDir: '/www/wwwroot/cn_vms_front.com',
    },
    yd: {
      name: 'YD',
      emoji: '🌍',
      remoteDir: '/www/wwwroot/vms-front.com',
    },
  },
};

// Couleurs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'═'.repeat(78)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'═'.repeat(78)}\n`, 'cyan');
}

// Vérifier si sshpass est installé
function checkSshpass() {
  try {
    execSync('which sshpass', { stdio: 'ignore' });
    log('✓ sshpass disponible', 'green');
    return true;
  } catch {
    log('❌ sshpass n\'est pas installé', 'red');
    log('\nInstallation (macOS):', 'yellow');
    log('  brew install hudochenkov/sshpass/sshpass', 'blue');
    log('\nInstallation (Linux):', 'yellow');
    log('  sudo apt-get install sshpass', 'blue');
    return false;
  }
}

// Vérifier si dist existe
function checkDist() {
  const distPath = path.resolve(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    log(`❌ Répertoire dist/ non trouvé: ${distPath}`, 'red');
    log('Veuillez d\'abord compiler: npm run build:cn ou npm run build:yd', 'yellow');
    return false;
  }

  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    log(`❌ Fichier index.html manquant dans dist/`, 'red');
    return false;
  }

  log('✓ dist/ détecté et valide', 'green');
  return true;
}

// Obtenir la commande SSH base
function getSshCmd() {
  return `sshpass -p '${config.remotePassword}' ssh -o PubkeyAuthentication=no`;
}

// Obtenir la taille du dossier
function getFolderSize(folderPath) {
  try {
    const result = execSync(`du -sh "${folderPath}"`, { encoding: 'utf-8' });
    return result.split('\t')[0].trim();
  } catch {
    return 'N/A';
  }
}

// Compter les fichiers
function getFileCount(folderPath) {
  try {
    const result = execSync(`find "${folderPath}" -type f | wc -l`, {
      encoding: 'utf-8',
    });
    return parseInt(result.trim());
  } catch {
    return 0;
  }
}

// Menu interactif
async function showMenu() {
  logSection('🌍 SÉLECTION DE LA RÉGION DE DÉPLOIEMENT');

  log('Régions disponibles:\n', 'bright');
  log(`  ${config.regions.cn.emoji} 1. ${config.regions.cn.name}`, 'green');
  log(`     Destination: ${config.regions.cn.remoteDir}\n`, 'blue');
  log(`  ${config.regions.yd.emoji} 2. ${config.regions.yd.name}`, 'green');
  log(`     Destination: ${config.regions.yd.remoteDir}\n`, 'blue');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Choisir un numéro (1-2) ou \'q\' pour quitter: ', (answer) => {
      rl.close();

      if (answer.toLowerCase() === 'q') {
        log('\n❌ Déploiement annulé', 'yellow');
        process.exit(0);
      }

      let region = null;
      if (answer === '1') region = 'cn';
      else if (answer === '2') region = 'yd';

      if (!region) {
        log('\n❌ Choix invalide', 'red');
        process.exit(1);
      }

      resolve(region);
    });
  });
}

// Confirmer le déploiement
async function confirmDeploy(region) {
  const regionConfig = config.regions[region];
  const distPath = path.resolve(__dirname, '..', 'dist');
  const size = getFolderSize(distPath);
  const fileCount = getFileCount(distPath);

  logSection(`DÉPLOIEMENT - ${regionConfig.name}`);

  log(`  Serveur: ${config.remoteUser}@${config.remoteHost}`, 'blue');
  log(`  Région: ${regionConfig.name} (${region.toUpperCase()})`, 'blue');
  log(`  Source: ./dist`, 'blue');
  log(`  Destination: ${regionConfig.remoteDir}`, 'blue');
  log(`  Taille: ${size}`, 'blue');
  log(`  Fichiers: ${fileCount}\n`, 'blue');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Continuer avec le déploiement? (y/n) ', (answer) => {
      rl.close();

      if (answer.toLowerCase() !== 'y') {
        log('\n⚠️  Déploiement annulé', 'yellow');
        process.exit(0);
      }

      resolve(true);
    });
  });
}

// Exécuter le déploiement
async function executeDeploy(region) {
  const regionConfig = config.regions[region];
  const distPath = path.resolve(__dirname, '..', 'dist');
  const remoteDir = regionConfig.remoteDir;

  log('\n📋 Préparation du serveur distant...', 'yellow');

  try {
    // Créer le répertoire distant si nécessaire
    const mkdirCmd = `[ -d '${remoteDir}' ] || (mkdir -p '${remoteDir}' && echo 'Créé par dell')`;
    try {
      execSync(
        `${getSshCmd()} ${config.remoteUser}@${config.remoteHost} "${mkdirCmd}"`,
        { stdio: 'pipe' }
      );
    } catch {
      // Le répertoire existe probablement déjà
    }
    log('✓ Répertoire distant vérifié', 'green');

    // Upload des fichiers vers un répertoire temporaire
    log('\n📋 Upload des fichiers en cours...', 'yellow');
    log('⏳ Cela peut prendre quelques minutes...\n', 'yellow');

    const tempDir = `/tmp/vms_deploy_${Date.now()}`;
    
    // Créer le répertoire temporaire
    execSync(
      `${getSshCmd()} ${config.remoteUser}@${config.remoteHost} "mkdir -p '${tempDir}'"`,
      { stdio: 'pipe' }
    );

    // Upload vers le répertoire temporaire
    execSync(
      `sshpass -p '${config.remotePassword}' scp -o PubkeyAuthentication=no -r '${distPath}'/* ${config.remoteUser}@${config.remoteHost}:'${tempDir}/'`,
      { stdio: 'inherit' }
    );
    log('\n✓ Fichiers uploadés', 'green');

    // Copier les fichiers du répertoire temporaire vers la destination avec sudo
    log('\n📋 Finalisation du déploiement...', 'yellow');
    const password = config.remotePassword;
    
    // Commande: Copier avec sudo  
    const copyCmd = `echo '${password}' | sudo -S cp -r '${tempDir}'/* '${remoteDir}/' 2>/dev/null || true`;
    execSync(
      `${getSshCmd()} ${config.remoteUser}@${config.remoteHost} "${copyCmd}"`,
      { stdio: 'inherit' }
    );
    
    // Fixer les permissions
    const chownCmd = `echo '${password}' | sudo -S chown -R www:www '${remoteDir}' 2>/dev/null || true`;
    execSync(
      `${getSshCmd()} ${config.remoteUser}@${config.remoteHost} "${chownCmd}"`,
      { stdio: 'pipe' }
    );
    
    // Nettoyer le répertoire temporaire
    execSync(
      `${getSshCmd()} ${config.remoteUser}@${config.remoteHost} "rm -rf '${tempDir}'"`,
      { stdio: 'pipe' }
    );

    // Vérifier le déploiement
    log('\n📋 Vérification du déploiement...', 'yellow');
    const verifyCmd = `if [ -f '${remoteDir}/index.html' ]; then echo 'Fichier index.html détecté'; echo 'Nombre de fichiers: '\$(find '${remoteDir}' -type f | wc -l); else echo 'ERREUR: index.html manquant'; exit 1; fi`;
    execSync(
      `${getSshCmd()} ${config.remoteUser}@${config.remoteHost} "${verifyCmd}"`,
      { stdio: 'inherit' }
    );

    logSection('✅ DÉPLOIEMENT RÉUSSI');
    log(`Région: ${regionConfig.emoji} ${regionConfig.name}`, 'green');
    log(`Destination: ${remoteDir}`, 'green');
    log('');
  } catch (error) {
    logSection('❌ ERREUR LORS DU DÉPLOIEMENT');
    log(`Région: ${regionConfig.name}`, 'red');
    log(`Destination: ${remoteDir}`, 'red');
    log(`\nErreur: ${error.message}`, 'red');
    log('\nConseil:', 'yellow');
    log('  1. Vérifiez la connexion réseau', 'yellow');
    log('  2. Vérifiez les identifiants SSH', 'yellow');
    log('  3. Vérifiez que le répertoire existe sur le serveur', 'yellow');
    log('  4. Vérifiez les permissions sur le serveur', 'yellow');
    process.exit(1);
  }
}

// Point d'entrée principal
async function main() {
  const args = process.argv.slice(2);

  // Vérifier les dépendances
  if (!checkSshpass()) {
    process.exit(1);
  }

  if (!checkDist()) {
    process.exit(1);
  }

  let region = null;
  let autoConfirm = false;

  if (args.length > 0) {
    region = args[0];
    if (!config.regions[region]) {
      log(`❌ Région invalide: ${region}`, 'red');
      log('Régions disponibles: cn, yd', 'yellow');
      process.exit(1);
    }
    autoConfirm = true;  // Auto-confirm when region is specified
  } else {
    region = await showMenu();
  }

  if (!autoConfirm) {
    await confirmDeploy(region);
  }
  await executeDeploy(region);
}

main().catch((error) => {
  log(`\n❌ Erreur: ${error.message}`, 'red');
  process.exit(1);
});
