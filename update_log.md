Built based on [kikoeru project](https://github.com/kikoeru-project)

## 7/21/2023

1. Encode all strings on queries to URI format.

### Mini BUG
1. ~~When trying to access a work with path set on the url, the browser console will pop up errors, but it does affect user experience or causing any problem. (Hmm, not causing any problem, will fix later, or never.)  :-) Also, it does affect download folder or file.~~ (Fixed - using with basic and *robust* way)
## 7/20/2023

1. Front-end is now support folder download.
2. Download file is optimized.

### TODO 
1. Limit user from downloading file and folder on unsupported platform.(In-progress)
2. Add download status.(long-term)
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
2. Add audio player.
3. Add multi-language support.(Delayed)
4. Add random play option.

## 7/15/2023

1. Searching feature is now working.
2. `WorksLib` page `WorkCard` and `WorkDetailPage` components are working correctly.

### TODO 
1. Fix `QueryMain` and Query`Result pages or deprecate them.