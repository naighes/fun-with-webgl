const PNGReader = require('png.js')

module.exports.fetchResource = (context, resource) => {
    const vs = context.VERTEX_SHADER
    const fs = context.FRAGMENT_SHADER
    let map = {
        'img': fetchImage,
        'heightmap': fetchHeightMap
    }
    map[vs] = fetchShader
    map[fs] = fetchShader

    return map[resource.type](resource).then(content => {
        return {
            content: content,
            type: resource.type
        }
    })
}

const fetchImage = resource => new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => {
        resolve(img)
    }
    img.src = resource.src
})

const fetchShader = resource => fetch(resource).then(decodeShader)
const fetchHeightMap = resource => fetch(resource).then(decodeHeightmap)

const fetch = resource => new Promise((resolve, reject) => {
    let request = new XMLHttpRequest()
    request.responseType = 'arraybuffer'
    request.open('GET', resource.src, true)
    request.onreadystatechange = () =>  {
        if (request.readyState === 4 &&
            (request.status === 200 || request.status === 0)) {
            resolve(request.response)
        }
    }
    request.send(null)
})

const decodeShader = response => {
    const dataView = new DataView(response)
    const decoder = new TextDecoder('utf-8')

    return Promise.resolve(decoder.decode(dataView))
}

const decodeHeightmap = response => new Promise((resolve, reject) => {
    const reader = new PNGReader(response)
    reader.parse((error, png) => {
        if (error) {
            throw error // TODO: reject
        }

        resolve(png)
    })
})
