/* @flow */

import GitHub from 'github-api'

export default {
  namespaced: true,
  state: {
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
    // GitHub API object
    gh: null,
    // Currently selected trees
    trees: {}
  },
  mutations: {},
  actions: {
    authenticateToken (context: any, token: string) {
      context.state.gh = new GitHub({
        token: token
      })
      context.state.user = context.state.gh.getUser()
      // context.state.user.getProfile()
      //   .then(res => {
      //     context.state.userProfile = res.data
      //     context.dispatch('listOwners')
      //   })
      // Set our user to default owner
      context.state.owner = context.state.user
      context.dispatch('listOwners')
    },
    setUserProfile (context: any): Promise<*> {
      console.log('setUserProfile')
      return context.state.user.getProfile()
        .then((res: any) => {
          context.state.userProfile = res.data
        })
    },
    setOwner (context: any, ownerName: string) {
      context.state.ownerName = ownerName
      // Note: You can use getUser to also get Organizations
      // context.state.owner = context.state.gh.getOrganization(ownerName)
      context.state.owner = context.state.gh.getUser(ownerName)
      // Reload repositories
      context.state.repositoryName = null
      context.dispatch('listRepositories')
      // Clear branches
      context.state.branchName = null
      context.state.branches = []
    },
    listOrganizations (context: any): Promise<*> {
      console.log('listOrganizations')
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
      console.log('listOwners')
      return context.dispatch('setUserProfile')
        .then(() => {
          context.dispatch('listOrganizations')
            .then(() => {
              context.state.owners = JSON.parse(JSON.stringify(context.state.organizations))
              context.state.owners.push(context.state.userProfile)
            })
        })
    },
    setRepository (context: any, { ownerName, repositoryName }: { ownerName: string, repositoryName: string }) {
      console.log('Setting repo', ownerName, repositoryName)
      context.dispatch('clearBranches')
      context.state.branchName = 'master'
      context.state.ownerName = ownerName
      context.state.repositoryName = repositoryName
      context.state.repo = context.state.gh.getRepo(ownerName, repositoryName)
      context.dispatch('listBranches')
    },
    setBranch (context: any, { branchName }: {branchName: string}) {
      console.log('Setting branch', branchName)
      context.state.branchName = branchName
      context.dispatch('listTrees')
    },
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
          context.state.repositories = repos
        })
    },
    listBranches (context: any): Promise<*> {
      // List branches in currently selected repository
      return context.state.repo.listBranches()
        .then((res: any) => {
          let branches: Array<any> = []
          res.data.forEach((branch: any) => {
            branches.push(branch)
          })
          context.state.branches = branches
        })
    },
    clearBranches (context: any) {
      context.state.branches = []
    },
    listTrees (context: any) {
      context.state.repo.getTree(context.state.branchName)
        .then((res: any) => {
          let trees: any = JSON.parse(JSON.stringify(res.data))
          trees.branchName = context.state.branchName
          context.state.trees = trees
        })
    }
  }
}
