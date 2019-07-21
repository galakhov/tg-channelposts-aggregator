import * as React from 'react'

import { connect } from 'react-redux'
import { setCurrentId, getMsgs, openModal } from '~/actions/Dashboard'

// import t from '~/utils/locales'
import { currentMsgSelector } from '~/reducers/selector.js'
import Page from '~/components/Page'

import '~/styles/global/global.css'
import styles from './Edit.css'

class Edit extends React.Component {
  componentWillMount () {
    const { match: { params: { msgId } } } = this.props
    this.props.setCurrentId(msgId)
  }
  componentDidMount () {
    this.props.getMsgs()
  }
  render () {
    const { currentMsg } = this.props

    return (
      <Page>
        <pre className={styles.raw}>
          {JSON.stringify(currentMsg, null, 2)}
        </pre>
      </Page>
    )
  }
}

const mapStateToProps = state => ({
  currentMsg: currentMsgSelector(state),
  isModalOpen: state.dashboard.isModalOpen,
  msgs: state.dashboard.msgs
})
const mapDispatchToProps = {
  openModal,
  getMsgs,
  setCurrentId
}

export default connect(mapStateToProps, mapDispatchToProps)(Edit)
