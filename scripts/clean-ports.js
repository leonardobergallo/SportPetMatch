// Simple cross-platform port cleaner before dev start
const kill = require('kill-port');

async function clean() {
  const ports = [3000, 8081, 8000];
  for (const port of ports) {
    try {
      // Kill both tcp and udp quietly
      await kill(port, 'tcp');
    } catch (_) {}
  }
}

clean().then(() => process.exit(0)).catch(() => process.exit(0));


