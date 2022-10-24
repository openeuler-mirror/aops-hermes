import {getSelectedRow} from '@/views/assests/utils/getSelectedRow';

describe('assets.utils.test', () => {
  it('cross', () => {
    expect(
      getSelectedRow(['1', '2', '3'], [{host_group_name: '1'}, {host_group_name: '3'}], [{host_group_name: '2'}])
    ).toEqual([{host_group_name: '1'}, {host_group_name: '2'}, {host_group_name: '3'}]);
  });
  it('input empty', () => {
    expect(getSelectedRow([], [{host_group_name: '1'}, {host_group_name: '3'}], [{host_group_name: '2'}])).toEqual([]);
  });
  it('data in tableData only', () => {
    expect(getSelectedRow(['1'], [{host_group_name: '2'}, {host_group_name: '3'}], [{host_group_name: '1'}])).toEqual([
      {host_group_name: '1'}
    ]);
  });
  it('data in selectedRow only', () => {
    expect(getSelectedRow(['1'], [{host_group_name: '1'}, {host_group_name: '3'}], [{host_group_name: '2'}])).toEqual([
      {host_group_name: '1'}
    ]);
  });
  it('data in selectedRow only, tableData empty', () => {
    expect(
      getSelectedRow(['1', '2', '3'], [{host_group_name: '1'}, {host_group_name: '2'}, {host_group_name: '3'}], [])
    ).toEqual([{host_group_name: '1'}, {host_group_name: '2'}, {host_group_name: '3'}]);
  });
  it('data in tabledata only, selectedRow empty', () => {
    expect(
      getSelectedRow(['1', '2', '3'], [], [{host_group_name: '1'}, {host_group_name: '2'}, {host_group_name: '3'}])
    ).toEqual([{host_group_name: '1'}, {host_group_name: '2'}, {host_group_name: '3'}]);
  });
});
