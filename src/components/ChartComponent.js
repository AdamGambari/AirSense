import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartComponent = ({ 
  type = 'line', 
  data, 
  title, 
  height = 300,
  options = {}
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && data) {
      // Destroy existing chart
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }

      const ctx = chartRef.current.getContext('2d');
      
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: {
                size: 12,
                family: "'Inter', sans-serif"
              }
            }
          },
          title: {
            display: !!title,
            text: title,
            color: '#ffffff',
            font: {
              size: 16,
              weight: '600',
              family: "'Inter', sans-serif"
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#94a3b8',
            borderColor: '#38bdf8',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            padding: 12
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(56, 189, 248, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 11,
                family: "'Inter', sans-serif"
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(56, 189, 248, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 11,
                family: "'Inter', sans-serif"
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6,
            borderWidth: 2
          },
          line: {
            tension: 0.4
          }
        },
        ...options
      };

      chartInstanceRef.current = new ChartJS(ctx, {
        type,
        data,
        options: defaultOptions
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [type, data, title, options]);

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartComponent;
