import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import * as PIXI from 'pixi.js';
import UIOverlay from './UIOverlay';

gsap.registerPlugin(Observer);

export default function Banner() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentChapter, setCurrentChapter] = useState(0);

  const CHAPTER_COUNT = 5;
  const TOTAL_FRAMES = 281;

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Initialize Pixi Application
    const app = new PIXI.Application({
      view: canvasRef.current,
      resizeTo: window,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // The main container will hold the background and have the displacement filter
    const mainContainer = new PIXI.Container();
    app.stage.addChild(mainContainer);

    // The foreground container sits on top and holds the sharp character
    const fgContainer = new PIXI.Container();
    app.stage.addChild(fgContainer);

    let bgSprite = null;
    let fgSprite = null;
    const bgImagePaths = [];
    const fgImagePaths = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const paddedIndex = i.toString().padStart(5, '0');
      bgImagePaths.push(`/seq/Comp 1_${paddedIndex}.webp`);
      fgImagePaths.push(`/fg_seq/Comp 1_${paddedIndex}.webp`);
    }

    const bgTextures = new Array(TOTAL_FRAMES).fill(null);
    const fgTextures = new Array(TOTAL_FRAMES).fill(null);

    const resizeSprite = (sprite) => {
      if (!sprite || !sprite.texture) return;
      const scaleX = window.innerWidth / sprite.texture.width;
      const scaleY = window.innerHeight / sprite.texture.height;
      const scale = Math.max(scaleX, scaleY);
      sprite.scale.set(scale);
      sprite.x = window.innerWidth / 2;
      sprite.y = window.innerHeight / 2;
      sprite.anchor.set(0.5);
    };

    const resizeAll = () => {
      resizeSprite(bgSprite);
      resizeSprite(fgSprite);
    };

    // Load first frame for both layers
    Promise.all([
      PIXI.Assets.load(bgImagePaths[0]),
      PIXI.Assets.load(fgImagePaths[0])
    ]).then(([bgTex, fgTex]) => {
      bgTextures[0] = bgTex;
      fgTextures[0] = fgTex;
      
      bgSprite = new PIXI.Sprite(bgTex);
      mainContainer.addChild(bgSprite);
      
      fgSprite = new PIXI.Sprite(fgTex);
      fgContainer.addChild(fgSprite);

      resizeAll();

      // Start loading the rest
      loadRemainingFrames();
    });

    const loadRemainingFrames = async () => {
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        PIXI.Assets.load(bgImagePaths[i]).then(tex => bgTextures[i] = tex);
        PIXI.Assets.load(fgImagePaths[i]).then(tex => fgTextures[i] = tex);
      }
    };

    window.addEventListener('resize', resizeAll);

    // --- Trail & Distortion Setup ---
    const brushRadius = 150; // Massive soft brush for smoky look
    const brushSize = brushRadius * 2;
    const brushCanvas = document.createElement('canvas');
    brushCanvas.width = brushSize;
    brushCanvas.height = brushSize;
    const ctx = brushCanvas.getContext('2d');
    
    // Create a very soft, low-opacity white brush. Overlapping these creates a smoky smudge.
    const gradient = ctx.createRadialGradient(brushRadius, brushRadius, 0, brushRadius, brushRadius, brushRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)'); 
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(brushRadius, brushRadius, brushRadius, 0, Math.PI * 2);
    ctx.fill();

    const brushTexture = PIXI.Texture.from(brushCanvas);

    const history = [];
    const historySize = 150; // Massively increased for a huge, lingering trail
    
    const renderTexture = PIXI.RenderTexture.create({
      width: window.innerWidth,
      height: window.innerHeight
    });
    const rtSprite = new PIXI.Sprite(renderTexture);
    
    const displacementFilter = new PIXI.DisplacementFilter(rtSprite);
    displacementFilter.scale.x = 200; // Heavy distortion for the smoky smear
    displacementFilter.scale.y = 200;
    
    // APPLY DISPLACEMENT ONLY TO THE BACKGROUND LAYER
    mainContainer.filters = [displacementFilter];

    const trailContainer = new PIXI.Container();
    // Heavy blur to soften the overlapping brushes into a cohesive smoke cloud
    const blurFilter = new PIXI.BlurFilter(15);
    trailContainer.filters = [blurFilter];
    const brushes = [];
    
    for (let i = 0; i < historySize; i++) {
      const b = new PIXI.Sprite(brushTexture);
      b.anchor.set(0.5);
      // Linear fade to keep the smoke thick for a long time
      const progress = 1 - (i / historySize);
      b.alpha = progress; 
      b.scale.set(progress * 1.2);
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

    const bgFluidSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    bgFluidSprite.width = window.innerWidth;
    bgFluidSprite.height = window.innerHeight;
    bgFluidSprite.tint = 0x808080;

    app.ticker.add(() => {
      const time = Date.now() * 0.002; // For fluid animation

      // Continuously undulate the displacement scale for a breathing liquid effect
      displacementFilter.scale.x = 150 + Math.sin(time) * 40;
      displacementFilter.scale.y = 150 + Math.cos(time * 0.8) * 40;

      history.unshift({ x: mouse.x, y: mouse.y });
      history.pop();

      for (let i = 0; i < historySize; i++) {
        // Smoky drift: Stronger, slower sinusoidal wobble to make the tail writhe like smoke
        const wobbleX = Math.sin(time * 0.5 + i * 0.1) * (i * 0.8);
        const wobbleY = Math.cos(time * 0.4 + i * 0.1) * (i * 0.8);

        // Extremely low easing (0.04) so the tail lags far behind and lingers in the air
        brushes[i].x += ((history[i].x + wobbleX) - brushes[i].x) * 0.04;
        brushes[i].y += ((history[i].y + wobbleY) - brushes[i].y) * 0.04;
      }

      app.renderer.render(bgFluidSprite, { renderTexture, clear: true });
      app.renderer.render(trailContainer, { renderTexture, clear: false });
    });

    const onResizeRt = () => {
      renderTexture.resize(window.innerWidth, window.innerHeight);
      bgFluidSprite.width = window.innerWidth;
      bgFluidSprite.height = window.innerHeight;
    };
    window.addEventListener('resize', onResizeRt);

    // --- Observer Chapter Navigation ---
    let frameObj = { frame: 0 };
    let animating = false;
    let localChapter = 0;

    const goToChapter = (index) => {
      if (animating || index < 0 || index >= CHAPTER_COUNT) return;
      animating = true;
      localChapter = index;
      setCurrentChapter(index);

      const targetFrame = Math.floor((index / (CHAPTER_COUNT - 1)) * (TOTAL_FRAMES - 1));

      gsap.to(frameObj, {
        frame: targetFrame,
        duration: 2, // Smooth 2 second transition to next chapter
        ease: "power2.inOut",
        onUpdate: () => {
          const currentFrameIndex = Math.floor(frameObj.frame);
          if (bgTextures[currentFrameIndex] && bgSprite) {
            bgSprite.texture = bgTextures[currentFrameIndex];
          }
          if (fgTextures[currentFrameIndex] && fgSprite) {
            fgSprite.texture = fgTextures[currentFrameIndex];
          }
        },
        onComplete: () => {
          animating = false;
        }
      });
    };

    Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      onUp: () => goToChapter(localChapter + 1),
      onDown: () => goToChapter(localChapter - 1),
      tolerance: 10,
      preventDefault: true
    });

    return () => {
      window.removeEventListener('resize', resizeAll);
      window.removeEventListener('resize', onResizeRt);
      window.removeEventListener('pointermove', onPointerMove);
      Observer.getAll().forEach(o => o.kill());
      app.destroy(true, { children: true });
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <UIOverlay currentChapterIndex={currentChapter} />
    </div>
  );
}
