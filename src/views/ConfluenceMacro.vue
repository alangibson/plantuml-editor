<template>
  <img id="ppu-img" :src="$route.query.url"/>
</template>

<script>
export default {
  mounted () {
    console.log('this.$route.query.url', this.$route.query.url)
  }
}
</script>
