import {checkIsDiff} from '@/views/configuration/utils/compareContent';
import {getStatusInfoFromAllConfs} from '@/views/configuration/utils/statusCheckTools';

describe('configuration.utils.test', () => {
  it('cross', () => {
    expect(checkIsDiff([{added: true}, {removed: true}, {}])).toEqual(true);
  });
  it('empty', () => {
    expect(checkIsDiff([{}, {}, {}])).toEqual(false);
  });
  it('all added', () => {
    expect(checkIsDiff([{added: true}, {added: true}, {added: true}])).toEqual(true);
  });
  it('all removed', () => {
    expect(checkIsDiff([{removed: true}, {removed: true}, {removed: true}])).toEqual(true);
  });
});

describe('configuration.utils.test', () => {
  it('empty', () => {
    expect(getStatusInfoFromAllConfs([])).toEqual({count: 0, syncStatus: 'NOT FOUND'});
  });
  it('all sync', () => {
    expect(getStatusInfoFromAllConfs([{isSynced: 'SYNCHRONIZED'}, {isSynced: 'SYNCHRONIZED'}])).toEqual({
      count: 0,
      syncStatus: 'SYNCHRONIZED'
    });
  });
  it('half syn', () => {
    expect(getStatusInfoFromAllConfs([{isSynced: 'SYNCHRONIZED'}, {isSynced: 'NOT SYNCHRONIZE'}])).toEqual({
      count: 1,
      syncStatus: 'NOT SYNCHRONIZE'
    });
  });
  it('half syn 2', () => {
    expect(getStatusInfoFromAllConfs([{isSynced: 'SYNCHRONIZED'}, {isSynced: 'NOT FOUND'}])).toEqual({
      count: 1,
      syncStatus: 'NOT SYNCHRONIZE'
    });
  });
  it('all not sync', () => {
    expect(getStatusInfoFromAllConfs([{isSynced: 'NOT SYNCHRONIZE'}, {isSynced: 'NOT FOUND'}])).toEqual({
      count: 2,
      syncStatus: 'NOT SYNCHRONIZE'
    });
  });
});
