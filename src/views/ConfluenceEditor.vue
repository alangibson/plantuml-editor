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
      console.debug(`[PowerPlantUML] Loading macro data`);
      this.$store.dispatch('confluence/loadParams', macroParams)
      // HACK backwards compatability
      // if (macroParams.encodedUML) {
      //   this.$store.dispatch('plantumlEditor/renderEncodedUML', macroParams.encodedUML)
      // }
      console.debug(`[PowerPlantUML] Done loading macro data`);
    })
    // AP.confluence.getMacroBody((body: string) => {
    //   console.debug(`[PowerPlantUML] Loading macro body of length ${body.length}`);
    //   this.$store.dispatch('confluence/loadBody', body)
    //   console.debug(`[PowerPlantUML] Done loading macro body`);
    // })
  }
}
</script>
