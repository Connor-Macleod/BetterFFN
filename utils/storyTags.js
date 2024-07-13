import profileUtils from "./profile";

const storyTagsUtils = {}


let storyTags
Object.defineProperty(storyTagsUtils, 'tags', {
    get: () => {
        if (!storyTags) {
            const tags = profileUtils.domElement.lastElementChild.innerText.split(' - ')

            const storyInfo = tags.reduce((acc, tag, i) => {
                if (tag.includes(":")) {
                    let [key, value] = tag.split(':')
                    value = value.trim()
                    switch (key.toLowerCase()) {
                        case'rated':
                            value = value.replace('Fiction', '').trim()
                            break
                        case 'favs':
                            key = 'favorites'
                        case 'chapters':
                        case 'words':
                        case 'reviews':
                        case 'follows':
                            value = parseInt(value.replace(/,/g, ''))
                            break;
                        case 'updated':
                        case 'published':
                            if (!/20\d{2}/.test(value)) {
                                value += ', ' + new Date().getFullYear()
                            }
                            value = new Date(value)
                            break;
                    }
                    acc[key.toLowerCase()] = value
                } else {
                    switch (i) {
                        case 1:
                            acc['language'] = tag
                            break
                        case 2:
                            acc['genre'] = tag
                            break
                        case 3:
                            const pairings = /^([^[]*?)(\[[^\]]*?\])? ?(\[[^\]]*?\])?([^[]*?)$/i
                            const match = pairings.exec(tag)
                            const characters = []
                            const ships = []
                            match.forEach((part, i) => {
                                if (!part || i === 0) return
                                let inPairing = false
                                if (part.includes('[') && part.includes(']')) {
                                    inPairing = true
                                }
                                const pairing = []
                                part.split(',').forEach((character) => {
                                    character = character.replace(/[[\]]/, '').trim()
                                    if (inPairing) {
                                        pairing.push(character)
                                    }
                                    characters.push(character)
                                })
                                if (pairing.length > 1) {
                                    ships.push(pairing.sort((a, b) => a.localeCompare(b)))
                                }
                            })
                            if (characters.length) acc['characters'] = characters.sort((a, b) => a.localeCompare(b))
                            if (ships.length) acc['ships'] = ships.map(pairing =>pairing.map(char => characters.indexOf(char)))
                    }
                }
                return acc
            }, {})
            storyTags = storyInfo
        }
        return storyTags
    }
})

export default storyTagsUtils
