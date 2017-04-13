function Triangle(vertices, tint) {
    let _positionBuffer = null
    let _colorBuffer = null

    const createBuffer = (context, data) => {
        const buffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER, buffer)
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW)

        return buffer
    }

    this.initialize = context => {
        _positionBuffer = createBuffer(context, vertices)
        _colorBuffer = createBuffer(context, tint)
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

        const world = mat4.create()
        const mvp = context.getUniformLocation(program, 'mvp')
        context.uniformMatrix4fv(mvp, false, this.camera.calculateModelViewProjection(context, world))
    }

    this.draw = (context, program, time) => {
        context.useProgram(program)

        sendData(context, program, _positionBuffer, 2, 'a_position')
        sendData(context, program, _colorBuffer, 4, 'a_color')

        context.drawArrays(context.TRIANGLE_STRIP, // primitive type
            0, // offset
            3) //count
    }
}