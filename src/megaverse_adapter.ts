import { Client, GoalCell, MapCell } from "./megaverse_client";
import { Cometh, Polyanet, Resource, Soloon, Space } from "./resources";

/**
 * A wrapper built on top of the Megaverse Client that provides higher level abstractions.
 */
export class MegaverseAdapter {
    constructor(protected client: Client) {}

    public async getGoalResources(): Promise<Resource[]> {
        const rawGoal = await this.client.getGoal();
        return this.transformMatrix(rawGoal, this.goalCellToResource);
    }

    public async getMapResources(): Promise<Resource[]> {
        const rawMap = await this.client.getMap();
        return this.transformMatrix(rawMap.map.content, this.mapCellToResource);
    }

    /**
     * Converts a bidimensional array into a linear array, applying a transformation.
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

    protected goalCellToResource(row: number, column: number, goalCell: GoalCell): Resource {
        switch (goalCell) {
            case "SPACE": return new Space(row, column);
            case "POLYANET": return new Polyanet(row, column);
        }
    }

    protected mapCellToResource(row: number, column: number, mapCell: MapCell): Resource {
        switch (mapCell?.type) {
            case undefined: return new Space(row, column);
            case 0: return new Polyanet(row, column);
            case 1: return new Soloon(row, column, mapCell.color);
            case 2: return new Cometh(row, column, mapCell.direction);
        }
    }
}