import spawn from 'spawn-please'

const { stdout, stderr } = await spawn('tsx', [`./examples/${process.argv[2]}`]);

if (stdout) {
  console.log(stdout);
}

if (stderr) {
  console.error(stderr);
}