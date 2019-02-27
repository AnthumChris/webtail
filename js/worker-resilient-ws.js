// match monitoring.log patterns to parse numbers
const chartValPatterns = new RegExp([
  'SystemCPU: (\\d+(\\.\\d+)?)',  // 1
  'ProcessCPU: (\\d+(\\.\\d+)?)', // 3
  'MemPhysMB: (\\d+)',            // 5
  'MemFreeMB: (\\d+)',            // 6
].join('.*'));

// regex pattern replacements
const perfLogReplacements = [
  // XSS
  [/&/g, '&amp;'],
  [/</g, '&lt;'],

  // visual decorators
  [/(\d\d:\d\d:\d\d\.\d\d\d)/, '<span class="time">$1</span>'],
  [/(\[pool.*\])/, '<span class="thread">$1</span>'],
  [/ (DEBUG) /, ' <span class="level-debug">$1</span> '],
  [/ (ERROR) /, ' <span class="level-error">$1</span> '],
  [/(c\.c\.u\.monitoring.Co3SystemAnalyzer)/, '<span class="class">$1</span>'],
  [/(Perf Info)/, '<span class="label">$1</span>'],
]


const socket = new WebSocket('ws://localhost:4000/');
socket.onopen = _ => console.log('WS opened!', this);
socket.onerror = function(e) {
  if (socket.readyState === 3) {
    return sendError('Could not open web socket connection.');
  }
}
socket.onmessage = e => processSocketData(e.data);

function processSocketData(data) {
  try {
    data = JSON.parse(data);
  } catch (e) {
    return sendError('Could not parse JSON response');
  }

  if (data.error) {
    return sendError(data.error);
  }

  // re-format respons, parse chart data, and post to app
  const postData = {};

  if (data.fileName)
    postData.fileName = data.fileName;

  if (data.line) {
    // parse last line for chart values and add to postData
    const chartValMatches = data.line.match(chartValPatterns);
    if (chartValMatches && chartValMatches.length > 6) {
      const memTotal = parseInt(chartValMatches[5]);
      const memFree = parseInt(chartValMatches[6]);

      postData.chart = {
        cpuSystem: parseFloat(chartValMatches[1]),
        cpuProcess: parseFloat(chartValMatches[3]),
        memUsed: memTotal-memFree, 
        memFree: memFree
      }
    }

    const line = perfLogReplacements.reduce((val, params) => val.replace.apply(val, params), data.line);
    postData.lines = [`<div>${line}</div>`];
  }

  self.postMessage(postData);
}

function sendError(errorMessage) {
  self.postMessage({
    error: 'Error: '+errorMessage
  })
}