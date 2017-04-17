function ColoredCube(size) {
    const xp = [1.0, 0.0, 0.0],
          xn = [-1.0, 0.0, 0.0],
          yp = [0.0, 1.0, 0.0],
          yn = [0.0, -1.0, 0.0],
          zp = [0.0, 0.0, -1.0],
          zn = [0.0, 0.0, 1.0]

    const oo = [0.0, 0.0],
          io = [1.0, 0.0],
          ii = [1.0, 1.0],
          oi = [0.0, 1.0]

    const normals = []
        .concat(zp, zp, zp,
                zp, zp, zp,
                xn, xn, xn,
                xn, xn, xn,
                zn, zn, zn,
                zn, zn, zn,
                xp, xp, xp,
                xp, xp, xp,
                yp, yp, yp,
                yp, yp, yp,
                yn, yn, yn,
                yn, yn, yn)

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

    const s = size/2

    const v1 = [-s, -s,  s],
          v2 = [ s, -s,  s],
          v3 = [ s,  s,  s],
          v4 = [-s,  s,  s],
          v5 = [-s, -s, -s],
          v6 = [ s, -s, -s],
          v7 = [ s,  s, -s],
          v8 = [-s,  s, -s]

    const vertices = []
    // front
        .concat(v2, v3, v1,
                v4, v1, v3,
    // left
                v1, v4, v5,
                v8, v5, v4,
    // back
                v5, v8, v6,
                v7, v6, v8,
    // right
                v6, v7, v2,
                v3, v2, v7,
    // top
                v3, v7, v4,
                v8, v4, v7,
    // bottom
                v5, v1, v6,
                v2, v6, v1)

    const lightDirection = vec3.normalize(vec3.create(), vec3.fromValues(0.5, 0.7, 1))

    let positionBuffer = null
    let colorBuffer = null
    let normalsBuffer = null
    let program = null
    let xRot = Math.PI
    let yRot = Math.PI

    const createBuffer = (context, data) => {
        const buffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER, buffer)
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW)

        return buffer
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

    this.initialize = (context, content) => {
        positionBuffer = createBuffer(context, vertices)
        colorBuffer = createBuffer(context, colors)
        normalsBuffer = createBuffer(context, normals)
        program = content.programs['colored-cube']
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

        context.uniformMatrix4fv(context.getUniformLocation(program, "u_world"),
            false,
            world)

        context.uniformMatrix4fv(context.getUniformLocation(program, 'u_worldViewProjection'),
            false,
            this.camera.calculateModelViewProjection(context, world))

        context.uniform3fv(context.getUniformLocation(program, "u_reverseLightDirection"),
            lightDirection)
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        sendData(context, program, positionBuffer, 3, 'a_position')
        sendData(context, program, colorBuffer, 4, 'a_color')
        sendData(context, program, normalsBuffer, 3, 'a_normal')

        context.drawArrays(context.TRIANGLES, // primitive type
            0, // offset
            vertices.length/3) // count
    }
}
