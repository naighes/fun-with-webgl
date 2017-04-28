const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const geometry = require('./geometry')

function Terrain(heightMapName, assets) {
    let positionBuffer = null
    let indexBuffer = null
    let textureBuffer = null
    let normalsBuffer = null
    let weightBuffer = null
    let program = null
    let attributes = null
    let terrain = null
    let sandTexture = null
    let grassTexture = null
    let rockTexture = null
    let snowTexture = null

    const lightPosition = vec3.normalize(vec3.create(), vec3.fromValues(1.0, 0.3, -1.0))
    const ambientLight = vec3.fromValues(1.0, 0.549, 0.0)

    const createBuffer = (context, data, target) => {
        const buffer = context.createBuffer()
        context.bindBuffer(target, buffer)
        context.bufferData(target, data, context.STATIC_DRAW)

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
        program = content.programs['terrain']
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_worldInverseTranspose': context.getUniformLocation(program, 'u_worldInverseTranspose'),
            'u_worldViewProjection': context.getUniformLocation(program, 'u_worldViewProjection'),
            'u_lightPosition': context.getUniformLocation(program, 'u_lightPosition'),
            'u_ambientLight': context.getUniformLocation(program, 'u_ambientLight'),
            'a_position': context.getAttribLocation(program, 'a_position'),
            'a_texcoord': context.getAttribLocation(program, 'a_texcoord'),
            'a_normal': context.getAttribLocation(program, 'a_normal'),
            'a_weight': context.getAttribLocation(program, 'a_weight'),
            'u_sand_texture': context.getUniformLocation(program, 'u_sand_texture'),
            'u_grass_texture': context.getUniformLocation(program, 'u_grass_texture'),
            'u_rock_texture': context.getUniformLocation(program, 'u_rock_texture'),
            'u_snow_texture': context.getUniformLocation(program, 'u_snow_texture')
        }

        sandTexture = createAndBindTexture(context, content, assets.sand)
        grassTexture = createAndBindTexture(context, content, assets.grass)
        rockTexture = createAndBindTexture(context, content, assets.rock)
        snowTexture = createAndBindTexture(context, content, assets.snow)
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
        const worldInverse = mat4.invert(mat4.create(), world)
        const worldInverseTranspose = mat4.transpose(mat4.create(), worldInverse)

        context.uniformMatrix4fv(attributes['u_world'],
            false,
            world)

        context.uniformMatrix4fv(attributes['u_worldInverseTranspose'],
            false,
            world)

        context.uniformMatrix4fv(attributes['u_worldViewProjection'],
            false,
            this.camera.calculateModelViewProjection(context, world))

        context.uniform3fv(attributes['u_lightPosition'],
            lightPosition)

        context.uniform3fv(attributes['u_ambientLight'],
            ambientLight)
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        sendData(context, positionBuffer, 3, 'a_position')
        sendData(context, textureBuffer, 2, 'a_texcoord')
        sendData(context, normalsBuffer, 3, 'a_normal')
        sendData(context, weightBuffer, 4, 'a_weight')

        context.uniform1i(attributes['u_sand_texture'], 0)
        context.uniform1i(attributes['u_grass_texture'], 1)
        context.uniform1i(attributes['u_rock_texture'], 2)
        context.uniform1i(attributes['u_snow_texture'], 3)

        context.activeTexture(context.TEXTURE0)
        context.bindTexture(context.TEXTURE_2D, sandTexture)

        context.activeTexture(context.TEXTURE1)
        context.bindTexture(context.TEXTURE_2D, grassTexture)

        context.activeTexture(context.TEXTURE2)
        context.bindTexture(context.TEXTURE_2D, rockTexture)

        context.activeTexture(context.TEXTURE3)
        context.bindTexture(context.TEXTURE_2D, snowTexture)

        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer)
        context.drawElements(context.TRIANGLES,
            terrain.indices.length,
            context.UNSIGNED_SHORT,
            0)
    }
}

module.exports = Terrain
