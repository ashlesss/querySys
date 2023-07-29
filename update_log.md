Built based on [kikoeru project](https://github.com/kikoeru-project)

## 7/28/2023

1. Add player.

### TODO 
1. Add player bar when player card is minimized.

## 7/27/2023

1. Handle back when user click on back button on browser.

### TODO
1. Need to handle `WorkTree` back action.

## 7/26/2023

1. Adjust download page handling scroll.

## 7/24/2023

1. Download card is now a global element, the download can still continue as long as the user is not refreshing the page.
2. Handle works don't have tags.
3. Add page tag name.
4. Fix change page, page number not shown on URL.

### TODO
1. ~~Handle back to previous page behavior.~~(Partial completed)
2. ~~Make keyword save to `store` so that it can be use globally and doesn't depend on query.~~(Cancelled)

## 7/23/2023

1. Completed `7/22/2023 TODO` 1, 2, 3 and 4.
2. Download is now can handle when user cancel the download.

## 7/22/2023

1. Add move to top button.
2. Add download status. (Need to test more for unexpected bugs)
3. Refactor the `AudioPlayer` store to support `Pinia`.
4. Clean up stacked codes in `WorkTree.vue`.

### TODO
1. ~~Add some logic to hide or show the download page button.~~(Completed)
2. ~~Try to get all the files' size at the beginning of the download process.~~(Completed)
3. ~~Make download page a component and use store to save the download data so that it can be open and hide by `MainLayout`.~~(Completed)
4. ~~**`downloadFile` in `WorkTree.vue` needs to refactor since the download page is added. (Urgent)**~~(Completed)

## 7/21/2023

1. Encode all strings on queries to URI format.

### Mini BUG
1. ~~When trying to access a work with path set on the url, the browser console will pop up errors, but it does affect user experience or causing any problem. (Hmm, not causing any problem, will fix later, or never.)  :-) Also, it does affect download folder or file.~~ (Fixed - using with basic and *robust* way)
## 7/20/2023

1. Front-end is now support folder download.
2. Download file is optimized.

### TODO 
1. Limit user from downloading file and folder on unsupported platform.(In-progress)
2. ~~Add download status.(long-term)~~(Completed)
## 7/18/2023

1. Improve loading spinner stability.
2. Add sorting.

## 7/17/2023

1. Improve searching stability.
2. Add `router-link` to the circles, tags and vas.
3. Add notification to handle errors.
4. Improve readability on work's images. Now the same with kikoeru.
5. Make compatible with mobile browsing.
### TODO
1. ~~Add sorting options on main page.~~(Completed)
2. ~~Add audio player.~~(Completed)
3. Add multi-language support.(Delayed)
4. Add random play option.

## 7/15/2023

1. Searching feature is now working.
2. `WorksLib` page `WorkCard` and `WorkDetailPage` components are working correctly.

### TODO 
1. Fix `QueryMain` and Query`Result pages or deprecate them.