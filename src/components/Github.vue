<template>
  <div>
    <label for="oauth-token">OAuth Token</label>
    <input id="oauth-token" v-model="oauthToken"/>
    <button @click="logInOauthToken">Log In</button>

    <div>
      {{$store.state.github.ownerName}}/{{$store.state.github.repositoryName}}/{{$store.state.github.branchName}}
    </div>

    <ul>
      <li v-for="owner in $store.state.github.owners" :key="owner.login">
        <a @click="$store.dispatch('github/setOwner', owner.login)">{{owner.login}}</a>
      </li>
    </ul>

    {{$store.state.github.ownerName}}
    <ul>
      <li v-for="repo in $store.state.github.repositories" :key="repo.id"
          @click="$store.dispatch('github/setRepository', {ownerName: $store.state.github.ownerName, repositoryName: repo.name})">
        {{ repo.name }}
        <ul v-if="repo.name === $store.state.github.repositoryName">
          <li v-for="branch in $store.state.github.branches">
            <a @click.stop="$store.dispatch('github/setBranch', {branchName: branch.name})">{{ branch.name }}</a>
            <ul v-if="$store.state.github.trees.branchName === branch.name">
              <li v-for="tree in $store.state.github.trees.tree" :key="tree.sha">
                <a :href="tree.url">{{tree.path}}</a>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>

    <!-- <pre>
      {{JSON.stringify($store.state.github.owners, null, 2)}}
    </pre> -->
  </div>
</template>

<script>
export default {
  data (): any {
    return {
      oauthToken: null
    }
  },
  methods: {
    logInOauthToken () {
      this.$store.dispatch('github/authenticateToken', this.oauthToken)
    }
  },
  mounted () {
    // Split anchor
    let splitHash: Array<string> = window.location.hash.slice(1).split('/')
    let path: string = splitHash.slice(3).join('/')
    console.log('path', path)
    // Authenticate and try to load file
    if (this.$store.state.github.token) {
      this.$store.dispatch('github/authenticateToken', this.$store.state.github.token)
        .then(() => {
          // let [owner: string, repository: string, branch: string, ...file: string]: Array<string> = splitHash
          // if (splitHash.length === 3) {
          let [owner: string, repository: string, treeSHA: string]: Array<string> = splitHash
          console.log(owner, repository, treeSHA, path)
          this.$store.dispatch('github/setRepository', {ownerName: splitHash[0], repositoryName: splitHash[1]})
            .then(() => {
              this.$store.dispatch('github/setContents', {ref: splitHash[2], path: path})
            })
          // }
        })
    }
  }
}
</script>
