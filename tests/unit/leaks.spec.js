import {getSelectedRow} from '@/views/leaks/utils/getSelectedRow';

describe('leaks.utils.test', () => {
  it('cross', () => {
    expect(getSelectedRow(['1', '2', '3'], [{keyName: '1'}, {keyName: '3'}], [{keyName: '2'}], 'keyName')).toEqual([
      {keyName: '1'},
      {keyName: '2'},
      {keyName: '3'}
    ]);
  });
  it('input empty', () => {
    expect(getSelectedRow([], [{keyName: '1'}, {keyName: '3'}], [{keyName: '2'}], 'keyName')).toEqual([]);
  });
  it('data in tableData only', () => {
    expect(getSelectedRow(['1'], [{keyName: '2'}, {keyName: '3'}], [{keyName: '1'}], 'keyName')).toEqual([
      {keyName: '1'}
    ]);
  });
  it('data in selectedRow only', () => {
    expect(getSelectedRow(['1'], [{keyName: '1'}, {keyName: '3'}], [{keyName: '2'}], 'keyName')).toEqual([
      {keyName: '1'}
    ]);
  });
  it('data in selectedRow only, tableData empty', () => {
    expect(getSelectedRow(['1', '2', '3'], [{keyName: '1'}, {keyName: '2'}, {keyName: '3'}], [], 'keyName')).toEqual([
      {keyName: '1'},
      {keyName: '2'},
      {keyName: '3'}
    ]);
  });
  it('data in tabledata only, selectedRow empty', () => {
    expect(getSelectedRow(['1', '2', '3'], [], [{keyName: '1'}, {keyName: '2'}, {keyName: '3'}], 'keyName')).toEqual([
      {keyName: '1'},
      {keyName: '2'},
      {keyName: '3'}
    ]);
  });
});
