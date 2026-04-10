import DeployService from './deploy-service.js';

const service = new DeployService();

const command = process.argv[2]?.toLowerCase();

service.on('deploy:start', ({ region }) => {
  console.log(`⏳ Déploiement ${region} en cours...`);
});

service.on('deploy:success', ({ region }) => {
  console.log(`✓ Déploiement ${region} réussi`);
});

service.on('deploy:error', ({ region, error }) => {
  console.log(`✗ Déploiement ${region} échoué: ${error.message}`);
});

switch (command) {
  case 'cn':
    service.emit('deploy:cn');
    break;
  case 'yd':
    service.emit('deploy:yd');
    break;
  case 'both':
    service.emit('deploy:both');
    break;
  default:
    console.log(`
Usage: node scripts/deploy-cli.js [command]

Commands:
  cn      Deploy region CN (Chine)
  yd      Deploy region YD (Monde)
  both    Deploy both regions
    `);
    process.exit(1);
}
