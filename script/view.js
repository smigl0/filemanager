let popups = [
    document.getElementById('dialog-add-file'), document.getElementById('dialog-add-folder'), document.getElementById('dialog-upload-file'), document.getElementById('dialog-rename'), document.getElementById('dialog-delete')
]

function closePopups(popups) {
    for (let i = 0; i < popups.length; i++) {
        popups[i].open = false
    }
}

document.getElementById("btn-add-file").addEventListener("click", () => {
    closePopups(popups)
    let popup = document.getElementById('dialog-add-file')
    popup.open = true
})

document.getElementById("btn-add-folder").addEventListener("click", () => {
    closePopups(popups)
    let popup = document.getElementById('dialog-add-folder')
    popup.open = true
})

document.getElementById("btn-upload-file").addEventListener("click", () => {
    closePopups(popups)
    let popup = document.getElementById('dialog-upload-file')
    popup.open = true
})

document.getElementById("btn-rename").addEventListener("click", () => {
    closePopups(popups)
    let popup = document.getElementById('dialog-rename')
    popup.open = true
})

document.getElementById("btn-delete").addEventListener("click", () => {
    closePopups(popups)
    let popup = document.getElementById('dialog-delete')
    popup.open = true
})

let toggleId = ''
let listFormFiles = document.getElementById('listFormFiles')
let listFormDirs = document.getElementById('listFormDirs')
