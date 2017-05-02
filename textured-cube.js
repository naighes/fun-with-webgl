const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const geometry = require('./geometry')

function TexturedCube(size, assetName) {
    const cube = geometry.createCube(size)
    const lightPosition = vec3.fromValues(20.0, 30.0, 50.0)

    let positionBuffer = null
    let textureBuffer = null
    let normalsBuffer = null
    let program = null
    let attributes = null
    let xRot = Math.PI
    let yRot = Math.PI
    let texture = null

    const createBuffer = (context, data) => {
        const buffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER, buffer)
        context.bufferData(context.ARRAY_BUFFER, data, context.STATIC_DRAW)

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
        positionBuffer = createBuffer(context, new Float32Array(cube.vertices))
        textureBuffer = createBuffer(context, new Float32Array(cube.textureCoords))
        normalsBuffer = createBuffer(context, new Float32Array(cube.normals))
        program = content.programs['textured-cube']
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_worldInverseTranspose': context.getUniformLocation(program, 'u_worldInverseTranspose'),
            'u_worldViewProjection': context.getUniformLocation(program, 'u_worldViewProjection'),
            'u_lightWorldPosition': context.getUniformLocation(program, 'u_lightWorldPosition'),
            'a_position': context.getAttribLocation(program, 'a_position'),
            'a_texcoord': context.getAttribLocation(program, 'a_texcoord'),
            'a_normal': context.getAttribLocation(program, 'a_normal'),
            'u_texture': context.getUniformLocation(program, 'u_texture')
        }

        texture = createAndBindTexture(context, content, assetName)
    }

    const createAndBindTexture = (context, content, assetName) => {
        const texture = context.createTexture()
        context.bindTexture(context.TEXTURE_2D, texture)
        context.texImage2D(context.TEXTURE_2D,
            0,
            context.RGBA,
            context.RGBA,
            context.UNSIGNED_BYTE,
            content.resources[assetName].content)
        context.generateMipmap(context.TEXTURE_2D)

        return texture
    }

    this.update = (context, time) => {
        context.useProgram(program)

        xRot += time.delta/2
        yRot += time.delta/6

        const rx = mat4.create()
        mat4.fromXRotation(rx, xRot)

        const ry = mat4.create()
        mat4.fromYRotation(ry, yRot)

        const rxry = mat4.create()
        mat4.multiply(rxry, rx, ry)

        const translation = vec3.create()
        vec3.set(translation, 0.55, -0.8, -2.0)
        const t = mat4.create()
        mat4.translate(t, t, translation)

        const world = mat4.create()
        mat4.multiply(world, t, rxry)

        const worldInverse = mat4.invert(mat4.create(), world)
        const worldInverseTranspose = mat4.transpose(mat4.create(), worldInverse);

        context.uniformMatrix4fv(attributes['u_world'],
            false,
            world)

        context.uniformMatrix4fv(attributes['u_worldInverseTranspose'],
            false,
            world)

        context.uniformMatrix4fv(attributes['u_worldViewProjection'],
            false,
            this.camera.getWorldViewProjection(context, world))

        context.uniform3fv(attributes['u_lightWorldPosition'],
            lightPosition)
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        sendData(context, positionBuffer, 3, 'a_position')
        sendData(context, textureBuffer, 2, 'a_texcoord')
        sendData(context, normalsBuffer, 3, 'a_normal')

        context.uniform1i(attributes['u_texture'], 0)
        context.activeTexture(context.TEXTURE0)
        context.bindTexture(context.TEXTURE_2D, texture)

        context.drawArrays(context.TRIANGLES, // primitive type
            0, // offset
            cube.vertices.length/3) // count
    }
}

module.exports = TexturedCube
