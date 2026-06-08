import chapterUtils from "../utils/chapters";
import {disableFocusMode, enableFocusMode} from "../utils/focusMode";

let chapterSelect = null;
export default async function chapterSelector() {
    if (chapterSelect) {
        return chapterSelect.showModal()
    }
    chapterSelect = document.createElement('dialog');
    chapterSelect.setAttribute('closedby', 'any');
    chapterSelect.className = 'chapterSelect';
    chapterSelect.addEventListener('open', async function (e) {
        disableFocusMode()
    })
    chapterSelect.addEventListener('close', async function (e) {
        enableFocusMode()
    })

    const chapters = await chapterUtils.chapters

    if (!chapters || chapters.length === 0) {
        const noChapters = document.createElement('div');
        noChapters.innerText = 'No chapters available';
        chapterSelect.appendChild(noChapters);
        return chapterSelect;
    }
    const chapterList = document.createElement('ul');
    chapterList.className = 'chapterList';

    chapters.forEach((chapter) => {
        const chapterTitle = document.createElement('span');
        chapterTitle.className = `chapterTitle`;
        chapterTitle.innerText = chapter.title;

        const chapterItem = document.createElement('li');
        chapterItem.className = `chapterItem ${chapter.current ? 'current' : ''} ${chapter.read ? 'read' : ''}`;
        chapterItem.appendChild(chapterTitle);

        chapterItem.onclick = async () => {
            chapterSelect.close();
            chapterUtils.goto(chapter);
        };
        chapterList.appendChild(chapterItem);
    })
    document.body.appendChild(chapterSelect)

    chapterSelect.appendChild(chapterList);
    chapterSelect.showModal()
    const currentChapter = await chapterUtils.currentChapter
    chapterList.children[currentChapter - 1 || 0].scrollIntoView()
}
