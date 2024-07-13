
let cookies = {}

const parseCookies = () => {
    const cookieString = document.cookie
    const cookieArray = cookieString.split(';')
    cookieArray.forEach(cookie => {
        const [key, value] = cookie.split('=')
        cookies[key.trim()] = value.trim()
    })
}

export const getCookie = (name) => {
    if (!cookies[name]) {
        parseCookies()
    }
    return cookies[name]
}
