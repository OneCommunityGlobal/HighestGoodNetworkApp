#!/usr/bin/env node

// Wrapper script to start react-scripts with OpenSSL legacy provider
// This patches child_process to ensure all node processes use the OpenSSL flag

const path = require('path');
const Module = require('module');
const originalRequire = Module.prototype.require;

// Patch child_process.spawn and spawnSync to always include --openssl-legacy-provider
Module.prototype.require = function(...args) {
  const mod = originalRequire.apply(this, args);
  
  if (args[0] === 'child_process') {
    const originalSpawn = mod.spawn;
    const originalSpawnSync = mod.spawnSync;
    
    mod.spawn = function(command, args, options) {
      if (command === 'node' || command === process.execPath || command.endsWith('node')) {
        // Prepend the OpenSSL flag if not already present
        if (!args || args[0] !== '--openssl-legacy-provider') {
          args = ['--openssl-legacy-provider', ...(args || [])];
        }
      }
      return originalSpawn.call(this, command, args, options);
    };
    
    mod.spawnSync = function(command, args, options) {
      if (command === 'node' || command === process.execPath || command.endsWith('node')) {
        // Prepend the OpenSSL flag if not already present
        if (!args || args[0] !== '--openssl-legacy-provider') {
          args = ['--openssl-legacy-provider', ...(args || [])];
        }
      }
      return originalSpawnSync.call(this, command, args, options);
    };
  }
  
  return mod;
};

// Now require and run the react-scripts start script
const reactScriptsStartPath = require.resolve('react-scripts/scripts/start');
require(reactScriptsStartPath);

