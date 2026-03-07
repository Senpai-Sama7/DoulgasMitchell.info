#!/usr/bin/env node
/**
 * Sync packages script - regenerates lock files to match package.json
 * This prevents npm ci lock file sync errors during build
 */

const fs = require('fs');
const path = require('path');

const projectRoot = '/vercel/share/v0-project';
const packageJsonPath = path.join(projectRoot, 'package.json');

// Remove any lock files that might conflict
const lockFiles = [
  path.join(projectRoot, 'package-lock.json'),
  path.join(projectRoot, 'pnpm-lock.yaml'),
  path.join(projectRoot, 'bun.lock'),
  path.join(projectRoot, 'yarn.lock')
];

console.log('[v0] Removing conflicting lock files...');
lockFiles.forEach(lockFile => {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
    console.log(`[v0] Removed: ${path.basename(lockFile)}`);
  }
});

// Ensure final/package.json matches root package.json dependencies
const rootPkgJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const finalPkgPath = path.join(projectRoot, 'final', 'package.json');

if (fs.existsSync(finalPkgPath)) {
  const finalPkgJson = JSON.parse(fs.readFileSync(finalPkgPath, 'utf8'));
  
  // Copy @simplewebauthn and other auth deps from root to final
  const authDeps = [
    '@simplewebauthn/browser',
    '@simplewebauthn/server',
    'bcrypt',
    'jsonwebtoken'
  ];
  
  authDeps.forEach(dep => {
    if (rootPkgJson.dependencies[dep]) {
      finalPkgJson.dependencies[dep] = rootPkgJson.dependencies[dep];
    }
  });
  
  // Copy type definitions
  if (rootPkgJson.devDependencies) {
    const typesDeps = [
      '@types/bcrypt',
      '@types/jsonwebtoken'
    ];
    
    typesDeps.forEach(dep => {
      if (rootPkgJson.devDependencies[dep]) {
        finalPkgJson.devDependencies[dep] = rootPkgJson.devDependencies[dep];
      }
    });
  }
  
  fs.writeFileSync(finalPkgPath, JSON.stringify(finalPkgJson, null, 2) + '\n');
  console.log('[v0] Synchronized final/package.json with root package.json');
}

console.log('[v0] Package sync complete');
