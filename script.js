// Configuration de la scène et du rendu
const container = document.getElementById('container');
const letter = document.getElementById('letter');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Lumières
const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Planète
const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
const planetMaterial = new THREE.MeshStandardMaterial({ color: 0x3399ff });
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);

// Variables globales
let planetDestroyed = false;
let particles = null;
let initialPositions = [];
let heartCenter = new THREE.Vector3(0, 0, 0); // Position cible du cœur

// Synchronisation : Centrer le cœur sur l'écriture
function syncHeartCenter() {
  const rect = letter.getBoundingClientRect(); // Récupère la position de l'écriture
  const x = (rect.left + rect.width / 2 - window.innerWidth / 2) / (window.innerWidth / 2);
  const y = -(rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight / 2);
  heartCenter.set(x * 2, y * 2, 0); // Conversion en coordonnées 3D (scène)
}

// Ajout des étoiles en arrière-plan
function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });

  const starCount = 1000;
  const starPositions = [];
  for (let i = 0; i < starCount; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 200, // X
      (Math.random() - 0.5) * 200, // Y
      (Math.random() - 0.5) * 200  // Z
    );
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

// Génération des positions en forme de cœur
function generateHeartShapePositions(count) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const t = Math.random() * 2 * Math.PI;
    const r = (Math.sin(t) * Math.sqrt(Math.abs(Math.cos(t)))) / (Math.sin(t) + 1.4) - 2 * Math.sin(t) + 2;
    const x = r * Math.cos(t) * 0.2 + heartCenter.x; // Échelle réduite + centrage
    const y = r * Math.sin(t) * 0.2 + heartCenter.y; // Échelle réduite + centrage
    const z = (Math.random() - 0.5) * 0.1 + heartCenter.z; // Légère variation en Z
    positions.push({ x, y, z });
  }
  return positions;
}

// Explosion de la planète
function explodePlanet() {
  if (particles) return; // Évite une nouvelle explosion si déjà en cours
  scene.remove(planet);
  syncHeartCenter(); // Met à jour la position cible du cœur

  const particleGeometry = new THREE.BufferGeometry();
  const particleMaterial = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0.9 });

  const particleCount = 500;
  const heartPositions = generateHeartShapePositions(particleCount); // Générer les positions en forme de cœur
  const positions = [];
  const velocities = [];
  const colors = [];

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 2;
    const z = (Math.random() - 0.5) * 2;

    positions.push(x, y, z);
    initialPositions.push(heartPositions[i]); // Position cible en forme de cœur

    velocities.push((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.03);
    colors.push(Math.random(), Math.random(), Math.random());
  }

  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  particleGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
  particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  setTimeout(() => { letter.style.display = 'block'; }, 3000);
}

// Réformation de la planète
function reformPlanet() {
  if (!particles) return; // Si pas de particules, aucune réformation
  const particlePositions = particles.geometry.attributes.position;
  const speed = 0.15; // Vitesse augmentée pour former le cœur rapidement
  let allParticlesReformed = true;

  for (let i = 0; i < particlePositions.count; i++) {
    const index = i * 3;

    const currentX = particlePositions.array[index];
    const currentY = particlePositions.array[index + 1];
    const currentZ = particlePositions.array[index + 2];

    const targetX = initialPositions[i].x;
    const targetY = initialPositions[i].y;
    const targetZ = initialPositions[i].z;

    // Met à jour la position
    particlePositions.array[index] += (targetX - currentX) * speed;
    particlePositions.array[index + 1] += (targetY - currentY) * speed;
    particlePositions.array[index + 2] += (targetZ - currentZ) * speed;

    // Vérifie si la particule est proche de la cible
    if (
      Math.abs(targetX - currentX) > 0.001 ||
      Math.abs(targetY - currentY) > 0.001 ||
      Math.abs(targetZ - currentZ) > 0.001
    ) {
      allParticlesReformed = false;
    }
  }

  // Indique que les positions ont été modifiées
  particlePositions.needsUpdate = true;

  if (allParticlesReformed) {
    console.log("Toutes les particules sont reformées !");
    scene.remove(particles);
    particles = null; // Réinitialise les particules
    letter.style.display = 'none'; // Cache la lettre
  } else {
    requestAnimationFrame(reformPlanet);
  }
}

// Événements
letter.addEventListener('click', () => reformPlanet());
window.addEventListener('click', () => { if (!planetDestroyed) { planetDestroyed = true; explodePlanet(); } });
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Animation principale
camera.position.z = 5;
addStars(); // Ajout des étoiles
function animate() {
  requestAnimationFrame(animate);

  if (!planetDestroyed && planet) planet.rotation.y += 0.01;

  if (particles) {
    const particlePositions = particles.geometry.attributes.position;
    const particleVelocities = particles.geometry.attributes.velocity;

    for (let i = 0; i < particlePositions.count; i++) {
      const index = i * 3;
      particlePositions.array[index] += particleVelocities.array[index];
      particlePositions.array[index + 1] += particleVelocities.array[index + 1];
      particlePositions.array[index + 2] += particleVelocities.array[index + 2];
    }

    particlePositions.needsUpdate = true;
  }

  renderer.render(scene, camera);
}
animate();
// Support pour les mobiles et les ordinateurs
letter.addEventListener('click', reformPlanet); // Pour les clics classiques
letter.addEventListener('touchstart', reformPlanet); // Pour les interactions tactiles

window.addEventListener('click', () => {
  if (!planetDestroyed) {
    planetDestroyed = true;
    explodePlanet();
  }
});
window.addEventListener('touchstart', () => {
  if (!planetDestroyed) {
    planetDestroyed = true;
    explodePlanet();
  }
});
