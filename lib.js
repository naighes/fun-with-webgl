const fetching = require('./fetching')

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
        .map(key => Promise.all([fetching.fetchResource(context, {
                src: shaders[key].vs,
                type: context.VERTEX_SHADER
            }), fetching.fetchResource(context, {
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
        .map(key => fetching.fetchResource(context, game.config.resources[key])
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

module.exports = wgl
