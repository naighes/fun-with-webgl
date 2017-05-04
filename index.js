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
            'colored-cube': { vs: 'fx/colored-cube-vs.glsl', fs: 'fx/colored-cube-fs.glsl' },
            'textured-cube': { vs: 'fx/textured-cube-vs.glsl', fs: 'fx/textured-cube-fs.glsl' },
            'colored-triangle': { vs: 'fx/colored-triangle-vs.glsl', fs: 'fx/colored-triangle-fs.glsl' },
            'terrain': { vs: 'fx/terrain-vs.glsl', fs: 'fx/terrain-fs.glsl' },
            'skybox': { vs: 'fx/skybox-vs.glsl', fs: 'fx/skybox-fs.glsl' }
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

    const camera = new Camera(vec3.fromValues(30.0, 10.0, -50.0),
        vec3.fromValues(0.0, 0.0, -51.0))

    let terrain = null
    let skybox = null
    const waterHeight = -7.5

    this.initialize = context => {
        this.objects.push(camera)
        skybox = new Skybox(camera, 1.0)
        this.objects.push(skybox)
        this.objects.push(new ColoredCube(camera,
            0.5,
            vec3.fromValues(0.0, 0.0, -1.0)))
        this.objects.push(new TexturedCube(camera,
            1.3,
            vec3.fromValues(0.55, -0.8, -2.0),
            'metal-box'))
        terrain = new Terrain(camera,
            'heightmap', {
                sand: 'sand',
                grass: 'grass',
                rock: 'rock',
                snow: 'snow'
            },
            waterHeight)
        this.objects.push(terrain)
    }

    this.update = (context, time) => {
    }

    this.draw = (context, time) => {
        context.disable(context.CULL_FACE)
        context.enable(context.DEPTH_TEST)
        context.depthFunc(context.LEQUAL)
        context.clearColor(0.0, 0.0, 0.0, 1.0)
        context.viewport(0, 0, context.drawingBufferWidth, context.drawingBufferHeight)

        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
        terrain.drawRefraction(context, time)

        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
        terrain.drawReflection(context, time)

        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
    }
}

