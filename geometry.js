const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3

const xp = [1.0, 0.0, 0.0],
      xn = [-1.0, 0.0, 0.0],
      yp = [0.0, 1.0, 0.0],
      yn = [0.0, -1.0, 0.0],
      zp = [0.0, 0.0, 1.0],
      zn = [0.0, 0.0, -1.0]

const oo = [0.0, 0.0],
      io = [1.0, 0.0],
      ii = [1.0, 1.0],
      oi = [0.0, 1.0]

const textureCoords = [].concat(io, ii, oo, oi, oo, ii,
                                io, ii, oo, oi, oo, ii,
                                io, ii, oo, oi, oo, ii,
                                io, ii, oo, oi, oo, ii,
                                io, ii, oo, oi, oo, ii,
                                io, ii, oo, oi, oo, ii)

function cubeBuilder(size) {
    const s = size/2

    const v1 = [-s, -s,  s],
          v2 = [ s, -s,  s],
          v3 = [ s,  s,  s],
          v4 = [-s,  s,  s],
          v5 = [-s, -s, -s],
          v6 = [ s, -s, -s],
          v7 = [ s,  s, -s],
          v8 = [-s,  s, -s]

    this.getVertices = () => {
        return []
        // front
            .concat(v2, v3, v1,
                v4, v1, v3,
                // left
                v1, v4, v5,
                v8, v5, v4,
                // back
                v5, v8, v6,
                v7, v6, v8,
                // right
                v6, v7, v2,
                v3, v2, v7,
                // top
                v3, v7, v4,
                v8, v4, v7,
                // bottom
                v6, v1, v5,
                v1, v6, v2)
    }

    this.getInvertedVertices = () => {
        let result = this.getVertices()

        for (let i = 0; i < result/3; i++) {
            const i1 = i*3+0
            const i2 = i*3+2
            const a = result[i1]
            const b = result[i2]
            result[i1] = b
            result[i2] = a
        }

        return result
    }
}

module.exports.createCube = size => {
    const normals = []
        .concat(zp, zp, zp,
                zp, zp, zp,
                xn, xn, xn,
                xn, xn, xn,
                zn, zn, zn,
                zn, zn, zn,
                xp, xp, xp,
                xp, xp, xp,
                yp, yp, yp,
                yp, yp, yp,
                yn, yn, yn,
                yn, yn, yn)

    const builder = new cubeBuilder(size)

    return {
        vertices: builder.getVertices(),
        normals: normals,
        textureCoords: textureCoords
    }
}

module.exports.createSkybox = size => {
    const normals = []
        .concat(zn, zn, zn,
                zn, zn, zn,
                xp, xp, xp,
                xp, xp, xp,
                zp, zp, zp,
                zp, zp, zp,
                xn, xn, xn,
                xn, xn, xn,
                yn, yn, yn,
                yn, yn, yn,
                yp, yp, yp,
                yp, yp, yp)

    const builder = new cubeBuilder(size)

    return {
        vertices: builder.getInvertedVertices(),
        normals: normals,
        textureCoords: textureCoords
    }
}

module.exports.createTerrain = (png, heightFactor, sizeFactor) => {
    const getVertices = (png, heightFactor, sizeFactor) => {
        let result = new Float32Array(png.getWidth()*png.getHeight()*3)

        for (let x = 0; x < png.getWidth(); x++) {
            for (let y = 0; y < png.getHeight(); y++) {
                const w = x*sizeFactor
                const h = (png.getPixel(x, y)[0]-127)*heightFactor
                const d = -1.0*y*sizeFactor
                const i = x*3+y*png.getWidth()*3
                result[i+0] = w
                result[i+1] = h
                result[i+2] = d
            }
        }

        return result
    }

    const getWeights = png => {
        const clamp = (num, min, max) => Math.max(min, Math.min(max, num))

        let result = new Float32Array(png.getWidth()*png.getHeight()*4)
        const h = png.getWidth()/4
        const d = h*0.6

        for (let x = 0; x < png.getWidth(); x++) {
            for (let y = 0; y < png.getHeight(); y++) {
                const i = x*4+y*png.getWidth()*4
                const height = png.getPixel(x, y)[0]

                result[i+0] = clamp(1.0-Math.abs(height-(h*0))/d, 0.0, 1.0)
                result[i+1] = clamp(1.0-Math.abs(height-(h*1))/d, 0.0, 1.0)
                result[i+2] = clamp(1.0-Math.abs(height-(h*2))/d, 0.0, 1.0)
                result[i+3] = clamp(1.0-Math.abs(height-(h*3))/d, 0.0, 1.0)

                let total = result[i+0]+result[i+1]+result[i+2]+result[i+3]
                result[i+0] = result[i+0]/total
                result[i+1] = result[i+1]/total
                result[i+2] = result[i+2]/total
                result[i+3] = result[i+3]/total
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

    const getTextureCoords = (png, heightFactor, sizeFactor) => {
        let result = new Float32Array(png.getWidth()*png.getHeight()*2)

        for (let x = 0; x < png.getWidth(); x++) {
            for (let y = 0; y < png.getHeight(); y++) {
                const i = x*2+y*png.getWidth()*2
                const u = x/20.0
                const v = y/20.0
                result[i+0] = u
                result[i+1] = v
            }
        }

        return result
    }

    const vertices = getVertices(png, heightFactor, sizeFactor)
    const indices = getIndices(png)
    const normals = getNormals(vertices, indices)
    const textureCoords = getTextureCoords(png, heightFactor, sizeFactor)
    const weights = getWeights(png)

    return {
        vertices: vertices,
        indices: indices,
        normals: normals,
        textureCoords: textureCoords,
        weights: weights,
        getVertexAt: (x, y) => {
            const i = x*3+y*png.getWidth()*3

            return vec3.fromValues(vertices[i+0],
                vertices[i+1],
                vertices[i+2])
        }
    }
}
