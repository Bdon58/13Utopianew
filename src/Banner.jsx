import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as PIXI from 'pixi.js';

gsap.registerPlugin(ScrollTrigger);

export default function Banner() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const scrollWrapperRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Initialize Pixi Application (v7 syntax)
    const app = new PIXI.Application({
      view: canvasRef.current,
      resizeTo: window,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    const mainContainer = new PIXI.Container();
    app.stage.addChild(mainContainer);

    let sprite = null;

    // Preload setup
    const frameCount = 281;
    const imagePaths = [];
    for (let i = 0; i < frameCount; i++) {
      const paddedIndex = i.toString().padStart(5, '0');
      imagePaths.push(`/seq/Comp 1_${paddedIndex}.png`);
    }

    const textures = new Array(frameCount).fill(null);
    let loadedCount = 0;

    const resizeSprite = () => {
      if (!sprite) return;
      const scaleX = window.innerWidth / sprite.texture.width;
      const scaleY = window.innerHeight / sprite.texture.height;
      const scale = Math.max(scaleX, scaleY);
      sprite.scale.set(scale);
      sprite.x = window.innerWidth / 2;
      sprite.y = window.innerHeight / 2;
      sprite.anchor.set(0.5);
    };

    // Load first frame immediately
    PIXI.Assets.load(imagePaths[0]).then((texture) => {
      textures[0] = texture;
      sprite = new PIXI.Sprite(texture);
      mainContainer.addChild(sprite);
      resizeSprite();

      // Start loading the rest
      loadRemainingFrames();
    });

    const loadRemainingFrames = async () => {
      for (let i = 1; i < frameCount; i++) {
        // Load in chunks to avoid blocking
        PIXI.Assets.load(imagePaths[i]).then(tex => {
          textures[i] = tex;
          loadedCount++;
        });
      }
    };

    window.addEventListener('resize', resizeSprite);

    // --- Trail & Distortion Setup ---
    
    // Create a brush for the trail (a soft radial gradient)
    const brushCanvas = document.createElement('canvas');
    brushCanvas.width = 300;
    brushCanvas.height = 300;
    const ctx = brushCanvas.getContext('2d');
    
    // Fill with neutral color (no distortion)
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 300, 300);
    
    // Draw soft brush
    const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
    // Use red/green channels for x/y displacement
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
    gradient.addColorStop(1, 'rgba(128, 128, 128, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, Math.PI * 2);
    ctx.fill();

    const brushTexture = PIXI.Texture.from(brushCanvas);

    // We will keep a history of mouse positions to draw the trail
    const history = [];
    const historySize = 20; // Number of trail segments
    
    // Render texture that covers the screen
    const renderTexture = PIXI.RenderTexture.create({
      width: window.innerWidth,
      height: window.innerHeight
    });
    const rtSprite = new PIXI.Sprite(renderTexture);
    
    const displacementFilter = new PIXI.DisplacementFilter(rtSprite);
    displacementFilter.scale.x = 50; // Distortion amount
    displacementFilter.scale.y = 50;
    
    mainContainer.filters = [displacementFilter];

    // Create a container to hold our brush sprites
    const trailContainer = new PIXI.Container();
    const brushes = [];
    
    for (let i = 0; i < historySize; i++) {
      const b = new PIXI.Sprite(brushTexture);
      b.anchor.set(0.5);
      b.alpha = 1 - (i / historySize); // Fade out older segments
      b.scale.set(1 - (i / historySize) * 0.5); // Shrink older segments
      b.x = window.innerWidth / 2;
      b.y = window.innerHeight / 2;
      brushes.push(b);
      trailContainer.addChild(b);
      history.push({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const onPointerMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('pointermove', onPointerMove);

    // Background to clear the render texture to neutral gray
    const bgSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    bgSprite.width = window.innerWidth;
    bgSprite.height = window.innerHeight;
    bgSprite.tint = 0x808080;

    app.ticker.add(() => {
      // Update trail history
      history.unshift({ x: mouse.x, y: mouse.y });
      history.pop();

      // Update brush positions
      for (let i = 0; i < historySize; i++) {
        // Smoothly interpolate towards the target history position
        brushes[i].x += (history[i].x - brushes[i].x) * 0.5;
        brushes[i].y += (history[i].y - brushes[i].y) * 0.5;
      }

      // Render the trail container into the renderTexture
      app.renderer.render(bgSprite, { renderTexture, clear: true });
      app.renderer.render(trailContainer, { renderTexture, clear: false });
    });

    // Handle Resize for RenderTexture
    const onResizeRt = () => {
      renderTexture.resize(window.innerWidth, window.innerHeight);
      bgSprite.width = window.innerWidth;
      bgSprite.height = window.innerHeight;
    };
    window.addEventListener('resize', onResizeRt);

    // --- GSAP ScrollTrigger Setup ---
    const scrollObj = { frame: 0 };
    
    // We pin the canvas container and use a tall wrapper to create scroll distance
    ScrollTrigger.create({
      trigger: scrollWrapperRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: containerRef.current,
      scrub: 1.5,
      onUpdate: (self) => {
        const frameIndex = Math.floor(self.progress * (frameCount - 1));
        if (textures[frameIndex] && sprite) {
          sprite.texture = textures[frameIndex];
          // We don't need to call resizeSprite every frame unless image sizes vary,
          // but assuming they are all the same size, we skip it for performance.
        }
      }
    });

    return () => {
      window.removeEventListener('resize', resizeSprite);
      window.removeEventListener('resize', onResizeRt);
      window.removeEventListener('pointermove', onPointerMove);
      ScrollTrigger.getAll().forEach(t => t.kill());
      app.destroy(true, { children: true });
    };
  }, []);

  return (
    <>
      <div ref={scrollWrapperRef} style={{ height: '500vh', width: '100%' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontSize: '3rem', zIndex: 10, pointerEvents: 'none', mixBlendMode: 'difference' }}>
            Scroll Down
          </div>
        </div>
      </div>
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', color: 'white', fontSize: '2rem' }}>
        End of Sequence
      </div>
    </>
  );
}
