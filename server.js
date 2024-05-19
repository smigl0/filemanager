let express = require('express')
let hbs = require('express-handlebars');
const formidable = require('formidable');
const cookieparser = require("cookie-parser");
const fs = require("fs")
const nocache = require("nocache");
let cors = require('cors')

const path = require("path");
const { json } = require('body-parser');

let db = []
app = express()

app.set('views', `${__dirname}/views`)
app.engine('hbs', hbs({
    extname: '.hbs',
    partialsDir: "views/partials",
    helpersDir: "views/helpers",
    layout: 'main.hbs'
}));
app.set('view engine', 'hbs')

app.use(cors())

app.use('/static', express.static('static'))
app.use('/bs', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/bsi', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json())
app.use(cookieparser())
app.use(nocache())
app.use(cors({
    origin: "*"
}))
app.use("/script", express.static(__dirname + '/script'))

function checkStatus(cookie) {
    if (typeof cookie['login'] == 'undefined' || typeof cookie['login']['username'] == 'undefined') {
        return 1
    }
}

const PORT = 5557

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
})

app.get('/', (req, res) => {
    if (checkStatus(req.cookies)) { res.render('login', { layout: false }) }
    else {
        if (checkStatus(req.cookies)) { res.render('login', { layout: false }) }
        else {
            res.render('index.hbs', { layout: "main.hbs" })
        }
    }
})

app.post('/add', (req, res) => {
    // console.log(req.query.path, typeof req.query.path);
    let form = formidable({ keepExtensions: true, multiples: true })
    form.uploadDir = path.join(__dirname, 'upload', req.cookies.login.username, req.query.path)
    // form.parse(req, (err, fields) => { console.log(fields); })
    form.parse(req, function (err, fields, files) {
        // console.log(path.join(__dirname, 'upload', req.cookies.login.username, req.query.path));

        if (fields.ftype == 'emptyFile') {
            seg = fields.fname.split('.')
            if (seg.length > 1) {
                fs.closeSync(fs.openSync(path.join(__dirname, 'upload', req.cookies.login.username, req.query.path, `${seg[0]}.${seg[seg.length - 1]}`), 'w'));
            } else {
                fs.closeSync(fs.openSync(path.join(__dirname, 'upload', req.cookies.login.username, req.query.path, `${fields.fname}.txt`), 'w'));
            }
        } else if (fields.ftype == 'folder') {
            if (!fs.existsSync(path.join(__dirname, 'upload', req.cookies.login.username, req.query.path, `${fields.fname}`))) {
                fs.mkdirSync(path.join(__dirname, 'upload', req.cookies.login.username, req.query.path, `${fields.fname}`));
            }
        } else if (fields.ftype == 'file') {
            // console.log('FILEDIR', files.path.substring(0, files.path.lastIndexOf("/")));
            fs.renameSync(files.file.path, files.file.path.substring(0, files.file.path.lastIndexOf("\\")) + '\\' + files.file.name)

        }
        res.redirect(`/list?type=dir&path=${req.query.path}`)
    })
})

app.get('/list', (req, res) => {
    if (checkStatus(req.cookies)) { res.render('login', { layout: false }) }
    else {
        console.log("////////////////////////////////BREAK/////////////////////////////////////");
        if (req.query.type == 'dir') {
            let context = {}
            context.path = req.query.path.split('\\').filter((el) => { return el; })
            context.path.unshift('\\')
            context.paths = []
            for (let i = 0; i < context.path.length; i++) {
                let newPath = ""
                for (let ii = 0; ii <= i; ii++) {
                    newPath += context.path[ii]
                    if (ii != 0 && ii != i) {
                        newPath += '\\'
                    }
                }
                context.paths.push(newPath)
            }

            context.currentPath = context.paths[context.paths.length - 1]
            context.newPathPrep = context.paths[context.paths.length - 2]

            context.btnpaths = []
            context.path.forEach((element, index) => {
                let btnDir = {}
                btnDir.path = element
                btnDir.paths = context.paths[index]
                context.btnpaths.push(btnDir)
            });

            // console.log('Context: ', context.btnpaths);

            // console.log('V---- under FS ----V');

            fs.readdir(path.join(__dirname, 'upload', req.cookies.login.username, req.query.path), { withFileTypes: true }, (err, files, catalog) => {
                if (err) throw err
                // console.log('context:', context);
                // context.files = files.filter(files => files.isFile()).map(dirent => dirent.name)
                context.files = []
                files.filter(files => files.isFile()).map(dirent => dirent.name).forEach(element => {
                    context.files.push({ fname: element, fpath: path.join(context.currentPath, element), ext: element.split('.').pop() })
                });
                let dirs = files.filter(files => files.isDirectory()).map(dirent => dirent.name)
                let dirpaths = []
                dirs.forEach((element) => {
                    dirpaths.push(path.join(context.paths[context.paths.length - 1], element))
                })
                context.dirsandpaths = []
                dirs.forEach((element, index) => {
                    context.dirsandpaths.push({ 'dirname': element, 'dirpath': dirpaths[index] })
                });
                console.log('Context: ', context);
                console.log('Context: ', context)
                res.render('list.hbs', context)
            })
        }
        else if (req.query.type == 'file') {
            if (editable.includes(req.query.ext)) {
                res.redirect(`/edit?path=${req.query.path}&ext=${req.query.ext}`)
            } else if (images.includes(req.query.ext)) {
                res.redirect(`/imageMod?type=file&ext=${req.query.ext}&path=${req.query.path}`)
            }
            else {
                res.sendFile(path.join(__dirname, 'upload', req.cookies.login.username, req.query.path))
            }
        }
    }
})

