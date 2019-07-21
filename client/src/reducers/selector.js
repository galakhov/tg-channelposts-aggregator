import { createSelector } from 'reselect'
import _filter from 'lodash/filter'

const dashSelector = state => state.dashboard

export const currentMsgSelector = createSelector(
  dashSelector,
  dashboard => {
    return _filter(dashboard.msgs, msg => msg._id === dashboard.currentMsgId)[0]
  }
)
