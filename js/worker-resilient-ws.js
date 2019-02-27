// match monitoring.log patterns to parse numbers
const chartValPatterns = new RegExp([
	'SystemCPU: (\\d+(\\.\\d+)?)',  // 1
	'ProcessCPU: (\\d+(\\.\\d+)?)', // 3
	'MemPhysMB: (\\d+)',            // 5
	'MemFreeMB: (\\d+)',            // 6
].join('.*'));

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
		postData.lines = [`<div>${data.line}</div>`];

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

	}

	self.postMessage(postData);
}

function sendError(errorMessage) {
	self.postMessage({
		error: 'Error: '+errorMessage
	})
}