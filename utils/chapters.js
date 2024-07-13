import config from '../pageConfig.js'
import storyUtils from "./story";
import cacheElements from "./cacheElements";

const chapterUtils = {}

let chaptersRead = {}


const saveChaptersRead = () => {
    localStorage.setItem('chaptersRead', JSON.stringify(chaptersRead))
}

Object.defineProperty(chapterUtils, 'chaptersRead', {
    get: async ()=>{
        const story = await storyUtils.storyDetails
        console.log('story:', story)
        return story.chapters || []
    }
})

Object.defineProperty(chapterUtils, 'chapterRead', {
    async get(){
        const chaptersRead = await chapterUtils.chaptersRead
        return chaptersRead.includes(this.currentChapter)
    }
})

Object.defineProperty(chapterUtils, 'allChaptersRead', {
    async get(){
        const chaptersRead = await chapterUtils.chaptersRead
        return chaptersRead.length === this.chapterCount
    }
})

const markRead = async (chapter) => {
    let chaptersRead = await chapterUtils.chaptersRead
    if (!chaptersRead) {
        chaptersRead = []
    }
    chaptersRead.push(chapter)
    chaptersRead[config.props.storyId] = Array.from(new Set(chaptersRead[config.props.storyId].sort((a, b) => a - b)))
    storyUtils.storyDetails.update()
}
Object.defineProperty(chapterUtils, 'markChapterRead', {
    set: markRead[config.props.storyId]
})
Object.defineProperty(chapterUtils, 'markRead', {
    value: ()=>markRead(chapterUtils.currentChapter)
})
let chapters
Object.defineProperty(chapterUtils, 'chapters', {
    get: async () => {
        if (!chapters) {
            const chapterSelect = cacheElements.chapterSelect
            const chapterOptions = chapterSelect.querySelectorAll('option')
            const chaptersRead = await chapterUtils.chaptersRead
            chapters = Array.from(chapterOptions).map(option => {
                return {
                    title: option.innerText,
                    number: parseInt(option.value),
                    current: option.selected,
                    read: chaptersRead.includes(parseInt(option.value))
                }
            })
        }
        return chapters
    }
})

Object.defineProperty(chapterUtils, 'currentChapter', {
    get: async () => {
        const chapters = await chapterUtils.chapters
        return chapters.find(chapter => chapter.current).number
    }
})

Object.defineProperty(chapterUtils, 'chapterTitle', {
    get: async () => {
        const chapters = await chapterUtils.chapters
        return chapters.find(chapter => chapter.current).title
    }
})

Object.defineProperty(chapterUtils, 'chapterCount', {
    get: async () => {
        const chapters = await chapterUtils.chapters
        return chapters[chapters.length - 1].number
    }
})

export default chapterUtils
