const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4

function Triangle(camera, vertices, tint) {
    let positionBuffer = null
    let colorBuffer = null
    let program = null

    const createBuffer = (context, data) => {
        const buffer = context.createBuffer()
        context.bindBuffer(context.ARRAY_BUFFER, buffer)
        context.bufferData(context.ARRAY_BUFFER, data, context.STATIC_DRAW)

        return buffer
    }

    const sendData = (context, program, buffer, size, name) => {
        context.bindBuffer(context.ARRAY_BUFFER, buffer)

        const attribute = context.getAttribLocation(program, name)
        context.enableVertexAttribArray(attribute)

        context.vertexAttribPointer(attribute,
            size,
            context.FLOAT,
            false,
            0,
            0)
    }

    this.initialize = (context, content) => {
        positionBuffer = createBuffer(context, new Float32Array(vertices))
        colorBuffer = createBuffer(context, new Float32Array(tint))
        program = content.programs['colored-triangle']
    }

    this.update = (context, time) => {
        context.useProgram(program)

        const world = mat4.create()

        context.uniformMatrix4fv(context.getUniformLocation(program, "u_world"), false, world)
        context.uniformMatrix4fv(context.getUniformLocation(program, 'u_worldViewProjection'), false, camera.getWorldViewProjection(context, world))
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        sendData(context, program, positionBuffer, 3, 'a_position')
        sendData(context, program, colorBuffer, 4, 'a_color')

        context.drawArrays(context.TRIANGLE_STRIP,
            0,
            3)
    }
}

module.exports = Triangle
