/* @flow */

import GitHub from 'github-api'

function clone (o: any): any {
  return JSON.parse(JSON.stringify(o))
}

export default {
  namespaced: true,
  state: {
    // GitHub authentication token
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
    setRepo (state: any, repo: any) {
      state.repo = repo
      state.ownerName = repo.owner.login
      state.repositoryName = repo.name
      state.branchName = repo.default_branch
    },
    setBranchName (state: any, branchName: string) {
      state.branchName = branchName
    },
    setBranch (state: any, branch: any) {
      state.branch = branch
      state.branchName = branch.name
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
      context.commit('setToken', token)
      // See if token is valid
      return new GitHub({token: token})
        .getUser()
        .getProfile()
        .then((res: any): any => {
          context.commit('settingsAuthenticationErrorMessage', '')
          
          // Load GitHub state
          context.dispatch('listRepositories')
          context.dispatch('listBranches')
          
          return res
        })
        .catch((error: any) => {
          console.error(error)
          context.commit('settingsAuthenticationErrorMessage',
            'Failed to authenticate you with GitHub. Please check your token.')
          throw error
        })
    },
    showGithubModal (context) {
      // If no token, show settings instead
      if (! context.state.token) {
        $('#githubSettingsModal').modal('show')
        return
      }
      // HACK
      $('#selectGithubRepoModal').modal('show')
    },
    showGithubSettingsModal (context) {
      // HACK
      $('#githubSettingsModal').modal('show')
    },
    //
    // Repositories
    //
    listRepositories (context: any): Promise<*> {
      return new GitHub({token: context.state.token})
        .getUser()
        .listRepos()
        .then((res: any) => {
          context.commit('setRepositories', res.data)
        })
    },
    // Set active repository. Also sets the default branch.
    setRepo (context: any, repo: any) {
      context.commit('setRepo', repo)
      context.dispatch('clearBranches')
      context.dispatch('listBranches')
    },
    setRepository (context: any, { ownerName, repositoryName }: { ownerName: string, repositoryName: string }): Promise<*> {
      context.dispatch('clearBranches')
      context.dispatch('listBranches')
      return new GitHub({token: context.state.token})
        .getRepo(ownerName, repositoryName)
        .getDetails()
        .then((res: any): any => {
          context.commit('setRepo', res.data)
          return res
        })
    },
    //
    // Branches
    //
    listBranches (context: any): Promise<*> {
      return new GitHub({token: context.state.token})
        .getRepo(context.state.ownerName, context.state.repositoryName)
        .listBranches()
        .then((res: any) => {
          context.commit('setBranches', res.data)
        })
    },
    setBranch (context: any, branch: any) {
      context.commit('setBranch', branch)
      context.dispatch('listTrees')
    },
    clearBranches (context: any) {
      context.commit('setBranches', [])
    },
    //
    // Trees
    //
    listTrees (context: any): Promise<*> {
      return new GitHub({token: context.state.token})
        .getRepo(context.state.ownerName, context.state.repositoryName)
        .getTree(context.state.branchName)
        .then((res: any) => {
          // TODO do this with commit()
          context.state.treeStack.push(clone(context.state.trees))
          let trees: any = clone(res.data)
          trees.branchName = context.state.branchName
          // context.state.trees = trees
          context.commit('setTree', trees)
        })
    },
    setTree (context: any, sha: string): Promise<*> {
      return new GitHub({token: context.state.token})
        .getRepo(context.state.ownerName, context.state.repositoryName)
        .getTree(sha)
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
      return new GitHub({token: context.state.token})
        .getRepo(context.state.ownerName, context.state.repositoryName)
        .getBlob(sha)
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
