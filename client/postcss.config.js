const paths = require('./config/paths')

const { viewports, variables } = require('./src/styles/vars')

module.exports = {
  plugins: [
    require('postcss-flexbugs-fixes'),
    require('postcss-import')({
      path: paths.appSrc
    }),
    require('postcss-custom-properties')({
      variables
    }),
    require('postcss-custom-media')({
      extensions: viewports
    }),
    require('postcss-mixins'),
    require('postcss-calc'),
    require('postcss-nested'),
    require('autoprefixer')({
      browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9']
    })
  ]
}
