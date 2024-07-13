import cacheElements from "./cacheElements";

const profileUtils = {}

Object.defineProperty(profileUtils, 'domElement', {
    get: () => {
        return cacheElements.profileDom
    }
})

let title
Object.defineProperty(profileUtils, 'title', {
    get: () => {
        title = title || profileUtils.domElement.querySelector('b').innerText
        return title
    }
})
let author
Object.defineProperty(profileUtils, 'author', {
    get: () => {
        author = author || profileUtils.domElement.querySelector('a').innerText
        return author
    }
})
let authorLink
Object.defineProperty(profileUtils, 'authorLink', {
    get: () => {
        authorLink = authorLink || profileUtils.domElement.querySelector('a').href
        return authorLink
    }
})
let synopsis
Object.defineProperty(profileUtils, 'synopsis', {
    get: () => {
        synopsis = synopsis || profileUtils.domElement.querySelector('div:not(span div)').innerText
        return synopsis
    }
})


export default profileUtils
