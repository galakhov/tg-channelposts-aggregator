import { createSelector } from 'reselect'
import _filter from 'lodash/filter'

const dashSelector = state => state.dashboard

export const currentPostSelector = createSelector(
  dashSelector,
  dashboard => {
    return _filter(
      dashboard.posts,
      post => post._id === dashboard.currentPostId
    )[0]
  }
)
