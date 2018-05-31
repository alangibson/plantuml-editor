<template>
  <div  style="500px;">
    <editor></editor>
    <button>Save</button>
  </div>
</template>

<script>
import Editor from './Editor.vue'

export default {
  name: 'confluenceEditor',
  components: {
    Editor
  }
}
</script>
