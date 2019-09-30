/* @flow */

import Dexie from 'dexie'
import lodash from 'lodash'
const _: any = lodash

// Since Dexie is a wrapper for IndexedDB, it doesnt make much sense to have it in state object.
var db = new Dexie('PlantumlEditor')

const state: any = {
  schemes: ['++id,text,src,created', '++id,text,encodedText,created'],
  versions: [1, 2],
  data: []
}

const mutations: any = {
  defineScheme(state: any) {
    // バージョン 2
    // Version 2
    db.version(state.versions[1])
      .stores({
        plantuml: state.schemes[1]
      })
      .upgrade(() => {
        state.db.plantuml.toCollection().modify((history: any) => {
          history.encodedText = _.last(history.src.split('/'))
        })
      })
    // バージョン 1
    // Version 1
    db.version(state.versions[0]).stores({
      plantuml: state.schemes[0]
    })
  },
  getHistories(state: any) {
    db.plantuml
      .reverse()
      .toArray()
      .then(function(data: any[]) {
        state.data = data
      })
  },
  save(state: any, { text, encodedText }: any) {
    db.plantuml.add({
      text: text,
      encodedText: encodedText,
      created: new Date().toLocaleString()
    })
  },
  delete(state: any, id: number) {
    db.plantuml.delete(id)
  }
}

const actions: any = {
  defineScheme(context: any) {
    context.commit('defineScheme')
  },
  getHistories(context: any) {
    context.commit('getHistories')
  },
  save(context: any, { text, encodedText }: any) {
    context.commit('save', { text, encodedText })
    context.commit('getHistories')
  },
  delete(context: any, id: number) {
    context.commit('delete', id)
    context.commit('getHistories')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
