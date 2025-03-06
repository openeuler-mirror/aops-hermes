export enum DOMAIN_STATUS_ENUM {
  notSync = 0,
  sync,
  notFound,
}

export enum DOMAIN_STATUS_LABEL_ENUM {
  unsynchronized = 0,
  synchronized,
  partialSynchronization,
}

export enum DOMAIN_STATUS_LABEL {
  'SYNCHRONIZED' = 'synchronized',
  'NOT SYNCHRONIZE' = 'unsynchronized',
  'NOT FOUND' = 'partialSynchronization',
}
