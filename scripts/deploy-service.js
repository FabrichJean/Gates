import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

class DeployService extends EventEmitter {
  constructor() {
    super();
    this.isDeploying = false;
    this.deployQueue = [];
    this.setupListeners();
  }

  setupListeners() {
    this.on('deploy:cn', () => this.handleDeployCN());
    this.on('deploy:yd', () => this.handleDeployYD());
    this.on('deploy:both', () => this.handleDeployBoth());
  }

  async handleDeployCN() {
    await this.deploy('cn', 'build:cn', '/www/wwwroot/cn_vms_front.com/');
  }

  async handleDeployYD() {
    await this.deploy('yd', 'build:yd', '/www/wwwroot/vms-front.com/');
  }

  async handleDeployBoth() {
    await this.deploy('cn', 'build:cn', '/www/wwwroot/cn_vms_front.com/');
    await this.deploy('yd', 'build:yd', '/www/wwwroot/vms-front.com/');
  }

  async deploy(region, buildScript, remotePath) {
    if (this.isDeploying) {
      this.deployQueue.push({ region, buildScript, remotePath });
      return;
    }

    this.isDeploying = true;
    this.emit('deploy:start', { region });

    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`  DÉPLOIEMENT ${region.toUpperCase()}`);
      console.log(`${'='.repeat(60)}\n`);

      await this.runCommand('npm', ['run', buildScript], projectRoot);
      console.log(`\n✓ Build ${region} complété\n`);

      await this.runRsync(remotePath);
      console.log(`\n✓ Rsync ${region} complété\n`);

      this.emit('deploy:success', { region });
      console.log(`SUCCESS: Déploiement ${region} réussi!\n`);
    } catch (error) {
      this.emit('deploy:error', { region, error });
      console.error(`\nERROR: Déploiement ${region} échoué!`);
      console.error(error.message);
    } finally {
      this.isDeploying = false;

      if (this.deployQueue.length > 0) {
        const next = this.deployQueue.shift();
        this.deploy(next.region, next.buildScript, next.remotePath);
      }
    }
  }

  runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd,
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Commande échouée: ${command} ${args.join(' ')}`));
        } else {
          resolve();
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  runRsync(remotePath) {
    return new Promise((resolve, reject) => {
      const source = path.join(projectRoot, 'dist') + '/';
      const destination = `dell@192.168.1.97:${remotePath}`;

      const rsyncCommand = `rsync -av ${source} ${destination}`;

      const child = spawn('bash', ['-c', rsyncCommand], {
        stdio: 'inherit',
        cwd: projectRoot
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Rsync échoué vers ${remotePath}`));
        } else {
          resolve();
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }
}

export default DeployService;
