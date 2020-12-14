import * as dat from 'dat.gui';
import * as twgl from 'twgl.js';

import ImageSource from './ImageSource';
import bindFramebuffer from './util/bindFramebuffer';
import { KERNELS } from './util/convolveImage';
import drawImage from './util/drawImage';

/**
 * Setup Scene
 */
const gl: WebGLRenderingContext = (document.getElementById('canvas') as any).getContext('webgl2');
twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

/**
 * create image source and define how it interacts with the scene
 */
const imageSource = new ImageSource(
    gl,
    (imageTexture: WebGLTexture, width: number, height: number) => {
        // draw image to the center of the canvas
        bindFramebuffer(gl, null, gl.canvas.width, gl.canvas.height);
        drawImage(gl, {
            image: imageTexture,
            x: gl.canvas.width / 2,
            y: gl.canvas.height / 2,
            width,
            height,
            destWidth: gl.canvas.width,
            destHeight: gl.canvas.height,
        });
    }
);
imageSource.setup([gl.canvas.width, gl.canvas.height]);

/**
 * setup controls
 */
const gui = new dat.GUI();
gui.add({ 'Upload Image': imageSource.handler }, 'Upload Image');
gui.add(imageSource, 'filter', ['none', ...Object.keys(KERNELS)]).onChange(imageSource.process);
