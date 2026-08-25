// utilities/weightBrackets.util.ts
import AppError from "./ErrorHandler";

interface IBracketRange {
    minKg: number;
    maxKg: number;
}

export function bracketsOverlap(a: IBracketRange, b: IBracketRange): boolean {
    return a.minKg <= b.maxKg && a.maxKg >= b.minKg;
}

/**
 * Throws if any two brackets in the incoming array overlap for the same rideType.
 * Two brackets with identical minKg/maxKg are treated as an "update" of the same
 * bracket, not an overlap.
 */
export function validateNoInternalOverlaps<T extends { rideType: string; minKg: number; maxKg: number },
>(incoming: T[]): void {
    for (let i = 0; i < incoming.length; i++) {
        for (let j = i + 1; j < incoming.length; j++) {
            const a = incoming[i];
            const b = incoming[j];
            if (
                a.rideType === b.rideType &&
                !(a.minKg === b.minKg && a.maxKg === b.maxKg) &&
                bracketsOverlap(a, b)
            ) {
                throw new AppError(
                    400,
                    `Overlapping weight brackets in request for rideType '${a.rideType}'`,
                );
            }
        }
    }
}

/**
 * Throws if `candidate` overlaps any bracket already stored on the zone
 * (for the same rideType).
 */
export function assertNoOverlapWithExisting<T extends { rideType: string; minKg: number; maxKg: number },
>(existing: T[], candidate: T): void {
    const overlaps = existing.some(
        (b) => b.rideType === candidate.rideType && bracketsOverlap(b, candidate),
    );
    if (overlaps) {
        throw new AppError(
            400,
            `Overlapping weight bracket exists for rideType '${candidate.rideType}' (${candidate.minKg}–${candidate.maxKg} kg)`,
        );
    }
}