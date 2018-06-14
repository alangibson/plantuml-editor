<template>
  <div  style="500px;">
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
    AP.confluence.getMacroData((macroParams) => {
      this.$store.dispatch('confluence/loadParams', macroParams)
    })
    AP.confluence.getMacroBody((body) => {
      this.$store.dispatch('confluence/loadBody', body)
    })
  }
}
</script>
