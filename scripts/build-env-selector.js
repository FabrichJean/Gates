#!/usr/bin/env node

/**
 * Script de sélection dynamique d'environnement pour le build
 * Permet de choisir entre .env.prod-cn ou .env.prod-yd
 * 
 * Utilisation:
 *   npm run build              (affiche le menu interactif)
 *   npm run build:cn           (build avec .env.prod-cn)
 *   npm run build:yd           (build avec .env.prod-yd)
 *   npm run build -- --cn      (build avec .env.prod-cn)
 *   npm run build -- --yd      (build avec .env.prod-yd)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs pour le terminal
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
  log(`\n${'═'.repeat(70)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'═'.repeat(70)}\n`, 'cyan');
}

// Vérifier les fichiers d'environnement
function checkEnvFiles() {
  const projectRoot = path.resolve(__dirname, '..');
  const envCn = path.join(projectRoot, '.env.prod-cn');
  const envYd = path.join(projectRoot, '.env.prod-yd');

  return {
    cn: fs.existsSync(envCn),
    yd: fs.existsSync(envYd),
    envCn,
    envYd,
    projectRoot,
  };
}

// Copier le fichier d'environnement vers .env.production
function copyEnvFile(srcPath, destPath) {
  try {
    const content = fs.readFileSync(srcPath, 'utf8');
    fs.writeFileSync(destPath, content, 'utf8');
    return true;
  } catch (error) {
    log(`Erreur lors de la copie du fichier: ${error.message}`, 'red');
    return false;
  }
}

// Afficher le menu interactif
async function showMenu() {
  const { cn, yd, envCn, envYd, projectRoot } = checkEnvFiles();

  logSection('🏗️  SÉLECTION D\'ENVIRONNEMENT DE BUILD');

  if (!cn && !yd) {
    log('❌ Aucun fichier d\'environnement trouvé!', 'red');
    log('Fichiers attendus:', 'yellow');
    log(`  • .env.prod-cn`, 'yellow');
    log(`  • .env.prod-yd`, 'yellow');
    process.exit(1);
  }

  log('Fichiers d\'environnement disponibles:\n', 'bright');

  const options = [];
  let optionNum = 1;

  if (cn) {
    log(`  ${optionNum}. 🇨🇳 CN (Chine)`, 'green');
    log(`     Fichier: .env.prod-cn\n`, 'blue');
    options.push({ num: optionNum, env: 'cn', path: envCn });
    optionNum++;
  } else {
    log(`  ✗ CN - Fichier .env.prod-cn manquant`, 'red');
  }

  if (yd) {
    log(`  ${optionNum}. 🌍 YD (Monde)`, 'green');
    log(`     Fichier: .env.prod-yd\n`, 'blue');
    options.push({ num: optionNum, env: 'yd', path: envYd });
    optionNum++;
  } else {
    log(`  ✗ YD - Fichier .env.prod-yd manquant`, 'red');
  }

  // Obtenir le choix de l'utilisateur
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`\nChoisir un numéro (1-${options.length}) ou 'q' pour quitter: `, (answer) => {
      rl.close();

      if (answer.toLowerCase() === 'q') {
        log('\n❌ Build annulé', 'yellow');
        process.exit(0);
      }

      const selected = options.find((o) => o.num === parseInt(answer));
      if (!selected) {
        log('\n❌ Choix invalide', 'red');
        process.exit(1);
      }

      resolve(selected);
    });
  });
}

// Exécuter le build
function executeBuild(envPath, envName) {
  const projectRoot = path.resolve(__dirname, '..');
  const destPath = path.join(projectRoot, '.env.production');

  logSection(`🚀 DÉMARRAGE DU BUILD - ${envName.toUpperCase()}`);

  // Copier le fichier d'environnement
  log('📋 Copie de la configuration d\'environnement...', 'yellow');
  if (!copyEnvFile(envPath, destPath)) {
    process.exit(1);
  }

  log(`✓ Configuration copiée depuis ${path.basename(envPath)}`, 'green');

  // Afficher les variables chargées
  log('\n📊 Variables d\'environnement:', 'bright');
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n').filter((line) => line.trim() && !line.startsWith('#'));
  lines.forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      log(`  • ${key}=${value}`, 'blue');
    }
  });

  // Exécuter le build
  log('\n⚙️  Compilation en cours...', 'yellow');
  try {
    execSync('npm run build:raw', {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    log('\n✅ Build réussi!', 'green');
    logSection('BUILD TERMINÉ AVEC SUCCÈS');
  } catch (error) {
    log('\n❌ Build échoué', 'red');
    process.exit(1);
  }
}

// Point d'entrée principal
async function main() {
  // Vérifier les arguments de ligne de commande
  const args = process.argv.slice(2);

  // Environnement spécifié via variable d'environnement
  if (process.env.ENV_FILE) {
    const envFile = process.env.ENV_FILE;
    const envName = envFile.includes('cn') ? 'cn' : 'yd';
    const projectRoot = path.resolve(__dirname, '..');
    const envPath = path.join(projectRoot, envFile);

    if (!fs.existsSync(envPath)) {
      log(`❌ Fichier d'environnement non trouvé: ${envFile}`, 'red');
      process.exit(1);
    }

    executeBuild(envPath, envName);
    return;
  }

  // Arguments de ligne de commande
  if (args.includes('--cn')) {
    const { envCn, projectRoot } = checkEnvFiles();
    if (!fs.existsSync(envCn)) {
      log('❌ Fichier .env.prod-cn non trouvé', 'red');
      process.exit(1);
    }
    executeBuild(envCn, 'cn');
    return;
  }

  if (args.includes('--yd')) {
    const { envYd, projectRoot } = checkEnvFiles();
    if (!fs.existsSync(envYd)) {
      log('❌ Fichier .env.prod-yd non trouvé', 'red');
      process.exit(1);
    }
    executeBuild(envYd, 'yd');
    return;
  }

  // Mode interactif
  const selected = await showMenu();
  executeBuild(selected.path, selected.env);
}

main().catch((error) => {
  log(`\n❌ Erreur: ${error.message}`, 'red');
  process.exit(1);
});
