module.exports = function (arr1, arr2) {
    // base cases
    if (arr1 === arr2) return 0;
    if (arr1.length === 0) return arr2.length;
    if (arr2.length === 0) return arr1.length;

    // two rows
    var prevRow = new Array(arr2.length + 1),
        curCol, nextCol, i, j, tmp;

    // initialise previous row
    for (i = 0; i < prevRow.length; ++i) {
        prevRow[i] = i;
    }

    // calculate current row distance from previous row
    for (i = 0; i < arr1.length; ++i) {
        nextCol = i + 1;

        for (j = 0; j < arr2.length; ++j) {
            curCol = nextCol;

            // substution
            nextCol = prevRow[j] + ( (arr1[i] === arr2[j]) ? 0 : 1 );
            // insertion
            tmp = curCol + 1;
            if (nextCol > tmp) {
                nextCol = tmp;
            }
            // deletion
            tmp = prevRow[j + 1] + 1;
            if (nextCol > tmp) {
                nextCol = tmp;
            }

            // copy current col value into previous (in preparation for next iteration)
            prevRow[j] = curCol;
        }

        // copy last col value into previous (in preparation for next iteration)
        prevRow[j] = nextCol;
    }

    return nextCol;
};