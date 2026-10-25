import * as migration_20261025_095903_initial from './20261025_095903_initial';
import * as migration_20261025_110707_add_blob_object_key from './20261025_110707_add_blob_object_key';

export const migrations = [
  {
    up: migration_20261025_095903_initial.up,
    down: migration_20261025_095903_initial.down,
    name: '20261025_095903_initial',
  },
  {
    up: migration_20261025_110707_add_blob_object_key.up,
    down: migration_20261025_110707_add_blob_object_key.down,
    name: '20261025_110707_add_blob_object_key'
  },
];
