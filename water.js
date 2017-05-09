const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4

function Water(camera, environment, terrain, assetName) {
    let attributes = null
    let positionBuffer = null
    let textureBuffer = null
    let program = null
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

        context.vertexAttribPointer(attribute,
            size,
            context.FLOAT,
            false,
            0,
            0)
    }

    const getTextureCoords = () => {
        return [0.0, 1.0,
                1.0, 0.0,
                0.0, 0.0,
                0.0, 1.0,
                1.0, 1.0,
                1.0, 0.0]
    }

    const getVertices = (content) => {
        const h = environment.getWaterHeight()
        const w = terrain.getWidth(content)
        const l = terrain.getLength(content)
        return [0.0, h,  0.0  ,
                w  , h, -1.0*l,
                0.0, h, -1.0*l,
                0.0, h,  0.0  ,
                w  , h,  0.0  ,
                w  , h, -1.0*l]
    }

    this.initialize = (context, content) => {
        positionBuffer = createBuffer(context, new Float32Array(getVertices(content)))
        textureBuffer = createBuffer(context, new Float32Array(getTextureCoords()))
        program = content.programs['water']
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_worldViewProjection': context.getUniformLocation(program, 'u_worldViewProjection'),
            'u_view': context.getUniformLocation(program, 'u_view'),
            'u_reflection_view': context.getUniformLocation(program, 'u_reflection_view'),
            'u_projection': context.getUniformLocation(program, 'u_projection'),
            'a_position': context.getAttribLocation(program, 'a_position'),
            'a_texcoord': context.getAttribLocation(program, 'a_texcoord'),
            'u_reflection_texture': context.getUniformLocation(program, 'u_reflection_texture'),
            'u_refraction_texture': context.getUniformLocation(program, 'u_refraction_texture'),
            'u_waves_texture': context.getUniformLocation(program, 'u_waves_texture'),
            'u_camera_position': context.getUniformLocation(program, 'u_camera_position'),
            'u_time': context.getUniformLocation(program, 'u_time')
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
        context.uniformMatrix4fv(attributes['u_worldViewProjection'], false, camera.getWorldViewProjection(context, world))

        context.uniformMatrix4fv(attributes['u_view'],
            false,
            camera.getView())

        context.uniformMatrix4fv(attributes['u_reflection_view'],
            false,
            getReflectionView())

        context.uniformMatrix4fv(attributes['u_projection'],
            false,
            camera.getProjection(context))

        context.uniform3fv(attributes['u_camera_position'],
            camera.getPosition())

        context.uniform1f(attributes['u_time'],
            time.totalGameTime)
    }

    const getReflectionView = () => {
        const wh = environment.getWaterHeight()
        const position = camera.getPosition()
        position[1] = -1.0*position[1]+wh*2.0
        const target = camera.getTarget()
        target[1] = -1.0*target[1]+wh*2.0

        const right = vec3.transformMat4(vec3.create(),
            vec3.fromValues(1.0, 0.0, 0.0),
            camera.getRotation())
        let up = vec3.cross(vec3.create(),
            right,
            vec3.subtract(vec3.create(), target, position))
        vec3.normalize(up, up)

        return mat4.lookAt(mat4.create(),
            position,
            target,
            up)
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        sendData(context, positionBuffer, 3, 'a_position')
        sendData(context, textureBuffer, 2, 'a_texcoord')

        context.uniform1i(attributes['u_reflection_texture'], 0)
        context.activeTexture(context.TEXTURE0)
        context.bindTexture(context.TEXTURE_2D,
            terrain.getReflectionTexture())

        context.uniform1i(attributes['u_refraction_texture'], 1)
        context.activeTexture(context.TEXTURE1)
        context.bindTexture(context.TEXTURE_2D,
            terrain.getRefractionTexture())

        context.uniform1i(attributes['u_waves_texture'], 2)
        context.activeTexture(context.TEXTURE2)
        context.bindTexture(context.TEXTURE_2D, texture)

        context.drawArrays(context.TRIANGLE_STRIP,
            0,
            6)
    }
}

module.exports = Water
