export interface ResourceLocation {
  row: number;
  column: number;
}

export type Color = "blue" | "red" | "purple" | "white";

export type Direction = "up" | "down" | "right" | "left";

export type ResourceName = "polyanets" | "soloons" | "comeths";

/**
 * This class represents the base for our different celestial objects.
 *
 * Some tradeoffs of coupling for simplicity were made:
 * - Including the resource name could be done in the API client or repositories.
 * - Having the resource representation here instead of separate data mappers.
 */
export abstract class Resource {
  constructor(
    protected row: number,
    protected column: number,
  ) {}

  /**
   * @returns the location of the object in the grid.
   */
  public getLocation(): ResourceLocation {
    return {
      row: this.row,
      column: this.column,
    };
  }

  /**
   * The name of the resource, as used in the API.
   */
  abstract getResourceName(): ResourceName;

  /**
   * The properties (other than location) that define the object, as used in the creation API.
   */
  abstract getProperties(): Record<string, any>;
}

export class Polyanet extends Resource {
  getResourceName(): ResourceName {
    return "polyanets";
  }

  getProperties(): Record<string, unknown> {
    return {};
  }
}

export class Soloon extends Resource {
  constructor(
    row: number,
    column: number,
    protected color: Color,
  ) {
    super(row, column);
  }

  getResourceName(): ResourceName {
    return "soloons";
  }

  getProperties(): Record<string, any> {
    return { color: this.color };
  }
}

export class Cometh extends Resource {
  constructor(
    row: number,
    column: number,
    protected direction: Direction,
  ) {
    super(row, column);
  }
  getResourceName(): ResourceName {
    return "comeths";
  }

  getProperties(): Record<string, any> {
    return { direction: this.direction };
  }
}

/**
 * This represents an empty space, useful to not have
 * to deal with "nulls" in a special way.
 */
export class Space extends Resource {
  getResourceName(): ResourceName {
    throw new Error("No associated resource");
  }
  getProperties(): Record<string, any> {
    return {}
  }
}