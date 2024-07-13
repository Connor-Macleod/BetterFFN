import account from "./account";

let dbName
const database = {}
let activeDatabase

function initDatabase() {
    console.log('initDatabase')
    if (!account.loggedIn) return Promise.reject('Not logged in')
    if (activeDatabase) return activeDatabase;
    dbName = "betterFFN";

    activeDatabase = new Promise((resolve, reject) => {
        console.log('opening database')
        // if the databse changes, we need to update the version number
        let dbVersion = 2

        const request = indexedDB.open(dbName, dbVersion)
        request.onupgradeneeded = function (event) {
            console.log('upgrading database')
            const db = event.target.result;
            const objectStoreNames = db.objectStoreNames
            const objectStores = []

            const storiesFollowers = {}

            if (!objectStoreNames.contains('keyVal')) {
                objectStores.push([db.createObjectStore('keyVal', {keyPath: 'key'})])
            }
            if (!objectStoreNames.contains('stories')) {
                objectStores.push([db.createObjectStore('stories', {keyPath: 'id'}),
                    async ()=>{
                        if (!storiesFollowers.stories){
                            const storiesFollowers = await account.refreshFollowsAndFavourites(false)
                        }
                        const storiesTransaction = db.transaction('stories', 'readwrite')
                        const storiesStore = storiesTransaction.objectStore('stories')
                        storiesFollowers.stories.forEach(story => {
                            storiesStore.put(story)
                        })
                    }
                ])
            }
            if (!objectStoreNames.contains('authors')) {
                objectStores.push([db.createObjectStore('authors', {keyPath: 'id'}),
                    async ()=>{
                        if (!storiesFollowers.authors){
                            const storiesFollowers = await account.refreshFollowsAndFavourites(false)
                        }
                        const authorsTransaction = db.transaction('authors', 'readwrite')
                        const authorsStore = authorsTransaction.objectStore('authors')
                        storiesFollowers.authors.forEach(author => {
                            authorsStore.put(author)
                        })
                    }])
            }

            let completed = 0
            objectStores.forEach(store => {
                store[0].transaction.oncomplete = () => {
                    completed++
                    if (store[1]) store[1]()
                    if (completed === objectStores.length) {
                        resolve(db)
                    }
                }
            })
        }
        request.onsuccess = function (event) {
            console.log('database opened')
            resolve(event.target.result)
        }
        request.onerror = function (event) {
            console.error('error opening database', event)
            reject(event)
        }
        request.onblocked = function (event) {
            console.error('database blocked', event)
            reject(event)
        }
        console.log(request)
    })
    return activeDatabase
}


Object.defineProperty(database, 'init', {
    value: initDatabase,
    writable: false,
})

Object.defineProperty(database, 'clear', {
    value: async function () {
        const db = await initDatabase()
        localStorage.setItem('fetched', 'false')
        db.close()
        indexedDB.deleteDatabase(dbName)
        activeDatabase = null
    }
})

async function updateAuthor(author, store){
    if (!store) {
        const db = await initDatabase()
        const transaction = db.transaction('authors', 'readwrite')
        store = transaction.objectStore('authors')
    }
    author.id = parseInt(author.id)
    delete author.update
    await store.put(author)
    author.update = async () => await updateAuthor(author)
    return author
}
async function updateStory(story, store){
    if (!store) {
        const db = await initDatabase()
        const transaction = db.transaction('stories', 'readwrite')
        store = transaction.objectStore('stories')
    }
    story.id = parseInt(story.id)
    const author = story.author
    await updateAuthor(author)
    delete story.author // TODO: attach author update method
    delete story.update
    await store.put(story)
    story.update = async () => await updateStory(story)
    story.author = author
    return story
}


