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

    const mainContainer = new PIXI.Container();
    app.stage.addChild(mainContainer);

    let sprite = null;
    const imagePaths = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const paddedIndex = i.toString().padStart(5, '0');
      imagePaths.push(`/seq/Comp 1_${paddedIndex}.webp`);
    }

    const textures = new Array(TOTAL_FRAMES).fill(null);

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

    // Load first frame
    PIXI.Assets.load(imagePaths[0]).then((texture) => {
      textures[0] = texture;
      sprite = new PIXI.Sprite(texture);
      mainContainer.addChild(sprite);
      resizeSprite();

      // Start loading the rest
      loadRemainingFrames();
    });

    const loadRemainingFrames = async () => {
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        PIXI.Assets.load(imagePaths[i]).then(tex => {
          textures[i] = tex;
        });
      }
    };

    window.addEventListener('resize', resizeSprite);

    // --- Trail & Distortion Setup ---
    const brushCanvas = document.createElement('canvas');
    brushCanvas.width = 300;
    brushCanvas.height = 300;
    const ctx = brushCanvas.getContext('2d');
    
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 300, 300);
    
    const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
    gradient.addColorStop(1, 'rgba(128, 128, 128, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, Math.PI * 2);
    ctx.fill();

    const brushTexture = PIXI.Texture.from(brushCanvas);

    const history = [];
    const historySize = 20;
    
    const renderTexture = PIXI.RenderTexture.create({
      width: window.innerWidth,
      height: window.innerHeight
    });
    const rtSprite = new PIXI.Sprite(renderTexture);
    
    const displacementFilter = new PIXI.DisplacementFilter(rtSprite);
    displacementFilter.scale.x = 50; 
    displacementFilter.scale.y = 50;
    
    mainContainer.filters = [displacementFilter];

    const trailContainer = new PIXI.Container();
    const brushes = [];
    
    for (let i = 0; i < historySize; i++) {
      const b = new PIXI.Sprite(brushTexture);
      b.anchor.set(0.5);
      b.alpha = 1 - (i / historySize);
      b.scale.set(1 - (i / historySize) * 0.5);
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

    const bgSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    bgSprite.width = window.innerWidth;
    bgSprite.height = window.innerHeight;
    bgSprite.tint = 0x808080;

    app.ticker.add(() => {
      history.unshift({ x: mouse.x, y: mouse.y });
      history.pop();

      for (let i = 0; i < historySize; i++) {
        brushes[i].x += (history[i].x - brushes[i].x) * 0.5;
        brushes[i].y += (history[i].y - brushes[i].y) * 0.5;
      }

      app.renderer.render(bgSprite, { renderTexture, clear: true });
      app.renderer.render(trailContainer, { renderTexture, clear: false });
    });

    const onResizeRt = () => {
      renderTexture.resize(window.innerWidth, window.innerHeight);
      bgSprite.width = window.innerWidth;
      bgSprite.height = window.innerHeight;
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
          if (textures[currentFrameIndex] && sprite) {
            sprite.texture = textures[currentFrameIndex];
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
      window.removeEventListener('resize', resizeSprite);
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
