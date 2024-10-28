import containerQueries from '@tailwindcss/container-queries';
import animated from 'tailwindcss-animated';

const generateGrid = (size) => {
  const gridColumn = {};
  const gridTemplateColumns = {};
  const gridRow = {};
  const gridTemplateRows = {};
  const gridRowStart = {};
  const gridRowEnd = {};
  const gridColumnStart = {};
  const gridColumnEnd = {};
  for (let i = 1; i <= size; i++) {
    gridRow[`span-${i}`] = `span ${i} / span ${i}`;
    gridColumn[`span-${i}`] = `span ${i} / span ${i}`;
    gridTemplateColumns[i] = `repeat(${i}, minmax(0, 1fr))`;
    gridTemplateRows[i] = `repeat(${i}, minmax(0, 1fr))`;
    gridRowStart[i] = `${i}`;
    gridRowEnd[i] = `${i}`;
    gridColumnStart[i] = `${i}`;
    gridColumnEnd[i] = `${i}`;
  }
  return {
    gridColumn,
    gridTemplateColumns,
    gridRow,
    gridTemplateRows,
    gridRowStart,
    gridRowEnd,
    gridColumnStart,
    gridColumnEnd,
  };
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f2f5fc',
          100: '#e1e8f8',
          200: '#cbd8f2',
          300: '#a6bfea',
          400: '#7c9dde',
          500: '#5d7dd4',
          600: '#4963c7',
          700: '#3f51b5',
          800: '#394494',
          900: '#323d76',
          950: '#222749',
        },
      },
      fontSize: {
        us: '0.625rem',
      },
      screens: {
        xs: '475px',
      },
      typography: () => ({
        DEFAULT: {
          css: {
            '.line-clamp': {
              display: '-webkit-box',
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
            },
          },
        },
      }),
      ...generateGrid(24),
    },
  },
  plugins: [
    containerQueries,
    animated,
    function ({ addUtilities }) {
      const newUtilities = {};
      Array.from(Array(10)).forEach((_, index) => {
        const count = index + 1;
        newUtilities[`.line-clamp-${count}`] = {
          '-webkit-line-clamp': `${count.toString()}`,
        };
      });
      addUtilities(newUtilities);

      newUtilities['.press-effect'] = {
        transitionDuration: '75ms',
        '&:active': {
          transform: 'scale(0.95)',
        },
      };

      newUtilities['.hide-scrollbar'] = {
        '-ms-overflow-style': 'none' /* Internet Explorer 10+ */,
        'scrollbar-width': 'none' /* Firefox */,
        '&::-webkit-scrollbar': {
          display: 'none' /* Safari and Chrome */,
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
