window.onload = () => {
    wgl('view', 'fx/vs.fx', 'fx/fs.fx', new Game())
}

function Triangle(vertices, tint) {
    let _vertices = vertices
    let _tint = tint
    let _buffer = null

    this.initialize = context => {
        _buffer = context.createBuffer()

        context.bindBuffer(context.ARRAY_BUFFER, _buffer)
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(_vertices), context.STATIC_DRAW)
    }

    this.update = (context, program, time) => {
    }

    this.draw = (context, program, time) => {
        context.useProgram(program)

        context.bindBuffer(context.ARRAY_BUFFER, _buffer)
        const position = context.getAttribLocation(program, 'a_position')
        context.enableVertexAttribArray(position)

        // tell the attribute how to get data out of buffer (ARRAY_BUFFER)
        context.vertexAttribPointer(position,
            2, // size: 2 components per iteration
            context.FLOAT, // type: the data is 32bit floats
            false, // normalize: don't normalize the data
            0, // stride: 0 = move forward size * sizeof(type) each iteration to get the next position
            0) // offset: start at the beginning of the buffer

        const color = context.getUniformLocation(program, "u_color")
        context.uniform4f(color, ..._tint, 1.0)
        context.drawArrays(context.TRIANGLES, // primitive type
            0, // offset
            3) //count
    }
}

function Game() {
    this.objects = []

    this.initialize = context => {
        this.objects.push(new Triangle([0, 0,
                                        0, 0.5,
                                        0.7, 0],
                                        [0.2, 0, 0.3, 1.0]))
        this.objects.push(new Triangle([-0.5, -0.5,
                                        -0.9, -0.5,
                                        -0.5, -0.8],
                                        [1.0, 1.0, 1.0, 1.0]))
        this.objects.push(new Triangle([-0.5, 0.9,
                                        -0.9, 0.9,
                                        -0.5, 0.2],
                                        [0.0, 0.0, 1.0, 1.0]))
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

