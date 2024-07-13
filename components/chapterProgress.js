import storyPage from '../utils/storyPage'

export default ()=>{
    const progress = document.createElement('div')
    progress.className = 'progress'
    const startProgressBar = document.createElement('div')
    const endProgressBar = document.createElement('div')
    startProgressBar.className = 'startProgressBar progressBar'
    endProgressBar.className = 'endProgressBar progressBar'
    progress.appendChild(startProgressBar)
    progress.appendChild(endProgressBar)

    storyPage.watchPage((scrollInfo) => {
        startProgressBar.style.width = `${scrollInfo.start}%`
        endProgressBar.style.width = `${scrollInfo.end}%`
    })

    storyPage.scrollToHash()

    progress.onclick = (e) => {
        const xPos = e.clientX
        const width = progress.clientWidth
        const percent = (xPos / width) * 100
        storyPage.scrollTo(percent)
    }



    return progress
}
