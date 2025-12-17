/**
 * Boids Background Animation
 *
 * P5.js instance mode simulation with flocking behaviour,
 * network lines, and scatter/respawn tied to scroll position.
 */

import p5 from "p5";

// =============================================================================
// Constants
// =============================================================================

// Behaviour
const POPULATION = 80;
const POPULATION_MOBILE = 50;
const SEPARATION = 3.8;
const ALIGNMENT = 1.6;
const COHESION = 0.8;
const PERCEPTION_RADIUS = 70;
const MAX_SPEED = 3.2;
const MAX_FORCE = 0.12;

// Appearance
const BOID_SIZE = 6.5;
const BOID_WIDTH = 1.15;
const BOID_LENGTH = 1.7;
const BOID_INDENT = 0.2;
const NETWORK_OPACITY = 84;
const NETWORK_MAX_CONNECTIONS = 3;
const NETWORK_RANGE_MULTIPLIER = 2.5;

// Centre fade (to keep content column readable)
const CENTRE_CLEAR_ZONE = 360; // Half-width of content column (720px / 2)
const CENTRE_MIN_OPACITY = 0.1; // Minimum opacity at centre

// Scatter
const SCATTER_INTENSITY = 0.5; // 0 = no edge seeking, 1 = full override
const SCATTER_FORCE = 0.7; // Strength of edge-seeking force
const SCATTER_SPEED_BOOST = 4.5; // Multiplier on MAX_SPEED during scatter
const SCATTER_FADE_DISTANCE = 300;

// Respawn
const RESPAWN_FADE_DURATION = 5000;

// Canvas
const FRAME_RATE = 30;
const MOBILE_BREAKPOINT = 768;

// Element IDs
const CANVAS_CONTAINER_ID = "boids-canvas";
const HERO_WORDMARK_ID = "hero-wordmark";

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
const parseComputedColour = (cssValue: string): RGBColour => {
  // Use canvas to force colour conversion - fillStyle always returns hex or rgb
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");

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
  return {r: 50, g: 50, b: 50};
};

/**
 * Read CSS custom property and parse to RGB
 */
const getColourFromProperty = (propertyName: string): RGBColour => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(propertyName)
    .trim();
  return parseComputedColour(value);
};

/**
 * Calculate opacity factor based on distance from centre vertical axis
 * Returns CENTRE_MIN_OPACITY within the clear zone, scaling to 1.0 at screen edges
 */
const getCentreOpacityFactor = (x: number, screenWidth: number): number => {
  const centreX = screenWidth / 2;
  const distanceFromCentre = Math.abs(x - centreX);

  // Within the clear zone: minimum opacity
  if (distanceFromCentre <= CENTRE_CLEAR_ZONE) {
    return CENTRE_MIN_OPACITY;
  }

  // Outside clear zone: scale from min opacity to 1.0
  const distanceBeyondZone = distanceFromCentre - CENTRE_CLEAR_ZONE;
  const maxDistanceBeyondZone = centreX - CENTRE_CLEAR_ZONE;

  if (maxDistanceBeyondZone <= 0) {
    return 1;
  } // Screen narrower than clear zone

  const factor = distanceBeyondZone / maxDistanceBeyondZone;
  return CENTRE_MIN_OPACITY + factor * (1 - CENTRE_MIN_OPACITY);
};

// =============================================================================
// Boid Class
// =============================================================================

/** Target edge point for scatter behaviour */
interface TargetEdge {
  x: number;
  y: number;
  d: number;
}

class Boid {
  private p: p5;
  position: p5.Vector;
  velocity: p5.Vector;
  acceleration: p5.Vector;
  opacity: number;
  isScattering: boolean;
  private targetEdge: TargetEdge | null;
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
    // Apply normal flocking forces
    const separation = this.separate(boids).mult(SEPARATION);
    const alignment = this.align(boids).mult(ALIGNMENT);
    const cohesion = this.cohere(boids).mult(COHESION);

