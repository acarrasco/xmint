import { Color, Direction, Resource } from "./resources";

type Fetch = typeof global.fetch;

export type GoalCell =
  | "SPACE"
  | "POLYANET"
  | `${Uppercase<Direction>}_COMETH`
  | `${Uppercase<Color>}_SOLOON`;

export type GoalResponse = { goal: GoalCell[][] };

export type PolyanetCell = {
  type: 0;
};

export type SoloonCell = {
  type: 1;
  color: Color;
};

export type ComethCell = {
  type: 2;
  direction: Direction;
};

export type MapCell = null | PolyanetCell | SoloonCell | ComethCell;

export type MapResponse = {
  map: {
    _id: string;
    content: MapCell[][];
    candidateId: string;
    phase: number;
    __v: number;
  };
};

/**
 * This type allows us to ensure that an object keys are strings; while
 * not forcing a loose Record<string, any> signature.
 */
type StringKeys<T> = { [K in Extract<keyof T, string>]: any } extends T
  ? T
  : never;

/**
 * Raw client for the Megaverse challenge API.
 *
 * For a more complex API we could create a class for each type of request,
 * but it seems overkill here.
 */
export class Client {
  /**
   * @param myFetch provide the fetch function, it is cleaner than mocking globals for testing.
   * @param baseUrl the base api url, without the trailing slash.
   * @param candidateId the candidate id to be used in the requests.
   */
  constructor(
    private myFetch: Fetch,
    private baseUrl: string,
    private candidateId: string,
  ) {}

  protected makeResourceUrl(resource: Resource): string {
    const resourceName = resource.getResourceName();
    const url = `${this.baseUrl}/${resourceName}`;
    return url;
  }

  protected makeBody<T>(resourceBody: StringKeys<T>): string {
    return JSON.stringify({
      candidateId: this.candidateId,
      ...resourceBody,
    });
  }

  protected getHeaders(): Record<string, string> {
    return { "Content-Type": "application/json" };
  }

  public save(resource: Resource): ReturnType<Fetch> {
    const url = this.makeResourceUrl(resource);
    const body = this.makeBody({
      ...resource.getLocation(),
      ...resource.getProperties(),
    });
    const headers = this.getHeaders();
    return this.myFetch(url, {
      method: "POST",
      redirect: "follow",
      body,
      headers,
    });
  }

  public delete(resource: Resource): ReturnType<Fetch> {
    const url = this.makeResourceUrl(resource);
    const body = this.makeBody(resource.getLocation());
    const headers = this.getHeaders();
    return this.myFetch(url, {
      method: "DELETE",
      redirect: "follow",
      body,
      headers,
    });
  }

  public async getGoal(): Promise<GoalResponse> {
    const url = `${this.baseUrl}/map/${this.candidateId}/goal`;
    const response = await this.myFetch(url, { redirect: "follow" });
    const json = await response.json();
    return json;
  }

  public async getMap(): Promise<MapResponse> {
    const url = `${this.baseUrl}/map/${this.candidateId}`;
    const response = await this.myFetch(url, { redirect: "follow" });
    const json = await response.json();
    return json;
  }
}

export function makeDefaultClient(
  myFetch = fetch,
  candidateId?: string,
): Client {
  candidateId ||= process.env.CANDIDATE_ID;
  if (!candidateId) {
    throw new Error(
      "missing candidate id, supply it as an argument or set the environment variable 'CANDIDATE_ID'",
    );
  }
  return new Client(myFetch, "https://challenge.crossmint.io/api", candidateId);
}
