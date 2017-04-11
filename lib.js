const wgl = (canvasId, vs, fs, game) => {
    const canvas = document.getElementById(canvasId)
    const context = getContext(canvas)

    if (!context) {
        return null
    }

    const updateDraw = (timestamp, context, program) => {
        if (typeof game.update !== 'function') {
            console.warn('game.update is missing')
        } else {
            game.update(timestamp, context, program)
            const objects = (game.objects || [])
            objects.filter(obj => typeof obj.update === 'function')
                .forEach(obj => obj.update(timestamp, context, program))
        }

        if (typeof game.draw !== 'function') {
            console.warn('game.draw is missing')
        } else {
            game.draw(timestamp, context, program)
            const objects = (game.objects || [])
            objects.filter(obj => typeof obj.draw === 'function')
                .forEach(obj => obj.draw(timestamp, context, program))
        }

        window.requestAnimationFrame(timestamp => updateDraw(timestamp, context, program))
    }

    return Promise.all([parseShaderSource(vs, context.VERTEX_SHADER),
        parseShaderSource(fs, context.FRAGMENT_SHADER)])
        .then(values => values.map(value => createShader(context, value.type, value.content)))
        .then(values => createProgram(context, values))
        .then(program => {
            if (typeof game.initialize !== 'function') {
                console.warn('game.initialize is missing')
            } else {
                game.initialize(context, program)
                const objects = (game.objects || [])
                objects.filter(obj => typeof obj.initialize === 'function')
                    .forEach(obj => obj.initialize(context, program))
            }

            return program
        })
        .then(program => {
            window.requestAnimationFrame(timestamp => updateDraw(timestamp, context, program))
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