    this.acceleration.add(separation);
    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);

    // When scattering, blend edge-seeking with flocking
    if (this.isScattering) {
      const scatterForce = this.getScatterForce();
      // Reduce flocking forces and add scatter force
      this.acceleration.mult(1 - SCATTER_INTENSITY);
      this.acceleration.add(scatterForce.mult(SCATTER_INTENSITY));
    }
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
   * Begin scatter behaviour - find nearest edge
   */
  startScatter(): void {
    if (this.isScattering) {
      return;
    }
    this.isScattering = true;
    this.hasExited = false;

    // Find nearest edge and set target position beyond it
    const edges = [
      {x: this.position.x, y: -50},
      {x: this.position.x, y: this.p.height + 50},
      {x: -50, y: this.position.y},
      {x: this.p.width + 50, y: this.position.y},
    ];

    this.targetEdge = edges.reduce<{x: number; y: number; d: number}>(
      (nearest, edge) => {
        const d = this.p.dist(this.position.x, this.position.y, edge.x, edge.y);
        return d < nearest.d ? {x: edge.x, y: edge.y, d} : nearest;
      },
      {x: 0, y: 0, d: Infinity}
    );
  }

  /**
   * Apply scatter steering force (blends with existing flocking)
   * Returns the edge-seeking steering force
   */
  private getScatterForce(): p5.Vector {
    if (!this.targetEdge || this.hasExited) {
      return this.p.createVector(0, 0);
    }

    const target = this.p.createVector(this.targetEdge.x, this.targetEdge.y);

    // Calculate steering toward edge
    const desired = p5.Vector.sub(target, this.position);
    desired.setMag(MAX_SPEED * SCATTER_SPEED_BOOST);

    const steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(SCATTER_FORCE);

    return steer;
  }

  /**
   * Update opacity and exit state during scatter
   */
  private updateScatterState(): void {
    if (!this.isScattering || this.hasExited) {
      return;
    }

    // Calculate distance to nearest edge for fade
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
    this.position = this.p.createVector(
      this.p.random(this.p.width),
      this.p.random(this.p.height)
    );
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
    this.velocity.add(this.acceleration);

    // Allow faster movement during scatter
    const speedLimit = this.isScattering
      ? MAX_SPEED * SCATTER_SPEED_BOOST
      : MAX_SPEED;
    this.velocity.limit(speedLimit);

    this.position.add(this.velocity);
    this.acceleration.mult(0);

    // Update scatter state (opacity, exit detection)
    if (this.isScattering) {
      this.updateScatterState();
    }
  }

  /**
   * Wrap around edges (only when not scattering)
   */
  edges(): void {
    if (this.isScattering) {
      return;
    }

    if (this.position.x > this.p.width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = this.p.width;
    }

    if (this.position.y > this.p.height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = this.p.height;
    }
  }

  /**
   * Draw the boid as a paper aeroplane shape with indent
   */
  show(colour: RGBColour): void {
    if (this.opacity <= 0) {
      return;
    }

    const p = this.p;

    // Calculate opacity reduction based on proximity to centre vertical axis
    const centreOpacityFactor = getCentreOpacityFactor(
      this.position.x,
      p.width
    );
    const finalOpacity = this.opacity * centreOpacityFactor;
    if (finalOpacity <= 0) {
      return;
    }

    p.push();
    p.translate(this.position.x, this.position.y);
    p.rotate(this.velocity.heading());

    const size = BOID_SIZE;
    const halfWidth = size * BOID_WIDTH;
    const length = size * BOID_LENGTH;
    const indent = size * BOID_INDENT;

    p.fill(colour.r, colour.g, colour.b, finalOpacity * 255);
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
  colour: {r: 50, g: 50, b: 50}, // Placeholder, updated on init
  isScattered: false,
  isRespawning: false,
  respawnStartTime: 0,
  allExited: false,
  observer: null,
  mutationObserver: null,
};

/**
 * Update colour based on current theme's --rule property
 */
const updateColours = (): void => {
  state.colour = getColourFromProperty("--rule");
};

/**
 * Get population based on screen width
 */
const getPopulation = (): number =>
  window.innerWidth < MOBILE_BREAKPOINT ? POPULATION_MOBILE : POPULATION;

// =============================================================================
// Network Lines
// =============================================================================

