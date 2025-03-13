import { Color, Direction, Resource } from "./resources";

type Fetch = typeof window.fetch;

export type GoalCell = "SPACE" | "POLYANET";

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
type StringKeys<T> = { [K in Extract<keyof T,string>] : any } extends T ? T : never;

/**
 * Raw client for the megaverse challenge API.
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
    return this.myFetch(url, { method: "POST", body, headers });
  }

  public delete(resource: Resource): ReturnType<Fetch> {
    const url = this.makeResourceUrl(resource);
    const body = this.makeBody(resource.getLocation());
    const headers = this.getHeaders();
    return this.myFetch(url, { method: "DELETE", body, headers });
  }

  public async getGoal(): Promise<GoalCell[][]> {
    const url = `${this.baseUrl}/map/${this.candidateId}/goal`;
    const response = await this.myFetch(url);
    const json = await response.json();
    return json.goal;
  }

  public async getMap(): Promise<MapResponse> {
    const url = `${this.baseUrl}/map/${this.candidateId}`;
    const response = await this.myFetch(url);
    const json = await response.json();
    return json;
  }
}

export function makeDefaultClient(candidateId: string | undefined): Client {
  candidateId ||= process.env.CANDIDATE_ID;
  if (!candidateId) {
    throw new Error("missing candidate id");
  }
  return new Client(fetch, "https://challenge.crossmint.com/api", candidateId);
}
