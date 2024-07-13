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

    topBar.appendChild(ffnLink)


    const storyTitleBar = document.createElement('div')
    storyTitleBar.className = 'storyTitleBar'
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
    accountMenu.className = 'accountMenu'
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


    const accountMenuHover = document.createElement('div')
    accountMenuHover.className = 'accountMenuHover'
    accountMenuHover.onmouseover = () => {
        clearTimeout(hideAccountMenuTimeout)
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
            window.location.assign('/login.php?cache=bust')
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
