window.onload = () => {

}

let filterBtn = document.getElementById("btn-filter")
let filterBtnToggle = false
let effect = 'normal'


filterBtn.addEventListener('click', () => {
    filterBtnToggle = !filterBtnToggle
    if (filterBtnToggle) {
        filterBtn.className = "btn btn-outline-warning"
        document.getElementById("panel").style.width = "12em"
        document.getElementById("panel").style.padding = "16px"
    } else {
        filterBtn.className = "btn btn-warning"
        document.getElementById("panel").style.width = "0"
        document.getElementById("panel").style.padding = "0"
    }
})


let imgshow = document.getElementById('img-show')
console.log(imgshow);
function filterImage(filterName) {
    if (filterName == 'normal') {
        imgshow.style.filter = ``
    }
    else {
        console.log(filterName);
        imgshow.style.filter = `${filterName}(100%)`
    }
}

for (let el of document.getElementsByClassName('filterbtn')) {
    el.addEventListener('click', () => { filterImage(el.id); console.log('filtered', el.id); effect = el.id })
    console.log(el.id);
}




let fpath = document.querySelector('#fpath').value



document.querySelector('#save-btn').addEventListener('click', () => {
    console.log(effect);
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    let image = new Image()
    image.src = imgshow.src

    image.onload = function () {
        canvas.width = image.width
        canvas.height = image.height
        if (effect != "normal") {
            context.filter = `${effect}(100%)`
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        // document.querySelector('#showArea').append(canvas)

        let dataUrl = canvas.toDataURL("image/jpeg")

        let data = JSON.stringify({
            fpath: fpath,
            data: dataUrl,
        })

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: data
        };

        fetch('/saveImage', options)
    }

})

document.getElementById('btn-rename').addEventListener('click', () => {
    console.log('test');
    let popup = document.getElementById('dialog-rename')
    popup.open = true
})

document.getElementById('dialog-cancel-btn').addEventListener('click', () => {
    let popup = document.getElementById('dialog-rename')
    popup.open = false
})

// console.log(dataUrl);