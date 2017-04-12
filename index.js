window.onload = () => {
    wgl('view', 'fx/vs.fx', 'fx/fs.fx', new Game())
}

function Triangle(vertices, tint) {
    let _vertices = vertices
    let _tint = tint
    let _positionBuffer = null
    let _colorBuffer = null

    const createBuffer = (context, data) => {
        const buffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER, buffer)
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW)

        return buffer
    }

    this.initialize = context => {
        _positionBuffer = createBuffer(context, _vertices)
        _colorBuffer = createBuffer(context, _tint)
    }

    this.update = (context, program, time) => {
    }

    const sendData = (context, program, buffer, size, name) => {
        context.bindBuffer(context.ARRAY_BUFFER, buffer)

        const attribute = context.getAttribLocation(program, name)
        context.enableVertexAttribArray(attribute)

        // tell the attribute how to get data out of buffer (ARRAY_BUFFER)
        context.vertexAttribPointer(attribute,
            size, // size: # of components per iteration
            context.FLOAT, // type: the data is 32bit floats
            false, // normalize: don't normalize the data
            0, // stride: 0 = move forward size * sizeof(type) each iteration to get the next position
            0) // offset: start at the beginning of the buffer
    }

    this.draw = (context, program, time) => {
        context.useProgram(program)

        sendData(context, program, _positionBuffer, 2, 'a_position')
        sendData(context, program, _colorBuffer, 4, 'a_color')

        context.drawArrays(context.TRIANGLES, // primitive type
            0, // offset
            3) //count
    }
}

function Game() {
    this.objects = []

    const rgb = [1.0, 0.0, 0.0, 1.0,
                 0.0, 1.0, 0.0, 1.0,
                 0.0, 0.0, 1.0, 1.0]

    this.initialize = context => {
        this.objects.push(new Triangle([0, 0,
                                        0, 0.5,
                                        0.7, 0],
                                        rgb))
        this.objects.push(new Triangle([-0.5, -0.5,
                                        -0.9, -0.5,
                                        -0.5, -0.8],
                                        rgb))
        this.objects.push(new Triangle([-0.5, 0.9,
                                        -0.9, 0.9,
                                        -0.5, 0.2],
                                        rgb))
    }

    this.update = (context, time) => {
    }

    this.draw = (context, time) => {
        context.clearColor(0.392157, 0.584314, 0.929412, 1.0)
        // enable depth testing
        context.enable(context.DEPTH_TEST)
        // near things obscure far things
        context.depthFunc(context.LEQUAL)
        // clear the color as well as the depth buffer
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
        context.viewport(0, 0, context.canvas.width, context.canvas.height)
    }
}

