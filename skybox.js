const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const geometry = require('./geometry')

function Skybox(size) {
    const cube = geometry.createSkybox(size)

    let positionBuffer = null
    let program = null
    let attributes = null
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
        program = content.programs['skybox']
        attributes = {
            'u_view': context.getUniformLocation(program, 'u_view'),
            'u_viewInverse': context.getUniformLocation(program, 'u_viewInverse'),
            'u_projection': context.getUniformLocation(program, 'u_projection'),
            'a_position': context.getAttribLocation(program, 'a_position')
        }

        texture = createAndBindTexture(context, content)
    }

    const createAndBindTexture = (context, content) => {
        let targets = { }
        targets[context.TEXTURE_CUBE_MAP_POSITIVE_X] = content.resources['skybox_xp'].content
        targets[context.TEXTURE_CUBE_MAP_NEGATIVE_X] = content.resources['skybox_xn'].content
        targets[context.TEXTURE_CUBE_MAP_POSITIVE_Y] = content.resources['skybox_yp'].content
        targets[context.TEXTURE_CUBE_MAP_NEGATIVE_Y] = content.resources['skybox_yn'].content
        targets[context.TEXTURE_CUBE_MAP_POSITIVE_Z] = content.resources['skybox_zp'].content
        targets[context.TEXTURE_CUBE_MAP_NEGATIVE_Z] = content.resources['skybox_zn'].content

        texture = context.createTexture()
        context.bindTexture(context.TEXTURE_CUBE_MAP, texture)

        context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MIN_FILTER, context.LINEAR)
        context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_MAG_FILTER, context.LINEAR)

        context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE)
        context.texParameteri(context.TEXTURE_CUBE_MAP, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE)

        Object.keys(targets).forEach(key => {
            context.texImage2D(key, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, targets[key])
        })

        context.generateMipmap(context.TEXTURE_CUBE_MAP)

        return texture
    }

    this.update = (context, time) => {
        context.useProgram(program)

        const world = mat4.create()

        const translation = mat4.create()
        const position = this.camera.getPosition()
        mat4.translate(translation, translation, position)
        mat4.multiply(world, world, translation)

        const view = this.camera.getWorldView(world)
        context.uniformMatrix4fv(attributes['u_view'],
            false,
            view)

        const viewInverse = mat4.create()
        mat4.invert(viewInverse, view)
        context.uniformMatrix4fv(attributes['u_viewInverse'],
            false,
            viewInverse)

        const projection = this.camera.getProjection(context)
        context.uniformMatrix4fv(attributes['u_projection'],
            false,
            projection)
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        // HACK: keeping CULL_FACE disabled (it
        // prevents skybox rendering)
        context.disable(context.CULL_FACE)
        context.disable(context.DEPTH_TEST)
        context.depthMask(false)

        context.bindTexture(context.TEXTURE_CUBE_MAP, texture)
        sendData(context, positionBuffer, 3, 'a_position')
        context.drawArrays(context.TRIANGLES, // primitive type
            0, // offset
            cube.vertices.length/3) // count

        context.depthMask(true)
        context.enable(context.DEPTH_TEST)
        context.enable(context.CULL_FACE)
    }
}

module.exports = Skybox
