import storyUtils from "../utils/story";
import accountUtils from "../utils/account";
import { addElement } from "../utils/replacePage";
import {navigateAndReturn} from "../utils/redirectHelper";

export default ()=>{
    const topBar = document.createElement('div')
    topBar.className = 'topBar'


    const ffnLink = document.createElement('a')
    ffnLink.href = '/'
    ffnLink.innerText = 'FFN'
    ffnLink.title = 'FanFiction.net'
    ffnLink.className = 'ffnLink'

    topBar.appendChild(ffnLink)


    const storyTitleBar = document.createElement('div')
    storyTitleBar.className = 'storyTitleBar'
    storyTitleBar.onclick = function () {
        storyTitleBar.classList.toggle('showFullTitle')
    }
    const storyTitle = document.createElement('h1')
    storyTitle.className = 'title'
    storyTitle.innerText = storyUtils.title
    storyTitleBar.appendChild(storyTitle)

    const storyByText = document.createElement('span')
    storyByText.className = 'by'
    storyByText.innerText = `by`
    storyTitleBar.appendChild(storyByText)

    const storyAuthor = document.createElement('a')
    storyAuthor.className = 'author'
    storyAuthor.innerText = storyUtils.author.name
    storyAuthor.href = storyUtils.author.link
    storyTitleBar.appendChild(storyAuthor)

    topBar.appendChild(storyTitleBar)




    const accountMenu = document.createElement('div')
    let hideAccountMenuTimeout
    accountMenu.className = 'accountMenu landscapeOnly'
    accountMenu.onmouseover = () => {
        accountMenuHover.style.display = 'flex'
    }
    accountMenu.onmouseleave = () => {
        hideAccountMenuTimeout = setTimeout(() => {
            accountMenuHover.style.display = 'none'
        }, 3000)
    }
    if (accountUtils.loggedIn) {
        accountMenu.innerText = accountUtils.accountName
    } else {
        accountMenu.innerText = 'Log In'
    }
    topBar.appendChild(accountMenu)


    const accountMenuPortrait = document.createElement('div')
    accountMenuPortrait.className = 'accountMenu portraitOnly'
    accountMenuPortrait.style.width = '32px'
    accountMenuPortrait.style.height = '32px'

    const svgNS = 'http://www.w3.org/2000/svg'
    const burgerSvg = document.createElementNS(svgNS,'svg')
    burgerSvg.setAttribute('width', '32')
    burgerSvg.setAttribute('height', '32')
    burgerSvg.setAttribute('viewBox', '0 0 32 32')
    burgerSvg.setAttribute('fill', '#000')
    burgerSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    burgerSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    burgerSvg.setAttribute('version', '1.1')
    burgerSvg.setAttribute('xml:space', 'preserve')
    burgerSvg.setAttribute('style', 'enable-background:new 0 0 32 32;')
    burgerSvg.setAttribute('id', 'layer_1')



    const burgerPath = document.createElementNS(svgNS, 'path')
    burgerPath.setAttribute('d', 'M4,10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2  s0.896,2,2,2h24c1.104,0,2-0.896,2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z')
    burgerPath.setAttribute('fill', '#000')
    burgerSvg.appendChild(burgerPath)

    accountMenuPortrait.appendChild(burgerSvg)
    topBar.appendChild(accountMenu)
    topBar.appendChild(accountMenuPortrait)


    const accountMenuHover = document.createElement('div')
    accountMenuHover.className = 'accountMenuHover'
    accountMenuHover.onmouseover = () => {
        clearTimeout(hideAccountMenuTimeout)
    }
    accountMenuPortrait.onmouseover = () => {
        accountMenuHover.style.display = 'flex'
    }
    accountMenuPortrait.onmouseleave = () => {
        hideAccountMenuTimeout = setTimeout(() => {
            accountMenuHover.style.display = 'none'
        }, 3000)
    }
    accountMenuHover.onmouseleave = () => {
        accountMenuHover.style.display = 'none'
    }
    accountMenuHover.style.display = 'none'
    if (accountUtils.loggedIn) {
        const accountLinkEl = document.createElement('a')
        accountLinkEl.href = '/login.php?cache=bust'
        accountLinkEl.innerText = 'Account'
        accountMenuHover.appendChild(accountLinkEl)

        const logoutButton = document.createElement('button')
        logoutButton.innerText = 'Log Out'
        logoutButton.onclick = function () {
            navigateAndReturn('/logout.php', 'loggedout')
        }
        accountMenuHover.appendChild(logoutButton)

        const checkForFollowsAndFavsButton = document.createElement('button')
        checkForFollowsAndFavsButton.innerText = 'Refresh Follows and Favourites'
        checkForFollowsAndFavsButton.onclick = function () {
            accountUtils.refreshFollowsAndFavourites()
        }
        accountMenuHover.appendChild(checkForFollowsAndFavsButton)

    } else {
        const loginButton = document.createElement('button')
        loginButton.innerText = 'Log In'
        loginButton.onclick = function () {
            window.location.assign('/login.php')
        }
        accountMenuHover.appendChild(loginButton)

        const signUpButton = document.createElement('button')
        signUpButton.innerText = 'Sign Up'
        signUpButton.onclick = function () {
            window.location.assign('/signup.php')
        }
        accountMenuHover.appendChild(signUpButton)
    }
    const darkModeButton = document.createElement('button')
    accountUtils.darkMode.then((darkMode) => {
        darkModeButton.innerText = `${darkMode ? 'Light' : 'Dark'} Mode`
    })
    darkModeButton.onclick = async function () {
        console.log('toggling dark mode')
        await accountUtils.toggleDarkMode()
        darkModeButton.innerText = `${(await accountUtils.darkMode) ? 'Light' : 'Dark'} Mode`
    }
    accountMenuHover.appendChild(darkModeButton)
    addElement(accountMenuHover)

    return topBar
}
