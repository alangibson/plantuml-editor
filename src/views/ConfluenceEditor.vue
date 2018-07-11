<template>
  <div>
    <editor :enableConfluence="true"></editor>
  </div>
</template>

<script>
import Editor from './Editor'
import AP from 'atlassian-connect'

export default {
  name: 'confluenceEditor',
  components: {
    Editor
  },
  mounted () {
    // Recover macro editor state
    AP.confluence.getMacroData((macroParams: any) => {
      this.$store.dispatch('confluence/loadParams', macroParams)
      // HACK backwards compatability
      if (macroParams.encodedUML) {
        this.$store.dispatch('plantumlEditor/renderEncodedUML', macroParams.encodedUML)
      }
    })
    AP.confluence.getMacroBody((body: string) => {
      this.$store.dispatch('confluence/loadBody', body)
    })
  }
}
</script>
