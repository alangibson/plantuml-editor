<template>
  <img id="ppu-img" :src="url"/>
</template>

<script>
import plantumlEncoder from 'plantuml-encoder-decoder'

export default {
  // TODO support dragscroll for image

  data() {
    return {
      // TODO spinning-orb loading image?
      url: this.$route.query.url
    }
  },
  mounted() {
    // TODO dont get url. Instead fetch macro body from Confluence Cloud, encode, then generate url

    AP.request(
      '/rest/api/content/' +
        this.$route.query.pageId +
        '/history/' +
        this.$route.query.pageVersion +
        '/macro/id/' +
        this.$route.query.macroId
    ).then((response: any) => {
      let encodedUML: string = plantumlEncoder.encode(JSON.parse(response).body)
      // TODO
      // this.url = ??? + encodedUML
      // TODO pass image type in url so we dont have to fetch it too
      // this.$route.query
    })
  }
}
</script>
