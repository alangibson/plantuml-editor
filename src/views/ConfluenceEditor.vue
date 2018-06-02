<template>
  <div  style="500px;">
    <editor :enableConfluence="true"></editor>
  </div>
</template>

<script>
import Editor from './Editor'
// import AJS from '@atlassian/aui/lib/js/aui'
import AP from 'atlassian-connect'

export default {
  name: 'confluenceEditor',
  components: {
    Editor
  },
  mounted () {
    let store = this.$store
    // Recover macro editor state
    AP.confluence.getMacroData(function(macroParams) {
      store.dispatch('plantumlEditor/renderEncodedUML', macroParams.encodedUML)
    });
  }
}
</script>
