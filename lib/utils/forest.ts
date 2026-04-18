export const EMOJI_POOL = ["🌱", "🌿", "🌷", "🌻", "🌳", "🌲", "🌼", "🍀"];

export function getTreeEmojiString(category: string, index: number) {
    let str = category + "_" + index;
    let hash = 0;
    for (let j = 0; j < str.length; j++) hash = Math.imul(31, hash) + str.charCodeAt(j) | 0;
    const idSeed = Math.abs(hash);
    return EMOJI_POOL[idSeed % EMOJI_POOL.length];
}

export function calculateTreeScale(treeTaskCount: number) {
    return 0.55 + (treeTaskCount / 5) * 0.45;
}