/**
 * Draw network lines connecting nearby boids
 */
const drawNetworkLines = (p: p5, boids: Boid[], colour: RGBColour): void => {
  // Skip during scatter for performance
  if (state.isScattered && !state.isRespawning) {
    return;
  }

  const maxRange = PERCEPTION_RADIUS * NETWORK_RANGE_MULTIPLIER;

  for (const boid of boids) {
    if (boid.opacity <= 0) {
      continue;
    }

    // Find nearby boids with distances
    const nearby: Array<{boid: Boid; distance: number}> = [];

    for (const other of boids) {
      if (other === boid || other.opacity <= 0) {
        continue;
      }
      const d = p5.Vector.dist(boid.position, other.position);
      if (d < maxRange) {
        nearby.push({boid: other, distance: d});
      }
    }

    // Sort by distance and take closest N
    nearby.sort((a, b) => a.distance - b.distance);
    const connections = nearby.slice(0, NETWORK_MAX_CONNECTIONS);

    // Draw lines with opacity based on distance and centre proximity
    const boidCentreFactor = getCentreOpacityFactor(boid.position.x, p.width);

    for (const conn of connections) {
      const connCentreFactor = getCentreOpacityFactor(
        conn.boid.position.x,
        p.width
      );
      const opacity = p.map(conn.distance, 0, maxRange, NETWORK_OPACITY, 0);
      const finalOpacity =
        opacity *
        boid.opacity *
        conn.boid.opacity *
        boidCentreFactor *
        connCentreFactor;

      p.stroke(colour.r, colour.g, colour.b, finalOpacity);
      p.strokeWeight(0.5);
      p.line(
        boid.position.x,
        boid.position.y,
        conn.boid.position.x,
        conn.boid.position.y
      );
    }
  }
};

// =============================================================================
// P5.js Sketch
// =============================================================================

const sketch = (p: p5): void => {
  p.setup = (): void => {
    const container = document.getElementById(CANVAS_CONTAINER_ID);

    if (!container) {
      return;
    }

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
    if (document.hidden) {
      return;
    }

    // Skip if all boids have exited during scatter
    if (state.allExited && !state.isRespawning) {
      return;
    }

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
};

// =============================================================================
// Scatter and Respawn Control
// =============================================================================

/**
 * Trigger scatter behaviour for all boids
 */
const triggerScatter = (): void => {
  if (state.isScattered) {
    return;
  }

  state.isScattered = true;
  state.allExited = false;

  for (const boid of state.boids) {
    boid.startScatter();
  }
};

/**
 * Trigger respawn - reset all boids and fade in
 */
const triggerRespawn = (): void => {
  if (!state.isScattered) {
    return;
  }

  state.isScattered = false;
  state.isRespawning = true;
  state.respawnStartTime = Date.now();
  state.allExited = false;

  for (const boid of state.boids) {
    boid.reset();
  }
};

// =============================================================================
// Intersection Observer for Scatter/Respawn
// =============================================================================

const setupScrollObserver = (): void => {
  const heroWordmark = document.getElementById(HERO_WORDMARK_ID);

  if (!heroWordmark) {
    return;
  }

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
      rootMargin: "-80px 0px 0px 0px",
    }
  );

  state.observer.observe(heroWordmark);
};

// =============================================================================
// Theme Change Observer
// =============================================================================

const setupThemeObserver = (): void => {
  // Clean up existing observer
  if (state.mutationObserver) {
    state.mutationObserver.disconnect();
  }

  state.mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        updateColours();
      }
    });
  });

  state.mutationObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
};

// =============================================================================
// Initialisation and Cleanup
// =============================================================================

const cleanup = (): void => {
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
};

const init = (): void => {
  const container = document.getElementById(CANVAS_CONTAINER_ID);

  if (!container) {
    return;
  }

  // Clean up any existing instance
  cleanup();

  // Create new p5 instance
  state.p5Instance = new p5(sketch);

  // Set up observers
  setupScrollObserver();
  setupThemeObserver();
};

// Initialise on load and after Astro page transitions
init();
document.addEventListener("astro:after-swap", init);
