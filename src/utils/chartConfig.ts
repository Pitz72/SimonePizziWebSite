import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';

// Registrazione dei moduli necessari per Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Configurazione default per i colori del brand
export const chartColors = {
    green: '#22c55e',       // dis-green
    greenTransparent: 'rgba(34, 197, 94, 0.2)',
    cyan: '#22d3ee',
    cyanTransparent: 'rgba(34, 211, 238, 0.2)',
    purple: '#a855f7',
    orange: '#fb923c',
    zinc: '#71717a',
    zincLight: '#d4d4d8',
    bg: '#18181b',          // zinc-900
    border: '#27272a'       // zinc-800
};

// Opzioni comuni per i grafici Dark Mode
export const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: chartColors.zincLight,
                font: {
                    family: "'Inter', sans-serif",
                    size: 12
                }
            }
        },
        tooltip: {
            backgroundColor: '#09090b', // zinc-950
            titleColor: '#fff',
            bodyColor: chartColors.zincLight,
            borderColor: chartColors.border,
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            cornerRadius: 8
        }
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(39, 39, 42, 0.5)', // zinc-800 semi-transparent
                drawBorder: false
            },
            ticks: {
                color: chartColors.zinc,
                font: {
                    size: 10
                }
            }
        },
        y: {
            grid: {
                color: 'rgba(39, 39, 42, 0.5)',
                drawBorder: false
            },
            ticks: {
                color: chartColors.zinc,
                font: {
                    size: 10
                }
            }
        }
    }
};
