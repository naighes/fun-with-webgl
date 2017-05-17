const basicNoise = (size, rnd) => {
    let rows = []

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            rows.push(rnd())
        }
    }

    return rows
}

const smooth = (x, y, noise, size) => {
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

const randomNoise = (size, rnd, zoom, fun) => {
    const noise = basicNoise(size, rnd)
    return noise.map((v, i) => {
        const y = Math.floor(i/size)
        const x = i-size*y

        return fun(size*turbulence(x, y, noise, size, zoom))
    })
}

const turbulence = (x, y, noise, size, zoom) => {
    let value = 0.0
    let z = zoom

    while (z >= 1) {
        value += smooth(x/z, y/z, noise, size)*z
        z = z/2.0
    }

    return value/zoom
}

module.exports.randomNoise = (size, rnd, zoom) => {
    return randomNoise(size,
        rnd,
        zoom,
        t => [t, t, t, 255])
}

module.exports.clouds = (size, rnd, zoom) => {
    return randomNoise(size,
        rnd,
        zoom,
        t => {
            const h = 0.662745098039216
            const s = 1
            const l = (192+t/4)/255
            return hslToRgb(h, s, l)
        })
}

/*
    https://gist.github.com/mjackson/5311256

    Converts an RGB color value to HSL. Conversion formula
    adapted from http://en.wikipedia.org/wiki/HSL_color_space.
    Assumes r, g, and b are contained in the set [0, 255] and
    returns h, s, and l in the set [0, 1]
*/
const hslToRgb = (h, s, l) => {
    let r, g, b

    if (s == 0) {
        r = g = b = l // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1/6) return p + (q - p) * 6 * t
            if (t < 1/2) return q
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6

            return p
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s
        var p = 2 * l - q

        r = hue2rgb(p, q, h+1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h-1/3)
    }

    return [r*255, g*255, b*255, 255]
}
