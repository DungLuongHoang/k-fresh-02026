#!/usr/bin/env node
/* eslint-disable */

const { execSync } = require('child_process');

const message = process.argv[2] || "chore: update code";

try {
  // Add all changes
  execSync('git add .', { stdio: 'inherit' });

  // Commit with the provided message
  execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

  // Get current branch name
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

  // Push to remote, setting upstream if needed
  execSync(`git push -u origin ${branch}`, { stdio: 'inherit' });

  console.log(`\n✅ Successfully pushed to ${branch}`);
} catch (error) {
  console.error('\n❌ Failed to push changes.');
  process.exit(1);
}
