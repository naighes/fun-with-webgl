const wgl = (canvasId, game) => {
    const canvas = document.getElementById(canvasId)
    const context = getContext(canvas)

    if (!context) {
        return null
    }

    const loopBody = (game, objects, f) => (context, time) => {
        const a = f(game)

        if (typeof a === 'function') {
            a(context, time)
        }

        objects.forEach(obj => {
            const b = f(obj)

            if (typeof b === 'function') {
                b(context, time)
            }
        })
    }

    const loop = (context, objects, time) => {
        loopBody(game, objects, o => o.update)(context, time)
        loopBody(game, objects, o => o.draw)(context, time)
        const previous = time.totalGameTime
        window.requestAnimationFrame(timestamp => {
            const current = timestamp / 1000
            const delta = current - previous
            loop(context, objects, {
                totalGameTime: current,
                delta: delta,
                fps: 1 / delta
            })
        })
    }

    const initialize = (context, content) => {
        if (typeof game.initialize === 'function') {
            game.initialize(context, content)
        }

        const objects = game.objects || []

        return objects.map(obj => {
            if (typeof obj.initialize === 'function') {
                obj.initialize(context, content)
            }

            return {
                update: (context, time) => typeof obj.update == 'function' ? obj.update(context, time) : () => { },
                draw: (context, time) => typeof obj.draw == 'function' ? obj.draw(context, time) : () => { }
            }
        })
    }

    const loadShaders = (context, shaders) => Object.keys(shaders)
        .map(key => Promise.all([fetchResource(context, {
                src: shaders[key].vs,
                type: context.VERTEX_SHADER
            }), fetchResource(context, {
                src: shaders[key].fs,
                type: context.FRAGMENT_SHADER
            })])
            .then(values => {
                const result = { }
                result[key] = values.map(v => createShader(context, v.type, v.content))

                return result
            }))

    const ls = Promise.all(loadShaders(context, game.config.shaders))
        .then(result => result.reduce((o, c) => {
            const key = Object.keys(c)[0]
            o[key] = createProgram(context, c[key])

            return o
        }, { }))

    const lr = Promise.all(Object.keys(game.config.resources)
        .map(key => fetchResource(context, game.config.resources[key])
            .then(r => {
                const result = { }
                result[key] = r

                return result
            })))
        .then(result => result.reduce((o, c) => {
            const key = Object.keys(c)[0]
            o[key] = c[key]

            return o
        }, { }))

    return Promise.all([ls, lr])
        .then(result => initialize(context, {
            programs: result[0],
            resources: result[1]
        }))
        .then(objects => loop(context, objects, {
            totalGameTime: 0,
            delta: 0,
            fps: 0
        }))
}

const getContext = canvas => {
    const context = canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')

    if (!context) {
        context.viewportWidth = canvas.width
        context.viewportHeight = canvas.height
    }

    return context
}

const fetchResource = (context, resource) => {
    const vs = context.VERTEX_SHADER
    const fs = context.FRAGMENT_SHADER
    let map = {
        'img': fetchImage,
        'heightmap': fetchHeightMap
    }
    map[vs] = fetchShader
    map[fs] = fetchShader

    return map[resource.type](resource)
}

const fetchImage = resource => new Promise((resolve, reject) => {
    resource.img = new Image()
    resource.img.onload = () => {
        resolve(resource)
    }
    resource.img.src = resource.src
})

const fetchShader = resource => {
    const decode = response => {
        const dataView = new DataView(response)
        const decoder = new TextDecoder('utf-8')

        return decoder.decode(dataView)
    }

    return fetch(resource, decode)
}

const fetchHeightMap = resource => {
    const decode = response => {
        return new Uint16Array(response)
    }

    return fetch(resource, decode)
}

const fetch = (resource, decode) => new Promise((resolve, reject) => {
    let request = new XMLHttpRequest()
    request.responseType = 'arraybuffer'
    request.open('GET', resource.src, true)
    request.onreadystatechange = () =>  {
        if (request.readyState === 4 &&
            (request.status === 200 || request.status == 0)) {
            resolve({
                content: decode(request.response),
                type: resource.type
            })
        }
    }
    request.send(null)
})

const createShader = (context, type, source) => {
    let shader = context.createShader(type)
    context.shaderSource(shader, source)
    context.compileShader(shader)

    if (context.getShaderParameter(shader, context.COMPILE_STATUS)) {
        return shader
    }

    const e = context.getShaderInfoLog(shader)
    context.deleteShader(shader)
    throw new Error(`SHADER COMPILING ERROR: "${e}"\n${source}`)
}

const createProgram = (context, shaders) => {
    let program = context.createProgram()
    shaders.forEach(shader => {
        context.attachShader(program, shader)
    })
    context.linkProgram(program)

    if (context.getProgramParameter(program, context.LINK_STATUS)) {
        return program
    }

    const e = context.getProgramInfoLog(program)
    context.deleteProgram(program)
    throw new Error(`SHADER LINKING ERROR: "${e}"`)
}
