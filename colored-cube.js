function ColoredCube(size) {
    const cube = createCube(size)

    const r = [1.0, 0.0, 0.0, 1.0],
          g = [0.0, 1.0, 0.0, 1.0],
          b = [0.0, 0.0, 1.0, 1.0],
          w = [1.0, 1.0, 1.0, 1.0]

    const colors = [].concat(r, g, b, w, b, g,
                             b, w, g, r, g, w,
                             g, r, w, b, w, r,
                             w, b, r, g, r, b,
                             g, b, w, r, w, b,
                             g, b, w, r, w, b)

    const lightDirection = vec3.normalize(vec3.create(), vec3.fromValues(0.5, 0.7, 1))

    let positionBuffer = null
    let colorBuffer = null
    let normalsBuffer = null
    let program = null
    let attributes = null
    let xRot = Math.PI
    let yRot = Math.PI

    const createBuffer = (context, data) => {
        const buffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER, buffer)
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW)

        return buffer
    }

    const sendData = (context, buffer, size, name) => {
        context.bindBuffer(context.ARRAY_BUFFER, buffer)

        const attribute = attributes[name]
        context.enableVertexAttribArray(attribute)

        // tell the attribute how to get data out of buffer (ARRAY_BUFFER)
        context.vertexAttribPointer(attribute,
            size, // size: # of components per iteration
            context.FLOAT, // type: the data is 32bit floats
            false, // normalize: don't normalize the data
            0, // stride: 0 = move forward size * sizeof(type) each iteration to get the next position
            0) // offset: start at the beginning of the buffer
    }

    this.initialize = (context, content) => {
        positionBuffer = createBuffer(context, cube.vertices)
        colorBuffer = createBuffer(context, colors)
        normalsBuffer = createBuffer(context, cube.normals)
        program = content.programs['colored-cube']
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_worldViewProjection': context.getUniformLocation(program, 'u_worldViewProjection'),
            'u_reverseLightDirection': context.getUniformLocation(program, 'u_reverseLightDirection'),
            'a_position': context.getAttribLocation(program, 'a_position'),
            'a_color': context.getAttribLocation(program, 'a_color'),
            'a_normal': context.getAttribLocation(program, 'a_normal')
        }
    }

    this.update = (context, time) => {
        context.useProgram(program)

        xRot += time.delta
        yRot += time.delta/3

        const rx = mat4.create()
        mat4.fromXRotation(rx, xRot)

        const ry = mat4.create()
        mat4.fromYRotation(ry, yRot)

        const rxry = mat4.create()
        mat4.multiply(rxry, rx, ry)

        const translation = vec3.create()
        vec3.set(translation, -1.1, 0.0, 0.0)
        const t = mat4.create()
        mat4.translate(t, t, translation)

        const world = mat4.create()
        mat4.multiply(world, t, rxry)

        context.uniformMatrix4fv(attributes['u_world'],
            false,
            world)

        context.uniformMatrix4fv(attributes['u_worldViewProjection'],
            false,
            this.camera.calculateModelViewProjection(context, world))

        context.uniform3fv(attributes['u_reverseLightDirection'],
            lightDirection)
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        sendData(context, positionBuffer, 3, 'a_position')
        sendData(context, colorBuffer, 4, 'a_color')
        sendData(context, normalsBuffer, 3, 'a_normal')

        context.drawArrays(context.TRIANGLES, // primitive type
            0, // offset
            cube.vertices.length/3) // count
    }
}
