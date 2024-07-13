import { navigateAndReturn } from "./redirectHelper";
import { getCookie } from './cookies'
import idb from "./idb";
import cacheElements from "./cacheElements";

const accountUtils = {}

const getAccountDom = () => {
    return cacheElements.accountDom
}

let accountLinksDom = () => {
    accountLinksDom = accountLinksDom || getAccountDom().querySelectorAll('a')
    return accountLinksDom
}

Object.defineProperty(accountUtils, 'loggedIn', {
    get: () => {
        return !!getCookie('funn')
    }
})

Object.defineProperty(accountUtils, 'accountLink', {
    get(){
        if (!accountUtils.loggedIn) {
            return undefined
        }
        return accountLinksDom()[0]?.href
    }
})

Object.defineProperty(accountUtils, 'accountName', {
    get(){
        return getCookie('funn')
    }
})

Object.defineProperty(accountUtils, 'login', {
    value: () => {
        navigateAndReturn('/login.php?cache=bust', 'loggedin', 'loggedin')
    }
})

Object.defineProperty(accountUtils, 'logout', {
    value: ()=>{
        navigateAndReturn('/logout.php', 'loggedout', 'loggedout')
    }
})

async function getFollowedAuthors(page = 1, checkPagination = true){
    const response = await fetch(`/alert/author.php?sort=&categoryid=0&userid=0&p=${page}`)
    const responseBody = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(responseBody, 'text/html')
    const allAuthors = []
    let authorFetches = []
    if (checkPagination){
        const pagination = doc.querySelector('#content_wrapper_inner > table td > center:last-child a:nth-last-child(2)')
        if (pagination) {
            const lastPageUrl = new URL(pagination?.href)
            const lastPage = lastPageUrl.searchParams.get('p')
            authorFetches = Array(parseInt(lastPage) - 1).fill().map(async (_, i) => {
                const stories = await getFollowedStories(i + 2, false)
                allAuthors.push(...stories)
            })
        }
    }
    const storyRows = doc.querySelectorAll('#gui_table1i tbody tr')
    const authors = [...storyRows].map(row => {
        if (row.querySelector('td:nth-child(1)').getAttribute('colspan') > 2) return undefined
        // if (row.querySelector('td:nth-child(1)').attributes) return undefined
        const author = {}
        author.name = row.querySelector('td:nth-child(1)').innerText
        author.link = row.querySelector('td:nth-child(1) a').href
        author.id = row.querySelector('input').getAttribute('value')
        author.follow = true
        return author
    }).filter(author => author)
    allAuthors.push(...authors)
    await Promise.allSettled(authorFetches)
    return allAuthors
}

async function getFavouriteAuthors(page = 1, checkPagination = true){
    const response = await fetch(`/favorites/author.php?sort=&categoryid=0&userid=0&p=${page}`)
    const responseBody = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(responseBody, 'text/html')
    const allAuthors = []
    let authorFetches = []
    if (checkPagination){
        const pagination = doc.querySelector('#content_wrapper_inner > table td > center:last-child a:nth-last-child(2)')
        if (pagination) {
            const lastPageUrl = new URL(pagination?.href)
            const lastPage = lastPageUrl.searchParams.get('p')
            authorFetches = Array(parseInt(lastPage) - 1).fill().map(async (_, i) => {
                const stories = await getFollowedStories(i + 2, false)
                allAuthors.push(...stories)
            })
        }
    }
    const storyRows = doc.querySelectorAll('#gui_table1i tbody tr')
    const authors = [...storyRows].map(row => {
        if (row.querySelector('td:nth-child(1)').getAttribute('colspan') > 2) return undefined
        // if (row.querySelector('td:nth-child(1)').attributes) return undefined
        const author = {}
        author.name = row.querySelector('td:nth-child(1)').innerText
        author.link = row.querySelector('td:nth-child(1) a').href
        author.id = row.querySelector('input').getAttribute('value')
        author.favourite = true
        return author
    }).filter(author => author)
    allAuthors.push(...authors)
    await Promise.allSettled(authorFetches)
    return allAuthors
}

async function getFollowedStories(page = 1, checkPagination = true){
    const response = await fetch(`/alert/story.php?sort=&categoryid=0&userid=0&p=${page}`)
    const responseBody = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(responseBody, 'text/html')
    const allStories = []
    let storyFetches = []
    if (checkPagination){
        const pagination = doc.querySelector('#content_wrapper_inner > table td > center:last-child a:nth-last-child(2)')
        if (pagination) {
            const lastPageUrl = new URL(pagination?.href)
            const lastPage = lastPageUrl.searchParams.get('p')
            storyFetches = Array(parseInt(lastPage) - 1).fill().map(async (_, i) => {
                const stories = await getFollowedStories(i + 2, false)
                allStories.push(...stories)
            })
        }
    }
    const storyRows = doc.querySelectorAll('#gui_table1i tbody tr')
    const stories = [...storyRows].map(row => {
        if (row.querySelector('td:nth-child(1)').getAttribute('colspan') > 2) return undefined
        // if (row.querySelector('td:nth-child(1)').attributes) return undefined
        const story = {}
        story.name = row.querySelector('td:nth-child(1)').innerText
        story.link = row.querySelector('td:nth-child(1) a').href
        story.authorName = row.querySelector('td:nth-child(2)').innerText
        story.authorId = row.querySelector('td:nth-child(2)').firstElementChild.href.split('/')[4]
        story.id = row.querySelector('input').getAttribute('value')
        story.follow = true
        return story
    }).filter(story => story)
    allStories.push(...stories)
    await Promise.allSettled(storyFetches)
    return allStories
}

