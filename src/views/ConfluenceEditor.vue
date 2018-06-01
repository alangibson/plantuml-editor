<template>
  <div  style="500px;">
    <editor></editor>
    <button id="submit-button" name="submit">Submit</button>
  </div>
</template>

<script>
import Editor from './Editor.vue'
// import "https://aui-cdn.atlassian.com/aui-adg/5.8.12/js/aui-soy.js"
// import "https://aui-cdn.atlassian.com/aui-adg/5.8.12/js/aui.js"
// import "https://aui-cdn.atlassian.com/aui-adg/5.8.12/js/aui-datepicker.js"
// import "https://aui-cdn.atlassian.com/aui-adg/5.8.12/js/aui-experimental.js"

// import '@atlassian/aui/lib/js/aui-soy.js'
// import '@atlassian/aui/lib/js/aui.js'
// import '@atlassian/aui/lib/js/aui-datepicker.js'
// import '@atlassian/aui/lib/js/aui-experimental.js'

// import {AP} from "@atlassian/aui/lib/js/aui"

import AJS from '@atlassian/aui/lib/js/aui'
// import $ from '@atlassian/aui/lib/js/aui/jquery.js'

// import C from '@atlassian/connect-module-core/dist/es2015'
// console.log('CCCCC', C)

// import AP from 'atlassian-connect-js'
// console.log('AP', AP);

// import AP from 'https://powerplantuml.atlassian.net/atlassian-connect/all.js'

import AP from 'atlassian-connect'

export default {
  name: 'confluenceEditor',
  components: {
    Editor
  },
  mounted () {
    let store : any = this.$store;
    function onSubmit () : boolean {
      let macroParams : any = {
        url: store.state.plantumlEditor.src
      }
      AP.confluence.saveMacro(macroParams)
      AP.confluence.closeMacroEditor()
      return true
    }
    AJS.$("#submit-button").click(onSubmit)
  }
}
</script>
