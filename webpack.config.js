const path = require('path');
const {UserscriptPlugin} = require('webpack-userscript');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const package = require('./package.json');
const fs = require('fs');
const {marked} = require('marked');

console.log(marked)
const readme = fs.readFileSync(path.resolve(__dirname, 'README.md'), 'utf8');
const indexHtml = marked(readme)


const dev = process.env.NODE_ENV === 'DEVELOPMENT';

module.exports = [
    {
        mode: dev ? 'development' : 'production',
        entry: path.resolve(__dirname, 'index.js'),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'betterFFN.js',
            clean: true,
        },
        module: {
            rules: [
                {
                    test: /\.less$/i,
                    use: [
                        // compiles Less to CSS
                        "style-loader",
                        "css-loader",
                        "less-loader",
                    ],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'BetterFFN',
                version: package.version,
                template: path.resolve(__dirname, 'index.html'),
                filename: 'index.html',
                templateParameters: {
                    readme: indexHtml
                },
            }),
        ],
    },
    {
        mode: dev ? 'development' : 'production',
        entry: path.resolve(__dirname, 'userscript.js'),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'betterFFN.user.js',
        },
        devServer: {
            hot: false,
            liveReload: false,
            client: false,
            webSocketServer: false
        },
        module: {
            rules: [
                {
                    test: /\.less$/i,
                    use: [
                        // compiles Less to CSS
                        "style-loader",
                        "css-loader",
                        "less-loader",
                    ],
                },
            ],
        },
        plugins: [
            new UserscriptPlugin({
                headers: {
                    name: 'BetterFFN',
                    version: `${package.version}${dev ? `-build.[buildTime]` : ''}`,
                    author: 'Saelorable <bffn@saelorable.com>',
                    description: 'Better FFN is intended to improve the userExperience of FanFiction.net',
                    match: ['https://www.fanfiction.net/*', 'https://m.fanfiction.net/*'],
                    icon: 'https://www.google.com/s2/favicons?sz=64&domain=fanfiction.net',
                },
                proxyScript: {
                    baseUrl: 'http://127.0.0.1:8080',
                    filename: '[basename].proxy.user.js',
                },
            })
        ],
    }
]
