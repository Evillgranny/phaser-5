export const SpawnerType = {
    CHEST: 'CHEST',
    MONSTER: 'MONSTER'
}

export const randomNumber = (min, max) => {
    return Math.floor(Math.random() * max) + min;
}