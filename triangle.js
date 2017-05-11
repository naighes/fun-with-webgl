const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const glutils = require('./glutils')

function Triangle(camera, vertices, tint) {
    let positionBuffer = null
    let colorBuffer = null
    let program = null

    this.initialize = (context, content) => {
        program = content.programs['colored-triangle']
        positionBuffer = glutils.createBuffer(context,
            program,
            new Float32Array(vertices),
            (context, program) => context.getAttribLocation(program, 'a_position'),
            3)
        colorBuffer = glutils.createBuffer(context,
            program,
            new Float32Array(tint),
            (context, program) => context.getAttribLocation(program, 'a_color'),
            4)
    }

    this.update = (context, time) => {
        context.useProgram(program)

        const world = mat4.create()

        context.uniformMatrix4fv(context.getUniformLocation(program, "u_world"), false, world)
        context.uniformMatrix4fv(context.getUniformLocation(program, 'u_worldViewProjection'), false, camera.getWorldViewProjection(context, world))
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        positionBuffer.bind(context)
        colorBuffer.bind(context)

        context.drawArrays(context.TRIANGLE_STRIP,
            0,
            3)
    }
}

module.exports = Triangle
