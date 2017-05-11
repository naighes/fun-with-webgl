const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const geometry = require('./geometry')
const glutils = require('./glutils')

function ColoredCube(camera, environment, size, position) {
    const cube = geometry.createCube(size)

    const r = [1.0, 0.0, 0.0, 1.0],
          g = [0.0, 1.0, 0.0, 1.0],
          b = [0.0, 0.0, 1.0, 1.0],
          w = [1.0, 1.0, 1.0, 1.0]

    const colors = [].concat(r, g, b, w, b, g,
                             b, w, g, r, g, w,
                             g, r, w, b, w, r,
                             w, b, r, g, r, b,
                             g, b, w, r, w, b,
                             w, b, g, b, w, r)

    let positionBuffer = null
    let colorBuffer = null
    let normalsBuffer = null
    let program = null
    let attributes = null
    let xRot = Math.PI
    let yRot = Math.PI

    this.initialize = (context, content) => {
        program = content.programs['colored-cube']
        positionBuffer = glutils.createBuffer(context,
            program,
            new Float32Array(cube.vertices),
            'a_position',
            3)
        colorBuffer = glutils.createBuffer(context,
            program,
            new Float32Array(colors),
            'a_color',
            4)
        normalsBuffer = glutils.createBuffer(context,
            program,
            new Float32Array(cube.normals),
            'a_normal',
            3)
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_worldInverseTranspose': context.getUniformLocation(program, 'u_worldInverseTranspose'),
            'u_worldViewProjection': context.getUniformLocation(program, 'u_worldViewProjection'),
            'u_lightWorldPosition': context.getUniformLocation(program, 'u_lightWorldPosition'),
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

        const translation = mat4.create()
        mat4.translate(translation, translation, position)

        const world = mat4.create()
        mat4.multiply(world, translation, rxry)

        const worldInverse = mat4.invert(mat4.create(), world)
        const worldInverseTranspose = mat4.transpose(mat4.create(), worldInverse);

        context.uniformMatrix4fv(attributes['u_world'], false, world)
        context.uniformMatrix4fv(attributes['u_worldInverseTranspose'], false, world)
        context.uniformMatrix4fv(attributes['u_worldViewProjection'], false, camera.getWorldViewProjection(context, world))
        context.uniform3fv(attributes['u_lightWorldPosition'], environment.getLightPosition())
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        positionBuffer.bind(context)
        colorBuffer.bind(context)
        normalsBuffer.bind(context)

        context.drawArrays(context.TRIANGLES,
            0,
            cube.vertices.length/3)
    }
}

module.exports = ColoredCube
