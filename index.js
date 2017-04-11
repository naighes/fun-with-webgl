window.onload = () => {
    wgl('view', 'fx/vs.fx', 'fx/fs.fx', new Game())
}

function Triangle(vertices) {
    let _vertices = vertices

    this.initialize = (context, program) => {
    }

    this.update = (context, program, time) => {
        const buffer = context.createBuffer()

        // bind the position buffer
        context.bindBuffer(context.ARRAY_BUFFER, buffer)
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(_vertices), context.STATIC_DRAW)

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
        context.uniform4f(color, 0.2, 0, 0.3, 1.0)
    }

    this.draw = (context, program, time) => {
        context.drawArrays(context.TRIANGLES, // primitive type
            0, // offset
            3) //count
    }
}

function Game() {
    this.objects = []

    this.initialize = (context, program) => {
        context.useProgram(program)
        this.objects.push(new Triangle([0, 0,
                                        0, 0.5,
                                        0.7, 0]))
    }

    this.update = (context, program, time) => {
    }

    this.draw = (context, program, time) => {
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

