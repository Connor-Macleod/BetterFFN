import {addElement} from "./replacePage";


export default function (body, title, buttons) {
    const modal = document.createElement('div')
    modal.className = 'redirectedModal'

    if (title) {
        const redirectedHeader = document.createElement('div')
        redirectedHeader.className = 'redirectedHeader'
        redirectedHeader.innerText = title
        modal.appendChild(redirectedHeader)
    }

    const redirectedBody = document.createElement('div')
    redirectedBody.className = 'redirectedBody'
    if (typeof body === 'string') {
        redirectedBody.innerText = body
    }
    modal.appendChild(redirectedBody)



    const redirectedButtons = document.createElement('div')
    redirectedButtons.className = 'redirectedButtons'

    if (buttons instanceof HTMLElement) {
        redirectedButtons.appendChild(buttons)
    }
    modal.appendChild(redirectedButtons)


    addElement(modal)
    return modal
}
