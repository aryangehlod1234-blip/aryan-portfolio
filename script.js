document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Lenis Smooth Scrolling Setup
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smooth: true,
        smoothTouch: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Anchor Link Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (target === '#top') {
                lenis.scrollTo(0);
            } else {
                lenis.scrollTo(target, { offset: -50 });
            }
        });
    });

    // 2. Premium Masked Bar Preloader & Site Entrance Logic
    const preloader = document.getElementById('preloader');
    const barsGroup = document.getElementById('bars-group');
    const finalText = document.getElementById('final-text');
    const glowSweep = document.querySelector('.loader-glow-sweep');

    function startSiteEntrance(delay = 0) {
        const isContactPage = document.querySelector('.contact-page-wrapper') !== null;
        
        if (isContactPage) {
            const wastedOverlay = document.getElementById('wasted-overlay');
            const wastedText = document.querySelector('.wasted-text');
            const mainContent = document.querySelector('main');
            
            if (wastedOverlay && wastedText) {
                // Initial state for contact page entrance
                gsap.set(mainContent, { 
                    opacity: 1, 
                    filter: "blur(10px) brightness(0.5)",
                    y: 0,
                    scale: 1,
                    scaleY: 1
                });
                
                // Hide elements that will animate in later
                gsap.set(".contact-anim, .contact-form-anim, .nav-brand, .nav-link", { opacity: 0, y: 20 });

                gsap.set(wastedOverlay, { autoAlpha: 1 });
                gsap.set(wastedText, { scale: 1.2, opacity: 0 });

                const tl = gsap.timeline({ delay: delay });
                
                // Text fade in + slight zoom
                tl.to(wastedText, {
                    scale: 1,
                    opacity: 1,
                    duration: 1.5,
                    ease: "power3.out"
                });

                // Slow motion blur out on the text
                tl.to(wastedText, {
                    filter: "blur(30px)",
                    opacity: 0,
                    scale: 1.2,
                    duration: 2,
                    ease: "power2.inOut"
                }, "+=1"); // Wait 1 second before blurring out

                // Smoothly fade out overlay and reveal page
                tl.to(wastedOverlay, {
                    autoAlpha: 0,
                    duration: 1,
                    ease: "power3.inOut"
                }, "-=1");

                tl.to(mainContent, {
                    filter: "blur(0px) brightness(1)",
                    duration: 1.5,
                    ease: "power3.inOut"
                }, "-=1.5");

                // Reveal nav and content
                tl.to(".nav-brand, .nav-link", { 
                    y: 0, 
                    opacity: 1, 
                    duration: 1, 
                    stagger: 0.05, 
                    ease: "power3.out" 
                }, "-=0.5");

                tl.to(".contact-anim, .contact-form-anim", { 
                    y: 0, 
                    opacity: 1, 
                    duration: 1, 
                    stagger: 0.1, 
                    ease: "power3.out" 
                }, "-=0.8");

                return; // Stop normal entrance
            }
        }

        const tl = gsap.timeline({ delay: delay });
        
        const isMobile = window.innerWidth < 1024;
        const blurAmount = isMobile ? 12 : 25; 
        const moveY = isMobile ? 40 : 70;
        const stretch = isMobile ? 1.1 : 1.3;

        // Initial state for entrance (Simulating Motion Blur)
        gsap.set("main", { 
            y: moveY, 
            filter: `blur(${blurAmount}px)`, 
            opacity: 0, 
            scale: 0.95,
            scaleY: stretch,
            transformOrigin: "center top"
        });
        
        tl.to("main", { 
            y: 0, 
            filter: "blur(0px)", 
            opacity: 1, 
            scale: 1, 
            scaleY: 1,
            duration: 2, 
            ease: "expo.out" 
        });

        // Animate title lines if present
        if (document.querySelector('.giant-title .line')) {
            tl.to(".giant-title .line", { 
                y: "0%", 
                duration: 1.5, 
                stagger: 0.1, 
                ease: "power4.out" 
            }, 0.2);
        }

        // Animate nav elements
        tl.from(".nav-brand, .nav-link", { 
            y: -20, 
            opacity: 0, 
            duration: 1, 
            stagger: 0.05, 
            ease: "power3.out" 
        }, 0.4);

        // Animate subpage specific content
        if (document.querySelector('.contact-page-wrapper') || document.querySelector('.work-hero')) {
            tl.to(".contact-anim, .work-subtitle, .contact-form-anim", { 
                y: 0, 
                opacity: 1, 
                duration: 1, 
                stagger: 0.1, 
                ease: "power3.out" 
            }, 0.6);
        }
    }

    if (preloader) {
        lenis.stop();
        document.body.style.overflow = 'hidden';

        if (barsGroup && finalText) {
            try {
                // Full complex preloader
                const numBars = 45;
                const barWidth = 1000 / numBars;
                const barElements = [];

                barsGroup.innerHTML = '';

                for (let i = 0; i < numBars; i++) {
                    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    rect.setAttribute("x", i * barWidth);
                    rect.setAttribute("y", 0);
                    rect.setAttribute("width", barWidth + 1);
                    rect.setAttribute("height", 300);
                    rect.setAttribute("fill", "white");
                    barsGroup.appendChild(rect);
                    barElements.push(rect);
                }

                const masterTL = gsap.timeline({
                    onComplete: () => {
                        preloader.style.display = 'none';
                        lenis.start();
                        document.body.style.overflow = '';
                    }
                });

                gsap.set(barElements, { scaleY: 0, transformOrigin: "bottom" });
                gsap.set(preloader, { transformOrigin: "center center", opacity: 1, display: 'flex' });

                masterTL.to(barElements, {
                    scaleY: (i) => 0.4 + Math.random() * 0.5,
                    duration: 1.4,
                    stagger: 0.04,
                    ease: "cubic-bezier(0.76, 0, 0.24, 1)"
                }, 0.2);

                masterTL.to(barElements, {
                    scaleY: 1,
                    duration: 0.8,
                    ease: "power2.inOut",
                    stagger: 0.02
                }, "+=0.2");

                masterTL.to(barElements, {
                    opacity: 1,
                    duration: 0.4
                }, "+=0.1");

                masterTL.to(finalText, {
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: 0.8,
                    ease: "power2.out",
                    onStart: () => {
                        gsap.set(barsGroup, { opacity: 0 });
                    }
                }, "-=0.3");

                masterTL.add(() => {
                    if (glowSweep) {
                        glowSweep.style.opacity = '1';
                        glowSweep.style.animation = 'glowSweep 1.2s cubic-bezier(0.76, 0, 0.24, 1) forwards';
                    }
                }, "-=0.4");

                masterTL.to(preloader, {
                    scale: 12,
                    opacity: 0,
                    filter: "blur(15px)",
                    duration: 1.4,
                    ease: "expo.inOut",
                    onStart: () => {
                        preloader.style.pointerEvents = 'none';
                    }
                }, "+=0.8");

                startSiteEntrance(masterTL.duration() - 0.7);
            } catch (err) {
                console.error("Preloader error:", err);
                startSiteEntrance();
            }
        } else {
            gsap.to(preloader, {
                opacity: 0,
                duration: 1.2,
                ease: "power2.inOut",
                delay: 0.8,
                onComplete: () => {
                    preloader.style.display = 'none';
                    lenis.start();
                    document.body.style.overflow = '';
                }
            });
            startSiteEntrance(1.2);
        }
    } else {
        // No preloader found, start entrance immediately
        startSiteEntrance(0);
    }

    // 3. Cinematic Starfield (Three.js)
    try {
        const starsCanvas = document.getElementById('stars-canvas');
        if (starsCanvas) {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({
                canvas: starsCanvas,
                alpha: true,
                antialias: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            function createStarField(count, size, color, opacity, distance) {
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array(count * 3);
                for (let i = 0; i < count; i++) {
                    positions[i * 3 + 0] = (Math.random() - 0.5) * distance;
                    positions[i * 3 + 1] = (Math.random() - 0.5) * distance;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * distance;
                }
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const material = new THREE.PointsMaterial({
                    size: size,
                    color: color,
                    transparent: true,
                    opacity: opacity,
                    blending: THREE.AdditiveBlending
                });
                return new THREE.Points(geometry, material);
            }

            const isMobile = window.innerWidth < 1024;
            const starScale = isMobile ? 1.8 : 1; 
            const starSpeed = isMobile ? 1.2 : 1; 
            
            const farStars = createStarField(isMobile ? 6480 : 4000, 0.0605 * starScale, 0xffffff, 0.4, 600);
            const midStars = createStarField(isMobile ? 3240 : 2000, 0.121 * starScale, 0xffffff, 0.6, 400);
            const nearStars = createStarField(isMobile ? 1296 : 800, 0.1815 * starScale, 0xffffff, 0.8, 200);
            
            scene.add(farStars);
            scene.add(midStars);
            scene.add(nearStars);

            camera.position.z = 50;

            let mouseX = 0, mouseY = 0, touchX = 0, touchY = 0;

            window.addEventListener('mousemove', (e) => {
                mouseX = (e.clientX - window.innerWidth / 2) / 100;
                mouseY = (e.clientY - window.innerHeight / 2) / 100;
            });

            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    touchX = (e.touches[0].clientX - window.innerWidth / 2) / 50;
                    touchY = (e.touches[0].clientY - window.innerHeight / 2) / 50;
                }
            }, { passive: true });

            function animateStars() {
                requestAnimationFrame(animateStars);
                const time = Date.now() * 0.0005;
                farStars.rotation.y += 0.00015 * starSpeed;
                midStars.rotation.y -= 0.0002 * starSpeed;
                midStars.rotation.z += 0.0001 * starSpeed;
                nearStars.rotation.y += 0.00025 * starSpeed;
                nearStars.rotation.x += 0.00015 * starSpeed;
                const driftX = Math.sin(time * 0.2) * 2;
                const driftY = Math.cos(time * 0.3) * 2;
                const targetX = mouseX + touchX + driftX;
                const targetY = -mouseY - touchY + driftY;
                camera.position.x += (targetX - camera.position.x) * 0.05;
                camera.position.y += (targetY - camera.position.y) * 0.05;
                camera.lookAt(scene.position);
                renderer.render(scene, camera);
            }

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            animateStars();
        }
    } catch (err) { console.error("Three.js error:", err); }

    // 4. Custom Cursor
    try {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        const magneticEls = document.querySelectorAll('[data-magnetic]');

        if (cursor && follower) {
            let mX = 0, mY = 0, cX = 0, cY = 0;
            window.addEventListener('mousemove', (e) => {
                mX = e.clientX; mY = e.clientY;
                gsap.to([cursor, follower], { opacity: 1, duration: 0.3 });
                gsap.set(cursor, { x: mX, y: mY });
            });
            window.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) {
                    mX = e.touches[0].clientX; mY = e.touches[0].clientY;
                    gsap.set(cursor, { x: mX, y: mY });
                    gsap.to([cursor, follower], { opacity: 1, duration: 0.2 });
                }
            }, { passive: true });
            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    mX = e.touches[0].clientX; mY = e.touches[0].clientY;
                    gsap.set(cursor, { x: mX, y: mY });
                }
            }, { passive: true });
            window.addEventListener('touchend', () => {
                gsap.to([cursor, follower], { opacity: 0, duration: 0.3 });
            }, { passive: true });

            gsap.ticker.add(() => {
                cX += (mX - cX) * 0.15;
                cY += (mY - cY) * 0.15;
                gsap.set(follower, { x: cX, y: cY });
            });

            document.querySelectorAll('[data-hover]').forEach(el => {
                el.addEventListener('mouseenter', () => { 
                    cursor.classList.add('is-hover'); 
                    follower.classList.add('is-hover'); 
                    const cursorText = el.getAttribute('data-cursor');
                    if (cursorText) {
                        follower.setAttribute('data-text', cursorText);
                        follower.classList.add('has-text');
                    }
                });
                el.addEventListener('mouseleave', () => { 
                    cursor.classList.remove('is-hover'); 
                    follower.classList.remove('is-hover'); 
                    follower.classList.remove('has-text');
                    follower.removeAttribute('data-text');
                });
            });

            magneticEls.forEach(el => {
                el.addEventListener('mousemove', (e) => {
                    // Disable mouse-follow magnetic displacement on mobile screens (width <= 768px)
                    if (window.innerWidth <= 768) return;

                    const rect = el.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
                    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
                    gsap.to(el, { x, y, duration: 0.4 });
                });
                el.addEventListener('mouseleave', () => {
                    if (window.innerWidth <= 768) return;
                    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
                });
            });
        }
    } catch (err) { console.error("Cursor error:", err); }

    // 5. Badge Card Interactive 3D Tilt, Drag & Flip
    const idCard = document.querySelector('.id-card');
    const idCardInner = document.querySelector('.id-card-inner');
    const cardShadow = document.querySelector('.card-shadow');
    const claspWrapper = document.getElementById('clasp-wrapper');
    const lanyardSvg = document.getElementById('lanyard-svg');
    const lanyardAssembly = document.querySelector('.lanyard-assembly');
    const lanyardClipDummy = document.getElementById('lanyard-clip-dummy');

    if (idCard && idCardInner) {
        let isFlipped = false;

        // Hide custom cursor and show native grab pointer on hover
        const customCursor = document.querySelector('.cursor');
        const customFollower = document.querySelector('.cursor-follower');
        if (customCursor && customFollower) {
            idCard.addEventListener('mouseenter', () => {
                customCursor.classList.add('hide-custom-cursor');
                customFollower.classList.add('hide-custom-cursor');
            });
            idCard.addEventListener('mouseleave', () => {
                customCursor.classList.remove('hide-custom-cursor');
                customFollower.classList.remove('hide-custom-cursor');
            });
        }
        
        // Ensure 3D perspective
        gsap.set(idCard, { transformPerspective: 1000, transformStyle: "preserve-3d" });
        if (cardShadow) {
            gsap.set(cardShadow, { transformPerspective: 1000, transformStyle: "preserve-3d" });
        }

        // Layout Coordinate Caching to completely eliminate layout reflows (getBoundingClientRect)
        let cardCenterX = 0;
        let cardCenterY = 0;
        
        function updateCardCenter() {
            const rect = idCard.getBoundingClientRect();
            cardCenterX = rect.left + rect.width / 2;
            cardCenterY = rect.top + rect.height / 2;
        }
        
        // Initial coordinate caching
        updateCardCenter();
        
        // Re-cache only when window resize or page scrolling happens
        window.addEventListener('resize', updateCardCenter);
        window.addEventListener('scroll', updateCardCenter, { passive: true });

        // Hover & 3D Tilt State
        let isHovered = false;
        
        // Target values for smooth Lerping (rotation)
        const target = { x: 0, y: 0, lanyardStretch: 1, flipY: 0 };
        const current = { x: 0, y: 0, lanyardStretch: 1, rotation: 0, flipY: 0 };

        // Drag State
        let isDragging = false;
        let startMouseX = 0, startMouseY = 0;
        let clickStartX = 0, clickStartY = 0;
        const dragTarget = { x: 0, y: 0 };
        const currentDrag = { x: 0, y: 0 };
        const dragVel = { x: 0, y: 0 }; // Velocity for heavy follow
        
        // Dual-Point Cloth Physics State (Soft Fabric Simulation)
        // Two independent control points create an S-curve like real fabric
        const clothP1 = { x: 70, y: 44 };   // Upper control point (near anchor)
        const clothP2 = { x: 70, y: 138 };  // Lower control point (near clasp)
        const clothV1 = { x: 0, y: 0 };     // Velocity for upper point
        const clothV2 = { x: 0, y: 0 };     // Velocity for lower point

        const isMobile = window.innerWidth < 1024;
        const maxRotationX = isMobile ? 15 : 22;
        const maxRotationY = isMobile ? 45 : 80;
        const lerpSpeed = 0.12; 
        
        // PERFORMANCE OPTIMIZATION: Cache DOM elements outside the ticker
        const strapPaths = document.querySelectorAll('.dynamic-strap');
        const sheenFront = document.querySelector('.card-front .card-sheen');
        const sheenBack = document.querySelector('.card-back .card-sheen');
        const shadingFront = document.querySelector('.card-front .card-shading');
        const shadingBack = document.querySelector('.card-back .card-shading');

        // Dynamic scale, proximity and click state tracking
        let currentProximity = 0;
        let currentScale = 1;
        let scaleMultiplier = 1;

        // Track last updated tilt values to skip redundant background/opacity DOM updates when near-motionless
        let lastTiltX = 0;
        let lastTiltY = 0;
        const updateThreshold = 0.04; // 0.04 degree delta threshold

        // Custom Ticker for fluid continuous 6DOF movement
        gsap.ticker.add(() => {
            // Lerp hover rotations
            current.x += (target.x - current.x) * lerpSpeed;
            current.y += (target.y - current.y) * lerpSpeed;
            current.lanyardStretch += (target.lanyardStretch - current.lanyardStretch) * lerpSpeed;
            
            // Smooth flip rotation (card + clasp rotate together)
            current.flipY += (target.flipY - current.flipY) * 0.1;

            // Smooth delayed follow — responsive but never snappy
            if (isDragging) {
                const followStiffness = 0.04; // Heavier, more fluid follow
                const damping = 0.88;          // Silky smooth settlement with more drift
                
                dragVel.x += (dragTarget.x - currentDrag.x) * followStiffness;
                dragVel.y += (dragTarget.y - currentDrag.y) * followStiffness;
                
                dragVel.x *= damping;
                dragVel.y *= damping;
                
                currentDrag.x += dragVel.x;
                currentDrag.y += dragVel.y;
            }

            // ===== Soft Fabric Lanyard Physics =====
            const Ax = 70;
            const Ay = -50;
            const Bx = 70 + currentDrag.x;
            const By = 232 + currentDrag.y;
            
            // Resting length
            const L = 282;
            const dx = Bx - Ax;
            const dy = By - Ay;
            const D = Math.sqrt(dx * dx + dy * dy);
            
            // Stretch factor — fabric stretches slightly when pulled taut
            const stretchRatio = D / L;
            const stretch = Math.min(stretchRatio, 1.08); // Cap at 8% stretch
            
            // Droop — fabric sags when slack, less sag when taut
            const slack = Math.max(0, 1 - stretchRatio);
            const droop = slack * L * 0.6;
            
            // Ideal resting positions for each control point (along the straight line)
            const idealP1x = Ax + dx * 0.33;
            const idealP1y = Ay + dy * 0.33 + droop * 0.4;
            
            const idealP2x = Ax + dx * 0.67;
            const idealP2y = Ay + dy * 0.67 + droop * 0.9;
            
            // Subtle gravity — just enough to feel organic, not enough to fight springs
            const gravity = 0.04;
            
            // --- Upper control point: tracks closely, settles fast ---
            const stiffP1 = 0.04;
            const dampP1 = 0.92;
            
            clothV1.x += (idealP1x - clothP1.x) * stiffP1;
            clothV1.y += (idealP1y - clothP1.y) * stiffP1 + gravity;
            clothV1.x *= dampP1;
            clothV1.y *= dampP1;
            clothP1.x += clothV1.x;
            clothP1.y += clothV1.y;
            
            // --- Lower control point: trails with soft delay, gentle bounce ---
            const stiffP2 = 0.02;
            const dampP2 = 0.90;
            
            clothV2.x += (idealP2x - clothP2.x) * stiffP2;
            clothV2.y += (idealP2y - clothP2.y) * stiffP2 + gravity;
            clothV2.x *= dampP2;
            clothV2.y *= dampP2;
            clothP2.x += clothV2.x;
            clothP2.y += clothV2.y;
            
            // Generate Cubic Bezier Path (S-curve like real fabric)
            const pathData = `M ${Ax} ${Ay} C ${clothP1.x} ${clothP1.y}, ${clothP2.x} ${clothP2.y}, ${Bx} ${By}`;
            
            // Natural Follow System: Lerp the rotation for physical weight
                const targetRotation = (Math.atan2(By - clothP2.y, Bx - clothP2.x) * 180 / Math.PI) - 90;
                
                // Handle angle wrapping for smooth continuous rotation
                let diff = targetRotation - current.rotation;
                while (diff < -180) diff += 360;
                while (diff > 180) diff -= 360;
                current.rotation += diff * 0.1; // Softer rotation follow

            const angleRad = current.rotation * Math.PI / 180;

            // Velocity-based tilt feels more organic and "free" than position-based tilt
            const dragTiltX = dragVel.y * -1.5; 
            const dragTiltY = dragVel.x * 1.5;  

            // Update all dynamic strap paths to curve smoothly
            strapPaths.forEach(path => {
                path.setAttribute("d", pathData);
            });

            // Make sure lanyard assembly does NOT rotate as a rigid body anymore
            if (lanyardAssembly) {
                gsap.set(lanyardAssembly, { rotateZ: 0 }); 
            }

            const bucklePivotY = 220; 
            const strapToBuckleOffset = 12; 

            if (claspWrapper) {
                // Subtle 3D tilt for the clasp itself based on movement and card tilt
                // This makes the layered 3D effect of the clasp much more apparent
                const claspTiltX = (current.x + dragTiltX) * 0.4;
                const claspTiltY = (current.y + dragTiltY) * 0.4;

                gsap.set(claspWrapper, {
                    x: currentDrag.x,
                    y: currentDrag.y + strapToBuckleOffset,
                    z: 0,
                    rotateX: claspTiltX,
                    rotateY: claspTiltY, // Swivel clasp hook tilts but stays attached without flipping
                    rotateZ: current.rotation,
                    transformOrigin: `50% ${bucklePivotY}px`,
                    transformPerspective: 1500
                });
            }

            // Dynamic Y-axis twist based on horizontal drag displacement
            const dragTwistY = currentDrag.x * 0.55;

            // Local tilt for the card remains relative to its parent (the clasp)
            const tiltX = current.x + dragTiltX;
            const tiltY = current.y + dragTiltY + dragTwistY;

            // Skip expensive background gradient redrawing & opacity updates if rotation change is microscopic
            const deltaX = Math.abs(tiltX - lastTiltX);
            const deltaY = Math.abs(tiltY - lastTiltY);
            
            if (deltaX > updateThreshold || deltaY > updateThreshold) {
                lastTiltX = tiltX;
                lastTiltY = tiltY;

                // Specular Highlight calculations (shifting light origin based on tilt)
                const highlightFrontX = 50 + (tiltY * 3.5);
                const highlightFrontY = 50 - (tiltX * 3.5);
                const highlightBackX = 50 - (tiltY * 3.5); // Inverted for back side Y rotation
                const highlightBackY = 50 - (tiltX * 3.5);

                if (sheenFront) {
                    sheenFront.style.background = `radial-gradient(circle at ${highlightFrontX}% ${highlightFrontY}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 55%)`;
                }
                if (sheenBack) {
                    sheenBack.style.background = `radial-gradient(circle at ${highlightBackX}% ${highlightBackY}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 55%)`;
                }

                // Subtle surface shading darkening when tilting away from light source
                if (shadingFront) {
                    const darkness = Math.max(0, Math.min(0.22, (tiltX * 0.008) + (Math.abs(tiltY) * 0.005)));
                    shadingFront.style.opacity = darkness;
                }
                if (shadingBack) {
                    // Inverted tiltX contribution because back is rotated 180 degrees
                    const darkness = Math.max(0, Math.min(0.22, (-tiltX * 0.008) + (Math.abs(tiltY) * 0.005)));
                    shadingBack.style.opacity = darkness;
                }
            }

            // Dynamic physical shadow trailing
            const shadowX = -tiltY * 1.5 - (currentDrag.x * 0.12);
            const shadowY = 16 - (tiltX * 1.5) + (currentDrag.y * 0.15);
            const shadowAlpha = Math.max(0.1, (0.2 + (currentProximity * 0.15)) - (currentDrag.y * 0.0008));

            // Smooth scale lerping
            const targetScale = (1 + (currentProximity * 0.03)) * scaleMultiplier;
            currentScale += (targetScale - currentScale) * 0.12;

            // Apply style with perspective, X-axis swing tilt, scale to outer container
            gsap.set(idCard, {
                transformPerspective: 1200,
                rotateX: tiltX, // X-axis swing physics only
                scale: currentScale,
                transformOrigin: "50% 23.1px"
            });

            // Apply Y-axis 3D rotation, drag twisting, and flipY ONLY to the inner wrapper
            const finalRotationY = tiltY + current.flipY;
            gsap.set(idCardInner, {
                transformStyle: "preserve-3d",
                rotateY: finalRotationY // Decoupled Y-axis rotation only
            });

            // Apply high-performance GPU-composited shadow transforms in sync with card
            if (cardShadow) {
                const shadowScale = currentScale * 0.95;
                gsap.set(cardShadow, {
                    transformPerspective: 1200,
                    x: shadowX,
                    y: shadowY,
                    scale: shadowScale,
                    opacity: shadowAlpha,
                    rotateX: tiltX,
                    rotateY: finalRotationY,
                    transformOrigin: "50% 23.1px"
                });
            }
        });

        // Real-Time Global Pointer Tracking for Continuous 3D Tilt and Proximity Effects
        window.addEventListener('pointermove', (e) => {
            // Drag Physical Tracking Logic - MUST BE FIRST TO AVOID LAG
            if (isDragging) {
                dragTarget.x = e.clientX - startMouseX;
                dragTarget.y = e.clientY - startMouseY;
                return; // 🚀 CRITICAL: Skip expensive DOM reads while dragging to prevent layout thrashing
            }

            // Track mouse position relative to the cached card center to completely avoid layout reflows
            const distanceX = e.clientX - cardCenterX;
            const distanceY = e.clientY - cardCenterY;
            
            // Proximity calculation for real-time scale and shadow
            const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const maxDist = 450; 
            currentProximity = Math.max(0, 1 - dist / maxDist);
            
            // Update card rotation continuously based on cursor position, scaled by proximity
            const sensitivityY = 0.18; 
            const sensitivityX = 0.08;
            target.y = Math.max(-maxRotationY, Math.min(maxRotationY, distanceX * sensitivityY)) * currentProximity;
            target.x = Math.max(-maxRotationX, Math.min(maxRotationX, -distanceY * sensitivityX)) * currentProximity;
        });

        // Reset tracking when mouse completely leaves the browser window
        document.addEventListener('mouseleave', () => {
            target.x = 0;
            target.y = 0;
            currentProximity = 0;
        });

        // Click, Drag & Release Interactions
        let isPressed = false;
        
        idCard.addEventListener('pointerdown', (e) => {
            // Prevent default behavior to block browser-level drag-and-drop and text selection
            if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
                e.preventDefault();
            }
            
            isPressed = true;
            isDragging = true;
            document.body.classList.add('card-dragging');
            clickStartX = e.clientX;
            clickStartY = e.clientY;
            
            // Reset hover tilt targets so it doesn't stay tilted from the edge grab during drag
            target.x = 0;
            target.y = 0;

            // Preserve current offsets to prevent jumping if grabbed while bouncing
            startMouseX = e.clientX - currentDrag.x;
            startMouseY = e.clientY - currentDrag.y;
            dragTarget.x = currentDrag.x;
            dragTarget.y = currentDrag.y;
            
            // Reset velocity to prevent snapping on grab
            dragVel.x = 0;
            dragVel.y = 0;
            
            // Stop any active bounce-back tweens
            gsap.killTweensOf(currentDrag);

            scaleMultiplier = 0.97;
        });

        window.addEventListener('pointerup', handleRelease);
        window.addEventListener('pointercancel', handleRelease);

        function handleRelease(e) {
            if (isDragging || isPressed) {
                isPressed = false;
                isDragging = false;
                document.body.classList.remove('card-dragging');

                // Check if it was a quick click vs a drag
                const distMoved = Math.abs(e.clientX - clickStartX) + Math.abs(e.clientY - clickStartY);
                
                // Increased threshold (30px) for more reliable click detection on swinging objects
                if (distMoved < 30) {
                    // It was a click! Trigger Flip — animate via GSAP target
                    isFlipped = !isFlipped;
                    target.flipY = isFlipped ? 180 : 0;
                }

                // Smoothly return to neutral with a gentle, loose elastic settle
                gsap.to(currentDrag, {
                    x: 0,
                    y: 0,
                    duration: 3.5,
                    ease: "elastic.out(1, 0.9)"
                });
                dragTarget.x = 0;
                dragTarget.y = 0;
                dragVel.x = 0;
                dragVel.y = 0;

                // Smoothly restore resting scale
                scaleMultiplier = 1.0;
            }
        }
    }

    // 6. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        ScrollTrigger.create({
            start: 'top -50',
            onUpdate: (self) => {
                if (self.direction === 1) navbar.classList.add('scrolled');
                else if (self.scroll() < 50) navbar.classList.remove('scrolled');
            }
        });
    }

    // 7. General Scroll Animations
    gsap.utils.toArray('.parallax-img').forEach(img => {
        // Disable image scroll parallax on mobile screens (width <= 768px) to keep cards completely stable
        if (window.innerWidth <= 768) {
            gsap.set(img, { y: 0 });
            return;
        }
        gsap.to(img, {
            y: "15%",
            scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
    });

    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            y: 50, opacity: 0, duration: 1, 
            scrollTrigger: { trigger: title, start: "top 90%" }
        });
    });

    gsap.utils.toArray('.contact-anim').forEach((anim) => {
        if (!document.querySelector('.contact-page-wrapper')) {
            gsap.from(anim, {
                y: 30, opacity: 0, duration: 1, ease: "power3.out",
                scrollTrigger: { trigger: anim, start: "top 90%" }
            });
        }
    });

    if (document.querySelector('.work-hero')) {
        gsap.utils.toArray('.work-item').forEach((item) => {
            gsap.from(item, {
                y: 100, opacity: 0, duration: 1,
                scrollTrigger: { trigger: item, start: "top 85%" }
            });
        });
    }

    if (document.querySelector('.about-section')) {
        gsap.from(".about-anim", {
            y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out",
            scrollTrigger: { trigger: ".about-text-col", start: "top 80%" }
        });
        document.querySelectorAll('.stat-number').forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            ScrollTrigger.create({
                trigger: stat, start: "top 85%", once: true,
                onEnter: () => {
                    gsap.to(stat, { 
                        innerHTML: target, 
                        duration: 2.5, 
                        snap: { innerHTML: 1 }, 
                        ease: "power4.out",
                        onUpdate: function() {
                            const val = Math.round(this.targets()[0].innerHTML);
                            stat.innerHTML = val < 10 ? `0${val}` : val;
                        }
                    });
                }
            });
        });
    }

    // 8. Umbaui Cinematic Slideshow Logic
    const umbauiSlides = document.querySelectorAll('.umbaui-slideshow .slide');
    if (umbauiSlides.length > 0) {
        let currentSlide = 0;
        // 5-second delay between slides
        setInterval(() => {
            umbauiSlides[currentSlide].classList.remove('slide-active');
            currentSlide = (currentSlide + 1) % umbauiSlides.length;
            umbauiSlides[currentSlide].classList.add('slide-active');
        }, 5000);
    }

    // 8.1. Furni Cinematic Slideshow Logic (Project 2)
    const furniSlides = document.querySelectorAll('.furni-slideshow .slide');
    if (furniSlides.length > 0) {
        let currentFurniSlide = 0;
        setInterval(() => {
            furniSlides[currentFurniSlide].classList.remove('slide-active');
            currentFurniSlide = (currentFurniSlide + 1) % furniSlides.length;
            furniSlides[currentFurniSlide].classList.add('slide-active');
        }, 5000);
    }

    // 9. Contact Page Form Logic
    if (document.querySelector('.contact-page-wrapper')) {
        const form = document.getElementById('contactForm');
        const submitBtn = document.querySelector('.submit-btn');
        const btnText = document.getElementById('btn-text');
        const successOverlay = document.getElementById('successMessage');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                btnText.innerText = "Sending...";
                submitBtn.style.pointerEvents = "none";
                submitBtn.style.opacity = "0.7";
                setTimeout(() => { successOverlay.classList.add('active'); }, 1500);
            });
        }
    }

    // ==========================================
    // 10. Google Analytics 4 Custom Event Tracking
    // ==========================================
    if (typeof gtag === 'function') {
        // Track project card clicks (both inside grids and lists)
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a');
            if (!anchor) return;
            
            const href = anchor.getAttribute('href');
            if (!href) return;
            
            const isProjectCard = anchor.classList.contains('project-card') || 
                                 anchor.closest('.project-card') || 
                                 anchor.classList.contains('work-item') || 
                                 anchor.closest('.work-item');
                                 
            if (isProjectCard) {
                const projectTitle = anchor.querySelector('h3') ? anchor.querySelector('h3').innerText.trim() : 'Unknown Project';
                gtag('event', 'project_card_click', {
                    event_category: 'engagement',
                    project_title: projectTitle,
                    project_url: href
                });
            }
            
            // Track outbound website visits and external project link clicks
            if (href.startsWith('http://') || href.startsWith('https://')) {
                const isInternal = href.includes(window.location.hostname);
                if (!isInternal) {
                    gtag('event', 'unbound_click', {
                        event_category: 'outbound',
                        destination_url: href,
                        link_text: anchor.innerText.trim() || anchor.getAttribute('aria-label') || 'Icon Link'
                    });
                }
            }
        }, { passive: true });
    }
});
