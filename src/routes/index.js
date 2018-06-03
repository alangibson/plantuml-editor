import VueRouter from 'vue-router'
import Editor from '../views/Editor.vue'
import Privacy from '../views/Privacy.vue'
import ConfluenceEditor from '../views/ConfluenceEditor.vue'
import ConfluenceMacro from '../views/ConfluenceMacro.vue'

const routes = [
  { path: '/', component: Editor },
  { path: '/privacy', component: Privacy },
  { path: '/confluence/editor', component: ConfluenceEditor },
  { path: '/confluence/macro', component: ConfluenceMacro }
]

export default new VueRouter({
  routes,
  mode: 'history'
})
