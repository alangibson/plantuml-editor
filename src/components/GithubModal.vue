 <template>
   <div id="selectGithubRepoModal" class="modal fade">
     <div class="modal-dialog" role="document">
       <div class="modal-content">

         <div class="modal-header">
           <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
           <div class="h3 modal-title">GitHub <small>Open File</small></div>
         </div>

         <div class="modal-body">
           <div class="container-fluid">
             <div class="col-sm-4">

               <!-- Left-hand list of repos and and branches -->
               <ul id="repo-branch-list" class="menu-list">
                 <li v-for="repo in repositories" :key="repo.id">
                   <a @click="setRepository(repo)">
                     {{ repo.full_name }}
                   </a>
                   <ul v-if="repo.name === $store.state.github.repositoryName">
                     <li v-for="branch in $store.state.github.branches">
                       <a @click.stop="setBranch(branch)">{{ branch.name }}</a>
                     </li>
                   </ul>
                 </li>
               </ul>

             </div>
             <div v-if="hasSelection"
                  class="col-sm-8">

               <!-- Back button -->
               <a @click.stop="$store.dispatch('github/backTree')">
                 <i class="fa fa-arrow-circle-left"></i>
               </a>

               <!-- Currently selected repo and branch -->
               {{$store.state.github.ownerName}} / {{$store.state.github.repositoryName}} / {{$store.state.github.branchName}}

               <div v-if="$store.state.github.tree.branchName"
                    class="container-fluid menu-list">
                 <div v-for="tree in treesInSelectedBranch" :key="tree.sha"
                      class="row">

                   <div class="col-sm-1">
                     <i v-if="tree.type === 'tree'"
                        class="fa fa-folder-open">
                     </i>
                     <i v-else-if="tree.type === 'blob'"
                        class="fa fa-file">
                     </i>
                   </div>
                   <div class="col-sm-5">
                     <a @click.stop="openTree(tree)">{{tree.path}}</a>
                   </div>
                   <div class="col-sm-3">
                     {{tree.type}}
                   </div>
                   <div class="col-sm-3">
                     {{tree.size}}
                   </div>
                 </div>
               </div>

             </div>
           </div>
         </div>

         <div class="modal-footer">
           <button @click.prevent="refresh" type="button" class="btn btn-secondary">Refresh</button>
           <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
         </div>

       </div>
     </div>
   </div>
</template>

<script>
import $ from 'jquery'

export default {
  computed: {
    treesInSelectedBranch(): Array<any> {
      return this.$store.state.github.tree.tree
        .concat()
        .sort((a, b) => {
          if (a.type === 'tree') {
            return -1
          } else {
            return 1
          }
        })
    },
    hasSelection(): boolean {
      return !! this.$store.state.github.ownerName
    },
    /**
     * Return sorted list of repositories.
     */
    repositories() {
      return this.$store.state.github.repositories
        .slice(0)
        .sort((a, b) => {
          if (a.full_name.toLowerCase() < b.full_name.toLowerCase()) {
            return -1
          } else {
            return 1
          }
        }
      )
    }
  },
  methods: {
    setRepository(repo: any) {
      this.$store.commit('github/pushHistory')
      this.$store.dispatch('github/setRepository', repo)
        .then(() => {
          this.$store.dispatch('github/clearBranches')
            .then(() => {
              this.$store.dispatch('github/listSelectedRepoBranches')
              this.$store.dispatch('github/setBranchByName', repo.default_branch)
                .then(() => {
                  this.$store.dispatch('github/getHeadTreeOfSelectedBranch')
                })
            })
        })
    },
    setBranch(branch: any) {
      this.$store.commit('github/pushHistory')
      this.$store.dispatch('github/setBranch', branch)
        .then(() => {
          this.$store.dispatch('github/getHeadTreeOfSelectedBranch')
        })
    },
    openTree(tree: any) {
      if (tree.type === 'tree') {
        this.$store.dispatch('github/setTreeBySHA', tree.sha)
      } else if (tree.type === 'blob') {
        this.$store.dispatch('github/setBlobBySHA', tree.sha)
        // Set window.location.hash
        window.location.hash = '#github' +
                               '/' + this.$store.state.github.ownerName +
                               '/' + this.$store.state.github.repositoryName +
                               '/' + tree.sha
        // Close modal
        // Doesnt work: this.showModal = false
        $('#selectGithubRepoModal').modal('hide')
      }
    },
    // Reload GitHub state
    refresh() {
      this.$store.dispatch('github/listRepositories')
      this.$store.dispatch('github/listSelectedRepoBranches')
    }
  },
  mounted() {
    console.log('mounted')
    // Split anchor
    let splitHash: Array<string> = window.location.hash.slice(1).split('/')
    let path: string = splitHash.slice(4).join('/')
    // TODO If splitHash.length > 0 and ! this.$store.state.github.token, open options with error message
    // Authenticate and try to load file
    if (this.$store.state.github.token) {
      this.$store.dispatch('github/authenticateToken', this.$store.state.github.token)
        .then(() => {
          console.log('Authentication succeeded')
          // Set up the initial state
          this.$store.commit('github/settingsAuthenticationErrorMessage', '')
          this.$store.dispatch('github/listRepositories')
          // Maybe set repository and editor contents based on url anchor tag
          // let [owner: string, repository: string, branch: string, ...file: string]: Array<string> = splitHash
          // let [owner: string, repository: string, treeSHA: string]: Array<string> = splitHash
          if (splitHash[0] === 'github') {
            this.$store.dispatch('github/setRepositoryByName', {ownerName: splitHash[1], repositoryName: splitHash[2]})
              .then(() => {
                if (splitHash.length === 4) {
                  // Support splitHash[2] == tree sha
                  this.$store.dispatch('github/setBlobBySHA', splitHash[3])
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

.menu-list a {
 cursor: pointer;
}
</style>
