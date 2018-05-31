import VueRouter from 'vue-router'
import Editor from '../views/Editor.vue'
import ConfluenceEditor from '../views/ConfluenceEditor.vue'

const routes = [
  { path: '/', component: Editor },
  { path: '/confluence/editor', component: ConfluenceEditor }
]

export default new VueRouter({
  routes
})
