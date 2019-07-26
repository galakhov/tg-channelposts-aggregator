import Home from '~/pages/Home'
import About from '~/pages/About'
import Edit from '~/pages/Edit'

export default [
  { path: '/', exact: true, component: Home },
  { path: '/about', component: About },
  { path: '/edit/:postId', component: Edit }
]
