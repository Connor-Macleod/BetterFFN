const elementQueue = [];

let elementsAlreadyAdded = false;
export function addElement(el){
    elementQueue.push(el)
    if (elementsAlreadyAdded) {
        document.body.appendChild(el)
    }
}

export function replacePage(){
    document.body.innerHTML = ''
    elementQueue.forEach(el => document.body.appendChild(el))
    elementsAlreadyAdded = true
}
