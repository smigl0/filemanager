let area = document.getElementById('editor')
let lcBar = document.getElementById('lcBar')

let newLen = area.value.split("\n").length
let oldLen = area.value.split("\n").length
let pathDiv = document.getElementById('pathDiv')
let pathDivInner = document.getElementById('fpath')
let colorThemes = [
    {
        main: '#121212',
        path: 'var(--bs-gray-800)',
        color: 'var(--bs-white)',
        pathColor: 'var(--bs-white)',
    }
    ,
    {
        main: 'var(--bs-white)',
        path: 'var(--bs-gray-300)',
        color: 'var(--bs-dark)',
        pathColor: 'var(--bs-dark)'
    }
    ,
    {
        main: 'var(--bs-red)',
        path: 'var(--bs-cyan)',
        color: 'var(--bs-white)',
        pathColor: 'var(--bs-dark)'
    }
]

fetch('/whatPalette')

updateLc()
fetchDefaultLayout(document.getElementById('ext').value)

async function fetchDefaultLayout() {
    data = JSON.stringify({ path: pathDivInner.innerHTML })
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    };
    await fetch('/sendFileContent', options)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            area.value = data.text
            newLen = data.text.split("\n").length
            updateLc()
        })
    updateLc()
}

function updateLc() {
    lcBar.innerHTML = ""
    console.log('new Length');
    for (let i = 1; i < newLen + 1; i++) {
        let newLineCounter = document.createElement('div')
        newLineCounter.innerHTML = `${i}`
        if (i == 1) {
            newLineCounter.className = "num num-first"
        }
        else {
            newLineCounter.className = "num"
        }
        if (i == newLen) {
            newLineCounter.className += " num-last"
        }
        // if (i = 0) {
        //     newLineCounter.className += ' num-first'
        // }
        lcBar.append(newLineCounter)
    }
}

area.onkeyup = function () {
    newLen = area.value.split("\n").length
    updateLc()
}

area.style.fontSize = "1em"
lcBar.style.fontSize = "1em"
let fs = "1"
document.getElementById('fsPlus').addEventListener('click', () => {
    fs = (parseFloat(fs) + 0.5).toFixed(1)
    area.style.fontSize = `${fs}em`
    lcBar.style.fontSize = `${fs}em`
})

document.getElementById('fsMinus').addEventListener('click', () => {
    fs = (parseFloat(fs) - 0.5).toFixed(1)
    console.log(fs);
    area.style.fontSize = `${fs}em`
    lcBar.style.fontSize = `${fs}em`
})

document.getElementById('btn-rename').addEventListener('click', () => {
    console.log('test');
    let popup = document.getElementById('dialog-rename')
    popup.open = true
})


let selectedThemeId = 0

document.getElementById('uplbtn').addEventListener('click', async () => {
    console.log('upload');

    console.log(document.querySelector('#editor').value);

    let data = JSON.stringify({
        path: document.querySelector('#fpath').innerHTML,
        text: document.querySelector('#editor').value,
    })

    console.log(data);

    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    };

    fetch('/writeFileContent', options)
})

document.getElementById('palswapbtn').addEventListener('click', () => {
    selectedThemeId++
    if (selectedThemeId > colorThemes.length - 1) {
        selectedThemeId = 0
    }
    console.log(selectedThemeId);

    let data = JSON.stringify({
        "paletteId": selectedThemeId,
    })

    console.log(data);

    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    };

    fetch('/swapPalette', options)

    area.style.backgroundColor = colorThemes[selectedThemeId].main
    area.style.color = colorThemes[selectedThemeId].color
    pathDiv.style.backgroundColor = colorThemes[selectedThemeId].path
    pathDiv.style.color = colorThemes[selectedThemeId].pathColor
})