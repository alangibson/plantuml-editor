import AP from 'atlassian-connect'

const actions: any = {
  cancel() {
    AP.confluence.closeMacroEditor()
  },
  save(context: any) {
    AP.confluence.saveMacro(
      {
        url: context.rootState.plantumlEditor.src,
        // encodedUML: context.rootState.plantumlEditor.encodedText,
        // bodyIsEncoded: false,
        imageType: context.rootState.plantumlEditor.umlExtension
      },
      context.rootState.plantumlEditor.text)
    AP.confluence.closeMacroEditor()
  },
  loadParams(context: any, macroParams: any) {
    if (! macroParams) {
      console.log('macroParams not defined. Nothing to do.');
      return;
    }
    // HACK backwards compatability
    if (macroParams.encodedUML) {
      context.dispatch('plantumlEditor/renderEncodedUML', macroParams.encodedUML, {root: true})
    }
    // Set image type
    if (macroParams.imageType) {
      context.dispatch('plantumlEditor/setUmlExtension', macroParams.imageType, {root: true})
      context.dispatch(
        'plantumlEditor/renderUML',
        context.rootState.plantumlEditor.text
      )
    }
  },
  loadBody(context: any, body: string) {
    if (body && body !== '') {
      context.dispatch('plantumlEditor/renderUML', body, {root: true})
    }
  }
}

export default {
  namespaced: true,
  actions
}
