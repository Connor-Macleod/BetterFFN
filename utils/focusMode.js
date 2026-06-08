let runOnce = false
let focusModeTimeout
let focusModeEnabled = false
export default () =>{
    if (runOnce){
        return
    }
    runOnce = true
    focusModeTimeout = window.setTimeout(()=>{
        document.body.classList.add('focus-mode')
    }, 4000)
    document.addEventListener('mousemove',()=>{
        document.body.classList.remove('focus-mode')
        window.clearTimeout(focusModeTimeout)
        focusModeTimeout = window.setTimeout(()=>{
            document.body.classList.add('focus-mode')
        }, 4000)
    })
}

export const disableFocusMode = () => {
    document.body.classList.remove('focus-mode')
    window.clearTimeout(focusModeTimeout)
}

export const enableFocusMode = () => {
    window.clearTimeout(focusModeTimeout)
    focusModeTimeout = window.setTimeout(()=>{
        document.body.classList.add('focus-mode')
    }, 4000)
}
