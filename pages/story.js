import topBar from "../components/topBar";
import bottomBar from "../components/bottomBar";
import storyTags from "../utils/storyTags";
import profile from "../utils/profile";
import storyUtils from "../utils/story";
import chapters from "../utils/chapters";
import {addElement, replacePage} from "../utils/replacePage";
import chapterProgress from "../components/chapterProgress";
import storyPage from "../utils/storyPage";
import accountUtils from "../utils/account";
import cacheElements from "../utils/cacheElements";
export default async function ({params}) {
    const currentChapter = await chapters.currentChapter
    //first up we load the stuff we actually want to keep into memory
    const storyText = cacheElements.storyText
    const storyImage = cacheElements.storyImage.querySelector('img')?.dataset.original


    const storyComplete = storyTags.status === 'Complete'
    storyText.className = ''
    storyText.id = ''
    document.body.removeAttribute('style')

    //then we delete the entire ui and replace it with our own

    const readerMode = document.createElement('div')
    readerMode.className = 'readerMode'

    const storyWrapper = document.createElement('div')
    storyWrapper.className = 'storyWrapper'
    const bottomBarEl = await bottomBar(storyWrapper)

    const titlePage = document.createElement('div')
    titlePage.className = 'titlePage'
    const titlePageDefault = document.createElement('div')
    titlePage.appendChild(titlePageDefault)
    titlePageDefault.className = 'titlePageDefault'
    const titlePageAlternate = document.createElement('div')
    titlePage.appendChild(titlePageAlternate)
    titlePageAlternate.className = 'titlePageAlternate'


    if (storyImage) {
        const storyImageEl = document.createElement('img')
        storyImageEl.className = 'storyImage'
        storyImageEl.src = storyImage
        titlePageDefault.appendChild(storyImageEl)
    }


    const titleEl = document.createElement('h1')
    const titleElAlternate = document.createElement('h1')
    titleEl.className = 'title'
    titleElAlternate.className = 'title'
    titleEl.innerText = storyUtils.title
    titleElAlternate.innerText = storyUtils.title
    titlePageAlternate.appendChild(titleElAlternate)
    function timeSince(date) {
        const now = new Date()
        // make now midnight
        now.setHours(0, 0, 0, 0)
        const ms = now - date
        // both dates are midnight, so we can just divide by the number of milliseconds in a day
        const days = Math.floor(ms / 86400000)
        const weeks = Math.floor(days / 7)
        const months = Math.floor(days / 30)
        // is there a better way to
        const years = Math.floor(days / 365)


        if (days < 1) return 'today'
        if (days < 2) return 'yesterday'
        if (days < 7) return `${days} days ago`
        if (weeks < 2) return 'last week'
        if (weeks < 4) return `${weeks} weeks ago`
        if (months < 2) return 'last month'
        if (years < 1) return `${months} months ago`
        if (years < 2) return 'last year'
        return `${years} years ago`


    }

    const publishedEl = document.createElement('div')
    publishedEl.className = 'published'
    publishedEl.innerHTML = `Published: <strong>${storyTags.tags.published.toLocaleDateString(Navigator.language, {
        year: 'numeric', month: 'long', day: 'numeric'
    })}</strong> - <em>${timeSince(storyTags.tags.published)}</em>`
    titlePageAlternate.appendChild(publishedEl)

    if (storyTags.tags.updated && storyTags.tags.updated !== storyTags.tags.published) {
        const updatedEl = document.createElement('div')
        updatedEl.className = 'updated'
        updatedEl.innerHTML = `Updated: <strong>${storyTags.tags.updated.toLocaleDateString(Navigator.language, {
            year: 'numeric', month: 'long', day: 'numeric'
        })}</strong> - <em>${timeSince(storyTags.tags.updated)}</em>`
        titlePageAlternate.appendChild(updatedEl)
    }


    const titlePageSynopsis = document.createElement('div')
    titlePageSynopsis.className = 'titlePageSynopsis'
    titlePageSynopsis.innerText = profile.synopsis
    titlePageAlternate.appendChild(titlePageSynopsis)

    const titlePageCharacters = document.createElement('div')
    titlePageCharacters.className = 'titlePageCharacters'
    storyTags.tags.ships?.forEach(pairing => {
        const pairingEl = document.createElement('div')
        pairingEl.className = 'pairing'
        pairingEl.innerText = pairing.map(i => storyTags.tags.characters[i]).join(' 💞 ')
        titlePageCharacters.appendChild(pairingEl)
    })
    if (storyTags.tags.characters?.length) {
        const charactersEl = document.createElement('div')
        charactersEl.className = 'characters'
        charactersEl.innerText = storyTags.tags.characters.join(', ')
        titlePageCharacters.appendChild(charactersEl)
    }
    titlePageAlternate.appendChild(titlePageCharacters)

    const byText = document.createElement('h3')
    byText.className = 'byText'
    byText.innerText = `by`

    const authorEl = document.createElement('h2')
    const authorLinkEl = document.createElement('a')
    authorLinkEl.href = storyUtils.author.link
    authorLinkEl.innerText = storyUtils.author.name
    authorEl.appendChild(authorLinkEl)
    authorEl.className = 'author'

    titlePageDefault.appendChild(titleEl)
    titlePageDefault.appendChild(byText)
    titlePageDefault.appendChild(authorEl)

    storyText.className = 'storyText'


    readerMode.appendChild(topBar())
    readerMode.appendChild(storyWrapper)
    readerMode.appendChild(chapterProgress())
    readerMode.appendChild(bottomBarEl)
    if (currentChapter == 1) storyWrapper.appendChild(titlePage)
    storyWrapper.appendChild(storyText)

    const chapterCount = await chapters.chapterCount
    if (currentChapter == chapterCount) {
        const endPage = document.createElement('div')
        endPage.className = 'titlePage'

        const endPageDefault = document.createElement('div')
        endPage.appendChild(endPageDefault)
        endPageDefault.className = 'titlePageDefault'
        endPageDefault.innerHTML = `<h1>${storyComplete ? 'fin.' : 'To be continued...'}</h1>`
        const endPageAlternate = document.createElement('div')
        endPage.appendChild(endPageAlternate)
        endPageAlternate.className = 'titlePageAlternate'
        storyWrapper.appendChild(endPage)


        const followStoryButton = document.createElement('button')
        followStoryButton.className = 'followStoryButton actionButton'
        const favStoryButton = document.createElement('button')
        favStoryButton.className = 'favStoryButton actionButton'
        const followAuthorButton = document.createElement('button')
        followAuthorButton.className = 'followAuthorButton actionButton'
        const favAuthorButton = document.createElement('button')
        favAuthorButton.className = 'favAuthorButton actionButton'

        let storyDetails = await storyUtils.storyDetails

        const status = {
            followStory: storyDetails.follow,
            favStory: storyDetails.favourite,
            followAuthor: storyDetails.author.follow,
            favAuthor: storyDetails.author.favourite,
        }
        console.log(status)
        followStoryButton.innerText = status.followStory ? 'Unfollow Story' : 'Follow Story'
        favStoryButton.innerText = status.favStory ? 'Unfavourite Story' : 'Favourite Story'
        followAuthorButton.innerText = status.followAuthor ? 'Unfollow Author' : 'Follow Author'
        favAuthorButton.innerText = status.favAuthor ? 'Unfavourite Author' : 'Favourite Author'

        followStoryButton.onclick = async () => {
            storyUtils.followStory()
            followStoryButton.innerText = status.followStory ? 'Unfollow Story' : 'Follow Story'

        }
        favStoryButton.onclick = async () => {
            storyUtils.favouriteStory()
            favStoryButton.innerText = status.favouriteStory ? 'Unfavourite Story' : 'Favourite Story'
        }
        followAuthorButton.onclick = async () => {
            storyUtils.followAuthor()
            followAuthorButton.innerText = status.followAuthor ? 'Unfollow Author' : 'Follow Author'
        }
        favAuthorButton.onclick = async () => {
            storyUtils.favouriteAuthor()
            favAuthorButton.innerText = status.favouriteAuthor ? 'Unfavourite Author' : 'Favourite Author'
        }



        endPageAlternate.appendChild(followStoryButton)
        endPageAlternate.appendChild(favStoryButton)
        endPageAlternate.appendChild(followAuthorButton)
        endPageAlternate.appendChild(favAuthorButton)

    }

    //then we add the new ui to the page
    addElement(readerMode)
    replacePage()



    //if we have an odd number of pages, we want to add a blank page at the end
    console.log('width', storyWrapper.scrollWidth)
    console.log('page width', storyWrapper.clientWidth)
    console.log('page count', storyWrapper.scrollWidth / storyWrapper.clientWidth % 1)
    if (storyWrapper.scrollWidth / storyWrapper.clientWidth % 1 !== 0) {
        const blankPage = document.createElement('div')
        blankPage.className = 'blankPage'
        storyWrapper.appendChild(blankPage)
        console.log('added blank page')
    }

    document.body.classList.toggle('light', !(await accountUtils.darkMode))
}
