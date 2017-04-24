const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const mat4 = glmatrix.mat4

function Terrain(heightMapName) {
    let positionBuffer = null
    let indexBuffer = null
    let colorBuffer = null
    let normalsBuffer = null
    let program = null
    let attributes = null
    let vertices = null
    let indices = null

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

    const getVertices = png => {
        const heightFactor = 0.1
        const sizeFactor = 0.5
        let result = new Float32Array(png.getWidth()*png.getHeight()*3)

        for (let x = 0; x < png.getWidth(); x++) {
            for (let y = 0; y < png.getHeight(); y++) {
                const w = (x-(png.getWidth()/2))*sizeFactor
                const h = (png.getPixel(x, y)[0]-127)*heightFactor
                const d = -1.0*(y-(png.getHeight()/2))*sizeFactor
                const i = x*3+y*png.getWidth()*3
                result[i+0] = w
                result[i+1] = h
                result[i+2] = d
            }
        }

        return result
    }

    const getIndices = png => {
        let result = new Uint16Array((png.getWidth()-1)*(png.getHeight()-1)*6)
        let counter = 0

        for (let y = 0; y < png.getHeight()-1; y++) {
            for (let x = 0; x < png.getWidth()-1; x++) {
                const lowerLeft = x+y*png.getWidth()
                const lowerRight = (x+1)+y*png.getWidth()
                const topLeft = x+(y+1)*png.getWidth()
                const topRight = (x+1)+(y+1)*png.getWidth()

                result[counter++] = lowerLeft
                result[counter++] = lowerRight
                result[counter++] = topLeft

                result[counter++] = lowerRight
                result[counter++] = topRight
                result[counter++] = topLeft
            }
        }

        return result
    }

    const getNormals = (vertices, indices) => {
        const getVec3 = (vertices, index) => vec3.fromValues(vertices[index*3+0],
                                                             vertices[index*3+1],
                                                             vertices[index*3+2])

        const setNormal = (result, index, normal) => {
            result[index*3+0] = normal[0]
            result[index*3+1] = normal[1]
            result[index*3+2] = normal[2]
        }

        const result = new Float32Array(vertices.length)

        for (let i = 0; i < Math.trunc(indices.length/3); i++) {
            const index1 = indices[i*3+0]
            const index2 = indices[i*3+1]
            const index3 = indices[i*3+2]

            const p1 = getVec3(vertices, index1)
            const p2 = getVec3(vertices, index2)
            const p3 = getVec3(vertices, index3)

            let side1 = vec3.create()
            vec3.subtract(side1, p1, p3)

            let side2 = vec3.create()
            vec3.subtract(side2, p1, p2)

            let normal = vec3.create()
            vec3.cross(normal, side1, side2)

            setNormal(result, index1, normal)
            setNormal(result, index2, normal)
            setNormal(result, index3, normal)
        }

        return result
    }

    this.initialize = (context, content) => {
        const heightmap = content.resources[heightMapName].content
        vertices = getVertices(heightmap)
        indices = getIndices(heightmap)
        const normals = getNormals(vertices, indices)
        positionBuffer = createBuffer(context,
            vertices,
            context.ARRAY_BUFFER)
        indexBuffer = createBuffer(context,
            indices,
            context.ELEMENT_ARRAY_BUFFER)
        colorBuffer = createBuffer(context,
            getColors(heightmap),
            context.ARRAY_BUFFER)
        normalsBuffer = createBuffer(context,
            normals,
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

        document.onkeydown = e => {
            if (e.keyCode === 37) {
                // move left
                move.left = (w, t) => mat4.translate(w, w, vec3.fromValues(-1.0*t, 0.0, 0.0))
            } if (e.keyCode === 38) {
                // move forward
                move.forward = (w, t) => mat4.translate(w, w, vec3.fromValues(0.0, 0.0, -1.0*t))
            } if (e.keyCode === 39) {
                // move right
                move.right = (w, t) => mat4.translate(w, w, vec3.fromValues(1.0*t, 0.0, 0.0))
            } if (e.keyCode === 40) {
                // move backward
                move.backward = (w, t) => mat4.translate(w, w, vec3.fromValues(0.0, 0.0, 1.0*t))
            }
        }

        document.onkeyup = e => {
            if (e.keyCode === 37) {
                move.left = (w, t) => w
            } if (e.keyCode === 38) {
                move.forward = (w, t) => w
            } if (e.keyCode === 39) {
                move.right = (w, t) => w
            } if (e.keyCode === 40) {
                move.backward = (w, t) => w
            }
        }
    }

    let move = {
        forward: (w, t) => w,
        backward: (w, t) => w,
        left: (w, t) => w,
        right: (w, t) => w
    }

    let world = mat4.create()

    this.update = (context, time) => {
        context.useProgram(program)

        Object.keys(move).forEach(m => {
            world = move[m](world, 0.15)
        })

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
            indices.length,
            context.UNSIGNED_SHORT,
            0)
    }
}

module.exports = Terrain
