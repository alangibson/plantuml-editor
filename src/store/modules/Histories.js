/* @flow */

import plantumlEncoder from 'plantuml-encoder-decoder'
import Dexie from 'dexie'
import lodash from 'lodash'
const _: any = lodash
import uuid from 'uuid/v4'

// Since Dexie is a wrapper for IndexedDB, it doesnt make much sense to have it in state object.
var db = new Dexie('PlantumlEditor')

const state: any = {
  schemes: ['++id,text,src,created', '++id,text,encodedText,created', 'id,created'],
  versions: [1, 2, 3],
  data: [],
  openDocument: null
}

const mutations: any = {
  setOpenDocument(state: any, document: any) {
    state.openDocument = document
  },
  setHistories(state: any, data: any) {
    state.data = data
  }
}

const actions: any = {
  defineScheme(context: any) {
    // Version 3
    db.version(context.state.versions[2])
      .stores({
        plantuml: context.state.schemes[2]
      })
    // バージョン 2
    db.version(context.state.versions[1])
      .stores({
        plantuml: context.state.schemes[1]
      })
      .upgrade(() => {
        db.plantuml
          .toCollection()
          .modify((history: any) => {
            history.encodedText = _.last(history.src.split('/'))
          })
      })
    // バージョン 1
    db.version(context.state.versions[0])
      .stores({
        plantuml: context.state.schemes[0]
      })
  },
  getHistories(context: any) {
    // context.commit('getHistories')
    return db.plantuml
      .reverse()
      .toArray()
      .then(function(data: any[]) {
        context.commit('setHistories', data)
      })
  },
  save(context: any, { text, encodedText }: any): Promise<*> {
    let openDocument = context.state.openDocument
    if (openDocument) {
      console.log('action save update')
      // Overwrite openDocument, dont create new
      openDocument.text = text
      openDocument.encodedText = encodedText
      // Update Dexie
      return db.plantuml
        .update(openDocument.id, openDocument)
        .then(() => {
          context.commit('setOpenDocument', openDocument)
          // Note: state.data must be reloaded by call to getHistories
          context.dispatch('getHistories')
        })
    } else {
      // Create new document
      let document = {
        id: uuid(),
        text: text,
        encodedText: encodedText,
        created: new Date().toLocaleString()
      }
      return db.plantuml
        .add(document)
        .then(() => {
          // Open our new document
          context.commit('setOpenDocument', document)
          context.commit('getHistories')
        })
    }
  },
  delete(context: any, id: string): Promise<*> {
    return db.plantuml
      .delete(id)
      .then(() => {
        // TODO dont set to null, set to next in list
        context.commit('setOpenDocument', null)
        // We now have no open document
        context.dispatch('getHistories')
        // TODO openDocument = null if id === openDocument.id
      })
  },
  open(context: any, id: string): Promise<*> {
    // Query Dexie by id async
    return db.plantuml
      .get(id)
      .then(document => {
        context.commit('setOpenDocument', document)
        // Set the buffer in the editor
        return context.dispatch('plantumlEditor/renderUML', document.text, {root: true})
      })
  },
  newDocument(context: any) {
    let id = uuid()
    // TODO load a basic template instead?
    let text = '@startuml\nactor PowerPlantUML\n@enduml\n'
    let document = {
      id: id,
      text: text,
      encodedText: plantumlEncoder.encode(text),
      created: new Date().toLocaleString()
    }
    return db.plantuml
      .add(document)
      .then(() => {
        return context.dispatch('open', id)
      })
  },
  openFirstOrNewDocument(context: any): Promise<*> {
    if (!context.state.openDocument) {
      // There is no open document
      if (context.state.data.length === 0) {
        // There are no documents in history
        // Create new document
        return context.dispatch('newDocument')
          .then(() => {
            context.dispatch('getHistories')
          })
      } else {
        // There are documents in history
        // Open first document
        return context.dispatch('open', context.state.data[0].id)
          .then(() => {
            context.dispatch('getHistories')
          })
      }
    } // else: There is an open document, so do nothing
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
