export interface LaneConfig {
  /** Vertical position of the lane as a fraction of the play area height (0 = top/far, 1 = bottom/near). */
  y: number;
  /** Target diameter in px. */
  size: number;
  /** Horizontal speed range in px/sec; a target picks a new speed in this range each bounce. */
  minSpeed: number;
  maxSpeed: number;
  /** Points awarded for hitting a target in this lane. */
  points: number;
  color: string;
}

export interface TargetState {
  id: number;
  laneIndex: number;
  x: number;
  dir: 1 | -1;
  /** Current speed in px/sec, re-rolled within the lane's range on each wall bounce. */
  speed: number;
  /** Set when hit, used to play a brief hit animation before respawn. */
  hitAt: number | null;
}

export interface BulletState {
  id: number;
  x: number;
  y: number;
}
