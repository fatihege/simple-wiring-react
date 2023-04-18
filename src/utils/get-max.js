export default function getMax(arr, key) {
    return arr.reduce((max, item) => Math.max(max, item[key]), 0) // Return the maximum value of the array
}