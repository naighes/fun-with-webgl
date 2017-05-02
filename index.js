const wgl = require('./lib')
const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const Triangle = require('./triangle')
const Camera = require('./camera')
const ColoredCube = require('./colored-cube')
const TexturedCube = require('./textured-cube')
const Terrain = require('./terrain')
const Skybox = require('./skybox')

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
            'terrain': { vs: 'fx/terrain-vs.fx', fs: 'fx/terrain-fs.fx' },
            'skybox': { vs: 'fx/skybox-vs.fx', fs: 'fx/skybox-fs.fx' }
        },
        resources: {
            'metal-box': {
                src: 'img/metal_box.jpg',
                type: 'img'
            },
            'sand': {
                src: 'img/sand.jpg',
                type: 'img'
            },
            'grass': {
                src: 'img/grass.jpg',
                type: 'img'
            },
            'rock': {
                src: 'img/rock.jpg',
                type: 'img'
            },
            'snow': {
                src: 'img/snow.jpg',
                type: 'img'
            },
            'heightmap': {
                src: 'img/heightmap_2.png',
                type: 'heightmap'
            },
            'skybox_xn': {
                src: 'img/skybox_2_xn.png',
                type: 'img'
            },
            'skybox_xp': {
                src: 'img/skybox_2_xp.png',
                type: 'img'
            },
            'skybox_zn': {
                src: 'img/skybox_2_zn.png',
                type: 'img'
            },
            'skybox_zp': {
                src: 'img/skybox_2_zp.png',
                type: 'img'
            },
            'skybox_yn': {
                src: 'img/skybox_2_yn.png',
                type: 'img'
            },
            'skybox_yp': {
                src: 'img/skybox_2_yp.png',
                type: 'img'
            }
        }
    }

    const rgb = [1.0, 0.0, 0.0, 1.0,
                 0.0, 1.0, 0.0, 1.0,
                 0.0, 0.0, 1.0, 1.0]

    const camera = new Camera(vec3.fromValues(0.0, 8.0, 150.0),
        vec3.fromValues(0.0, 0.0, -1.0))

    this.initialize = context => {
        this.objects.push(camera)

        const skybox = new Skybox(1.0)
        skybox.camera = camera
        this.objects.push(skybox)

        const triangles = [[0.0, 0.5,
                            0.0, 1.0,
                            0.7, 0.5],
                           [-0.5, -0.5,
                            -0.9, -0.5,
                            -0.5, -0.8],
                           [-0.5, 0.9,
                            -0.9, 0.9,
                            -0.5, 0.2]]
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

        const terrain = new Terrain('heightmap', {
            sand: 'sand',
            grass: 'grass',
            rock: 'rock',
            snow: 'snow'
        })
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