async function getFavouriteStories(page = 1, checkPagination = true){
    const response = await fetch(`/favorites/story.php?sort=&categoryid=0&userid=0&p=${page}`)
    const responseBody = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(responseBody, 'text/html')
    const allStories = []
    let storyFetches = []
    if (checkPagination){
        const pagination = doc.querySelector('#content_wrapper_inner > table td > center:last-child a:nth-last-child(2)')
        if (pagination) {
            const lastPageUrl = new URL(pagination?.href)
            const lastPage = lastPageUrl.searchParams.get('p')
            storyFetches = Array(parseInt(lastPage) - 1).fill().map(async (_, i) => {
                const stories = await getFollowedStories(i + 2, false)
                allStories.push(...stories)
            })
        }
    }
    const storyRows = doc.querySelectorAll('#gui_table1i tbody tr')
    const stories = [...storyRows].map(row => {
        if (row.querySelector('td:nth-child(1)').getAttribute('colspan') > 2) return undefined
        // if (row.querySelector('td:nth-child(1)').attributes) return undefined
        const story = {}
        story.name = row.querySelector('td:nth-child(1)').innerText
        story.link = row.querySelector('td:nth-child(1) a').href
        story.authorName = row.querySelector('td:nth-child(2)').innerText
        story.authorId = row.querySelector('td:nth-child(2)').firstElementChild.href.split('/')[4]
        story.id = row.querySelector('input').getAttribute('value')
        story.favourite = true
        return story
    }).filter(story => story)
    allStories.push(...stories)
    await Promise.allSettled(storyFetches)
    return allStories
}

Object.defineProperty(accountUtils, 'refreshFollowsAndFavourites', {
    value: async (loadFromStore = true) => {
        // load from idb
        let idbStories = []
        let idbAuthors = []
        if (loadFromStore) {
            idbStories = idb.stories
            idbAuthors = idb.authors
        }


        const followedAuthors = getFollowedAuthors()
        const favouriteAuthors = getFavouriteAuthors()
        const followedStories = getFollowedStories()
        const favouriteStories = getFavouriteStories()
        const authorPromises = Promise.allSettled([followedAuthors, favouriteAuthors])
        const storyPromises = Promise.allSettled([followedStories, favouriteStories])
        const allPromises = await Promise.allSettled([authorPromises, storyPromises, idbAuthors, idbStories])
        let authors = {}
        let stories = {}
        const defaultObj = {follow: false, favourite: false}
        if (loadFromStore){
            allPromises[2].value.result.forEach(author => {
                authors[author.id] = author
            })
            allPromises[3].value.result.forEach(story => {
                stories[story.id] = story
            })
        }
        allPromises[0].value.forEach(promise => {
            if (promise.status === 'fulfilled') {
                promise.value.forEach(author => {
                    if (!authors[author.id]){
                        authors[author.id] = {...defaultObj, ...author}
                    } else {
                        authors[author.id] = {...defaultObj, ...authors[author.id], ...author}
                    }
                })
            } else {
                console.error(promise.reason)
            }
        })
        allPromises[1].value.forEach(promise => {
            if (promise.status === 'fulfilled') {
                promise.value.forEach(story => {
                    const author = authors[story.authorId] || {
                        id: story.authorId,
                        follow: false,
                        favourite: false,
                        name: story.authorName,
                        link: `https://www.fanfiction.net/u/${story.authorId}/`
                    }
                    let chapters = []
                    if (stories[story.id]?.chapters && stories[story.id].chapters.length > 0) {
                        chapters = stories[story.id].chapters
                    }
                    if (story.chapters && story.chapters.length > 0) {
                        chapters.push(...story.chapters)
                    }
                    if (!stories[story.id]){
                        stories[story.id] = {...defaultObj, ...story, author}
                    } else {
                        stories[story.id] = {...defaultObj, ...stories[story.id], ...story, author}
                    }
                    stories[story.id].chapters = Array.from(new Set(chapters)).sort((a, b) => a - b)
                })
            } else {
                console.error(promise.reason)
            }
        })
        authors = Object.values(authors)
        stories = Object.values(stories)

        console.log(authors, stories)
        //save to idb
        if (loadFromStore){
            idb.stories = stories
            idb.authors = authors
        }
        console.log('last updated', Date.now())
        idb.updateKeyVal('lastUpdated', Date.now())
        return {authors, stories}
    }
})
let darkMode
Object.defineProperty(accountUtils, 'darkMode', {
    get: async () => {
        if (darkMode === undefined) {
            const keyValStore = await idb.keyVal
            darkMode = typeof keyValStore?.darkMode !== "boolean"? true : keyValStore?.darkMode // default to dark mode
        }
        return darkMode
    }
})

Object.defineProperty(accountUtils, 'toggleDarkMode', {
    value: async () => {
        darkMode = (!await accountUtils.darkMode)
        idb.updateKeyVal('darkMode', darkMode)
        document.body.classList.toggle('light', !darkMode)
    }
})


export default accountUtils
