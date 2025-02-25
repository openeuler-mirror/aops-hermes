const cveSeverityMap = {
  Low: '低风险',
  Medium: '中风险',
  High: '高风险',
  Critical: '严重',
  Unknown: '未知',
}

const cveSeverityColorMap: Record<string, string> = {
  Critical: '#E4211F',
  High: '#FA770F',
  Medium: '#E9B000',
  Low: '#017BFF',
  Unknown: '#8D98AC',
}

export { cveSeverityMap, cveSeverityColorMap }
