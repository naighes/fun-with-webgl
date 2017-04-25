const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4
const geometry = require('./geometry')

function Terrain(heightMapName) {
    let positionBuffer = null
    let indexBuffer = null
    let colorBuffer = null
    let normalsBuffer = null
    let program = null
    let attributes = null
    let terrain = null

    const lightDirection = vec3.normalize(vec3.create(), vec3.fromValues(0.5, 0.7, -1.0))

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

    const getColors = png => {
        let result = new Float32Array(png.getWidth()*png.getHeight()*4)

        for (let x = 0; x < png.getWidth(); x++) {
            for (let y = 0; y < png.getHeight(); y++) {
                const i = x*4+y*png.getWidth()*4
                const h = png.getPixel(x, y)[0]

                if (h < 50) {
                    result[i+0] = 0.0
                    result[i+1] = 0.0
                    result[i+2] = 1.0
                    result[i+3] = 1.0
                } else if (h >= 50 && h < 120) {
                    result[i+0] = 0.0
                    result[i+1] = 1.0
                    result[i+2] = 0.0
                    result[i+3] = 1.0
                } else if (h >= 120 && h < 210) {
                    result[i+0] = 1.0
                    result[i+1] = 0.0
                    result[i+2] = 0.0
                    result[i+3] = 1.0
                } else {
                    result[i+0] = 1.0
                    result[i+1] = 1.0
                    result[i+2] = 1.0
                    result[i+3] = 1.0
                }
            }
        }

        return result
    }

    this.initialize = (context, content) => {
        const heightmap = content.resources[heightMapName].content
        terrain = geometry.createTerrain(heightmap, 0.1, 0.5)
        positionBuffer = createBuffer(context,
            terrain.vertices,
            context.ARRAY_BUFFER)
        indexBuffer = createBuffer(context,
            terrain.indices,
            context.ELEMENT_ARRAY_BUFFER)
        normalsBuffer = createBuffer(context,
            terrain.normals,
            context.ARRAY_BUFFER)
        colorBuffer = createBuffer(context,
            getColors(heightmap),
            context.ARRAY_BUFFER)
        program = content.programs['terrain']
        attributes = {
            'u_world': context.getUniformLocation(program, 'u_world'),
            'u_worldInverseTranspose': context.getUniformLocation(program, 'u_worldInverseTranspose'),
            'u_worldViewProjection': context.getUniformLocation(program, 'u_worldViewProjection'),
            'u_reverseLightDirection': context.getUniformLocation(program, 'u_reverseLightDirection'),
            'a_position': context.getAttribLocation(program, 'a_position'),
            'a_color': context.getAttribLocation(program, 'a_color'),
            'a_normal': context.getAttribLocation(program, 'a_normal')
        }
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
    }

    this.draw = (context, time) => {
        context.useProgram(program)

        sendData(context, positionBuffer, 3, 'a_position')
        sendData(context, colorBuffer, 4, 'a_color')
        sendData(context, normalsBuffer, 3, 'a_normal')
        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer)
        context.drawElements(context.TRIANGLES,
            terrain.indices.length,
            context.UNSIGNED_SHORT,
            0)
    }
}

module.exports = Terrain
