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
        console.log('story for chapters read:', story)
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
    const story = await storyUtils.storyDetails
    if (!chaptersRead) {
        chaptersRead = []
    }
    chaptersRead.push(await(chapter.number || chapter))
    const chaptersReadSet = new Set(chaptersRead)
    chaptersRead = Array.from(chaptersReadSet).sort((a, b) => a - b)
    console.log('chapters read', chaptersRead)
    story.chapters = chaptersRead
    story.update()
}
Object.defineProperty(chapterUtils, 'markRead', {
    value: ()=>markRead(chapterUtils.currentChapter)
})
let chapters
Object.defineProperty(chapterUtils, 'chapters', {
    get: async () => {
        if (!chapters) {
            const chapterSelect = cacheElements.chapterSelect
            if (!chapterSelect) {
                return [{
                    title: 'One Shot',
                    number: 1,
                    current: true,
                    read: false
                }]
            }
            const chapterOptions = chapterSelect.querySelectorAll('option')
            const chaptersRead = await chapterUtils.chaptersRead
            chapters = Array.from(chapterOptions).map(option => {
                const chapterNumberReplacement = new RegExp(`^${parseInt(option.value)}\. `, 'i')
                const numberStrippedChapterTitle = option.innerText.replace(chapterNumberReplacement, '')
                return {
                    title: numberStrippedChapterTitle,
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
        const currentChapter = chapters.find(chapter => chapter.current)
        return chapters.length > 1 ? currentChapter.title : 'One Shot'
    }
})

Object.defineProperty(chapterUtils, 'chapterCount', {
    get: async () => {
        const chapters = await chapterUtils.chapters
        return chapters[chapters.length - 1].number
    }
})

Object.defineProperty(chapterUtils, 'goto', {
    value: async (chapter) => {
        if (chapter.number){
            chapter = chapter.number
        }
        const urlParts = window.location.pathname.split('/')
        urlParts[3] = chapter
        window.location.assign(urlParts.join('/'))
    }
})

export default chapterUtils
