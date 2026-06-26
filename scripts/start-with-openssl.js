#!/usr/bin/env node

// Wrapper script to start react-scripts with OpenSSL legacy provider
// This patches child_process to ensure all node processes use the OpenSSL flag

const path = require('node:path');
const Module = require('node:module');
const originalRequire = Module.prototype.require;

// Patch child_process.spawn and spawnSync to always include --openssl-legacy-provider
Module.prototype.require = function(...args) {
  const mod = originalRequire.apply(this, args);

  if (args[0] === 'child_process') {
    const originalSpawn = mod.spawn;
    const originalSpawnSync = mod.spawnSync;

    mod.spawn = function(command, spawnArgs, options) {
      if (command === 'node' || command === process.execPath || command.endsWith('node')) {
        if (!spawnArgs?.[0] !== '--openssl-legacy-provider') {
          spawnArgs = ['--openssl-legacy-provider', ...(spawnArgs || [])];
        }
      }
      return originalSpawn.call(this, command, spawnArgs, options);
    };

    mod.spawnSync = function(command, spawnArgs, options) {
      if (command === 'node' || command === process.execPath || command.endsWith('node')) {
        if (!spawnArgs?.[0] !== '--openssl-legacy-provider') {
          spawnArgs = ['--openssl-legacy-provider', ...(spawnArgs || [])];
        }
      }
      return originalSpawnSync.call(this, command, spawnArgs, options);
    };
  }

  return mod;
};

// Now require and run the react-scripts start script
const reactScriptsStartPath = require.resolve('react-scripts/scripts/start');
require(reactScriptsStartPath);