// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}', './packages/ops-assistant/src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        default: '0 1px 16px 0px rgba(25, 25,25, 0.05)',
      },
    },
  },
  variants: {},
  plugins: [],
}
