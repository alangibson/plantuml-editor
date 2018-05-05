/* @flow */

import GitHub from 'github-api'

function clone (o: any): any {
  return JSON.parse(JSON.stringify(o))
}

export default {
  namespaced: true,
  state: {
    // GitHub API object
    gh: null,
    token: null,
    // Owner is either a User or Organization
    owner: null,
    ownerName: null,
    owners: [],
    // Authenticated User object
    user: null,
    // Users profile data
    userProfile: null,
    repositoryName: null,
    branchName: null,
    // List of repos from last listRepositories
    repositories: [],
    repo: null,
    // Branches in current repo
    branches: [],
    // Organizations user is a member of
    organizations: [],
    // Concatenation of organizations and username
    // owners: [],
    // Currently selected trees
    trees: {},
    // History of tree navigation
    treeStack: [],
    // Blob contents
    contents: null,
    settingsAuthenticationErrorMessage: ''
  },
  mutations: {
    setToken (state: any, token: string) {
      state.token = token
    },
    setOwnerName (state: any, ownerName: string) {
      state.ownerName = ownerName
    },
    setOwner (state: any, owner: any) {
      state.owner = owner
    },
    setRepositoryName (state: any, repositoryName: string) {
      state.repositoryName = repositoryName
    },
    setRepositories (state: any, repositories: Array<any>) {
      state.repositories = repositories
    },
    setRepositoryBranch (state: any, {ownerName, repositoryName, branchName}: {ownerName: string, repositoryName: string, branchName: string}) {
      state.ownerName = ownerName
      state.repositoryName = repositoryName
      state.branchName = branchName
    },
    setBranchName (state: any, branchName: string) {
      state.branchName = branchName
    },
    setBranch (state: any, branchName: string) {
      state.branchName = branchName
    },
    setBranches (state: any, branches: Array<any>) {
      state.branches = branches
    },
    setTree (state: any, tree: any) {
      state.trees = tree
    },
    setContents (state: any, contents: string) {
      state.contents = contents
    },
    settingsAuthenticationErrorMessage (state: any, message: string) {
      state.settingsAuthenticationErrorMessage = message
    }
  },
  actions: {
    authenticateToken (context: any, token: string): Promise<*> {
      console.log('authenticateToken: setting token', token)
      context.commit('setToken', token)
      context.state.gh = new GitHub({
        token: token
      })
      context.state.user = context.state.gh.getUser()
      return context.state.user.getProfile()
        .then((res: any): any => {
          console.log('authenticateToken succeeded', res)
          context.commit('settingsAuthenticationErrorMessage', '')
          if (!context.state.owner) {
            console.log('authenticateToken: setting owner to', context.state.user)
            context.commit('setOwner', context.state.user)
          }
          context.dispatch('listOwners')
          return res
        })
        .catch((error: any) => {
          context.commit('settingsAuthenticationErrorMessage',
            'Failed to authenticate you with GitHub. Please check your token.')
          throw error
        })
    },
    setUserProfile (context: any): Promise<*> {
      return context.state.user.getProfile()
        .then((res: any) => {
          context.state.userProfile = res.data
        })
    },
    setOwner (context: any, ownerName: string) {
      // context.state.ownerName = ownerName
      context.commit('setOwnerName', ownerName)
      // Note: You can use getUser to also get Organizations
      context.state.owner = context.state.gh.getUser(ownerName)
      // Reload repositories
      // context.state.repositoryName = null
      context.commit('setRepositoryName', null)
      context.dispatch('listRepositories')
      // Clear branches
      // context.state.branchName = null
      context.commit('setBranchName', null)
      // context.state.branches = []
      context.commit('setBranches', [])
    },
    listOrganizations (context: any): Promise<*> {
      return context.state.gh.getUser().listOrgs()
        .then((res: any) => {
          let orgs: Array<any> = []
          res.data.forEach((org: any) => {
            orgs.push(org)
          })
          context.state.organizations = orgs
        })
    },
    listOwners (context: any): Promise<*> {
      return context.dispatch('setUserProfile')
        .then(() => {
          context.dispatch('listOrganizations')
            .then(() => {
              context.state.owners = JSON.parse(JSON.stringify(context.state.organizations))
              context.state.owners.push(context.state.userProfile)
            })
        })
    },
    //
    // Repositories
    //
    listRepositories (context: any): Promise<*> {
      let f: any = null
      if (typeof context.state.owner.listRepos === 'function') {
        // Owner object is a User
        f = (): Promise<*> => context.state.owner.listRepos()
      } else if (typeof context.state.owner.getRepos === 'function') {
        // Owner object is an Organization
        f = (): Promise<*> => context.state.owner.getRepos()
      } // TODO need an else
      return f()
        .then((res: any) => {
          let repos: Array<any> = []
          res.data.forEach((repo: any) => {
            repos.push(repo)
          })
          // context.state.repositories = repos
          context.commit('setRepositories', repos)
        })
    },
    setRepository (context: any, { ownerName, repositoryName }: { ownerName: string, repositoryName: string }) {
      context.dispatch('clearBranches')
      context.commit('setRepositoryBranch', {ownerName, repositoryName, branchName: 'master'})
      // context.state.branchName = 'master'
      // context.state.ownerName = ownerName
      // context.state.repositoryName = repositoryName
      context.state.repo = context.state.gh.getRepo(ownerName, repositoryName)
      context.dispatch('listBranches')
    },
    //
    // Branches
    //
    listBranches (context: any): Promise<*> {
      // List branches in currently selected repository
      return context.state.repo.listBranches()
        .then((res: any) => {
          let branches: Array<any> = []
          res.data.forEach((branch: any) => {
            branches.push(branch)
          })
          // context.state.branches = branches
          context.commit('setBranches', branches)
        })
    },
    setBranch (context: any, { branchName }: {branchName: string}) {
      // context.state.branchName = branchName
      context.commit('setBranch', branchName)
      context.dispatch('listTrees')
    },
    clearBranches (context: any) {
      // context.state.branches = []
      context.commit('setBranches', [])
    },
    //
    // Trees
    //
    listTrees (context: any) {
      context.state.repo.getTree(context.state.branchName)
        .then((res: any) => {
          // TODO do this with commit()
          context.state.treeStack.push(clone(context.state.trees))
          let trees: any = clone(res.data)
          trees.branchName = context.state.branchName
          // context.state.trees = trees
          context.commit('setTree', trees)
        })
    },
    setTree (context: any, sha: string) {
      context.state.repo.getTree(sha)
        .then((res: any) => {
          // TODO do this with commit()
          context.state.treeStack.push(clone(context.state.trees))
          let trees: any = clone(res.data)
          // TODO invalid assumption?
          trees.branchName = context.state.branchName
          // context.state.trees = trees
          context.commit('setTree', trees)
        })
    },
    backTree (context: any) {
      // TODO do this with commit()
      let trees: any = context.state.treeStack.pop()
      if (trees) {
        // context.state.trees = trees
        context.commit('setTree', trees)
      }
    },
    //
    // Blobs
    //
    setBlob (context: any, sha: string): any {
      return context.state.repo.getBlob(sha)
        .then((res: any) => {
          context.commit('setContents', res.data)
          context.dispatch('plantumlEditor/renderUML', res.data, { root: true })
        })
    },
    setContents (context: any, {ref, path}: {ref: string, path: string}): any {
      return context.state.repo.getContents(ref, path, true)
        .then((res: any) => {
          context.commit('setContents', res.data)
          context.dispatch('plantumlEditor/renderUML', res.data, { root: true })
        })
    }
  }
}
