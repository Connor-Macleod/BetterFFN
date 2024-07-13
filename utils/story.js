import config from '../pageConfig'
import profileUtils from "./profile"
import idb from "./idb"

const storyUtils = {}

const authorInfo = {}
Object.defineProperty(authorInfo, 'name', {
    value: profileUtils.author,
    writable: false,
})

Object.defineProperty(authorInfo, 'link', {
    value: profileUtils.authorLink,
    writable: false,
})

Object.defineProperty(authorInfo, 'id', {
    get: () => {
        const match = authorInfo.link.match(/\/u\/(\d+)/)
        return match ? match[1] : null
    }
})

Object.defineProperty(storyUtils, 'title', {
    value: profileUtils.title,
    writable: false,
})

Object.defineProperty(storyUtils, 'author', {
    value: authorInfo,
    writable: false,
})
Object.defineProperty(storyUtils, 'storyId', {
    get: ()=>config.props.storyId,
})

Object.defineProperty(storyUtils, 'storyDetails', {
    async get(){
        let story
        try {
            story = await idb.getStory(storyUtils.storyId)
        } catch (e) {
            console.log(e)
        }
        if (!story) {
            let author
            try {
                author = await idb.getAuthor(storyUtils.author.id)
            } catch (e) {
                console.log(e)
            }
            if (!author) {
                author = {
                    name: storyUtils.author.name,
                    link: storyUtils.author.link,
                    id: storyUtils.author.id,
                    follow: false,
                    favourite: false
                }
                idb.author = author
            }
            story = {
                title: storyUtils.title,
                id: storyUtils.storyId,
                follow: false,
                favourite: false,
                authorName: storyUtils.author.name,
                authorId: storyUtils.author.id,
                author: author
            }
            story.update = () => {
                idb.story = story
            }
        }

        return story
    }
})


let actionsTaken = {}
async function submitAction(actions) {
    if (typeof actions === 'string') actions = [actions]

    const storyData = {
        storyid: storyUtils.storyId,
        userid: storyUtils.author.id,
        authoralert: false,
        storyalert: false,
        favstory: false,
        favauthor: false,
    }

    actions.forEach(action => {
        if (storyData.hasOwnProperty(action)) storyData[action] = !storyData[action]
        else throw new Error(`Invalid action: ${action}`)
    })

    const formData = new FormData()
    formData.append('storyid', storyData.storyid)
    formData.append('userid', storyData.userid)
    formData.append('authoralert', storyData.authoralert ? "1" : "0")
    formData.append('storyalert', storyData.storyalert ? "1" : "0")
    formData.append('favstory', storyData.favstory ? "1" : "0")
    formData.append('favauthor', storyData.favauthor ? "1" : "0")

    const fetchOptions = {
        method: 'POST',
        body: formData,
    }

    const response = await fetch('/api/ajax_subs.php', fetchOptions)
    if (response.error) {
        throw new Error(response.error)
    }

}


const actions = {}

async function takeAction(action, target, result){
    // action: follow, favourite
    // target: story, author
    // result: true, false (should we follow/favourite or unfollow/unfavourite)
    if (result === undefined) {
        let currentStatus
        const storyDetails = await storyUtils.storyDetails
        if (action === 'follow') {
            if (target === 'story') {
                currentStatus = await storyDetails.follow
            } else {
                currentStatus = await storyDetails.author.follow
            }
        } else {
            if (target === 'story') {
                currentStatus = await storyDetails.favourite
            } else {
                currentStatus = await storyDetails.author.favourite
            }
        }
        result = !currentStatus
    }

    if (result){
        await submitAction(`${action==='follow'? '': 'fav'}${target==='story'? 'story': 'author'}${action==='follow'? 'alert': ''}`)
    } else {
        const formData = new FormData()

        formData.append('action', 'remove-multi')
        formData.append('rids[]', target === 'story' ? await storyUtils.storyId : await storyUtils.author.id)
        const fetchOptions = {
            method: 'POST',
            body: formData,
        }

        const response = await fetch(`/${action==='follow'? 'alert': 'favorites'}/${target==='story'? 'story': 'author'}.php`, fetchOptions)

    }
    // we will just have to assume that the action was successful for now. TODO: find a way to check if the action was successful
    let story = await storyUtils.storyDetails
    if (action === 'follow') {
        if (target === 'story') {
            story.follow = result
        } else {
            story.author.follow = result
        }
    } else {
        if (target === 'story') {
            story.favourite = result
        } else {
            story.author.favourite = result
        }
    }

    story.update()

}


Object.defineProperty(storyUtils, 'followStory', {
    value: async (follow) => {
        return await takeAction('follow', 'story', follow)
    },
    writable: false
})

Object.defineProperty(storyUtils, 'followAuthor', {
    value: async (follow) => {
        return await takeAction('follow', 'author', follow)
    },
    writable: false
})

Object.defineProperty(storyUtils, 'favouriteStory', {
    value: async (favourite) => {
        return await takeAction('favourite', 'story', favourite)
    },
    writable: false
})

Object.defineProperty(storyUtils, 'favouriteAuthor', {
    value: async (favourite) => {
        return await takeAction('favourite', 'author', favourite)
    },
    writable: false
})




export default storyUtils