app.get('/info', (req, res) => {
    if (checkStatus(req.cookies)) { res.render('login', { layout: false }) }
    else {
        context = db[req.query.id - 1]
        console.log('Context: ', context)
        res.render('info.hbs', context)
    }
})


app.get('/rename', (req, res) => {
    if (checkStatus(req.cookies)) { res.render('login', { layout: false }) }
    else {
        console.log('/////////////////////////////////////RENAME/////////////////////////////////////');
        console.log(req.query);
        if (req.query.from == 'edit') {
            let fpath = req.query.fpath.split('\\').filter((el) => { return el; })
            fpath.unshift('\\')
            let paths = []
            for (let i = 0; i < fpath.length; i++) {
                let newPath = ""
                for (let ii = 0; ii <= i; ii++) {
                    newPath += fpath[ii]
                    if (ii != 0 && ii != i) {
                        newPath += '\\'
                    }
                }
                paths.push(newPath)
            }


            console.log(req.query);
            console.log(paths);
            fs.renameSync(path.join(__dirname, 'upload', req.cookies.login.username, paths[paths.length - 2], req.query.name), path.join(__dirname, 'upload', req.cookies.login.username, req.query.path), (err) => { })
            let newPath = path.join(paths[paths.length - 2], req.query.name)
            newPath.substring(0, newPath.length - 2)
            res.redirect(`/edit?path=${newPath}/&ext=${req.query.name.split('.')[req.query.name.split('.').length - 1]}`)
        }
        else if (req.query.from == 'imageMod') {
            let fpath = req.query.fpath.split('\\').filter((el) => { return el; })
            fpath.unshift('\\')
            let paths = []
            for (let i = 0; i < fpath.length; i++) {
                let newPath = ""
                for (let ii = 0; ii <= i; ii++) {
                    newPath += fpath[ii]
                    if (ii != 0 && ii != i) {
                        newPath += '\\'
                    }
                }
                paths.push(newPath)
            }


            console.log(req.query);
            console.log(paths);
            fs.renameSync(path.join(__dirname, 'upload', req.cookies.login.username, req.query.fpath), path.join(__dirname, 'upload', req.cookies.login.username, paths[paths.length - 2], req.query.name), (err) => { })
            let newPath = path.join(paths[paths.length - 2], req.query.name)
            newPath.substring(0, newPath.length - 2)
            res.redirect(`/imageMod?type=file&ext=png&path=${newPath}`)
        }
        else if (!fs.existsSync(path.join(__dirname, 'upload', req.query.name))) {
            fs.rename(path.join(__dirname, 'upload', req.cookies.login.username, req.query.path), path.join(__dirname, 'upload', req.cookies.login.username, req.query.newPathPrep, req.query.name), (err) => {
                if (err) console.log(err)
                else {
                    res.redirect(`/list?type=dir&path=${path.join(req.query.newPathPrep, req.query.name)}`)
                }
            })
        }
        else {
            res.redirect(`/list?type=dir&path=${req.query.path}`)
        }
    }
})

app.get('/delete', (req, res) => {
    if (checkStatus(req.cookies)) { res.render('login', { layout: false }) }
    else {

        fs.rm(path.join(__dirname, 'upload', req.cookies.login.username, req.query.path), { recursive: true }, (err) => {
            if (err) {
                console.error(err.message);
                return;
            }
            console.log("Katalog usunięty");

        })
        res.redirect(`/list?type=dir&path=\\`)
    }
})

let editable = [
    'css',
    'html',
    'js',
    'json',
    'txt',
    'xml',
]

let images = [
    'png',
    'jpg'
]
app.get('/edit', (req, res) => {
    if (checkStatus(req.cookies)) { res.render('login', { layout: false }) }
    else {
        console.log(req.query);
        let context = {
            path: req.query.path,
            ext: req.query.ext
        }
        console.log('Context: ', context)
        res.render('edit.hbs', context)
    }
})

