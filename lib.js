
const wgl = (canvasId, vs, fs, game) => {
    const canvas = document.getElementById(canvasId)
    const context = getContext(canvas)

    if (!context) {
        return null
    }

    const withObjects = (objects, f) =>
        (context, program, timestamp) => objects.filter(obj => typeof f(obj) === 'function')
            .forEach(obj => f(obj)(context, program, timestamp))

    const loopBody = (game, f) => {
        const objects = (game.objects || [])

        return (context, program, timestamp) => {
            if (typeof f(game) === 'function') {
                f(game)(context, program, timestamp)
                withObjects(objects, o => f(o))(context, program, timestamp)
            }
        }
    }

    const updateDraw = (context, program, timestamp) => {
        loopBody(game, o => o.update)(context, program, timestamp)
        loopBody(game, o => o.draw)(context, program, timestamp)

        window.requestAnimationFrame(timestamp => updateDraw(context, program, timestamp))
    }

    return Promise.all([parseShaderSource(vs, context.VERTEX_SHADER),
        parseShaderSource(fs, context.FRAGMENT_SHADER)])
        .then(values => values.map(value => createShader(context, value.type, value.content)))
        .then(values => createProgram(context, values))
        .then(program => {
            loopBody(game, o => o.initialize)(context, program)

            return program
        })
        .then(program => {
            window.requestAnimationFrame(timestamp => updateDraw(context, program, timestamp))
        })
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

const parseShaderSource = (path, type) => {
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

