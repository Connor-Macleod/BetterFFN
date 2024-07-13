import accountUtils from "./account";
import modal from "./modal";

export function navigateAndReturn (target, afterRedirect, afterRedirectTest){
    setRedirect(window.location.href, afterRedirect, afterRedirectTest)
    window.location.href = target;
}
export function setRedirect (target = window.location.href, afterRedirect, afterRedirectTest){
    sessionStorage.setItem('redirect', target)
    if (afterRedirect) {
        sessionStorage.setItem('afterRedirect', afterRedirect)
    }
}

const redirectAfterTests = {
    'loggedin': () => {
        accountUtils.refreshFollowsAndFavourites()
        return accountUtils.loggedIn
    },
    'loggedout': () => {
        return !accountUtils.loggedIn
    },
}

const redirectAfters = {
    'loggedout': () => {
        const redirectedButton = document.createElement('button')
        redirectedButton.innerText = 'OK'
        const redirectedModal = modal('You have been logged out!', 'Logged Out', redirectedButton)
        redirectedButton.onclick = function () {
            redirectedModal.remove()
        }
    },
    'loggedin': () => {
        const closeButton = document.createElement('button')
        closeButton.innerText = 'OK'
        const redirectedModal = modal(`Welcome ${accountUtils.accountName}! You have now been logged in!`, 'Logged In', closeButton)
        closeButton.onclick = function () {
            redirectedModal.remove()
        }
    }
}

export function getRedirect(){
    let redirect, afterRedirect
    try {
        redirect = sessionStorage.getItem('redirect')
    }
    catch (e) {
    }
    try {
        afterRedirect = sessionStorage.getItem('afterRedirect')
    }
    catch (e) {
    }
    if (redirect) {
        sessionStorage.removeItem('redirect')
        window.location.assign(redirect)
        return true
    } else if (afterRedirect && (!redirectAfterTests[afterRedirect] || redirectAfterTests[afterRedirect]())) {
        sessionStorage.removeItem('afterRedirect')
        sessionStorage.removeItem('afterRedirectTest')
        if (redirectAfters[afterRedirect]) {
            redirectAfters[afterRedirect]()
        }
    }
    return false
}
