 <template>
   <div id="selectGithubRepoModal" class="modal fade">
     <div class="modal-dialog" role="document">
       <div class="modal-content">
         <div class="modal-header">
           <h5 class="modal-title" id="exampleModalLongTitle">Modal title</h5>
           <button type="button" class="close" data-dismiss="modal" aria-label="Close">
             <span aria-hidden="true">&times;</span>
           </button>
         </div>
         <div class="modal-body">
           <div>
             {{$store.state.github.ownerName}}/{{$store.state.github.repositoryName}}/{{$store.state.github.branchName}}
           </div>
           <div class="container-fluid">
             <div class="col-sm-4">
               <ul>
                 <li v-for="repo in $store.state.github.repositories" :key="repo.id">
                   <a @click="$store.dispatch('github/setRepo', repo)">
                     {{ repo.full_name }}
                   </a>
                   <ul v-if="repo.name === $store.state.github.repositoryName">
                     <li v-for="branch in $store.state.github.branches">
                       <a @click.stop="$store.dispatch('github/setBranch', branch)">{{ branch.name }}</a>
                     </li>
                   </ul>
                 </li>
               </ul>
             </div>
             <div class="col-sm-8">
               <button @click.stop="$store.dispatch('github/backTree')">^</button>
               <div v-if="$store.state.github.trees.branchName"
                    class="container-fluid">
                 <div v-for="tree in $store.state.github.trees.tree" :key="tree.sha"
                      class="row">
                   <div class="col-sm-4">
                     <a @click.stop="openTree(tree)">{{tree.path}}</a>
                   </div>
                   <div class="col-sm-4">
                     {{tree.type}}
                   </div>
                   <div class="col-sm-4">
                     {{tree.size}}
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
         <div class="modal-footer">
           <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
         </div>
       </div>
     </div>
   </div>
</template>

<script>
import $ from 'jquery'

export default {
  methods: {
    openTree (tree: any) {
      if (tree.type === 'tree') {
        this.$store.dispatch('github/setTree', tree.sha)
      } else if (tree.type === 'blob') {
        this.$store.dispatch('github/setBlob', tree.sha)
        // Set window.location.hash
        window.location.hash = '#github' +
                               '/' + this.$store.state.github.ownerName +
                               '/' + this.$store.state.github.repositoryName +
                               '/' + tree.sha
        // Close modal
        // Doesnt work: this.showModal = false
        $('#selectGithubRepoModal').modal('hide')
      }
    }
  },
  mounted () {
    console.log('mounted')
    // Split anchor
    let splitHash: Array<string> = window.location.hash.slice(1).split('/')
    let path: string = splitHash.slice(4).join('/')
    // TODO If splitHash.length > 0 and ! this.$store.state.github.token, open options with error message
    // Authenticate and try to load file
    if (this.$store.state.github.token) {
      this.$store.dispatch('github/authenticateToken', this.$store.state.github.token)
        .then(() => {
          this.$store.commit('github/settingsAuthenticationErrorMessage', '')
          // Maybe set repository and editor contents based on url anchor tag
          // let [owner: string, repository: string, branch: string, ...file: string]: Array<string> = splitHash
          // let [owner: string, repository: string, treeSHA: string]: Array<string> = splitHash
          if (splitHash[0] === 'github') {
            this.$store.dispatch('github/setRepository', {ownerName: splitHash[1], repositoryName: splitHash[2]})
              .then(() => {
                if (splitHash.length === 4) {
                  // Support splitHash[2] == tree sha
                  this.$store.dispatch('github/setBlob', splitHash[3])
                } else {
                  // Support splitHash[2] == ref and everything else is file path (like GitHub raw urls)
                  this.$store.dispatch('github/setContents', {ref: splitHash[3], path: path})
                }
              })
          }
        })
        .catch((error: any) => {
          console.error('authenticateToken failed', error)
          // Show settings with error message
          this.$store.commit('github/settingsAuthenticationErrorMessage',
            `You're trying to open a file from GitHub, but you haven't added any
            authentication info. Please enter your API token below then refresh
            this page`)
          $('#githubSettingsModal').modal('show')
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#selectGithubRepoModal .modal-dialog {
  width: 120rem;
}
</style>
