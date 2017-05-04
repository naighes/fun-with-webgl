const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const vec4 = glmatrix.vec4
const mat4 = glmatrix.mat4
const geometry = require('./geometry')

function Terrain(camera, heightMapName, assets, waterHeight) {
    let positionBuffer = null
    let indexBuffer = null
    let textureBuffer = null
    let normalsBuffer = null
    let weightBuffer = null

    let refraction = null
    let reflection = null

    let program = null
    let attributes = null
    let terrain = null
    let textures = null

    const lightPosition = vec3.normalize(vec3.create(), vec3.fromValues(1.0, 0.3, -1.0))
    const ambientLight = vec3.fromValues(1.0, 0.549, 0.0)

    const createBuffer = (context, data, target) => {
        const buffer = context.createBuffer()
        context.bindBuffer(target, buffer)
        context.bufferData(target, data, context.STATIC_DRAW)

        return buffer
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

    const initializeRenderBuffer = context => {
        const createFrameBuffer = context => {
            const buffer = context.createFramebuffer()
            context.bindFramebuffer(context.FRAMEBUFFER, buffer)

            return buffer
        }

        const createRenderBuffer = context => {
            const buffer = context.createRenderbuffer()
            context.bindRenderbuffer(context.RENDERBUFFER, buffer)
            context.renderbufferStorage(context.RENDERBUFFER,
                context.DEPTH_COMPONENT16,
                context.canvas.width,
                context.canvas.height)

            return buffer
        }

        const createRenderBufferTexture = context => {
            const texture = context.createTexture()
            context.bindTexture(context.TEXTURE_2D, texture)

            context.texParameteri(context.TEXTURE_2D,
                context.TEXTURE_MIN_FILTER,
                context.LINEAR);
            context.texParameteri(context.TEXTURE_2D,
                context.TEXTURE_MAG_FILTER,
                context.LINEAR)
            context.texParameteri(context.TEXTURE_2D,
                context.TEXTURE_WRAP_S,
                context.CLAMP_TO_EDGE);
            context.texParameteri(context.TEXTURE_2D,
                context.TEXTURE_WRAP_T,
                context.CLAMP_TO_EDGE);

            context.texImage2D(context.TEXTURE_2D,
                0,
                context.RGBA,
                context.canvas.width,
                context.canvas.height,
                0,
                context.RGBA,
                context.UNSIGNED_BYTE,
                null)

            return texture
        }

        const result = {
            frameBuffer: createFrameBuffer(context),
            renderBuffer: createRenderBuffer(context),
            texture: createRenderBufferTexture(context)
        }

        context.framebufferTexture2D(context.FRAMEBUFFER,
            context.COLOR_ATTACHMENT0,
            context.TEXTURE_2D,
            result.texture,
            0)
        context.framebufferRenderbuffer(context.FRAMEBUFFER,
            context.DEPTH_ATTACHMENT,
            context.RENDERBUFFER,
            result.renderBuffer)

        context.bindTexture(context.TEXTURE_2D, null)
        context.bindRenderbuffer(context.RENDERBUFFER, null)
        context.bindFramebuffer(context.FRAMEBUFFER, null)

        return result
    }

    this.initialize = (context, content) => {
        const heightmap = content.resources[heightMapName].content
        terrain = geometry.createTerrain(heightmap, 0.1, 1.0)
        positionBuffer = createBuffer(context,
            terrain.vertices,
            context.ARRAY_BUFFER)
        indexBuffer = createBuffer(context,
            terrain.indices,
            context.ELEMENT_ARRAY_BUFFER)
        normalsBuffer = createBuffer(context,
            terrain.normals,
            context.ARRAY_BUFFER)
        weightBuffer = createBuffer(context,
            terrain.weights,
            context.ARRAY_BUFFER)
        textureBuffer = createBuffer(context,
            terrain.textureCoords,
            context.ARRAY_BUFFER)

        refraction = initializeRenderBuffer(context)
        reflection = initializeRenderBuffer(context)

        program = content.programs['terrain']
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_worldInverseTranspose': context.getUniformLocation(program, 'u_worldInverseTranspose'),
            'u_view': context.getUniformLocation(program, 'u_view'),
            'u_projection': context.getUniformLocation(program, 'u_projection'),
            'u_lightPosition': context.getUniformLocation(program, 'u_lightPosition'),
            'u_ambientLight': context.getUniformLocation(program, 'u_ambientLight'),
            'u_refractionClipPlane': context.getUniformLocation(program, 'u_refractionClipPlane'),
            'u_enableRefractionClipping': context.getUniformLocation(program, 'u_enableRefractionClipping'),
            'u_reflectionClipPlane': context.getUniformLocation(program, 'u_reflectionClipPlane'),
            'u_enableReflectionClipping': context.getUniformLocation(program, 'u_enableReflectionClipping'),
            'a_position': context.getAttribLocation(program, 'a_position'),
            'a_texcoord': context.getAttribLocation(program, 'a_texcoord'),
            'a_normal': context.getAttribLocation(program, 'a_normal'),
            'a_weight': context.getAttribLocation(program, 'a_weight')
        }

        textures = [{
            texture: createAndBindTexture(context, content, assets.sand),
            location: context.getUniformLocation(program, 'u_sand_texture'),
            index: context.TEXTURE0
        }, {
            texture: createAndBindTexture(context, content, assets.grass),
            location: context.getUniformLocation(program, 'u_grass_texture'),
            index: context.TEXTURE1
        }, {
            texture: createAndBindTexture(context, content, assets.rock),
            location: context.getUniformLocation(program, 'u_rock_texture'),
            index: context.TEXTURE2
        }, {
            texture: createAndBindTexture(context, content, assets.snow),
            location: context.getUniformLocation(program, 'u_snow_texture'),
            index: context.TEXTURE3
        }]
    }

    this.update = (context, time) => {
        context.useProgram(program)

        const world = mat4.create()
        context.uniformMatrix4fv(attributes['u_world'], false, world)

        const worldInverse = mat4.invert(mat4.create(), world)
        const worldInverseTranspose = mat4.transpose(mat4.create(), worldInverse)
        context.uniformMatrix4fv(attributes['u_worldInverseTranspose'], false, worldInverseTranspose)

        const view = camera.getView()
        context.uniformMatrix4fv(attributes['u_view'], false, view)

        const projection = camera.getProjection(context)
        context.uniformMatrix4fv(attributes['u_projection'], false, projection)

        context.uniform4fv(attributes['u_refractionClipPlane'],
            vec4.fromValues(0.0, 1.0, 0.0, -1.0*waterHeight))

        context.uniform4fv(attributes['u_reflectionClipPlane'],
            vec4.fromValues(0.0, 1.0, 0.0, -1.0*waterHeight))

        context.uniform3fv(attributes['u_lightPosition'], lightPosition)
        context.uniform3fv(attributes['u_ambientLight'], ambientLight)
    }

    this.draw = (context, time) => {
        this.drawTerrain(context, time)
    }

    this.drawTerrain = (context, time) => {
        context.useProgram(program)

        context.uniform1f(attributes['u_enableRefractionClipping'], 0)
        context.uniform1f(attributes['u_enableReflectionClipping'], 0)
        drawScene(context, time)
    }

    this.drawRefraction = (context, time) => {
        context.useProgram(program)

        context.uniform1f(attributes['u_enableRefractionClipping'], 1)
        context.uniform1f(attributes['u_enableReflectionClipping'], 0)
        context.bindFramebuffer(context.FRAMEBUFFER, refraction.frameBuffer)
        drawScene(context, time)
        context.bindFramebuffer(context.FRAMEBUFFER, null)
    }

    this.drawReflection = (context, time) => {
        context.useProgram(program)

        context.uniform1f(attributes['u_enableRefractionClipping'], 0)
        context.uniform1f(attributes['u_enableReflectionClipping'], 1)
        context.bindFramebuffer(context.FRAMEBUFFER, reflection.frameBuffer)
        drawScene(context, time)
        context.bindFramebuffer(context.FRAMEBUFFER, null)
    }

    const drawScene = (context, time) => {
        sendData(context, positionBuffer, 3, 'a_position')
        sendData(context, textureBuffer, 2, 'a_texcoord')
        sendData(context, normalsBuffer, 3, 'a_normal')
        sendData(context, weightBuffer, 4, 'a_weight')

        textures.forEach((item, i) => {
            context.uniform1i(item.location, i)
            context.activeTexture(item.index)
            context.bindTexture(context.TEXTURE_2D, item.texture)
        })

        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer)
        context.drawElements(context.TRIANGLES,
            terrain.indices.length,
            context.UNSIGNED_SHORT,
            0)
    }
}

module.exports = Terrain
