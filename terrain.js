const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4

function Terrain(heightMapName) {
    const lightPosition = vec3.fromValues(20.0, 30.0, 50.0)

    let positionBuffer = null
    let normalsBuffer = null
    let program = null
    let attributes = null
    let heightMap = null

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
        positionBuffer = createBuffer(context, [0, 0.5,
                                                0, 1.0,
                                                0.7, 0.5])
        normalsBuffer = createBuffer(context, [0.0, 0.0, 1.0,0.0, 0.0, 1.0,0.0, 0.0, 1.0])
        program = content.programs['terrain']
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_worldInverseTranspose': context.getUniformLocation(program, 'u_worldInverseTranspose'),
            'u_worldViewProjection': context.getUniformLocation(program, 'u_worldViewProjection'),
            'u_lightWorldPosition': context.getUniformLocation(program, 'u_lightWorldPosition'),
            'a_position': context.getAttribLocation(program, 'a_position'),
            'a_normal': context.getAttribLocation(program, 'a_normal')
        }
        heightMap = content.resources['heightmap']
    }

    this.update = (context, time) => {
        context.useProgram(program)

        const world = mat4.create()
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
            this.camera.calculateModelViewProjection(context, world))

        context.uniform3fv(attributes['u_lightWorldPosition'],
            lightPosition)
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        sendData(context, positionBuffer, 2, 'a_position')
        sendData(context, normalsBuffer, 3, 'a_normal')

        context.drawArrays(context.TRIANGLES, // primitive type
            0, // offset
            3) // count
    }
}

module.exports = Terrain