// TODO: i think stories need to update the author first, in case the author is not in the database.
Object.defineProperty(database, 'stories', {
    async get(){
        const db = await initDatabase()
        const transaction = db.transaction('stories', 'readonly')
        const store = transaction.objectStore('stories')
        const stories = await store.getAll()
        Array.prototype.forEach.call(stories, story => {
            story.author = database.getAuthor(story.authorId)
            story.update = async () => await updateStory(story)
        })
        return stories
    },
    async set(stories){
        const db = await initDatabase()
        const transaction = db.transaction('stories', 'readwrite')
        const store = transaction.objectStore('stories')
        const storiesMap = stories.map(async story => {
            await updateStory(story, store)
        })
        await Promise.allSettled(storiesMap)
    }
})


Object.defineProperty(database, 'story', {
    async set(story){
        return updateStory(story)
    }
})

Object.defineProperty(database, 'getStory', {
    async value(id){
        if (typeof id === 'string') id = parseInt(id)
        else if (typeof id !== 'number') throw new Error('id must be a number or a string')
        const db = await initDatabase()
        const transaction = db.transaction('stories', 'readonly')
        const store = transaction.objectStore('stories')
        const story = await store.get(id)

        return new Promise((resolve, reject) => {
            transaction.oncomplete = async () => {
                if (!story.result) return reject(`Story "${id}" not found`)
                story.result.update = async () => await updateStory(story.result)
                try{
                    story.result.author = await database.getAuthor(story.result.authorId)
                } catch (e) {
                    console.log(e)
                }
                resolve(story.result)
            }
        })
    },
    writable: false,
})

Object.defineProperty(database, 'author', {
    async set(author){
        return updateAuthor(author)
    }
})

Object.defineProperty(database, 'getAuthor', {
    async value(id){
        if (!id) throw new Error('No id provided')
        if (typeof id === 'string') id = parseInt(id)
        else if (typeof id !== 'number') throw new Error('id must be a number or a string')
        const db = await initDatabase()
        const transaction = db.transaction('authors', 'readonly')
        const store = transaction.objectStore('authors')
        const author = store.get(id)
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                if (!author.result) return reject(`Author "${id}" not found`)
                author.result.update = async () => await updateAuthor(author.result)
                resolve(author.result)
            }
        })
    },
    writable: false,
})

Object.defineProperty(database, 'authors', {
    async get(){
        const db = await initDatabase()
        const transaction = db.transaction('authors', 'readonly')
        const store = transaction.objectStore('authors')
        const authors = store.getAll()
        console.log('authors',authors)
        Array.prototype.forEach.call(authors, author => {
            author.update = async () => await updateAuthor(author)
        })
        return authors
    },
    async set(authors){
        const db = await initDatabase()
        const transaction = db.transaction('authors', 'readwrite')
        const store = transaction.objectStore('authors')
        authors.map(author => {
            return updateAuthor(author, store)
        })
        await Promise.allSettled(authors)
    }
})

let keyValItems // cache keyVal items. we only need the database for these between page loads
Object.defineProperty(database, 'keyVal', {
    get() {
        return new Promise(async (resolve, reject) => {
            if (keyValItems) return resolve(keyValItems)
            const db = await initDatabase()
            const transaction = db.transaction('keyVal', 'readonly')
            const store = transaction.objectStore('keyVal')
            const keyVal = store.getAll()
            transaction.oncomplete = () => {
                const items = {}
                keyVal.result.map((item)=>{
                    items[item.key] = item.value
                })
                keyValItems = items
                resolve(items)
            }
        })
    }
})

Object.defineProperty(database, 'updateKeyVal', {
    value: (key, val)=>{
        return new Promise(async (resolve, reject) => {
            const db = await initDatabase()
            const transaction = db.transaction('keyVal', 'readwrite')
            const store = transaction.objectStore('keyVal')
            store.put({key, value: val})
            transaction.oncomplete = () => {
                if (!keyValItems) keyValItems = {}
                keyValItems[key] = val
                resolve()
            }
        })
    },
    readonly: true,
})

Object.defineProperty(database, 'getKeyVal', {
    value: async (key) => {
        const keyVal = await database.keyVal
        return keyVal[key]
    },
    readonly: true,
})

export default database
