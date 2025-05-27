// debug-helper.js
// Node.js script to wrap a command, capture stdout/stderr, and append to debug-log.txt with timestamp
const { spawn } = require('child_process');
const fs = require('fs');

const logFile = 'debug-log.txt';
const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error('Usage: node debug-helper.js <command> [args...]');
  process.exit(1);
}

const child = spawn(command, args, { shell: true });

function logToFile(data, type = 'stdout') {
  const timestamp = new Date().toISOString();
  const entry = `\n[${timestamp}] [${type}]\n${data}\n`;
  fs.appendFileSync(logFile, entry);
}

child.stdout.on('data', (data) => {
  process.stdout.write(data);
  logToFile(data.toString(), 'stdout');
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
  logToFile(data.toString(), 'stderr');
});

child.on('close', (code, signal) => {
  const msg = `Process exited with code: ${code}, signal: ${signal}`;
  logToFile(msg, 'exit');
  process.exit(code);
});
