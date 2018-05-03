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
                 <li v-for="owner in $store.state.github.owners" :key="owner.login">
                   <a @click="$store.dispatch('github/setOwner', owner.login)">{{owner.login}}</a>
                   <ul v-if="owner.login === $store.state.github.ownerName">
                     <li v-for="repo in $store.state.github.repositories" :key="repo.id">
                       <a @click="$store.dispatch('github/setRepository', {ownerName: $store.state.github.ownerName, repositoryName: repo.name})">
                         {{ repo.name }}
                       </a>
                       <ul v-if="repo.name === $store.state.github.repositoryName">
                         <li v-for="branch in $store.state.github.branches">
                           <a @click.stop="$store.dispatch('github/setBranch', {branchName: branch.name})">{{ branch.name }}</a>
                         </li>
                       </ul>
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
export default {
  methods: {
    openTree (tree: any) {
      console.log(JSON.stringify(tree))
      if (tree.type === 'tree') {
        this.$store.dispatch('github/setTree', tree.sha)
      } else if (tree.type === 'blob') {
        this.$store.dispatch('github/setBlob', tree.sha)
        // Set window.location.hash
        window.location.hash = '#' + this.$store.state.github.ownerName +
                               '/' + this.$store.state.github.repositoryName +
                               '/' + tree.sha
        // TODO close modal
      }
    }
  },
  mounted () {
    // Split anchor
    let splitHash: Array<string> = window.location.hash.slice(1).split('/')
    let path: string = splitHash.slice(3).join('/')
    // Authenticate and try to load file
    if (this.$store.state.github.token) {
      this.$store.dispatch('github/authenticateToken', this.$store.state.github.token)
        .then(() => {
          // Maybe set repository and editor contents based on url anchor tag
          // let [owner: string, repository: string, branch: string, ...file: string]: Array<string> = splitHash
          // let [owner: string, repository: string, treeSHA: string]: Array<string> = splitHash
          if (splitHash.length >= 2) {
            this.$store.dispatch('github/setRepository', {ownerName: splitHash[0], repositoryName: splitHash[1]})
              .then(() => {
                if (splitHash.length === 3) {
                  // Support splitHash[2] == tree sha
                  this.$store.dispatch('github/setBlob', splitHash[2])
                } else {
                  // Support splitHash[2] == ref and everything else is file path (like GitHub raw urls)
                  this.$store.dispatch('github/setContents', {ref: splitHash[2], path: path})
                }
              })
          }
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
