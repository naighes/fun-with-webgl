const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const glutils = require('./glutils')

function Square(camera, environment, size, assetName) {
    let attributes = null
    let positionBuffer = null
    let textureBuffer = null
    let program = null
    let texture = null

    const getTextureCoords = () => {
        return [0.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                1.0, 1.0,
                0.0, 0.0,
                1.0, 0.0]
    }

    const getVertices = () => {
        return [-1.0*size, -1.0*size, 0.0,
                +1.0*size, +1.0*size, 0.0,
                -1.0*size, +1.0*size, 0.0,
                +1.0*size, +1.0*size, 0.0,
                -1.0*size, -1.0*size, 0.0,
                +1.0*size, -1.0*size, 0.0]
    }

    this.initialize = (context, content) => {
        program = content.programs['square']
        positionBuffer = glutils.createArrayBuffer(context,
            program,
            new Float32Array(getVertices(environment)),
            (context, program) => context.getAttribLocation(program, 'a_position'),
            3)
        textureBuffer = glutils.createArrayBuffer(context,
            program,
            new Float32Array(getTextureCoords()),
            (context, program) => context.getAttribLocation(program, 'a_texcoord'),
            2)
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_view': context.getUniformLocation(program, 'u_view'),
            'u_projection': context.getUniformLocation(program, 'u_projection'),
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

        const world = mat4.create()

        context.uniformMatrix4fv(attributes['u_world'], false, world)
        context.uniformMatrix4fv(attributes['u_view'], false, camera.getView())
        context.uniformMatrix4fv(attributes['u_projection'], false, camera.getProjection(context))
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        positionBuffer.bind(context)
        textureBuffer.bind(context)

        context.uniform1i(attributes['u_texture'], 0)
        context.activeTexture(context.TEXTURE0)
        context.bindTexture(context.TEXTURE_2D, texture)

        context.drawArrays(context.TRIANGLE_STRIP, 0, 6)
    }
}

module.exports = Square
