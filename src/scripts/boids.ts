/**
 * Boids Background Animation
 *
 * P5.js instance mode simulation with flocking behaviour,
 * network lines, and scatter/respawn tied to scroll position.
 */

import p5 from 'p5';

// =============================================================================
// Constants
// =============================================================================

// Behaviour
const POPULATION = 100;
const POPULATION_MOBILE = 50;
const SEPARATION = 2.8;
const ALIGNMENT = 1.6;
const COHESION = 0.9;
const PERCEPTION_RADIUS = 65;
const MAX_SPEED = 3.2;
const MAX_FORCE = 0.12;

// Theme colour mapping for boids and network lines (RGB values)
const THEME_COLOURS: Record<string, RGBColour> = {
  steel: { r: 58, g: 64, b: 74 },
  purple: { r: 70, g: 55, b: 80 },
  charcoal: { r: 75, g: 75, b: 75 },
  teal: { r: 45, g: 65, b: 65 },
};

// Fallback colour if theme not found
const DEFAULT_BOID_COLOUR: RGBColour = { r: 60, g: 60, b: 60 };

// Appearance
const BOID_SIZE = 4.5;
const BOID_WIDTH = 1.15;
const BOID_LENGTH = 1.7;
const BOID_INDENT = 0.2;
const NETWORK_OPACITY = 84;
const NETWORK_MAX_CONNECTIONS = 5;
const NETWORK_RANGE_MULTIPLIER = 2.5;

// Scatter
const SCATTER_SPEED = 6;
const SCATTER_FADE_DISTANCE = 100;

// Respawn
const RESPAWN_FADE_DURATION = 500;

// Canvas
const FRAME_RATE = 30;
const MOBILE_BREAKPOINT = 768;

// Element IDs
const CANVAS_CONTAINER_ID = 'boids-canvas';
const HERO_WORDMARK_ID = 'hero-wordmark';

// =============================================================================
// Colour Utilities
// =============================================================================

interface RGBColour {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse CSS colour value to RGB using canvas
 * This forces the browser to convert any colour format (including OKLCH) to RGB
 */
function parseComputedColour(cssValue: string): RGBColour {
  // Use canvas to force colour conversion - fillStyle always returns hex or rgb
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = cssValue;
    ctx.fillRect(0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1).data;
    return {
      r: imageData[0],
      g: imageData[1],
      b: imageData[2],
    };
  }

  // Fallback to dark grey if canvas fails
  return { r: 50, g: 50, b: 50 };
}

/**
 * Read CSS custom property and parse to RGB
 */
function getColourFromProperty(propertyName: string): RGBColour {
  const value = getComputedStyle(document.documentElement).getPropertyValue(propertyName).trim();
  return parseComputedColour(value);
}

/**
 * Adjust an RGB colour by a given amount
 * Positive = brighten (towards 255), Negative = darken (towards 0)
 */
function adjustColour(colour: RGBColour, amount: number): RGBColour {
  if (amount >= 0) {
    // Brighten: move towards 255
    return {
      r: Math.min(255, Math.round(colour.r + (255 - colour.r) * amount)),
      g: Math.min(255, Math.round(colour.g + (255 - colour.g) * amount)),
      b: Math.min(255, Math.round(colour.b + (255 - colour.b) * amount)),
    };
  } else {
    // Darken: move towards 0
    const darkenAmount = Math.abs(amount);
    return {
      r: Math.max(0, Math.round(colour.r * (1 - darkenAmount))),
      g: Math.max(0, Math.round(colour.g * (1 - darkenAmount))),
      b: Math.max(0, Math.round(colour.b * (1 - darkenAmount))),
    };
  }
}

// =============================================================================
// Boid Class
// =============================================================================

class Boid {
  private p: p5;
  position: p5.Vector;
  velocity: p5.Vector;
  acceleration: p5.Vector;
  opacity: number;
  isScattering: boolean;
  private targetEdge: { x: number; y: number } | null;
  private hasExited: boolean;

  constructor(p: p5) {
    this.p = p;
    this.position = p.createVector(p.random(p.width), p.random(p.height));
    this.velocity = p5.Vector.random2D().mult(p.random(1, MAX_SPEED));
    this.acceleration = p.createVector(0, 0);
    this.opacity = 1;
    this.isScattering = false;
    this.targetEdge = null;
    this.hasExited = false;
  }

