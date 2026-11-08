/* ==============================================================
   SANATAN KATHA — 3D JavaScript (Three.js + GSAP + Tilt)
   ============================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===============================
    // 1. THREE.JS COSMIC BACKGROUND
    // ===============================
    const canvas = document.getElementById('three-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // --- Stars ---
    const starCount = 2500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3]     = (Math.random() - 0.5) * 50;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        starSizes[i] = Math.random() * 2 + 0.5;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color('#ffd700') },
            uColor2: { value: new THREE.Color('#ff6b00') },
        },
        vertexShader: `
            attribute float size;
            uniform float uTime;
            varying float vAlpha;
            void main() {
                vec3 pos = position;
                pos.y += sin(uTime * 0.1 + position.x * 0.5) * 0.1;
                vAlpha = 0.4 + 0.6 * sin(uTime + position.z * 2.0);
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (80.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            varying float vAlpha;
            void main() {
                float d = length(gl_PointCoord - vec2(0.5));
                if (d > 0.5) discard;
                float glow = 1.0 - smoothstep(0.0, 0.5, d);
                vec3 color = mix(uColor1, uColor2, vAlpha);
                gl_FragColor = vec4(color, glow * vAlpha * 0.7);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Golden Dust Particles ---
    const dustCount = 800;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustSize = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
        dustPos[i * 3]     = (Math.random() - 0.5) * 20;
        dustPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 15;
        dustSize[i] = Math.random() * 3 + 1;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('size', new THREE.BufferAttribute(dustSize, 1));

    const dustMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
            attribute float size;
            uniform float uTime;
            varying float vAlpha;
            void main() {
                vec3 pos = position;
                pos.x += sin(uTime * 0.3 + position.y * 2.0) * 0.3;
                pos.y += cos(uTime * 0.2 + position.x * 1.5) * 0.2;
                pos.y = mod(pos.y + 10.0 + uTime * 0.05, 20.0) - 10.0;
                vAlpha = 0.3 + 0.7 * sin(uTime * 0.5 + position.z * 3.0);
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (60.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vAlpha;
            void main() {
                float d = length(gl_PointCoord - vec2(0.5));
                if (d > 0.5) discard;
                float glow = 1.0 - smoothstep(0.0, 0.5, d);
                gl_FragColor = vec4(1.0, 0.85, 0.0, glow * vAlpha * 0.25);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // --- Sacred Geometry (floating wireframe shapes) ---
    const geoGroup = new THREE.Group();
    scene.add(geoGroup);

    const wireframeMat = (color, opacity) => new THREE.MeshBasicMaterial({
        color, wireframe: true, transparent: true, opacity,
        blending: THREE.AdditiveBlending,
    });

    // Icosahedron
    const ico = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.6, 0),
        wireframeMat('#ffd700', 0.08)
    );
    ico.position.set(-4, 2, -3);
    geoGroup.add(ico);

    // Octahedron
    const oct = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.5, 0),
        wireframeMat('#ff6b00', 0.06)
    );
    oct.position.set(4, -1, -4);
    geoGroup.add(oct);

    // Dodecahedron
    const dod = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.4, 0),
        wireframeMat('#9b59b6', 0.07)
    );
    dod.position.set(-2, -3, -2);
    geoGroup.add(dod);

    // Torus (sacred ring)
    const torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.05, 8, 32),
        wireframeMat('#ffd700', 0.05)
    );
    torus.position.set(3, 3, -5);
    geoGroup.add(torus);

    // Torus Knot
    const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.5, 0.08, 64, 8),
        wireframeMat('#ff6b00', 0.04)
    );
    knot.position.set(-5, -2, -6);
    geoGroup.add(knot);

    // --- Nebula Planes ---
    const nebulaGeo = new THREE.PlaneGeometry(30, 30);
    const nebulaMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform float uScroll;
            varying vec2 vUv;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            void main() {
                vec2 uv = vUv * 3.0;
                float n = 0.0;
                n += 0.5 * noise(uv + uTime * 0.02);
                n += 0.25 * noise(uv * 2.0 - uTime * 0.03);
                n += 0.125 * noise(uv * 4.0 + uTime * 0.01);

                float scrollPhase = uScroll * 0.3;
                vec3 c1 = vec3(0.4, 0.1, 0.0);  // saffron
                vec3 c2 = vec3(0.05, 0.05, 0.2); // deep blue
                vec3 c3 = vec3(0.3, 0.0, 0.15);  // maroon
                vec3 c4 = vec3(0.0, 0.15, 0.3);  // teal

                vec3 color = mix(mix(c1, c2, sin(scrollPhase) * 0.5 + 0.5),
                                 mix(c3, c4, cos(scrollPhase * 0.7) * 0.5 + 0.5),
                                 n);

                float alpha = n * 0.12;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
    });

    const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebula.position.z = -10;
    scene.add(nebula);

    // --- Mouse tracking for parallax ---
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // --- Scroll tracking ---
    let scrollProgress = 0;
    window.addEventListener('scroll', () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = window.scrollY / maxScroll;
    });

    // --- Render loop ---
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Smooth mouse
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Star uniforms
        starMat.uniforms.uTime.value = t;
        dustMat.uniforms.uTime.value = t;
        nebulaMat.uniforms.uTime.value = t;
        nebulaMat.uniforms.uScroll.value = scrollProgress * Math.PI * 4;

        // Camera follows mouse
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        // Rotate stars slowly
        stars.rotation.y = t * 0.01 + scrollProgress * 0.5;
        stars.rotation.x = t * 0.005;
        dust.rotation.y = -t * 0.015;

        // Rotate geometry
        ico.rotation.x = t * 0.3;
        ico.rotation.y = t * 0.2;
        oct.rotation.x = -t * 0.25;
        oct.rotation.z = t * 0.15;
        dod.rotation.y = t * 0.35;
        dod.rotation.z = -t * 0.2;
        torus.rotation.x = t * 0.2;
        torus.rotation.y = t * 0.3;
        knot.rotation.x = t * 0.15;
        knot.rotation.y = -t * 0.1;

        // Float geometry
        ico.position.y = 2 + Math.sin(t * 0.5) * 0.5;
        oct.position.y = -1 + Math.cos(t * 0.4) * 0.4;
        dod.position.y = -3 + Math.sin(t * 0.6) * 0.3;
        torus.position.y = 3 + Math.cos(t * 0.3) * 0.6;

        renderer.render(scene, camera);
    }
    animate();

    // --- Resize ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });


    // ===============================
    // 2. CURSOR GLOW EFFECT
    // ===============================
    const cursorGlow = document.getElementById('cursor-glow');
    let cursorX = 0, cursorY = 0, glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    function updateCursor() {
        glowX += (cursorX - glowX) * 0.08;
        glowY += (cursorY - glowY) * 0.08;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(updateCursor);
    }
    updateCursor();


    // ===============================
    // 3. 3D TILT EFFECT ON CARDS
    // ===============================
    const tiltElements = document.querySelectorAll('[data-tilt]');
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });


    // ===============================
    // 4. SCROLL REVEAL ANIMATIONS
    // ===============================
    gsap.registerPlugin(ScrollTrigger);

    // Reveal elements with stagger
    const revealSelectors = [
        '.reveal-3d', '.section-header',
        '.deity-card', '.avatar-card', '.goddess-card',
        '.creature-card', '.epic-card', '.cosmo-card',
        '.text-card', '.stat-card-3d', '.quote-3d'
    ];

    revealSelectors.forEach(selector => {
        gsap.utils.toArray(selector).forEach((el, i) => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.9,
                delay: i % 4 * 0.12,
                ease: 'power3.out',
                onStart: () => el.classList.add('revealed'),
            });
        });
    });

    // Hero parallax on scroll
    const heroContent = document.querySelector('.hero-content');
    gsap.to(heroContent, {
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        },
        y: 200,
        opacity: 0,
        scale: 0.9,
    });

    // Section headings slide in
    gsap.utils.toArray('.heading-3d').forEach(h => {
        gsap.from(h, {
            scrollTrigger: { trigger: h, start: 'top 85%' },
            x: -60, opacity: 0, duration: 1, ease: 'power3.out',
        });
    });

    // Labels fade in
    gsap.utils.toArray('.label').forEach(l => {
        gsap.from(l, {
            scrollTrigger: { trigger: l, start: 'top 85%' },
            y: 20, opacity: 0, duration: 0.6, ease: 'power2.out',
        });
    });


    // ===============================
    // 5. COUNTER ANIMATION
    // ===============================
    document.querySelectorAll('.stat-n').forEach(el => {
        const target = parseInt(el.dataset.target);
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: function() { el.textContent = Math.round(this.targets()[0].val); },
                });
            },
        });
    });


    // ===============================
    // 6. NAVBAR
    // ===============================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    });

    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => navLinks.classList.remove('open'));
    });

    // Active link highlighting
    const sections = document.querySelectorAll('section[id], header[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 200) current = s.id;
        });
        navLinks.querySelectorAll('a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });


    // ===============================
    // 7. AVATAR CARDS STAGGER
    // ===============================
    gsap.utils.toArray('.avatar-card').forEach((card, i) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
            },
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
            delay: i * 0.08,
            ease: 'back.out(1.4)',
        });
    });

});
