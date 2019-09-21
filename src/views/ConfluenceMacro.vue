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
  }
  // mounted() {
  //   // TODO dont get url. Instead fetch macro body from Confluence Cloud, encode, then generate url

  //   AP.request(
  //     '/rest/api/content/' +
  //       this.$route.query.pageId +
  //       '/history/' +
  //       this.$route.query.pageVersion +
  //       '/macro/id/' +
  //       this.$route.query.macroId
  //   ).then((response: any) => {
  //     let uml: string = plantumlEncoder.encode(JSON.parse(response).body)
  //     let encodedUml = plantumlEncoder.encode(uml)

  //     // TODO get plantuml server base url from atlassian-connect.json links.plantuml

  //     // TODO pass image type in url so we dont have to fetch it too
  //     // this.$route.query.imageType
  //     // TODO get language
  //     // this.$route.query.language

  //     // TODO build url then this.url=?
  //   })
  // }
}
</script>
