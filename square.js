const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const glutils = require('./glutils')
const noise = require('./noise')

function Square(camera, environment, size) {
    let attributes = null
    let positionBuffer = null
    let textureBuffer = null
    let program = null
    let texture = null

    const createTexture = (context, width, height, data) => {
        const texture = context.createTexture()
        context.bindTexture(context.TEXTURE_2D, texture)
        context.texImage2D(context.TEXTURE_2D,
            0,
            context.RGBA,
            width,
            height,
            0,
            context.RGBA,
            context.UNSIGNED_BYTE,
            data)
        context.texParameteri(context.TEXTURE_2D,
            context.TEXTURE_MAG_FILTER,
            context.NEAREST)
        context.texParameteri(context.TEXTURE_2D,
            context.TEXTURE_MIN_FILTER,
            context.NEAREST)

        return texture
    }

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

        texture = createNoiseTexture(context,
            128,
            s => noise.clouds(s,
                () => Math.random(),
                16.0))
    }

    const createNoiseTexture = (context, size, noise) => {
        const data = noise(size).reduce((a, b) => {
            return a.concat(b)
        }, [])
        return createTexture(context,
            size,
            size,
            new Uint8Array(data))
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
