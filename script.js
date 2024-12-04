// Code original ajusté pour centrer uniquement la lettre

// Configuration de base
const container = document.getElementById('container');
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

// Étoiles en arrière-plan
function createDynamicStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    size: 0.1,
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
  });

  const starCount = 2000;
  const positions = [];
  const colors = [];
  for (let i = 0; i < starCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );
    colors.push(Math.random(), Math.random(), Math.random());
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  return stars;
}

const stars = createDynamicStars();

// Explosion de la planète
let planetDestroyed = false;
let particles = null;

function explodePlanet() {
  if (planetDestroyed) return;
  planetDestroyed = true;

  // Supprimer la planète
  scene.remove(planet);

  // Particules d'explosion
  const particleGeometry = new THREE.BufferGeometry();
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
  });

  const particleCount = 500;
  const positions = [];
  const velocities = [];
  const colors = [];
  for (let i = 0; i < particleCount; i++) {
    positions.push(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    );

    velocities.push(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    );

    colors.push(Math.random(), Math.random(), Math.random());
  }

  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  particleGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
  particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Afficher le texte après un délai
  setTimeout(() => {
    displayLetter();
  }, 3000);
}

// Affichage de la lettre centrée
function displayLetter() {
  const loader = new THREE.FontLoader();

  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const message = `
      Ma chérie d’amour je voulais t’écrire cette lettre pour ta deuxième journée d’ebc je voulais te dire que déjà de une je nique ton reuf a la bagarre mais sa c’est un détaille Nn en sah jeudi c’est shs donc pour cette occasion j voulais sortir mon bagage en bac literature donc premièrement tu dois bien lire psk avec toi des fois ton œil il part a de l’autre sens tkt pas t trop mignonne comme sa( la musique elle pt ta vu ) nn en vrai sah cette fois ne stresse pas je sais que t malade je pense que dans ta tête sa explose pareil que ici j’espère sa ira mieux dm in shaa allah ne stresse pas fais ce que je t’ai dit fermé les yeux et tu respire. Je serais tjr près de toi mm de loin 

    Tu a bosser comme une folle mais tu ne l’es pas rassure toi donc il y’a pas de chance que tu ne réussi mm ton concours petite lettre d’amour pour te motiver 

    Et n’oublie pas on peut toujours revenir en arrière ( click sur la lettre❤️.
    `;

    const textSize = Math.min(window.innerWidth / 40, 0.5);

    const textGeometry = new THREE.TextGeometry(message, {
      font: font,
      size: textSize,
      height: 0.1,
      curveSegments: 12,
    });

    const textMaterial = new THREE.MeshStandardMaterial({ color: 0xff5555 });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Centrage dynamique
    textGeometry.computeBoundingBox();
    const centerOffsetX = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
    const centerOffsetY = -0.5 * (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
    textMesh.position.set(centerOffsetX, centerOffsetY, 0);

    scene.add(textMesh);
  });
}

// Animation
camera.position.z = 5;
function animate() {
  requestAnimationFrame(animate);

  if (!planetDestroyed) {
    planet.rotation.y += 0.01;
  }

  if (particles) {
    const particlePositions = particles.geometry.attributes.position;
    const particleVelocities = particles.geometry.attributes.velocity;

    for (let i = 0; i < particlePositions.count; i++) {
      particlePositions.array[i * 3] += particleVelocities.array[i * 3];
      particlePositions.array[i * 3 + 1] += particleVelocities.array[i * 3 + 1];
      particlePositions.array[i * 3 + 2] += particleVelocities.array[i * 3 + 2];
    }
    particlePositions.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

animate();

// Gestion des clics
window.addEventListener('click', () => {
  explodePlanet();
});

// Gestion des redimensionnements
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});