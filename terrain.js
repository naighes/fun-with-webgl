const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const geometry = require('./geometry')

function Terrain(heightMapName, textureAssetName) {
    let positionBuffer = null
    let indexBuffer = null
    let textureBuffer = null
    let normalsBuffer = null
    let program = null
    let attributes = null
    let terrain = null
    let texture = null

    const lightDirection = vec3.normalize(vec3.create(), vec3.fromValues(0.5, 0.7, -1.0))
    const ambientLight = vec3.fromValues(0.8, 0.8, 0.8)

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
        textureBuffer = createBuffer(context,
            terrain.textureCoords,
            context.ARRAY_BUFFER)
        program = content.programs['terrain']
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_worldInverseTranspose': context.getUniformLocation(program, 'u_worldInverseTranspose'),
            'u_worldViewProjection': context.getUniformLocation(program, 'u_worldViewProjection'),
            'u_reverseLightDirection': context.getUniformLocation(program, 'u_reverseLightDirection'),
            'u_ambientLight': context.getUniformLocation(program, 'u_ambientLight'),
            'a_position': context.getAttribLocation(program, 'a_position'),
            'a_texcoord': context.getAttribLocation(program, 'a_texcoord'),
            'a_normal': context.getAttribLocation(program, 'a_normal')
        }

        texture = createAndBindTexture(context, content, textureAssetName)
    }

    const createAndBindTexture = (context, content, assetName) => {
        texture = context.createTexture()
        context.bindTexture(context.TEXTURE_2D, texture)
        context.texImage2D(context.TEXTURE_2D,
            0,
            context.RGBA,
            context.RGBA,
            context.UNSIGNED_BYTE,
            content.resources[textureAssetName].content)
        context.generateMipmap(context.TEXTURE_2D)

        return texture
    }

    let world = mat4.create()

    this.update = (context, time) => {
        context.useProgram(program)

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

        context.uniform3fv(attributes['u_reverseLightDirection'],
            lightDirection)

        context.uniform3fv(attributes['u_ambientLight'],
            ambientLight)
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        sendData(context, positionBuffer, 3, 'a_position')
        sendData(context, textureBuffer, 2, 'a_texcoord')
        sendData(context, normalsBuffer, 3, 'a_normal')
        context.bindTexture(context.TEXTURE_2D, texture)

        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer)
        context.drawElements(context.TRIANGLES,
            terrain.indices.length,
            context.UNSIGNED_SHORT,
            0)
    }
}

module.exports = Terrain
