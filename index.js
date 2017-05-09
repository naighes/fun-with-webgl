const wgl = require('./lib')
const glmatrix = require('gl-matrix')
const vec3 = glmatrix.vec3
const Triangle = require('./triangle')
const Camera = require('./camera')
const ColoredCube = require('./colored-cube')
const TexturedCube = require('./textured-cube')
const Terrain = require('./terrain')
const Skybox = require('./skybox')
const Water = require('./water')

window.onload = () => {
    wgl('view', new Game())
}

function Heightmap(assetName,
    sizeFactor,
    heightFactor,
    waterHeight,
    textures) {
    this.getAssetName = () => assetName
    this.getSizeFactor = () => sizeFactor
    this.getHeightFactor = () => heightFactor
    this.getTextures = () => textures
    this.getPng = content => content.resources[this.getAssetName()].content
    this.getWidth = content => this.getPng(content).getWidth()*this.getSizeFactor()
    this.getHeight = content => this.getPng(content).getHeight()*this.getSizeFactor()
    this.getWaterHeight = () => waterHeight*this.getHeightFactor()
}

function Environment(lightPosition,
    ambientLight,
    heightmap) {
    this.getLightPosition = () => lightPosition
    this.getAmbientLight = () => ambientLight
    this.getHeightmap = () => heightmap
}

function Game() {
    this.objects = []

    this.config = {
        shaders: {
            'colored-cube': { vs: 'fx/colored-cube-vs.glsl', fs: 'fx/colored-cube-fs.glsl' },
            'textured-cube': { vs: 'fx/textured-cube-vs.glsl', fs: 'fx/textured-cube-fs.glsl' },
            'colored-triangle': { vs: 'fx/colored-triangle-vs.glsl', fs: 'fx/colored-triangle-fs.glsl' },
            'terrain': { vs: 'fx/terrain-vs.glsl', fs: 'fx/terrain-fs.glsl' },
            'skybox': { vs: 'fx/skybox-vs.glsl', fs: 'fx/skybox-fs.glsl' },
            'water': { vs: 'fx/water-vs.glsl', fs: 'fx/water-fs.glsl' }
        },
        resources: {
            'metal-box': {
                src: 'img/metal_box.jpg',
                type: 'img'
            },
            'water-bump-map': {
                src: 'img/water_bump_map.png',
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
                src: 'img/heightmap_4.png',
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

    const environment = new Environment(vec3.normalize(vec3.create(), vec3.fromValues(1.0, 0.3, -1.0)),
        vec3.fromValues(1.0, 0.549, 0.0),
        new Heightmap('heightmap',
            1.0,
            0.1,
            -55, {
                sand: 'sand',
                grass: 'grass',
                rock: 'rock',
                snow: 'snow'
            }))

    let terrain = null
    let skybox = null

    this.initialize = context => {
        this.objects.push(camera)
        skybox = new Skybox(camera, 1.0, environment)
        this.objects.push(skybox)
        this.objects.push(new ColoredCube(camera,
            environment,
            0.5,
            vec3.fromValues(0.0, 0.0, -1.0)))
        this.objects.push(new TexturedCube(camera,
            environment,
            1.3,
            vec3.fromValues(0.55, -0.8, -2.0),
            'metal-box'))
        terrain = new Terrain(camera, environment)
        this.objects.push(new Water(camera,
            environment,
            terrain,
            'water-bump-map'))
        this.objects.push(terrain)
    }

    this.update = (context, time) => {
    }

    this.draw = (context, time) => {
        context.enable(context.CULL_FACE);
        context.cullFace(context.BACK);
        context.enable(context.DEPTH_TEST)
        context.depthFunc(context.LEQUAL)
        context.clearColor(0.0, 0.0, 0.0, 1.0)
        context.viewport(0, 0, context.drawingBufferWidth, context.drawingBufferHeight)

        terrain.usingRefractionBuffer(context, context => {
            context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
            terrain.drawRefraction(context, time)
        })

        terrain.usingReflectionBuffer(context, context => {
            context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
            skybox.draw(context, time)
            terrain.drawReflection(context, time)
        })

        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT)
    }
}

