import AP from 'atlassian-connect'

const actions: any = {
  cancel () {
    AP.confluence.closeMacroEditor()
  },
  save (context: any) {
    AP.confluence.saveMacro({
      url: context.rootState.plantumlEditor.src,
      encodedUML: context.rootState.plantumlEditor.encodedText
    })
    AP.confluence.closeMacroEditor()
  }
}

export default {
  namespaced: true,
  actions
}
