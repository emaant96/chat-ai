
module.exports = {
  mode: 'jit',
  prefix: '',
  content: ['./src/**/*.{html,ts,scss,css,js,md}'],
  theme: {
    extend: {
      scale: {
        200: '2',
        300: '3'
      }
    }
  },
  variants: {
    extend: {}
  }
};
