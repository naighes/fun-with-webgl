function TexturedCube(size) {
    this.shaderName = 'textured'

    const r = [0.0, 0.0], g = [1.0, 0.0], b = [1.0, 1.0], w = [0.0, 1.0]
    const textureCoords = [].concat(r, g, b, w, b, g,
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

    let _positionBuffer = null
    let _textureBuffer = null
    let _mvp = null
    let _xRot = Math.PI
    let _yRot = Math.PI

    const createBuffer = (context, data) => {
        const buffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER, buffer)
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(data), context.STATIC_DRAW)

        return buffer
    }

    this.initialize = context => {
        _positionBuffer = createBuffer(context, vertices)
        _textureBuffer = createBuffer(context, textureCoords)
    }

    this.update = (context, program, time) => {
        _xRot += time.delta
        _yRot += time.delta/3

        const rx = mat4.create()
        mat4.fromXRotation(rx, _xRot)

        const ry = mat4.create()
        mat4.fromYRotation(ry, _yRot)

        const rxry = mat4.create()
        mat4.multiply(rxry, rx, ry)

        const translation = vec3.create()
        vec3.set(translation, 0.7, -1.0, -2.0)
        const t = mat4.create()
        mat4.translate(t, t, translation)

        const world = mat4.create()
        mat4.multiply(world, t, rxry)

        _mvp = this.camera.calculateModelViewProjection(context, world)
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

        sendData(context, program, _positionBuffer, 3, 'a_position')
        sendData(context, program, _textureBuffer, 2, 'a_texcoord')

        // create a texture.
        const texture = context.createTexture()
        context.bindTexture(context.TEXTURE_2D, texture)

        // fill the texture with a 1x1 blue pixel.
        context.texImage2D(context.TEXTURE_2D,
            0,
            context.RGBA,
            1,
            1,
            0,
            context.RGBA,
            context.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]))

        const mvp = context.getUniformLocation(program, 'mvp')
        context.uniformMatrix4fv(mvp, false, _mvp)

        context.drawArrays(context.TRIANGLES, // primitive type
            0, // offset
            vertices.length/3) // count
    }
}
