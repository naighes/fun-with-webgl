const basicNoise = (size, rnd) => {
    let rows = []

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            rows.push(rnd())
        }
    }

    return rows
}

module.exports.basicNoise = basicNoise

const smoothNoise = (size, rnd, zoom) => {
    const noise = basicNoise(size, rnd)
    return noise.map((v, i) => {
        const y = Math.floor(i/size)
        const x = i-size*y

        return calculateSmoothNoise(x/zoom, y/zoom, noise, size)
    })
}

module.exports.smoothNoise = smoothNoise

const calculateSmoothNoise = (x, y, noise, size) => {
    const at = (noise, x, y) => {
        return noise[x+y*size]
    }

    // get fractional part of x and y
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const dx = x-x0
    const dy = y-y0

    // wrap around
    const x1 = (x0+size)%size
    const y1 = (y0+size)%size

    // neighbor values
    const x2 = (x1+size-1)%size
    const y2 = (y1+size-1)%size

    // smooth the noise with bilinear interpolation
    return dx*dy*at(noise, x1, y1) +
           (1-dx)*dy*at(noise, x2, y1) +
           dx*(1-dy)*at(noise, x1, y2) +
           (1-dx)*(1-dy)*at(noise, x2, y2)
}

const turbulenceNoise = (size, rnd, zoom) => {
    const noise = basicNoise(size, rnd)
    return noise.map((v, i) => {
        const y = Math.floor(i/size)
        const x = i-size*y

        return calculateTurbulenceNoise(x, y, noise, size, zoom)
    })
}

module.exports.turbulenceNoise = turbulenceNoise

const calculateTurbulenceNoise = (x, y, noise, size, zoom) => {
    let value = 0.0
    let z = zoom

    while (z >= 1) {
        value += calculateSmoothNoise(x/z, y/z, noise, size)*z
        z = z/2.0
    }

    return size*value/zoom
}
