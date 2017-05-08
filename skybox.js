const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const vec4 = glmatrix.vec4
const mat4 = glmatrix.mat4
const geometry = require('./geometry')

function Skybox(camera, size, waterHeight) {
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

        context.vertexAttribPointer(attribute,
            size,
            context.FLOAT,
            false,
            0,
            0)
    }

    this.initialize = (context, content) => {
        positionBuffer = createBuffer(context, new Float32Array(cube.vertices))
        program = content.programs['skybox']
        attributes = {
            'u_view': context.getUniformLocation(program, 'u_view'),
            'u_reflection_view': context.getUniformLocation(program, 'u_reflection_view'),
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_projection': context.getUniformLocation(program, 'u_projection'),
            'a_position': context.getAttribLocation(program, 'a_position'),
            'u_reflectionClipPlane': context.getUniformLocation(program, 'u_reflectionClipPlane'),
            'u_enableReflectionClipping': context.getUniformLocation(program, 'u_enableReflectionClipping')
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
        const position = camera.getPosition()
        mat4.translate(translation, translation, position)
        mat4.multiply(world, world, translation)

        context.uniformMatrix4fv(attributes['u_view'],
            false,
            camera.getView())

        context.uniformMatrix4fv(attributes['u_reflection_view'],
            false,
            getReflectionView())

        context.uniformMatrix4fv(attributes['u_world'],
            false,
            world)

        context.uniformMatrix4fv(attributes['u_projection'],
            false,
            camera.getProjection(context))

        context.uniform4fv(attributes['u_reflectionClipPlane'],
            vec4.fromValues(0.0, -1.0, 0.0, 1.0*waterHeight))
    }

    const getReflectionView = () => {
        const position = camera.getPosition()
        position[1] = -1.0*position[1]+waterHeight*2.0

        const target = camera.getTarget()
        target[1] = -1.0*target[1]+waterHeight*2.0

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
        this.drawSkybox(context, time)
    }

    this.drawSkybox = (context, time) => {
        context.useProgram(program)

        context.uniform1f(attributes['u_enableReflectionClipping'], 0)
        drawScene(context, time)
    }

    this.drawReflection = (context, time) => {
        context.useProgram(program)

        context.uniform1f(attributes['u_enableReflectionClipping'], 1)
        drawScene(context, time)
    }

    const drawScene = (context, time) => {
        // HACK: keeping CULL_FACE disabled (it
        // prevents skybox rendering)
        context.disable(context.CULL_FACE)
        context.disable(context.DEPTH_TEST)
        context.depthMask(false)

        context.bindTexture(context.TEXTURE_CUBE_MAP, texture)
        sendData(context, positionBuffer, 3, 'a_position')
        context.drawArrays(context.TRIANGLES,
            0,
            cube.vertices.length/3)

        context.depthMask(true)
        context.enable(context.DEPTH_TEST)
        context.enable(context.CULL_FACE)
    }
}

module.exports = Skybox
