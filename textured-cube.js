const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const geometry = require('./geometry')
const glutils = require('./glutils')

function TexturedCube(camera, environment, size, position, assetName) {
    const cube = geometry.createCube(size)

    let positionBuffer = null
    let textureBuffer = null
    let normalsBuffer = null
    let program = null
    let attributes = null
    let xRot = Math.PI
    let yRot = Math.PI
    let texture = null

    this.initialize = (context, content) => {
        program = content.programs['textured-cube']
        positionBuffer = glutils.createBuffer(context,
            program,
            new Float32Array(cube.vertices),
            (context, program) => context.getAttribLocation(program, 'a_position'),
            3)
        textureBuffer = glutils.createBuffer(context,
            program,
            new Float32Array(cube.textureCoords),
            (context, program) => context.getAttribLocation(program, 'a_texcoord'),
            2)
        normalsBuffer = glutils.createBuffer(context,
            program,
            new Float32Array(cube.normals),
            (context, program) => context.getAttribLocation(program, 'a_normal'),
            3)
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_worldInverseTranspose': context.getUniformLocation(program, 'u_worldInverseTranspose'),
            'u_worldViewProjection': context.getUniformLocation(program, 'u_worldViewProjection'),
            'u_lightWorldPosition': context.getUniformLocation(program, 'u_lightWorldPosition'),
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
        textureBuffer.bind(context)
        normalsBuffer.bind(context)

        context.uniform1i(attributes['u_texture'], 0)
        context.activeTexture(context.TEXTURE0)
        context.bindTexture(context.TEXTURE_2D, texture)

        context.drawArrays(context.TRIANGLES,
            0,
            cube.vertices.length/3)
    }
}

module.exports = TexturedCube
