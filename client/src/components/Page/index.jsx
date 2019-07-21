import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/bind'

import Row from './Row'
import Main from './Main'
import Side from './Side'

import styles from './Page.css'

const cx = classNames.bind(styles)
const Page = ({ direction, className, ...props }) => {
  const classnames = cx(className, 'container', {
    'flex-row': direction === 'row',
    'flex-column': direction === 'column'
  })

  return (
    <div className={classnames}>
      {props.children}
    </div>
  )
}

Page.propTypes = {
  className: PropTypes.string,
  direction: PropTypes.string
}
Page.defaultProps = {
  className: '',
  direction: 'row'
}

Page.Row = Row
Page.Main = Main
Page.Side = Side

export default Page
