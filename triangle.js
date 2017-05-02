const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4

function Triangle(vertices, tint) {
    let positionBuffer = null
    let colorBuffer = null
    let program = null

    const lightDirection = vec3.normalize(vec3.create(), vec3.fromValues(0.5, 0.7, 1))

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
        colorBuffer = createBuffer(context, tint)
        program = content.programs['colored-triangle']
    }

    this.update = (context, time) => {
        context.useProgram(program)

        const world = mat4.create()

        context.uniformMatrix4fv(context.getUniformLocation(program, "u_world"),
            false,
            world)

        context.uniformMatrix4fv(context.getUniformLocation(program, 'u_worldViewProjection'),
            false,
            this.camera.getWorldViewProjection(context, world))

        context.uniform3fv(context.getUniformLocation(program, "u_reverseLightDirection"),
            lightDirection)
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        sendData(context, program, positionBuffer, 2, 'a_position')
        sendData(context, program, colorBuffer, 4, 'a_color')

        context.drawArrays(context.TRIANGLE_STRIP, // primitive type
            0, // offset
            3) //count
    }
}

module.exports = Triangle
