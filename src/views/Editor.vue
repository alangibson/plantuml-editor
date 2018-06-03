<template>
  <div>
    <headerNavbar :enableConfluence="enableConfluence"></headerNavbar>
    <div class="container-fluid">
      <div class="row">
        <div :class="[historyCol ? `col-sm-${historyCol}` : 'col-sm-2']" v-show="Boolean(historyCol)">
          <historyList :height="height"></historyList>
        </div>
        <div class="col-editor" :class="[editorCol ? `col-sm-${editorCol}` : 'col-sm-4']" v-show="Boolean(editorCol)">
          <editor :height="height"></editor>
        </div>
        <div :class="[cheatSheetCol ? `col-sm-${cheatSheetCol}` : 'col-sm-3']" v-show="Boolean(cheatSheetCol)">
          <cheatSheet :height="height"></cheatSheet>
        </div>
        <div :class="[umlCol ? `col-sm-${umlCol}` : 'col-sm-6']" v-show="Boolean(umlCol)">
          <functionTop></functionTop>
          <uml :height="umlH"></uml>
        </div>
      </div>
    </div>
    <helpModal></helpModal>
    <optionsModal></optionsModal>
    <gistModal></gistModal>
    <githubModal></githubModal>
    <githubSettingsModal></githubSettingsModal>
  </div>
</template>

<script>
/* @flow */

// components
import HeaderNavbar from '../components/HeaderNavbar'
import HelpModal from '../components/HelpModal'
import OptionsModal from '../components/OptionsModal'
import GistModal from '../components/GistModal'
import GithubModal from '../components/GithubModal'
import GithubSettingsModal from '../components/GithubSettingsModal'
import HistoryList from '../components/HistoryList'
import CheatSheet from '../components/CheatSheet'
import FunctionTop from '../components/FunctionTop'
import Uml from '../components/Uml'
import Editor from '../components/Editor'

export default {
  name: 'home',
  components: {
    HeaderNavbar,
    HelpModal,
    OptionsModal,
    GistModal,
    HistoryList,
    GithubModal,
    GithubSettingsModal,
    CheatSheet,
    FunctionTop,
    Uml,
    Editor
  },
  props: [
    'enableConfluence'
  ],
  computed: {
    historyCol(): number {
      return this.$store.state.layout.colSize.history
    },
    editorCol(): number {
      return this.$store.state.layout.colSize.editor
    },
    cheatSheetCol(): number {
      return this.$store.state.layout.colSize.cheatSheet
    },
    umlCol(): number {
      return this.$store.state.layout.colSize.uml
    }
  },
  data(): any {
    return {
      height: '0px',
      umlH: '0px'
    }
  },
  created() {
    this.resize()
    this.$store.dispatch('plantumlEditor/getLocalStrage')
    this.$store.dispatch(
      'plantumlEditor/renderUML',
      this.$store.state.plantumlEditor.text
    )
    this.$store.dispatch('histories/defineScheme')
  },
  mounted() {
    this.setHeight()
    window.$('[data-toggle="tooltip"]').tooltip()

    // Look for a query param ?uml={..} or anchor #uml={...}
    // FIXME getting error with #github/
    if (this.$route.query.uml) {
      this.$store.dispatch('plantumlEditor/renderEncodedUML', this.$route.query.uml)
    } else if (this.$route.hash) {
      let ref: string = this.$route.hash.split('#')[1]
      let encodedUml: string = ref.split('uml=').slice(1).join('uml=')
      this.$store.dispatch('plantumlEditor/renderEncodedUML', encodedUml)
    }
  },
  methods: {
    setHeight() {
      const headerHeight: number = window.$('.navbar-static-top').height()
      const functionTopHeight: number = window.$('.functionTop').height()
      // Reduce height to reduce overall editor height
      const height: number = window.innerHeight - headerHeight
      const marginTop: number = 20
      const marginBottom: number = 10
      this.height = height + 'px'
      this.umlH = height - (marginTop + functionTopHeight + marginBottom) + 'px'
    },
    resize() {
      let timer: any = null
      window.addEventListener('resize', () => {
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          this.setHeight()
        }, this.$store.state.plantumlEditor.FPS)
      })
    }
  }
}

</script>
