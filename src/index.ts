import * as dat from 'dat.gui';
import * as twgl from 'twgl.js';

import ImageSource from './ImageSource';
import bindFramebuffer, { bindFramebufferWithTexture } from './util/bindFramebuffer';
import buildTexture from './util/buildTexture';
import { KERNELS } from './util/convolveImage';
import createContext from './util/createContext';
import createUnitQuad2D from './util/createUnitQuad2D';
import drawImage from './util/drawImage';
import getResolution from './util/getResolution';

const vertShader = require('./shaders/basic.vert');
const fragShader = require('./shaders/texture.frag');

/**
 * Initialize WebGL
 */
const gl: WebGLRenderingContext = createContext();
twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
console.log('canvas dimensions:', gl.canvas.width, gl.canvas.height);

/**
 * Setup shader program and buffer
 */
const programInfo = twgl.createProgramInfo(gl, [vertShader, fragShader]);
const bufferInfo = createUnitQuad2D(gl);

/**
 * Setup 'simulation' texture, framebuffer
 */
const framebuffer = gl.createFramebuffer();
const texture = gl.createTexture();
const res = getResolution(gl, 128);
console.log('res:', res);
buildTexture(gl, texture, {
    width: res[0],
    height: res[1],
    src: new Float32Array(res[0] * res[1] * 4).fill(0),
});
console.log(texture);

/**
 * Draw simulation texture to canvas
 */
function drawTextureToCanvas() {
    bindFramebuffer(gl, null, gl.canvas.width, gl.canvas.height);
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, { tex: texture });
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP);
}

/**
 * Draw image texture from ImageSource to canvas
 * @param imageTexture 
 * @param width 
 * @param height 
 */
function drawImageToCanvas(imageTexture: WebGLTexture, width: number, height: number) {
    // draw image to the center of the simulation texture
    bindFramebufferWithTexture(gl, framebuffer, res[0], res[1], texture);
    // bindFramebuffer(gl, null, gl.canvas.width, gl.canvas.height);
    drawImage(gl, {
        image: imageTexture,
        x: res[0] / 2,
        y: res[1] / 2,
        width,
        height,
        destWidth: res[0],
        destHeight: res[1],
    });

    // draw simulation texture to canvas
    drawTextureToCanvas();
}

/**
 * create image source and define how it interacts with the scene
 */
const imageSource = new ImageSource(gl, drawImageToCanvas);
imageSource.setup(res);

/**
 * setup controls
 */
const gui = new dat.GUI();
gui.add({ 'Upload Image': imageSource.handler }, 'Upload Image');
gui.add(imageSource, 'filter', ['none', ...Object.keys(KERNELS)]).onChange(imageSource.process);

drawTextureToCanvas();
