import {getSelectedRow} from '@/views/utils/getSelectedRow';
import {dateFormat} from '@/views/utils/Utils';

describe('utils.getSelectedRow.test', () => {
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

describe('utils.getSelectedRow.test', () => {
  it('formate', () => {
    expect(dateFormat('YYmmdd', new Date(1666791355824))).toEqual('20221026');
  });
  it('formate', () => {
    expect(dateFormat('YYmmdd', 1666791355824)).toEqual('20221026');
  });
  it('full formate', () => {
    expect(dateFormat('YY-mm-dd HHMMSS', 1666791355824)).toEqual('2022-10-26 213555');
  });
  it('full formate， single key', () => {
    expect(dateFormat('Y-m-d HMS', 1666791355824)).toEqual('2022-10-26 213555');
  });
  it('not date', () => {
    expect(dateFormat('YY-mm-dd HHMMSS', 'abc')).toEqual('abc');
  });
});
