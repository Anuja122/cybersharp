import { Camera } from '../player/Camera';
import { World } from '../world/World';
import { ShaderManager } from './ShaderManager';
import { PipelineManager } from './PipelineManager';
import { TextureManager } from './TextureManager';
import { PostProcessing } from './PostProcessing';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private adapter!: GPUAdapter;
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private presentationFormat!: GPUTextureFormat;

  private shaderManager!: ShaderManager;
  private pipelineManager!: PipelineManager;
  private textureManager!: TextureManager;
  private postProcessing!: PostProcessing;

  private depthTexture!: GPUTexture;
  private depthTextureView!: GPUTextureView;

  private gBufferTextures!: {
    albedo: GPUTexture;
    normal: GPUTexture;
    depth: GPUTexture;
    emissive: GPUTexture;
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async initialize() {
    this.adapter = await navigator.gpu.requestAdapter() as GPUAdapter;

    if (!this.adapter) {
      throw new Error('WebGPU adapter not available');
    }

    this.device = await this.adapter.requestDevice();
    this.context = this.canvas.getContext('webgpu') as GPUCanvasContext;
    this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    this.context.configure({
      device: this.device,
      format: this.presentationFormat,
      alphaMode: 'premultiplied',
    });

    this.shaderManager = new ShaderManager(this.device);
    this.pipelineManager = new PipelineManager(this.device, this.presentationFormat);
    this.textureManager = new TextureManager(this.device);
    this.postProcessing = new PostProcessing(this.device, this.presentationFormat);

    await this.shaderManager.loadShaders();
    await this.pipelineManager.createPipelines(this.shaderManager);

    this.createDepthTexture();
    this.createGBuffers();

    await this.postProcessing.initialize();
  }

  private createDepthTexture() {
    this.depthTexture = this.device.createTexture({
      size: [this.canvas.width, this.canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.depthTextureView = this.depthTexture.createView();
  }

  private createGBuffers() {
    const size = [this.canvas.width, this.canvas.height];

    this.gBufferTextures = {
      albedo: this.device.createTexture({
        size,
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      }),
      normal: this.device.createTexture({
        size,
        format: 'rgba16float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      }),
      depth: this.device.createTexture({
        size,
        format: 'r32float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      }),
      emissive: this.device.createTexture({
        size,
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      }),
    };
  }

  resize(width: number, height: number) {
    this.depthTexture.destroy();
    Object.values(this.gBufferTextures).forEach(tex => tex.destroy());

    this.createDepthTexture();
    this.createGBuffers();
  }

  render(world: World, camera: Camera) {
    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    this.renderGBuffer(commandEncoder, world, camera);
    this.renderLighting(commandEncoder, textureView, camera);
    this.postProcessing.render(commandEncoder, textureView);

    this.device.queue.submit([commandEncoder.finish()]);
  }

  private renderGBuffer(encoder: GPUCommandEncoder, world: World, camera: Camera) {
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.gBufferTextures.albedo.createView(),
          clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
        {
          view: this.gBufferTextures.normal.createView(),
          clearValue: { r: 0.5, g: 0.5, b: 1.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
        {
          view: this.gBufferTextures.emissive.createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: this.depthTextureView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    });

    world.render(renderPass, camera, this.pipelineManager);

    renderPass.end();
  }

  private renderLighting(encoder: GPUCommandEncoder, targetView: GPUTextureView, camera: Camera) {
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [{
        view: targetView,
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    renderPass.end();
  }

  getDevice(): GPUDevice {
    return this.device;
  }
}
