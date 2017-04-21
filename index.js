const wgl = require('./lib')
const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const Triangle = require('./triangle')
const Camera = require('./camera')
const ColoredCube = require('./colored-cube')
const TexturedCube = require('./textured-cube')
const Terrain = require('./terrain')

window.onload = () => {
    wgl('view', new Game())
}

function Game() {
    this.objects = []

    this.config = {
        shaders: {
            'colored-cube': { vs: 'fx/colored-cube-vs.fx', fs: 'fx/colored-cube-fs.fx' },
            'textured-cube': { vs: 'fx/textured-cube-vs.fx', fs: 'fx/textured-cube-fs.fx' },
            'colored-triangle': { vs: 'fx/colored-triangle-vs.fx', fs: 'fx/colored-triangle-fs.fx' },
            'terrain': { vs: 'fx/terrain-vs.fx', fs: 'fx/terrain-fs.fx' }
        },
        resources: {
            'metal-box': {
                src: 'img/metal_box.jpg',
                type: 'img'
            },
            'heightmap': {
                src: 'img/heightmap.png',
                type: 'heightmap'
            }
        }
    }

    const rgb = [1.0, 0.0, 0.0, 1.0,
                 0.0, 1.0, 0.0, 1.0,
                 0.0, 0.0, 1.0, 1.0]

    const camera = new Camera(vec3.fromValues(0.0, -15.0, 10.0),
        vec3.fromValues(0.0, 0.0, 0.0))

    this.initialize = context => {
        const triangles = [[0.0, 0.5,
                            0.0, 1.0,
                            0.7, 0.5],
                           [-0.5, -0.5,
                            -0.9, -0.5,
                            -0.5, -0.8],
                           [-0.5, 0.9,
                            -0.9, 0.9,
                            -0.5, 0.2]]
        this.objects.push(camera)
        triangles.map(t => new Triangle(t, rgb)).forEach(t => {
            t.camera = camera
            this.objects.push(t)
        })

        const cube1 = new ColoredCube(0.5)
        cube1.camera = camera
        this.objects.push(cube1)

        const cube2 = new TexturedCube(1.3, 'metal-box')
        cube2.camera = camera
        this.objects.push(cube2)

        const terrain = new Terrain('heightmap')
        terrain.camera = camera
        this.objects.push(terrain)
    }

    this.update = (context, time) => {
    }

    this.draw = (context, time) => {
        context.clearColor(0.0, 0.0, 0.0, 1.0)
        // enable depth testing
        context.enable(context.DEPTH_TEST)
        // near things obscure far things
        context.depthFunc(context.LEQUAL)
        // clear the color as well as the depth buffer
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
        context.viewport(0, 0, context.drawingBufferWidth, context.drawingBufferHeight)
    }
}

