<template>
  <div id="options" class="modal fade">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
          <div class="h3 modal-title">Options</div>
        </div>
        <div class="modal-body">
          <form class="form-horizontal">
            <div class="form-group">
              <label class="col-sm-4 control-label">keymap</label>
              <div class="col-sm-8">
                <label class="radio-inline">
                  <input type="radio" name="keymap" v-model="keymap" value="sublime"> sublime
                </label>
                <label class="radio-inline">
                  <input type="radio" name="keymap" v-model="keymap" value="vim"> vim
                </label>
                <label class="radio-inline">
                  <input type="radio" name="keymap" v-model="keymap" value="emacs"> emacs
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">indent</label>
              <div class="col-sm-8">
                <label class="radio-inline">
                  <input type="radio" name="indent" v-model="indent" value="space2"> space 2
                </label>
                <label class="radio-inline">
                  <input type="radio" name="indent" v-model="indent" value="space4"> space 4
                </label>
                <label class="radio-inline">
                  <input type="radio" name="indent" v-model="indent" value="tab"> tab
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label" for="codeMirrorTheme">editor theme&nbsp;</label>
              <div class="col-sm-8">
                <select id="codeMirrorTheme" v-model="codeMirrorTheme" class="form-control">
                  <option v-for="(option, index) in codeMirrorThemes" :value="option" :key="index">
                    {{ option }}
                  </option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* @flow */

export default {
  name: 'OptionsModal',
  computed: {
    keymap: {
      get(): string {
        return this.$store.state.plantumlEditor.codemirrorOptions.keyMap
      },
      set(value: string) {
        this.$store.dispatch('plantumlEditor/syncCodeMirrorKeyMap', value)
      }
    },
    indent: {
      get(): string {
        return this.$store.state.plantumlEditor.codemirrorIndent
      },
      set(value: string) {
        this.$store.dispatch('plantumlEditor/syncCodeMirrorIndent', value)
      }
    },
    codeMirrorTheme: {
      get(): string {
        return this.$store.state.plantumlEditor.codemirrorOptions.theme
      },
      set(value: string) {
        this.$store.dispatch('plantumlEditor/syncCodeMirrorTheme', value)
      }
    },
    codeMirrorThemes(): any {
      // Best: monokai, lucario, mbo, railscast, seti, ttcn,
      return [
        'default',
        '3024-day', '3024-night',
        'abcdef', 'ambiance', 'ambiance-mobile',
        'base16-dark', 'base16-light', 'bespin', 'blackboard',
        'cobalt', 'colorforth',
        'dracula', 'duotone-dark', 'duotone-light',
        'eclipse', 'elegant', 'erlang-dark',
        'gruvbox-dark',
        'hopscotch',
        'icecoder', 'idea', 'isotope',
        'lesser-dark', 'liquibyte', 'lucario',
        'material', 'mbo', 'mdn-like', 'midnight', 'monokai',
        'neat', 'neo', 'night',
        'oceanic-next',
        'panda-syntax', 'paraiso-dark', 'paraiso-light', 'pastel-on-dark',
        'railscasts', 'rubyblue',
        'seti', 'shadowfox', 'solarized', 'ssms',
        'the-matrix', 'tomorrow-night-bright', 'tomorrow-night-eighties', 'ttcn', 'twilight',
        'vibrant-ink',
        'xq-dark', 'xq-light',
        'yeti',
        'zenburn'
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
