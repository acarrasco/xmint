export interface ResourceLocation {
  row: number;
  column: number;
}

export type Color = "blue" | "red" | "purple" | "white";

export type Direction = "up" | "down" | "right" | "left";

export type ResourceName = "polyanets" | "soloons" | "comeths";

/**
 * Visitor pattern, so we can add behavior based on type
 * without type checking nor increasing the Resource footprint.
 */
export interface ResourceVisitor<T> {
  visitPolyanet(resource: Polyanet): T;
  visitSoloon(resource: Soloon): T;
  visitCometh(resource: Cometh): T;
  visitSpace(resource: Space): T;
}

/**
 * A resource visitor that does the same for every resource;
 * we can subclass it to override specific behaviors.
 */
export class DefaultResourceVisitor<T> implements ResourceVisitor<T> {
  constructor(protected delegate: (resource: Resource) => T) {}

  visitPolyanet(resource: Polyanet): T {
    return this.delegate(resource);
  }
  visitSoloon(resource: Soloon): T {
    return this.delegate(resource);
  }
  visitCometh(resource: Cometh): T {
    return this.delegate(resource);
  }
  visitSpace(resource: Space): T {
    return this.delegate(resource);
  }
}

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

  public toString(): string {
    return `${Object.getPrototypeOf(this).constructor.name}(${JSON.stringify(this)})`;
  }

  public equals(other: Resource): boolean {
    return this.toString() === other.toString();
  }

  /**
   * The name of the resource, as used in the API.
   */
  abstract getResourceName(): ResourceName;

  /**
   * The properties (other than location) that define the object, as used in the creation API.
   */
  abstract getProperties(): Record<string, any>;

  /**
   *
   * @param visitor
   */
  abstract receive<T>(visitor: ResourceVisitor<T>): T;
}

export class Polyanet extends Resource {
  getResourceName(): ResourceName {
    return "polyanets";
  }

  getProperties(): Record<string, unknown> {
    return {};
  }

  receive<T>(visitor: ResourceVisitor<T>): T {
    return visitor.visitPolyanet(this);
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

  receive<T>(visitor: ResourceVisitor<T>): T {
    return visitor.visitSoloon(this);
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

  receive<T>(visitor: ResourceVisitor<T>): T {
    return visitor.visitCometh(this);
  }
}

/**
 * This represents an empty space.
 */
export class Space extends Resource {
  getResourceName(): ResourceName {
    throw new Error("No associated resource");
  }
  getProperties(): Record<string, any> {
    return {};
  }
  receive<T>(visitor: ResourceVisitor<T>): T {
    return visitor.visitSpace(this);
  }
}
