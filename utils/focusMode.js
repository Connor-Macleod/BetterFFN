let runOnce = false
export default () =>{
    if (runOnce){
        return
    }
    runOnce = true
    let focusModeTimeout = window.setTimeout(()=>{
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
