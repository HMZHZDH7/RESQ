// Import the necessary functions and modules
import { showImage } from './chatbox.js';
import { fetchData } from './socket.js';

var allChartsThatWeHaveSaved = [];

let args; // /!\ TEMPORARY GLOBAL VAR UNTIL WE CAN TELL IF RASA SEND ARGS OR DATA

export async function createInitalChart(log, json_names) {
  let data;

  try {
    console.log(`Fetching data for ${json_names[0]}`);
    data = await fetchData(json_names[0]);
    console.log(data);
    console.log(`Fetching args for ${json_names[1]}`);
    args = await fetchData(json_names[1]);
    console.log(args);

    createLineChart(log, data, args);
  }
  catch (error) {
  console.error('Error fetching data:', error);
  }
}

// Function to create the line chart
export async function createLineChart(log, data) {
  console.log("Creating a new chart from :");
  console.log(data);
 if (data && args) {
    const labels = data.map(item => item.YQ);
    const values = data.map(item => item.Value);

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Your hospital',
            data: values,
            borderColor: '#ff4081',
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: '#ff4081',
        }]
    };

    if (args.visualization.show_nat_val === true) {
        const nat_values = data.map(item => item.nat_value);
        chartData.datasets.push({
            label: 'National median',
            data: nat_values,
            borderColor: '#2196f3',
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: '#2196f3',
        });
    }

    setupXYFiltering(labels, values);

    // Creating a line chart
    const ctx = document.getElementById('viz');
    ctx.width = ctx.clientWidth; // Set canvas width to its client width
    ctx.height = ctx.clientHeight; // Set canvas height to its client height

    let chartStatus = Chart.getChart(ctx)
    if (chartStatus !== undefined) {
      chartStatus.destroy();
    }

    const chart = new Chart(ctx, {
      type: args.visualization.type,
      data: chartData,
      options: {
        scales: {
          x: {
            type: 'category', // Use category scale for YQ values
            position: 'bottom',
            title: {
              display: true,
              text: 'YQ'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Value'
            },
            beginAtZero: true
          }
        },
        animation: {
          onComplete: function () {
            let base = chart.toBase64Image();
            for (let i = 0; i < allChartsThatWeHaveSaved.length; i++) {
              if (allChartsThatWeHaveSaved[i] === chart) {
                return;
              }
            }
            allChartsThatWeHaveSaved.push(chart);
            saveChartAsPng(base);
          }
        }
      }
    });
  } else {
      console.error('Data or args are not defined. Cannot create chart.');
  }
}

async function saveChartAsPng(chart) {
    let img = document.createElement("img");
    img.classList.add("gallery-image");
    img.src = chart;
    img.onclick = () => {
        showImage(img);
    };
    document.getElementById("gallery-container").appendChild(img);
}

const setupXYFiltering = (x, y) => {
    const xMinInput = document.getElementById("min-x");
    const xMaxInput = document.getElementById("max-x");
    const yMinInput = document.getElementById("min-y");
    const yMaxInput = document.getElementById("max-y");
    const submitX = document.getElementById("submit-x");
    const submitY = document.getElementById("submit-y");

    if (x.some(val => !isNaN(val))) {
        const xMin = Math.min(...x);
        const xMax = Math.max(...x);
        xMinInput.min = xMin;
        xMinInput.max = xMax;
        xMaxInput.max = xMax;
        xMaxInput.min = xMin;
    } else {
        submitX.disabled = true;
        xMinInput.disabled = true;
        xMaxInput.disabled = true;
    }

    if (y.some(val => !isNaN(val))) {
        const yMin = Math.min(...y);
        const yMax = Math.max(...y);
        yMinInput.min = yMin;
        yMinInput.max = yMax;
        yMaxInput.max = yMax;
        yMaxInput.min = yMin;
    } else {
        submitY.disabled = true;
        yMinInput.disabled = true;
        yMaxInput.disabled = true;
    }
}
