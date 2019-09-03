const S_BREAKPOINT = 738
const M_BREAKPOINT = 768
const L_BREAKPOINT = 1200
exports.breakpoints = { M_BREAKPOINT, L_BREAKPOINT }

const fonts = {
  sansFont:
    '-apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", "Droid Sans", "Helvetica Neue", "PingFang HK", "Hiragino Sans GB", "Droid Sans Fallback", "Microsoft YaHei", sans-serif',
  consoleFont:
    '"monostena", "Lucida Console", "Lucida Sans Typewriter", monaco, "Bitstream Vera Sans Mono", monospace',
  titleFont:
    '"Alegreya", -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", "Droid Sans", "Helvetica Neue", "PingFang HK"',
  textFont:
    '"Source Serif Pro", Noto Serif, PT Serif, "source-han-serif-sc", Songti SC, serif'
}
exports.fonts = fonts

const utils = {
  gutter: '15px',
  'l-gutter': '20px',
  'l-breakpoint': `${L_BREAKPOINT}px`,
  'm-breakpoint': `${M_BREAKPOINT}px`,
  headerHeight: '60px'
}
exports.utils = utils

const colors = {
  bgColor: '#282240',
  titleColor: '#fffbf7',
  mainColor: '#08109f',
  fontColor: '#4A4A4A',
  fontSelected: '#ff4d46',

  linkColor: '#f7527c', // #08109f
  linkHoverColor: '#0084FB',

  buttonColor: '#08109f',
  buttonHoverColor: '#195BBF',
  actionColor: '#f7527c', // pink! // #F5A623
  actionBgColor: '#fcc3c6',
  actionHoverColor: '#f7530c', // #FEBD52
  lineColor: '#fffbf7', // #EEEEEE

  cardColor: '#fffbf7',
  panelColor: '#383152', // #060b6f

  dark: '#4A4A4A',
  pitchDark: '#161616',
  blue: '#08109f',
  grey: '#BCBEBC',
  darkGrey: '#999999',
  red: '#DB4437',
  green: '#25A42F'
}
exports.colors = colors

const viewports = {
  '--xs': `(max-width: ${S_BREAKPOINT - 1}px)`, // small size
  '--s': `(max-width: ${M_BREAKPOINT - 1}px)`, // small size
  '--m': `(max-width: ${L_BREAKPOINT - 1}px)`, // medium size
  '--md': `(min-width: ${M_BREAKPOINT}px)`, // medium size and larger screens
  '--l': `(min-width: ${L_BREAKPOINT}px)` // large size
}
exports.viewports = viewports

exports.variables = {
  ...fonts,
  ...utils,
  ...colors
}
