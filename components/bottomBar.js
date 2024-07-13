import chapters from "../utils/chapters";
import storyPageUtils from "../utils/storyPage";
import storyUtils from "../utils/story";
import idb from "../utils/idb";

export default async (storyWrapper)=>{
    storyPageUtils.storyWrapper = storyWrapper
    const bottomBar = document.createElement('div')
    bottomBar.className = 'bottomBar'


    const nextPageButton = document.createElement('button')
    nextPageButton.className = 'pageButton nextPageButton'

    nextPageButton.innerText = '>'

    const chapterNumber = document.createElement('div')
    const currentChapterEl = document.createElement(chapters.chapterRead ? 'strong' : 'span')
    const chapterCountEl = document.createElement(chapters.allChaptersRead ? 'strong' : 'span')
    const chapterDivider = document.createElement('span')
    const currentChapter = await chapters.currentChapter
    const chapterCount = await chapters.chapterCount
    currentChapterEl.innerText = currentChapter
    chapterCountEl.innerText = chapterCount
    chapterDivider.innerText = '/'

    chapterNumber.className = 'chapterNumber'
    chapterNumber.appendChild(currentChapterEl)
    chapterNumber.appendChild(chapterDivider)
    chapterNumber.appendChild(chapterCountEl)
    chapterNumber.title = chapters.chapterTitle
    chapterNumber.onclick = function () {
        const urlParts = window.location.pathname.split('/')
        if (chapters.allChaptersRead) {
            if (chapters.currentChapter < chapters.chapterCount) {
                urlParts[3] = parseInt(chapters.chapterCount)
            } else {
                urlParts[3] = 1
            }
        } else {
            let chap = parseInt(chapters.currentChapter) + 1
            while (chapters.chaptersRead[storyUtils.storyId].includes(chap)) {
                chap++
                if (chap > parseInt(chapters.chapterCount)) chap = 1
            }
            urlParts[3] = chap
        }
        window.location.assign(urlParts.join('/'))
    }


    const prevPageButton = document.createElement('button')
    prevPageButton.className = 'pageButton prevPageButton'

    prevPageButton.innerText = '<'

    nextPageButton.onclick = storyPageUtils.nextPage
    prevPageButton.onclick = storyPageUtils.prevPage

    document.body.onkeydown = function (e) {
        let loadNextChapter = true
        switch (e.key) {
            case 'ArrowDown':
                loadNextChapter = false
            case 'ArrowRight':
                storyPageUtils.nextPage(loadNextChapter)
                break
            case 'ArrowUp':
                loadNextChapter = false
            case 'ArrowLeft':
                storyPageUtils.prevPage(loadNextChapter)
                break;
        }
    }

    bottomBar.appendChild(prevPageButton)
    bottomBar.appendChild(chapterNumber)
    bottomBar.appendChild(nextPageButton)

    let fontSize;
    try {
        fontSize = await idb.getKeyVal('fontSize')
    } catch (e) {
        fontSize = 1
    }

    const fontSizeInput = document.createElement('input')
    fontSizeInput.className = 'fontSizeInput'
    fontSizeInput.type = 'range'
    fontSizeInput.min = 0.5
    fontSizeInput.max = 3
    fontSizeInput.step = 0.01
    fontSizeInput.value = fontSize
    fontSizeInput.oninput = function () {
        fontSize = fontSizeInput.value
        document.body.style.setProperty('--custom-font-size', `${fontSize}rem`)
        idb.updateKeyVal('fontSize', fontSize)
    }

    const spacer = document.createElement('div')
    spacer.className = 'spacer'
    bottomBar.appendChild(spacer)

    bottomBar.appendChild(fontSizeInput)
    document.body.style.setProperty('--custom-font-size', `${fontSize}rem`)

    return bottomBar
}
