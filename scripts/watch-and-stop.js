const { spawn } = require('child_process');
const kill = require('tree-kill');

console.log('Starting watch...');

const watch = spawn('yarn', ['watch'], {
  stdio: 'inherit',
  shell: true,
});

setTimeout(() => {
  console.log('Stopping watch...');
  kill(watch.pid, 'SIGTERM', (err) => {
    if (err) {
      console.error('Failed to kill watch process:', err);
    } else {
      console.log('Watch process killed.');
    }
  });
}, 10000);

watch.on('exit', (code, signal) => {
  if (signal === 'SIGTERM' || code === null || code === 0) {
    console.log(`Watch process exited gracefully.`);
    process.exit(0);
  } else {
    console.warn(`Watch process exited with code ${code}`);
    process.exit(0); // Still exit cleanly
  }
});
