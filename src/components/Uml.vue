<template>
  <div class="row">
    <div class="col-sm-12">
      <div id="umlArea" class="dragscroll umlImage" :style="{'height':height}">
        <div v-html="preMarkdown"></div>

        <!--
          Not making a difference between png and svg due to chrome (?) bug
          that requests svg in infinite loop due to a.style.cssText undefined
        -->
        <!--<img :src="src" @load="loadedImg" v-if="!isSvg && hasSrc" :width="umlWidth"/>-->
        <!--<object :data="src" @load="loadedImg" v-else-if="isSvg && hasSrc" :width="umlWidth"></object>-->
        <img :src="src" @load="loadedImg" :width="umlWidth"/>

        <div v-html="afterMarkdown"></div>
      </div>
    </div>
  </div>
</template>

<script>
/* @flow */

import 'dragscroll'

export default {
  name: 'uml',
  props: {
    height: {
      type: String,
      default: '100%'
    }
  },
  computed: {
    src(): string {
      return this.$store.state.plantumlEditor.src
    },
    // hasSrc(): boolean {
    //   return !!this.$store.state.plantumlEditor.src
    // },
    isSvg(): string {
      return this.$store.getters['plantumlEditor/isSvg']
    },
    preMarkdown(): string {
      return this.$store.state.plantumlEditor.preMarkdown
    },
    afterMarkdown(): string {
      return this.$store.state.plantumlEditor.afterMarkdown
    },
    umlWidth (): string {
      if (this.$store.state.plantumlEditor.umlWidth && this.$store.state.plantumlEditor.umlWidth >= 1) {
        return this.$store.state.plantumlEditor.umlWidth + '%'
      } else {
        return 'auto'
      }
    }
  },
  data(): any {
    return {
      loadingDelay: 500,
      drag: true
    }
  },
  created() {
    this.$store.dispatch('plantumlEditor/setMarked')
    this.$store.dispatch('plantumlEditor/setIsLoading', true)
  },
  watch: {
    src() {
      if (this.src) {
        this.$store.dispatch('plantumlEditor/setIsLoading', true)
      }
    }
  },
  methods: {
    loadedImg() {
      window.setTimeout(() => {
        this.$store.dispatch('plantumlEditor/setIsLoading', false)
      }, this.loadingDelay)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.umlImage {
  overflow: scroll;
  /*width: 100%;*/
}
</style>
