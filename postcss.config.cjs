module.exports = {
  plugins: {
    'postcss-import': {},
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      features: {
        'color-functional-notation': true,
        'oklab-function': true,
      },
      preserve: false
    },
    'autoprefixer': {},
  },
}
