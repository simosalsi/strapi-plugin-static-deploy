/* Remove collateral dev directory created as a byproduct of a successful 'yarn verify' command */
const fs = require('fs');
const devDir = 'dev';

try {
  fs.rmSync(devDir, { recursive: true, force: true });
  console.log(`Deleted ${devDir} directory`);
} catch (error) {
  console.log(`Failed to delete ${devDir} directory due to error: `, error);
}
