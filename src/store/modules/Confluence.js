import AP from 'atlassian-connect'

function extractEncodedUMLFromURL(url) {
  const path = new URL(url).pathname
  const parts = path.split('.')[0].split('/')
  return parts[parts.length - 1]
}

const actions: any = {
  cancel(context: any) {
    context.commit('plantumlEditor/resetUML', { root: true })
    AP.confluence.closeMacroEditor()
  },
  save(context: any) {
    console.debug(`[PowerPlantUML] Saving macro. Body length is ${context.rootState.plantumlEditor.text.length}`)
    AP.confluence.saveMacro(
      {
        url: context.rootState.plantumlEditor.src,
        // doc: context.rootState.plantumlEditor.text,
        imageType: context.rootState.plantumlEditor.umlExtension,
        encodedUML: context.rootState.plantumlEditor.encodedText,
        language: 'plantuml'
      },
      context.rootState.plantumlEditor.text
    )
    AP.confluence.closeMacroEditor()
    console.debug('[PowerPlantUML] Done saving macro')
  },
  loadParams(context: any, macroParams: any) {
    console.debug('[PowerPlantUML] Loading params')
    if (!macroParams) {
      console.warn('[PowerPlantUML] macroParams not defined. Nothing to do.')
      return
    }

    // Removed. encodedUML should be write-only.
    // HACK backwards compatability
    // if (macroParams.encodedUML) {
    //   console.debug(`[PowerPlantUML] Encoded UML is set. Length is ${macroParams.encodedUML.length}`);
    //   context.dispatch('plantumlEditor/renderEncodedUML', macroParams.encodedUML, {root: true})
    // }

    // Set image type
    console.debug(`[PowerPlantUML] Image type is ${macroParams.imageType}`)
    if (macroParams.imageType) {
      context.dispatch('plantumlEditor/setUmlExtension', macroParams.imageType, { root: true })
      context.dispatch('plantumlEditor/renderUML', context.rootState.plantumlEditor.text)
    }
    // Set document definition language
    console.debug(`[PowerPlantUML] Language is ${macroParams.language}`)
    if (macroParams.language) {
      context.dispatch('plantumlEditor/setLanguage', macroParams.language, {
        root: true
      })
    }
    // Recover document
    // if (macroParams.doc) {
    //   console.debug(`[PowerPlantUML] Loading document. Length is ${macroParams.doc.length}`)
    //   context.dispatch('plantumlEditor/renderUML', macroParams.doc, {
    //     root: true
    //   })
    // } else 
    if (macroParams.url) {
      console.debug(`[PowerPlantUML] Loading document from URL ${macroParams.url}`)
      const encodedUML = extractEncodedUMLFromURL(macroParams.url)
      context.dispatch('plantumlEditor/renderEncodedUML', encodedUML, {
        root: true
      })
    }
    // TODO error?

    console.debug('[PowerPlantUML] Done loading params')
  },
  loadBody(context: any, body: string) {
    // console.debug(`[PowerPlantUML] Loading body.`);
    // if (body && body !== '' && body !== '\n') {
    //   console.debug(`[PowerPlantUML] Loading body. Length is ${body.length}`);
    //   context.dispatch('plantumlEditor/renderUML', body, {root: true})
    // }
    // console.debug(`[PowerPlantUML] Done loading body.`);
  }
}

export default {
  namespaced: true,
  actions
}
