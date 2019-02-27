// mock data worker posts random randomness

const interval = 1000;

init();

function init() {
	const prefill=20;
	for (let i=0; i<prefill; i++) {
		postRandomData();
	}

	setInterval(postRandomData, interval);
}

function postRandomData() {
	let cpuSystem = Math.random() * (80 - 65) + 65;
	let cpuProcess = Math.random() * cpuSystem;
	const memTotal = 16384;
	const memUsed = Math.round(memTotal * (Math.random() * (25 - 10) + 10)/100);
	const memFree = memTotal - memUsed

	const showError = Math.random() > 0.90;

	const data = {
		lines: getRandomLine({ showError, cpuSystem, cpuProcess, memTotal, memFree }),
		fileName: '/var/log/monitoring.log'
	};

	if (!showError) {
		data.chart = {cpuSystem, cpuProcess, memUsed, memFree};
	}

	self.postMessage(data);
}

function getRandomLine({ showError, cpuSystem, cpuProcess, memTotal, memFree}) {
	const time = new Date().toISOString().match(/T(.*)Z/)[1];
	const pool = Math.floor(Math.random()*3) + 1 // 1-4

	const level = showError ? '<span class="level-error">ERROR</span>' : '<span class="level-debug">DEBUG</span>';

	cpuSystem = cpuSystem.toFixed(2);
	cpuProcess = cpuProcess.toFixed(2);

	let s = `<div><span class="time">${time}</span> [pool-${pool}-thread-1] ${level} <span class="class">c.c.u.monitoring.Co3SystemAnalyzer</span>`;

	if (!showError) {
		s += ` - <span class="label">Perf Info</span> - OSName: Mac OS X, OSVersion: 10.14.3, SystemCPU: ${cpuSystem}, ProcessCPU: ${cpuProcess}, NumCPUs: 8, MemPhysMB: ${memTotal}, MemFreeMB: ${memFree}, MemPctFree: 5.96, SwapTotalMB: 3072, SwapFreeMB: 1365, SwapPctFree: 44.43, JVMUptimeSec: 116080, JVMHeapInitMB: 256, JVMHeapUsedMB: 661, JVMHeapCommitMB: 1002, JVMHeapMaxMB: 3641, JVMHeapUsedCommitPct: 65.97, JVMHeapCommitMaxPct: 27.52, JVMNonHeapInitMB: 2, JVMNonHeapUsedMB: 358, JVMNonHeapCommitMB: 374, JVMNonHeapMaxMB: 0, YoungNumGC: 274, YoungTimeGCms: 4918, YoungTimePerGCms: 17, YoungPctUptimeGC: 0.00, OldNumGC: 6, OldTimeGCms: 2120, OldTimePerGCms: 353, OldPctUptimeGC: 0.00, NetTimeGCms: 7038, NetPctUptimeGC: 0.01, PctTimeLastMinGC: 0.00</div>`;
	}

	return s;
}