app.post('/editDefaultLayout', (req, res) => {
    // console.log(fs.readFileSync(path.join(__dirname, 'static/editorDefaultLayout', `default.${req.body.ext}`), { encoding: 'utf8', flag: 'r' }));
    // console.log('edit', req.body.ext);
    console.log(req.body.ext);
    res.json({ text: fs.readFileSync(path.join(__dirname, 'static/editorDefaultLayout', `default.${req.body.ext}`), { encoding: 'utf8', flag: 'r' }) })
})

app.post('/sendFileContent', (req, res) => {
    console.log('/sendFileContent ::::', req.body);
    res.send({ text: fs.readFileSync(path.join(__dirname, 'upload', req.cookies.login.username, req.body.path), { encoding: 'utf8', flag: 'r' }) })
})

app.post('/writeFileContent', (req, res) => {
    fs.writeFile(path.join(__dirname, 'upload', req.cookies.login.username, req.body.path), req.body.text, (err) => {
        if (err) throw err
        console.log("plik zapisany");
    })
    console.log(req.body.ext);
    if (editable.includes(req.body.ext)) {
        res.redirect(`/edit?path=${req.body.path}&ext=${req.body.ext}`)
    } else {
        res.redirect(`/list?type=file&ext=${req.body.ext}&path=${req.body.path}`)
    }
})

app.post('/swapPalette', (req, res) => {
    console.log(req.body);
    fs.writeFileSync(path.join(__dirname, 'currPalette.json'), JSON.stringify(req.body))
})

app.post('/whatPalette', (req, res) => {
    let paletteId = JSON.parse(fs.readFileSync(path.join(__dirname, 'currPalette.json'), { encoding: "utf8", flag: "r" })).paletteId
    console.log('/whatPalette ::::', paletteId);
    res.send({ "paletteId": paletteId })
})

app.get('/imageMod', (req, res) => {
    if (checkStatus(req.cookies)) { res.render('login', { layout: false }) }
    else {
        let context = {
            fpath: path.join(req.query.path),
            src: path.join('/returnUpload', req.cookies.login.username, req.query.path),
            effects: [
                { src: path.join('/returnUpload', req.cookies.login.username, req.query.path), name: "normal" },
                { src: path.join('/returnUpload', req.cookies.login.username, req.query.path), name: "grayscale" },
                { src: path.join('/returnUpload', req.cookies.login.username, req.query.path), name: "invert" },
                { src: path.join('/returnUpload', req.cookies.login.username, req.query.path), name: "sepia" }
            ],
        }
        console.log('Context: ', context)
        res.render('imageMod', context)
    }
})

app.post('/saveImage', (req, res) => {
    console.log(req.body);

    const data = req.body.data
    const imgData = data.split(",")[1];
    const buffer = Buffer.from(imgData, "base64")
    const filePath = path.join(__dirname, 'upload', req.cookies.login.username, req.body.fpath)

    console.log(imgData, buffer);
    fs.writeFile(filePath, buffer, (err) => { });
})

app.get('/login', (req, res) => {
    res.render('login', { layout: false })
})



app.get('/register', (req, res) => {
    res.render('register', { layout: false })
})

app.post('/register', (req, res) => {
    users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), { encoding: "utf8", flag: "r" }))
    users[req.body.username] = { 'password': req.body.password }
    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users))
    fs.mkdirSync(path.join(__dirname, 'upload', req.body.username))
    res.cookie(
        'login',
        {
            'username': req.body.username,
            'status': 'active'
        },
        { httpOnly: true, maxAge: 45 * 60 * 1000 });
    res.redirect('/')
})

app.get('/authenticate', (req, res) => {
    console.log(req.query);
    let users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), { encoding: "utf8", flag: "r" }))
    console.log(users, req.query);
    if (!req.query.password || !users[req.query.username]) {
        res.redirect('/login')
    }
    else if (users[req.query.username].password == req.query.password) {
        res.cookie(
            'login',
            {
                'username': req.query.username,
                'status': 'active'
            },
            { httpOnly: true, maxAge: 45 * 60 * 1000 });
        res.redirect('/')
    } else {
        res.redirect('login')
    }

}
)

app.get('/logout', (req, res) => {
    if (checkStatus(req.cookies)) { res.render('login', { layout: false }) }
    else {
        res.clearCookie("login");
        res.redirect('/')
    }
})

app.use(('/returnUpload'), express.static('upload'))
app.use('/file', express.static('static/upload'))

app.get('/showUpload', (req, res) => {
    if (checkStatus(req.cookies)) { res.render('login', { layout: false }) }
    else {
        res.sendFile(path.join(__dirname, 'upload', req.cookies.login.username, req.query.fpath));
    }
})

app.all('*', (req, res) => {
    res.render('404.hbs');
}); 