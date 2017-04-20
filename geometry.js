module.exports.createCube = (size) => {
    const s = size/2

    const v1 = [-s, -s,  s],
          v2 = [ s, -s,  s],
          v3 = [ s,  s,  s],
          v4 = [-s,  s,  s],
          v5 = [-s, -s, -s],
          v6 = [ s, -s, -s],
          v7 = [ s,  s, -s],
          v8 = [-s,  s, -s]

    const vertices = []
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
                v5, v1, v6,
                v2, v6, v1)

    const xp = [1.0, 0.0, 0.0],
          xn = [-1.0, 0.0, 0.0],
          yp = [0.0, 1.0, 0.0],
          yn = [0.0, -1.0, 0.0],
          zp = [0.0, 0.0, -1.0],
          zn = [0.0, 0.0, 1.0]

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

    return {
        vertices: vertices,
        normals: normals,
        textureCoords: textureCoords
    }
}
