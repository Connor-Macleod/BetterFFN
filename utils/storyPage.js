import chapterUtils from "./chapters";

const storyPage = {}

let storyWrapper
const progressWatchers = [
    ({start, end}, updateHash) => {// we always want to update the hash, so we pre-populate the first watcher
        if (!updateHash) return
        if (end === 100) {
            window.history.replaceState(null, '', '#end')
        } else history.replaceState(null, '', `#${start*1000}`)
    }
]
function updateProgress(updateHash = true) {
    let scrollInfo = storyPage.scrollInfo
    if (scrollInfo.start === 0 && scrollInfo.end === 0) {
        return window.setTimeout(() => {
            updateProgress(updateHash)
        }, 100)
    }

    progressWatchers.forEach(watcher => watcher(scrollInfo, updateHash))
}

Object.defineProperty(storyPage, 'storyWrapper', {
    set: (wrapper) => {
        if (typeof wrapper === 'string') {
            storyWrapper = document.querySelector(wrapper)
        } else if (wrapper instanceof HTMLElement) {
            storyWrapper = wrapper
        } else {
            throw new Error('storyWrapper must be a string or an HTMLElement')
        }
    },
    get: ()=> {
        if (storyWrapper){
            return storyWrapper
        } else {
            storyWrapper = document.querySelector('.storyWrapper')
            if (!storyWrapper) {
                throw new Error('Story wrapper not found. Please set storyPage.storyWrapper to the correct element before accessing it.')
            }
            return storyWrapper
        }
    }
})

Object.defineProperty(storyPage, 'scrollInfo', {
    get: () => {
        //first we want to get the current scrollleft
        const storyWrapper = storyPage.storyWrapper
        const scrollLeft = storyWrapper.scrollLeft
        // then we also want to get the current width of the scrollable area
        const scrollWidth = storyWrapper.scrollWidth
        // and the width of the visible area
        const clientWidth = storyWrapper.clientWidth
        // then we can work out the start and end of the scroll percent. We want to keep at least 5 significant figures
        let start = Math.floor((scrollLeft / scrollWidth) * 100000) / 1000
        let end = Math.floor(((scrollLeft + clientWidth) / scrollWidth) * 100000) / 1000

        // set to 0 if NaN or less than 0
        start = start < 0 || isNaN(start) ? 0 : start
        end = end < 0 || isNaN(end) ? 0 : end
        // then we want to add the hash to the url
        // then we want to return both the start and end, so that we can update the progress bar
        return {start, end}
    }
})

Object.defineProperty(storyPage, 'watchPage', {
    value: (watcher, runImmediately = true, firstScroll = false) => {
        progressWatchers.push(watcher)

        if (runImmediately) updateProgress(firstScroll)
    }
})

Object.defineProperty(storyPage, 'nextPage', {
    async value (loadNextChapter = true) {
        const urlParts = window.location.pathname.split('/')
        if (storyPage.storyWrapper.scrollWidth - storyPage.storyWrapper.scrollLeft - storyPage.storyWrapper.clientWidth < 1 && await chapterUtils.currentChapter < await chapterUtils.chapterCount && loadNextChapter) {
            urlParts[3] = parseInt(await chapterUtils.currentChapter) + 1
            window.location.assign(urlParts.join('/'))
        } else {
            storyPage.storyWrapper.classList.add('scrolling')
            window.setTimeout(() => {
                storyPage.storyWrapper.scrollBy(window.innerWidth, 0)
                storyPage.storyWrapper.classList.remove('scrolling')
                updateProgress()
            }, 250)
        }
    }
})

Object.defineProperty(storyPage, 'prevPage', {
    async value (loadNextChapter = true) {
        const urlParts = window.location.pathname.split('/')
        if (this.storyWrapper.scrollLeft < 1 && await chapterUtils.currentChapter > 1 && loadNextChapter) {
            urlParts[3] = parseInt(await chapterUtils.currentChapter) - 1
            window.location.assign(`${urlParts.join('/')}#end`)
        } else {
            storyPage.storyWrapper.classList.add('scrolling')
            window.setTimeout(() => {
                storyPage.storyWrapper.scrollBy(-window.innerWidth, 0)
                storyPage.storyWrapper.classList.remove('scrolling')
                updateProgress()
            }, 250)
        }
    }
})

Object.defineProperty(storyPage, 'scrollTo', {
    value: (percent) => {
        // first we want to know the width of each page and the total width of the story
        const pageWidth = storyPage.storyWrapper.clientWidth / 2 // two pages per screen
        const storyWidth = storyPage.storyWrapper.scrollWidth

        if (pageWidth === 0 || storyWidth === 0) return window.setTimeout(() => {
            storyPage.scrollTo(percent)
        }, 99) // 99 rather than 100 to encourage this to run before updateProgress if they are both called at the same time

        // then we want to find which page contains the percent
        const page = Math.round(percent * storyWidth / 100 / pageWidth)
        // then we want to scroll to that page
        storyPage.storyWrapper.scrollTo(page * pageWidth, 0)
        // then we want to update the progress bar
        updateProgress(false)
    }
})

Object.defineProperty(storyPage, 'scrollToHash', {
    value: () => {
        let hash = location.hash
        if (hash !== '#end') {
            if (!hash || hash === '#' || isNaN(parseInt(hash.slice(1)))) return
            const percent = parseInt(hash.slice(1)) / 1000
            return storyPage.scrollTo(percent)
        } else {
            storyPage.scrollTo(100)
        }
    }
})

// we want to watch for resize events, and use a timeout to prevent too many updates, running the last one after 100ms
let resizeTimeout
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(() => {
        storyPage.scrollToHash() // we regularly update the hash, meaning we can use this to pin the scroll position when the window is resized
    }, 100) // if this fires too often, we can increase this number
})


export default storyPage;
