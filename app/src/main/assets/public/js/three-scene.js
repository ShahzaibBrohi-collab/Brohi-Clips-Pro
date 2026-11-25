/* Brohi Clips Pro — 3D Three.js Visuals & 3D Avatar Module */

export class ThreeSceneManager {
  constructor() {
    this.bgCanvas = document.getElementById('three-bg');
    this.avatarCanvas = document.getElementById('avatar-canvas');
    this.initBg();
    this.initAvatar();
    this.setupResize();
  }

  initBg() {
    if (!this.bgCanvas || !window.THREE) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 24;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.bgCanvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Outer Imperial Gold Icosahedron Wireframe
    const geo = new THREE.IcosahedronGeometry(9.5, 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffc81f,
      wireframe: true,
      transparent: true,
      opacity: 0.16
    });
    this.coreMesh = new THREE.Mesh(geo, mat);
    this.scene.add(this.coreMesh);

    // Inner Glowing Cyan Core
    const innerGeo = new THREE.SphereGeometry(4.2, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    this.innerMesh = new THREE.Mesh(innerGeo, innerMat);
    this.scene.add(this.innerMesh);

    // Golden Orbital Rings
    const ringGeo = new THREE.TorusGeometry(12.5, 0.09, 16, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffe26b,
      transparent: true,
      opacity: 0.35
    });
    this.ring1 = new THREE.Mesh(ringGeo, ringMat);
    this.ring1.rotation.x = Math.PI / 3;
    this.scene.add(this.ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.25
    });
    this.ring2 = new THREE.Mesh(ringGeo, ringMat2);
    this.ring2.rotation.y = Math.PI / 4;
    this.scene.add(this.ring2);

    // Interactive Touch/Mouse Rotation
    this.rotTargetX = 0;
    this.rotTargetY = 0;
    this.isDragging = false;
    this.prevX = 0;
    this.prevY = 0;

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.prevX = e.clientX || e.touches?.[0]?.clientX || 0;
      this.prevY = e.clientY || e.touches?.[0]?.clientY || 0;
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const x = e.clientX || e.touches?.[0]?.clientX || 0;
      const y = e.clientY || e.touches?.[0]?.clientY || 0;
      const dx = x - this.prevX;
      const dy = y - this.prevY;
      this.rotTargetY += dx * 0.005;
      this.rotTargetX += dy * 0.005;
      this.prevX = x;
      this.prevY = y;
    };

    const onPointerUp = () => { this.isDragging = false; };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    const animate = () => {
      requestAnimationFrame(animate);

      this.coreMesh.rotation.y += 0.0018 + (this.rotTargetY - this.coreMesh.rotation.y) * 0.05;
      this.coreMesh.rotation.x += 0.0012 + (this.rotTargetX - this.coreMesh.rotation.x) * 0.05;

      this.innerMesh.rotation.y -= 0.003;
      this.ring1.rotation.z += 0.0025;
      this.ring2.rotation.x += 0.0025;

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  initAvatar() {
    if (!this.avatarCanvas || !window.THREE) return;

    this.avatarScene = new THREE.Scene();
    this.avatarCam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    this.avatarCam.position.z = 5.2;

    this.avatarRenderer = new THREE.WebGLRenderer({
      canvas: this.avatarCanvas,
      alpha: true,
      antialias: true
    });
    this.avatarRenderer.setSize(120, 120);

    const headGeo = new THREE.BoxGeometry(2, 2.2, 1.8);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x16131d });
    this.avatarHead = new THREE.Mesh(headGeo, headMat);
    this.avatarScene.add(this.avatarHead);

    const visorGeo = new THREE.BoxGeometry(1.6, 0.5, 0.2);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xffc81f });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.3, 0.95);
    this.avatarHead.add(visor);

    const mouthGeo = new THREE.BoxGeometry(0.8, 0.18, 0.2);
    this.mouthMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    this.avatarMouth = new THREE.Mesh(mouthGeo, this.mouthMat);
    this.avatarMouth.position.set(0, -0.45, 0.95);
    this.avatarHead.add(this.avatarMouth);

    this.isAvatarSpeaking = false;

    const animAvatar = () => {
      requestAnimationFrame(animAvatar);

      this.avatarHead.rotation.y = Math.sin(Date.now() * 0.0015) * 0.12;
      this.avatarHead.rotation.x = Math.sin(Date.now() * 0.002) * 0.06;

      if (this.isAvatarSpeaking) {
        const scaleY = 1 + Math.abs(Math.sin(Date.now() * 0.02)) * 2.2;
        this.avatarMouth.scale.set(1, scaleY, 1);
      } else {
        this.avatarMouth.scale.set(1, 1, 1);
      }

      this.avatarRenderer.render(this.avatarScene, this.avatarCam);
    };
    animAvatar();
  }

  speak(text, durationMs = 4500) {
    const el = document.getElementById('avatar-speech');
    const container = document.getElementById('avatar-container');
    if (container) container.classList.remove('hidden');
    if (el) el.textContent = text;
    this.isAvatarSpeaking = true;

    clearTimeout(this._speakTimer);
    this._speakTimer = setTimeout(() => {
      this.isAvatarSpeaking = false;
      if (el) el.textContent = 'Brohi AI Ready';
    }, durationMs);
  }

  setupResize() {
    window.addEventListener('resize', () => {
      if (!this.renderer || !this.camera) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}

export function setup3DTiltCards() {
  document.querySelectorAll('.card-3d').forEach((card) => {
    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = -((y - cy) / cy) * 8;
      const rotY = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
    };

    const handleLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    card.addEventListener('touchmove', handleMove, { passive: true });
    card.addEventListener('touchend', handleLeave);
  });
}
