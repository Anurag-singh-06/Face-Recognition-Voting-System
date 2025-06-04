import React from 'react';
import ReactApexChart from 'react-apexcharts';

const ElectionResult = () => {
  const [state, setState] = React.useState({
    series: [
      {
        name: 'Party A',
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
      },
      {
        name: 'Party B',
        data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
      },
      {
        name: 'Party C',
        data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
      },
    ],
    options: {
      chart: {
        type: 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: ['Booth 1', 'Booth 2', 'Booth 3', 'Booth 4', 'Booth 5', 'Booth 6', 'Booth 7', 'Booth 8', 'Booth 9'],
      },
      yaxis: {
        title: {
          text: 'Votes',
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " votes";
          },
        },
      },
    },
  });

  return (
    <div style={{ padding: '20px' }}>
      <h2>Election Results</h2>
      <div id="chart">
        <ReactApexChart
          options={state.options}
          series={state.series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

export default ElectionResult;
