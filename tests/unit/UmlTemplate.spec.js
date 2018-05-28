import Vue from 'vue'
import store from '@/store/index.js'
import UmlTemplate from '@/components/UmlTemplate'

describe('UmlTemplate.vue', () => {
  let vm: any = null

  beforeEach(() => {
    const Constructor: any = Vue.extend(UmlTemplate)
    vm = new Constructor({ store }).$mount()
  })

  describe('methods selectTemplate', () => {
    beforeEach(() => {
      vm.$store.dispatch('umlTemplate/selectTemplate', 'useCase')
    })

    it('state.plantumlEditor.text', () => {
      expect(vm.$store.state.plantumlEditor.text).toEqual(
        vm.$store.state.umlTemplate.useCase
      )
    })

    it('state.plantumlEditor.src', () => {
      expect(vm.$store.state.plantumlEditor.src).toEqual(
        'https://plantuml-server.kkeisuke.app/svg/UDfpA2v9B2efpStXuafCBialKd24qavSN8uAkgK5kdOA6gK5cY1EKMPwHWc8dvoQLv9Q11PBoI_F0mc1QB10JceQM0s8rkJYSa8smmaX3JF22SbOC0CiX6egbqDgNWhGYG02d38o.svg'
      )
    })
  })
})
