/**
 * Recursively assigns missing properties from a source object to a target object.
 *
 * @param target - The target object that will receive missing properties.
 * @param source - The source object providing default properties.
 *
 * @returns The updated target object with missing properties filled from the source.
 *
 * @remarks
 * - Only properties that are `undefined` in the target will be assigned from the source.
 * - If both target and source values are objects, the function recursively merges missing properties.
 * - Does not overwrite existing properties in the target.
 *
 * @example
 * ```ts
 * const target = { a: 1, b: { x: 10 } };
 * const source = { b: { x: 20, y: 30 }, c: 3 };
 *
 * assignMissingDeep(target, source);
 * // Result: { a: 1, b: { x: 10, y: 30 }, c: 3 }
 * ```
 *
 * @since 1.0.0
 */

export function assignMissingDeep(
    target: Record<string, unknown>, source: Record<string, unknown>
): Record<string, unknown> {
    for (const key in source) {
        // Prevent prototype pollution
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue;
        }

        const sourceValue = source[key];
        const targetValue = target[key];

        if (targetValue === undefined) {
            target[key] = sourceValue;
        } else if (
            sourceValue && typeof sourceValue === 'object' &&
            targetValue && typeof targetValue === 'object'
        ) {
            assignMissingDeep(
                targetValue as Record<string, unknown>,
                sourceValue as Record<string, unknown>
            );
        }
    }

    return target;
}
