class TailConsole {

  constructor({selector}) {
    this.maxLines = 250;
    this.wrapper = $(selector);
    this.range = document.createRange();
    this.autoScrollToBottom = true; // changes when user scrolls up
    this.pointsAdded = 0;

    this.wrapper.addEventListener('scroll', e => {
      if (!this.ignoreScrollEvent) {
        this.autoScrollToBottom = this.wrapper.scrollTop + this.wrapper.clientHeight === this.wrapper.scrollHeight;
      }
      this.ignoreScrollEvent = false;
    }, {passive: true})
  }

  append(content) {
    const frag = this.range.createContextualFragment(content);

    // maintain maxLines threshold for demo performance (remove DOM line first)
    // does not suffice over virtual scrolling and it's a hack to prevent performance probs during demo
    const totalNewLines = frag.childNodes.length;
    const totalCurrentLines = this.wrapper.childNodes.length;
    const totalToRemove = Math.max(0, totalCurrentLines + totalNewLines - this.maxLines);

    for (let i=0; i<totalToRemove; i++) {
      this.wrapper.childNodes[i].remove();
    }
    this.wrapper.appendChild(frag);
    this.adjustScroll();
  }

  adjustScroll() {
    if (this.autoScrollToBottom) {
      // scroll event is triggered when we manually set scrollTop
      this.ignoreScrollEvent = true;
      this.wrapper.scrollTop = this.wrapper.scrollHeight;
    }
  }
}

const $ =  document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
Element.prototype.$ = Element.prototype.querySelector;
Element.prototype.$$ = Element.prototype.querySelectorAll;
const log = console.log.bind(console);
let dataWorker = null;

// theme switcher
document.addEventListener('keyup', e => {
  if (e.key === 't') {
    const darkTheme = $('html').classList.toggle('theme-dark');
    localStorage.setItem('darkTheme', darkTheme);
  }
}, {passive: true})


if (!$('html').classList.contains('unsupported-browser')) {
  init();
}

function showError(message) {
  const el = $('.status');
  el.classList.add('error');
  el.innerHTML = message;
}

function showStatus(message) {
  const el = $('.status');
  el.classList.remove('error');
  el.innerHTML = message;
}

function init() {
  dataWorker = new Worker(new URLSearchParams(location.search).has('mock') ? 'js/worker-mock.js' : 'js/worker-resilient-ws.js');
  const console1 = new TailConsole({ selector: '#console1'});

  dataWorker.onerror = function(evt) {
    showError('An internal error has occurred. Shame on it.');
  }

  dataWorker.onmessage = function(msg) {
    const data = msg.data;

    if (data.error) {
      showError(data.error);
      return;
    }

    if (data.fileName) {
      showStatus(data.fileName);
    }
    if (data.chart) {
      lineChart.series[0].addPoint([null, data.chart.cpuSystem], false, true);
      lineChart.series[1].addPoint([null, data.chart.cpuProcess], false, true);
      lineChart.redraw();

      pieChart.series[0].setData([data.chart.memUsed, data.chart.memFree], true);
    }
    if (data.lines) {
      console1.append(data.lines);
    }
  }

  const lineChart = new Highcharts.chart('chart1', {
    chart: {
      height: 200,
      type: 'areaspline',
    },
    title: false,
    legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 50,
        y: 0,
        symbolRadius: 0,
        floating: true,
        borderWidth: 1,
        backgroundColor: 'var(--page-bg)'
    },
    time: {
      useUTC: false
    },

    xAxis: {
      visible: false,
      labels: false,
      endOnTick: false,
      startOnTick: false,
      minPadding: 0,
      maxPadding: 0,
    },
    yAxis: {
        title: false,
        min: 0,
        max: 100,
        tickInterval: 25,
        labels: {
          formatter: function() {
             return this.value+" %";
          }
        },
    },
    plotOptions: {
        areaspline: {
            marker: {
              enabled: false,
            },
            lineColor: false,
        },
        series: {
          animation: false
        },
    },
    series: [{
        name: 'System CPU',
        data: new Array(100).fill(0),
    }, {
        name: 'Process CPU',
        data: new Array(100).fill(0),
    }]
  });


  pieChart = new Highcharts.Chart('chart2', {
    chart: {
      height: 200,
      type: 'pie',
      margin: 12,
      spacing: 0,
    },
    legend: {
      layout: 'vertical',
      align: 'center',
      verticalAlign: 'middle',
      // x: 50,
      // y: 0,
      symbolRadius: 0,
      floating: true,
      borderWidth: 1,
      backgroundColor: 'var(--page-bg)'
    },
    plotOptions: {
      pie: {
        animation: false,
        borderWidth: 0,
        dataLabels: {
          enabled: false
        },
        showInLegend: true,
        // endAngle: 360 - 360/12*2 + 360/12*7, // show "2 hours less" than 7:00 startAngle
        slicedOffset: 0,
        // startAngle: 360/12*7, // 7:00
        states: {
          hover: {
            color: '#000',
            enabled: false,
            halo: false
          }
        }
      }
    },
    series: [{
      data: [{
        name: 'Memory Used',
        color: 'var(--ram-used)',
      }, {
        name: 'Memory Free',
        color: 'var(--ram-free)',
      }],
      size: '100%',
      innerSize: '85%'
    }],
    tooltip: { enabled: false }
  });

}
