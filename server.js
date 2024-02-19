const fs = require("fs")
const path = require("path")
const http = require("http")
const funValidate = (obj) => {
    const { req: { body: { title, auther } } } = obj
    if (!title || title?.length <= 3) {
        return ({
            error: true,
            message: "title key bo'lishi shart, va title uzunligi 3dan katta bo'lishi shart"
        })

    } else if (!auther || auther.length <= 3) {
        return ({
            error: true,
            message: "auther key bo'lishi shart, va title uzunligi 3dan katta bo'lishi shart"
        })
    } else {
        return ({
            error: false,
        })
    }
}
const funBooksGet = ({ res }) => {
    fs.readFile(path.join(__dirname, "data.json"), "utf8", (err, data) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "application/json" })
            return res.end(JSON.stringify({
                responseCode: -1,
                userMessage: "Serverda hatolikk bor",
            }))
        }
        res?.writeHead(200, { "Content-Type": 'application/json' })
        res.end(JSON.stringify({
            responseCode: 0,
            data: JSON.parse(data)
        }))
    })
}
const funBookGetId = ({ req: { url }, res }) => {
    fs.readFile(path.join(__dirname, "data.json"), "utf8", (err, data) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "application/json" })
            return res.end(JSON.stringify({
                userMessage: "Serverda hatolikk bor",
                responseCode: -1
            }))
        }
        let result = JSON.parse(data)
        const id = +url.split("/")[4]
        let book = result.find(i => i?.id === id)
        if (book?.id) {
            res?.writeHead(200, { "Content-Type": 'application/json' })
            return res.end(JSON.stringify({
                data: book,
                responseCode: 0,
            }))
        } else {
            res.writeHead(500, { "Content-Type": "application/json" })
            return res.end(JSON.stringify({
                responseCode: -1,
                userMessage: "Berilgan id bo'yicha kitob topilmadi",
            }))
        }
    })
}
const funBookCreate = ({ req, res }) => {
    let arr = []
    req.on("data", chunk => {
        arr.push(chunk)
    })
    req.on("end", () => {
        let body = JSON.parse(Buffer.concat(arr).toString())
        fs.readFile(path.join(__dirname, "data.json"), "utf8", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" })
                return res.end(JSON.stringify({
                    userMessage: "Serverda hatolikk bor",
                    responseCode: -1
                }))
            }
            let result = JSON.parse(data)
            if (result.findIndex(i => i?.title === body.title) !== -1) {
                res.writeHead(400, { 'Content-Type': "application/json" })
                return res.end(JSON.stringify({
                    responseCode: -1,
                    userMessage: "Bunday title bor"
                }))
            }
            let { error, message } = funValidate({ req: { ...req, body } })
            if (error) {
                res.writeHead(500, { 'Content-Type': "application/json" })
                return res.end(JSON.stringify({
                    responseCode: -1,
                    userMessage: message
                }))
            }
            let book = {
                id: result.length + 1,
                ...body,
            }
            result.push(book)
            let put = JSON.stringify(result, null, 2)
            fs.writeFile(path.join(__dirname, "data.json"), put, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': "application/json" })
                    res.end(JSON.stringify({
                        responseCode: -1,
                        userMessage: "Serverda hatolik bor " + err
                    }))
                }
                res.writeHead(200, { 'Content-Type': "application/json" })
                res.end(JSON.stringify({
                    responseCode: 0,
                    userMessage: "Muofaqiyatli saqlandi"
                }))
            })
        })
    })

}
const funBookUpdate = ({ req, res }) => {
    let arr = []
    req.on("data", chunk => {
        arr.push(chunk)
    })
    req.on("end", () => {
        let body = JSON.parse(Buffer.concat(arr).toString())
        fs.readFile(path.join(__dirname, "data.json"), "utf8", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" })
                return (
                    res.end(JSON.stringify({
                        responseCode: -1,
                        userMessage: "Serverda katolik bor " + e
                    }))
                )
            }
            let result = JSON.parse(data)
            if (result.findIndex(i => i?.id === body.id) === -1) {
                res.writeHead(400, { 'Content-Type': "application/json" })
                return res.end(JSON.stringify({
                    responseCode: -1,
                    userMessage: "Bunday id bo'yicha kitob topmadi"
                }))
            }
            if (result.findIndex(i => i?.title === body.title) !== -1) {
                res.writeHead(400, { 'Content-Type': "application/json" })
                return res.end(JSON.stringify({
                    responseCode: -1,
                    userMessage: "Bunday title bor title"
                }))
            }
            let { error, message } = funValidate({ req: { ...req, body } })
            if (error) {
                res.writeHead(500, { 'Content-Type': "application/json" })
                return res.end(JSON.stringify({
                    responseCode: -1,
                    userMessage: message
                }))
            }
            result = result.map(i => {
                if (i?.id === body?.id) {
                    i = body
                }
                return i
            })
            let put = JSON.stringify(result, null, 2)
            fs.writeFile(path.join(__dirname, "data.json"), put, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': "application/json" })
                    res.end(JSON.stringify({
                        responseCode: -1,
                        userMessage: "Serverda hatolik bor " + err
                    }))
                }
                res.writeHead(200, { 'Content-Type': "application/json" })
                res.end(JSON.stringify({
                    responseCode: 0,
                    userMessage: "Muofaqiyatli ma'lumotni o'zgartirib qo'yildi"
                }))
            })
        })
    })
}
const funBookDelete = ({ req, res }) => {
    req.on("end", () => {
        const id = +url.split("/")[4]
        fs.readFile(path.join(__dirname, "data.json"), "utf8", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" })
                return (
                    res.end(JSON.stringify({
                        responseCode: -1,
                        userMessage: "Serverda katolik bor " + e
                    }))
                )
            }
            let result = JSON.parse(data)
            if (result.findIndex(i => i?.id === id) === -1) {
                res.writeHead(400, { 'Content-Type': "application/json" })
                return res.end(JSON.stringify({
                    responseCode: -1,
                    userMessage: "Bunday id bo'yicha kitob topmadi"
                }))
            }
            let put = JSON.stringify(result.filter(i => i?.id !== id), null, 2)
            fs.writeFile(path.join(__dirname, "data.json"), put, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': "application/json" })
                    res.end(JSON.stringify({
                        responseCode: -1,
                        userMessage: "Serverda hatolik bor " + err
                    }))
                }
                res.writeHead(200, { 'Content-Type': "application/json" })
                res.end(JSON.stringify({
                    responseCode: 0,
                    userMessage: "Muofaqiyatli ma'lumot o'chirib yuborildi"
                }))
            })
        })
    })
}
const funUrlBookId = (url, method) => {// urlda id bor yoki yo'qligini aniqlab beradigan method
    const urls = url.split("/")
    return urls.length === 5 && urls[1] === "api" && urls[2] === "book" && urls[3] === method
}
const funNotFound = ({ res }) => {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
        responseCode: -1,
        userMessage: "Not Found 404",
    }));
}
http.createServer((req, res) => {
    const { url, method } = req
    if (funUrlBookId(url, "get") && method.toLocaleLowerCase() === "get") {
        funBookGetId({ req, res })
    } else if (url === "/api/books/get" && method.toLocaleLowerCase() === "get") {
        funBooksGet({ req, res })
    } else if (url === "/api/book/create" && method.toLocaleLowerCase() === "post") {
        funBookCreate({ req, res })
    } else if (url === "/api/book/update" && method.toLocaleLowerCase() === "put") {
        funBookUpdate({ req, res })
    } else if (funUrlBookId(url, "delete") && method.toLocaleLowerCase() === "delete") {
        funBookDelete({ req, res })
    } else {
        funNotFound({ req, res })
    }
}).listen(3000, () => {
    console.log(5000, "serverni eshitishni boshladi")
})