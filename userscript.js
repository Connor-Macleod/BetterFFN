// ==UserScript==
// @name         Better FFN Reader
// @namespace    http://tampermonkey.net/
// @version      2024-02-06
// @description  Removes the clutter from FanFiction.net and makes reading a bit more pleasant!
// @author       Saelorable
// @match        https://www.fanfiction.net/s/*
// @match        https://m.fanfiction.net/u/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fanfiction.net
// @grant        none
// ==/UserScript==

import loadPage from "./loadPage";
import {getRedirect} from "./utils/redirectHelper";

import './styles.less'
import idb from "./utils/idb";
import modal from "./utils/modal";
import focusMode from "./utils/focusMode";

(async function() {
    'use strict';
    console.log('BetterFFN: Loading...')
    if (window.location.hostname.startsWith('m.')){
        const redirectButton = document.createElement('button')
        redirectButton.innerText = 'Open Desktop Site'
        redirectButton.onclick = function (){
            window.location.assign(window.location.href.replace('m.', 'www.'))
        }
        return modal('BetterFFN does not support mobile view yet. Please use the desktop site.', 'BetterFFN', redirectButton)
    }
    await idb.init()
    getRedirect()
    console.log('BetterFFN: Loaded')
    loadPage()
    focusMode()
})();