  /**
   * Apply flocking forces: separation, alignment, cohesion
   */
  flock(boids: Boid[]): void {
    if (this.isScattering) return;

    const separation = this.separate(boids).mult(SEPARATION);
    const alignment = this.align(boids).mult(ALIGNMENT);
    const cohesion = this.cohere(boids).mult(COHESION);

    this.acceleration.add(separation);
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
  }

  /**
   * Separation: steer away from nearby boids
   */
  private separate(boids: Boid[]): p5.Vector {
    const steer = this.p.createVector(0, 0);
    let count = 0;

    for (const other of boids) {
      const d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < PERCEPTION_RADIUS / 2) {
        const diff = p5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
      steer.setMag(MAX_SPEED);
      steer.sub(this.velocity);
      steer.limit(MAX_FORCE);
    }

    return steer;
  }

  /**
   * Alignment: steer towards average heading of nearby boids
   */
  private align(boids: Boid[]): p5.Vector {
    const sum = this.p.createVector(0, 0);
    let count = 0;

    for (const other of boids) {
      const d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < PERCEPTION_RADIUS) {
        sum.add(other.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.setMag(MAX_SPEED);
      const steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(MAX_FORCE);
      return steer;
    }

    return this.p.createVector(0, 0);
  }

  /**
   * Cohesion: steer towards centre of nearby boids
   */
  private cohere(boids: Boid[]): p5.Vector {
    const sum = this.p.createVector(0, 0);
    let count = 0;

    for (const other of boids) {
      const d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < PERCEPTION_RADIUS) {
        sum.add(other.position);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    }

    return this.p.createVector(0, 0);
  }

  /**
   * Seek: steer towards a target position
   */
  private seek(target: p5.Vector): p5.Vector {
    const desired = p5.Vector.sub(target, this.position);
    desired.setMag(MAX_SPEED);
    const steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(MAX_FORCE);
    return steer;
  }

  /**
   * Begin scatter behaviour - find nearest edge and accelerate towards it
   */
  startScatter(): void {
    if (this.isScattering) return;
    this.isScattering = true;
    this.hasExited = false;

    // Calculate distance to each edge
    const distTop = this.position.y;
    const distBottom = this.p.height - this.position.y;
    const distLeft = this.position.x;
    const distRight = this.p.width - this.position.x;

    // Find nearest edge and set target position beyond it
    const minDist = Math.min(distTop, distBottom, distLeft, distRight);
    if (minDist === distTop) {
      this.targetEdge = { x: this.position.x, y: -50 };
    } else if (minDist === distBottom) {
      this.targetEdge = { x: this.position.x, y: this.p.height + 50 };
    } else if (minDist === distLeft) {
      this.targetEdge = { x: -50, y: this.position.y };
    } else {
      this.targetEdge = { x: this.p.width + 50, y: this.position.y };
    }
  }

  /**
   * Apply scatter force towards target edge
   */
  private scatter(): void {
    if (!this.targetEdge || this.hasExited) return;

    const target = this.p.createVector(this.targetEdge.x, this.targetEdge.y);

    // Strong seek towards edge
    const desired = p5.Vector.sub(target, this.position);
    desired.setMag(SCATTER_SPEED);
    this.velocity.lerp(desired, 0.1);

    // Calculate distance to edge for fade
    const distToEdge = Math.min(
      this.position.x,
      this.p.width - this.position.x,
      this.position.y,
      this.p.height - this.position.y
    );

    // Fade opacity as approaching edge
    if (distToEdge < SCATTER_FADE_DISTANCE) {
      this.opacity = Math.max(0, distToEdge / SCATTER_FADE_DISTANCE);
    }

    // Mark as exited when off-screen
    if (
      this.position.x < -50 ||
      this.position.x > this.p.width + 50 ||
      this.position.y < -50 ||
      this.position.y > this.p.height + 50
    ) {
      this.hasExited = true;
      this.opacity = 0;
    }
  }

  /**
   * Check if boid has exited the screen during scatter
   */
  hasExitedScreen(): boolean {
    return this.hasExited;
  }

  /**
   * Reset boid to random position for respawn
   */
  reset(): void {
    this.position = this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height));
    this.velocity = p5.Vector.random2D().mult(this.p.random(1, MAX_SPEED));
    this.acceleration = this.p.createVector(0, 0);
    this.opacity = 0;
    this.isScattering = false;
    this.targetEdge = null;
    this.hasExited = false;
  }

  /**
   * Update position and velocity
   */
  update(): void {
    if (this.isScattering) {
      this.scatter();
    }

    this.velocity.add(this.acceleration);
    this.velocity.limit(MAX_SPEED);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  /**
   * Wrap around edges (only when not scattering)
   */
  edges(): void {
    if (this.isScattering) return;

    if (this.position.x > this.p.width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = this.p.width;

    if (this.position.y > this.p.height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = this.p.height;
  }

  /**
   * Draw the boid as a paper aeroplane shape with indent
   */
  show(colour: RGBColour): void {
    if (this.opacity <= 0) return;

    const p = this.p;
    p.push();
    p.translate(this.position.x, this.position.y);
    p.rotate(this.velocity.heading());

    const size = BOID_SIZE;
    const halfWidth = size * BOID_WIDTH;
    const length = size * BOID_LENGTH;
    const indent = size * BOID_INDENT;

    p.fill(colour.r, colour.g, colour.b, this.opacity * 255);
    p.noStroke();
    p.beginShape();
    // Nose
    p.vertex(length, 0);
    // Top wing
    p.vertex(-length, -halfWidth);
    // Indent (tail)
    p.vertex(-length + indent, 0);
    // Bottom wing
    p.vertex(-length, halfWidth);
    p.endShape(p.CLOSE);

    p.pop();
  }
}

// =============================================================================
// State Management
// =============================================================================

interface BoidsState {
  p5Instance: p5 | null;
  boids: Boid[];
  colour: RGBColour;
  isScattered: boolean;
  isRespawning: boolean;
  respawnStartTime: number;
  allExited: boolean;
  observer: IntersectionObserver | null;
  mutationObserver: MutationObserver | null;
}

const state: BoidsState = {
  p5Instance: null,
  boids: [],
  colour: DEFAULT_BOID_COLOUR,
  isScattered: false,
  isRespawning: false,
  respawnStartTime: 0,
  allExited: false,
  observer: null,
  mutationObserver: null,
};

/**
 * Get current theme ID from body class
 */
function getCurrentTheme(): string {
  for (const cls of document.body.classList) {
    if (cls.startsWith('theme-')) {
      return cls.replace('theme-', '');
    }
  }
  return 'steel';
}

/**
 * Update colour based on current theme
 */
function updateColours(): void {
  const theme = getCurrentTheme();
  state.colour = THEME_COLOURS[theme] ?? DEFAULT_BOID_COLOUR;
}

/**
 * Get population based on screen width
 */
function getPopulation(): number {
  return window.innerWidth < MOBILE_BREAKPOINT ? POPULATION_MOBILE : POPULATION;
}

// =============================================================================
// Network Lines
// =============================================================================

/**
 * Draw network lines connecting nearby boids
 */
function drawNetworkLines(p: p5, boids: Boid[], colour: RGBColour): void {
  // Skip during scatter for performance
  if (state.isScattered && !state.isRespawning) return;

  const maxRange = PERCEPTION_RADIUS * NETWORK_RANGE_MULTIPLIER;

  for (const boid of boids) {
    if (boid.opacity <= 0) continue;

    // Find nearby boids with distances
    const nearby: Array<{ boid: Boid; distance: number }> = [];

    for (const other of boids) {
      if (other === boid || other.opacity <= 0) continue;
      const d = p5.Vector.dist(boid.position, other.position);
      if (d < maxRange) {
        nearby.push({ boid: other, distance: d });
      }
    }

    // Sort by distance and take closest N
    nearby.sort((a, b) => a.distance - b.distance);
    const connections = nearby.slice(0, NETWORK_MAX_CONNECTIONS);

    // Draw lines with opacity based on distance
    for (const conn of connections) {
      const opacity = p.map(conn.distance, 0, maxRange, NETWORK_OPACITY, 0);
      const finalOpacity = opacity * boid.opacity * conn.boid.opacity;

      p.stroke(colour.r, colour.g, colour.b, finalOpacity);
      p.strokeWeight(0.5);
      p.line(boid.position.x, boid.position.y, conn.boid.position.x, conn.boid.position.y);
    }
  }
}

// =============================================================================
// P5.js Sketch
// =============================================================================

function sketch(p: p5): void {
  p.setup = (): void => {
    const container = document.getElementById(CANVAS_CONTAINER_ID);
    if (!container) return;

    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent(container);
    p.frameRate(FRAME_RATE);

    // Initialise colours
    updateColours();

    // Create boids
    const population = getPopulation();
    state.boids = [];
    for (let i = 0; i < population; i++) {
      state.boids.push(new Boid(p));
    }
  };

  p.draw = (): void => {
    // Skip if document is hidden (tab not visible)
    if (document.hidden) return;

    // Skip if all boids have exited during scatter
    if (state.allExited && !state.isRespawning) return;

    p.clear();

    // Handle respawn fade-in
    if (state.isRespawning) {
      const elapsed = Date.now() - state.respawnStartTime;
      const progress = Math.min(elapsed / RESPAWN_FADE_DURATION, 1);

      for (const boid of state.boids) {
        boid.opacity = progress;
      }

      if (progress >= 1) {
        state.isRespawning = false;
      }
    }

    // Update and draw boids
    for (const boid of state.boids) {
      boid.flock(state.boids);
      boid.update();
      boid.edges();
      boid.show(state.colour);
    }

    // Draw network lines
    drawNetworkLines(p, state.boids, state.colour);

    // Check if all boids have exited during scatter
    if (state.isScattered && !state.isRespawning) {
      state.allExited = state.boids.every((b) => b.hasExitedScreen());
    }
  };

  p.windowResized = (): void => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}

// =============================================================================
// Scatter and Respawn Control
// =============================================================================

/**
 * Trigger scatter behaviour for all boids
 */
function triggerScatter(): void {
  if (state.isScattered) return;

  state.isScattered = true;
  state.allExited = false;

  for (const boid of state.boids) {
    boid.startScatter();
  }
}

/**
 * Trigger respawn - reset all boids and fade in
 */
function triggerRespawn(): void {
  if (!state.isScattered) return;

  state.isScattered = false;
  state.isRespawning = true;
  state.respawnStartTime = Date.now();
  state.allExited = false;

  for (const boid of state.boids) {
    boid.reset();
  }
}

// =============================================================================
// Intersection Observer for Scatter/Respawn
// =============================================================================

function setupScrollObserver(): void {
  const heroWordmark = document.getElementById(HERO_WORDMARK_ID);
  if (!heroWordmark) return;

  // Clean up existing observer
  if (state.observer) {
    state.observer.disconnect();
  }

  state.observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Wordmark visible: respawn boids
          triggerRespawn();
        } else {
          // Wordmark not visible: scatter boids
          triggerScatter();
        }
      });
    },
    {
      rootMargin: '-80px 0px 0px 0px',
    }
  );

  state.observer.observe(heroWordmark);
}

// =============================================================================
// Theme Change Observer
// =============================================================================

function setupThemeObserver(): void {
  // Clean up existing observer
  if (state.mutationObserver) {
    state.mutationObserver.disconnect();
  }

  state.mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        updateColours();
      }
    });
  });

  state.mutationObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

// =============================================================================
// Initialisation and Cleanup
// =============================================================================

function cleanup(): void {
  if (state.p5Instance) {
    state.p5Instance.remove();
    state.p5Instance = null;
  }
  if (state.observer) {
    state.observer.disconnect();
    state.observer = null;
  }
  if (state.mutationObserver) {
    state.mutationObserver.disconnect();
    state.mutationObserver = null;
  }
  state.boids = [];
  state.isScattered = false;
  state.isRespawning = false;
  state.allExited = false;
}

function init(): void {
  const container = document.getElementById(CANVAS_CONTAINER_ID);
  if (!container) return;

  // Clean up any existing instance
  cleanup();

  // Create new p5 instance
  state.p5Instance = new p5(sketch);

  // Set up observers
  setupScrollObserver();
  setupThemeObserver();
}

// Initialise on load and after Astro page transitions
init();
document.addEventListener('astro:after-swap', init);
