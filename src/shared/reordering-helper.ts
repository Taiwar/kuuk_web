export class ReorderingHelper {
  static sortNrAfterDeletion(itemSortNr: number, deletedSortNr: number) {
    if (itemSortNr > deletedSortNr) {
      return itemSortNr - 1
    }
    return itemSortNr
  }

  static sortNrAfterReorder(itemSortNr: number, newSortNr: number, isMovingPosition: boolean, isMovingGroups: boolean, prevSortNr?: number | null) {
    if (prevSortNr) {
      if (isMovingPosition || isMovingGroups) {
        if (!isMovingGroups && newSortNr > prevSortNr) {
          if (itemSortNr <= newSortNr && itemSortNr > prevSortNr) {
            return itemSortNr - 1
          }
        } else {
          if (itemSortNr >= newSortNr && itemSortNr < prevSortNr) {
            return itemSortNr + 1
          }
        }
      }
    }
    return itemSortNr
  }
}
