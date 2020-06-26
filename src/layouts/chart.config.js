module.exports = function config(points, axes) {
  return {
    type: "line",
    data: {
      datasets: [
        {
          data: points,
          backgroundColor: "rgba(26,162,221, .1)",
          borderColor: "#1aa2dd"
        }
      ]
    },
    options: {
      elements: {
        point: {
          radius: 1
        },
        line: {
          tension: 0 // disables bezier curves
        }
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [
          {
            display: true,
            type: "linear",
            scaleLabel: {
              display: true,
              labelString: axes.x.label
            },
            ticks: {
              maxTickLimit: 8,
              suggestedMax: 10,
              min: 0,
            }
          }
        ],
        yAxes: [
          {
            display: true,
            type: "linear",
            scaleLabel: {
              display: true,
              labelString: axes.y.label
            },
            ticks: {
              maxTickLimit: 8,
              suggestedMax: axes.y.max,
              min: 0
            }
          }
        ]
      },
      animation: {
        duration: 0 // general animation time
      },
      hover: {
        animationDuration: 0 // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0, // animation duration after a resize
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: "x"
          },
          zoom: {
            enabled: true,
            mode: "x"
          }
        }
      }
    }
  }
}