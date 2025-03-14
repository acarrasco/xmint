import { Client, GoalCell, MapCell } from "./megaverse_client";
import { Cometh, Polyanet, Resource, Soloon, Space } from "./resources";

/**
 * A wrapper built on top of the Megaverse Client that provides higher level abstractions.
 */
export class MegaverseAdapter {
    constructor(protected client: Client) {}

    public async getGoalResources(): Promise<Resource[]> {
        const goalResponse = await this.client.getGoal();
        console.log({goalResponse});
        return this.transformMatrix(goalResponse.goal, this.goalCellToResource);
    }

    public async getMapResources(): Promise<Resource[]> {
        const mapResponse = await this.client.getMap();
        console.log({mapResponse});
        return this.transformMatrix(mapResponse.map.content, this.mapCellToResource);
    }

    /**
     * Converts a bidimensional array into a linear array, applying a transformation.
     * 
     * @param matrix The bidimensional array containing source elements.
     * @param transform A function that takes a pair of coordinates and a source element, and returns a transformed element.
     * @returns The array of transformed elements.
     */
    protected transformMatrix<G, T>(matrix: G[][], transform: (i: number, j: number, g: G) => T): T[] {
        const result: T[] = [];

        for (let i = 0; i < matrix.length; i++) {
            for(let j = 0; j < matrix[i].length; j++) {
                result.push(transform(i, j, matrix[i][j]));
            }
        }

        return result;
    }

    /**
     * Creates a Resource from the goal response contents.
     */
    protected goalCellToResource(row: number, column: number, goalCell: GoalCell): Resource {
        switch (goalCell) {
            case "SPACE": return new Space(row, column);
            case "POLYANET": return new Polyanet(row, column);
            // I feel dirty doing this, but extracting the patterns in a type-safe way was too tricky
            case "BLUE_SOLOON": return new Soloon(row, column, "blue");
            case "PURPLE_SOLOON": return new Soloon(row, column, "purple");
            case "RED_SOLOON": return new Soloon(row, column, "red");
            case "WHITE_SOLOON": return new Soloon(row, column, "white");
            case "DOWN_COMETH": return new Cometh(row, column, "down");
            case "LEFT_COMETH": return new Cometh(row, column, "left");
            case "RIGHT_COMETH": return new Cometh(row, column, "right");
            case "UP_COMETH": return new Cometh(row, column, "up");
        }
    }

    /**
     * Creates a Resource object from the map response contents.
     */
    protected mapCellToResource(row: number, column: number, mapCell: MapCell): Resource {
        switch (mapCell?.type) {
            case undefined: return new Space(row, column);
            case 0: return new Polyanet(row, column);
            case 1: return new Soloon(row, column, mapCell.color);
            case 2: return new Cometh(row, column, mapCell.direction);
        }
    }
}