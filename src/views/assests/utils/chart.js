import {Chart} from '@antv/g2';

function labelText(text) {
  const list = text.replace(/^(\s|{)+|(\s|})+$/g, '').split(',');
  let tmpArr = [];
  const result = [];
  list.map((item) => {
    tmpArr = item.split('=');
    tmpArr[1] = tmpArr[1].substring(1, tmpArr[1].length - 1);
    result.push(tmpArr.join(': '));
  });
  return result;
}

export default class HostChart {
  constructor(container, data) {
    this.container = container;
    this.chart = new Chart({
      container: container,
      autoFit: true
    });
    this.chart.scale({
      time: {
        type: 'time',
        nice: true,
        mask: 'HH:mm'
      },
      value: {
        min: 0,
        nice: true
      }
    });
    this.chart.tooltip({
      showCrosshairs: true,
      title: (title, datum) => new Date(datum['time']).toLocaleString()
    });
    this.chart.legend({
      position: 'bottom-left',
      maxRow: 4,
      radio: 'truthy',
      maxItemWidth: 430,
      itemWidth: 450,
      itemSpacing: 0
    });
    if (data.length === 0) {
      this.chart.annotation().html({
        html: '<div style="font-size: 20px; font-weight: 600">No Data</div>',
        alignX: 'middle',
        alignY: 'middle',
        offsetX: 270,
        offsetY: -130
      });
    }
    this.chart.data(data);
    this.chart
      .line()
      .position('time*value')
      .color('metric', ['#3d5afe', '#424242', '#EC87E4', '#ff5722', '#00AAA9', '#ffa000', '#00b0ff', '#388e3c'])
      .tooltip('time*value*metric', (time, value, metric) => {
        return {
          name: labelText(metric),
          value: value
        };
      });
    this.chart.render();
  }

  changeData(data) {
    this.chart.changeData(data);
  }

  destroy() {
    this.chart.destroy();
  }

  loadData(data) {
    this.chart.data(data);
  }

  render() {
    this.chart.render();
  }
}
