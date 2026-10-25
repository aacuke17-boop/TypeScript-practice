import * as migration_20261025_095903_initial from './20261025_095903_initial';

export const migrations = [
  {
    up: migration_20261025_095903_initial.up,
    down: migration_20261025_095903_initial.down,
    name: '20261025_095903_initial'
  },
];
