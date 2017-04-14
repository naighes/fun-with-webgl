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

    const initialize = (context, programs) => {
        if (typeof game.initialize === 'function') {
            game.initialize(context)
        }

        const objects = game.objects || []

        return objects.map(obj => {
            const program = programs[obj.shaderName]

            if (typeof obj.initialize === 'function') {
                obj.initialize(context)
            }

            return {
                update: (context, time) => typeof obj.update == 'function' ? obj.update(context, program, time) : () => { },
                draw: (context, time) => typeof obj.draw == 'function' ? obj.draw(context, program, time) : () => { }
            }
        })
    }

    const loadShaders = (context, shaders) => Object.keys(shaders)
        .map(key => Promise.all([fetch(shaders[key].vs, context.VERTEX_SHADER),
            fetch(shaders[key].fs, context.FRAGMENT_SHADER)])
            .then(values => {
                const result = { }
                result[key] = values.map(v => createShader(context, v.type, v.content))

                return result
            }))

    return Promise.all(loadShaders(context, game.shaders))
        .then(result => result.reduce((o, c) => {
            const key = Object.keys(c)[0]
            o[key] = createProgram(context, c[key])

            return o
        }, { }))
        .then(result => initialize(context, result))
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

const fetch = (path, type) => {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest()
        request.open('GET', path, true)
        request.onreadystatechange = () =>  {
            if (request.readyState === 4 &&
                (request.status === 200 || request.status == 0)) {
                resolve({
                    content: request.responseText,
                    type: type
                })
            }
        }
        request.send(null)
    })
}

const createShader = (context, type, source) => {
    let shader = context.createShader(type)
    context.shaderSource(shader, source)
    context.compileShader(shader)

    if (context.getShaderParameter(shader, context.COMPILE_STATUS)) {
        return shader
    }

    context.deleteShader(shader)
    throw new Error(context.getShaderInfoLog(shader))
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

    context.deleteProgram(program)
    throw new Error(context.getProgramInfoLog(program))
}

