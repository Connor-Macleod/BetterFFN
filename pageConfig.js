import pageConfig from './pageConfig.json';

const currentPath = window.location.pathname;

let pathParams = currentPath.split('/');

const foundPage = pageConfig.find(page => {
    const regex = new RegExp(page.match)
    if (regex.test(currentPath)) {
        pathParams = regex.exec(currentPath)?.groups || pathParams
        return page;
    }
})

let config = {}

if (!foundPage) {
    console.warn('No BetterFFN page found for current path');
} else {
    config = {
        ...foundPage,
        props: pathParams
    }
}
export default config
