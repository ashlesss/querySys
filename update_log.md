Built based on [kikoeru project](https://github.com/kikoeru-project)

## 1/15/2024

1. Add history playback api.

## 1/13/2024

1. Fix `sortOptions` logic error in `WorkLib` page.

## 1/12/2024

1. Remove dedicated watch page using video card instead.

## 1/11/2024

1. Serve `plyr.svg` from `/public`.
2. Optimize to show `totalWork` number when page contains changes on `WorkLib` page.

## 1/10/2024

1. Fix page control.

## 1/10/2024

1. Refactor page control logics. ~~(not complete)~~

## 1/8/2024

1. Add video player page for playing video. (not complete)
2. Remove some repeat values in `subtitle.js`.

## 1/7/2024

1. Don't show PiP subtitle icon when there is no lyric file to current track.

# 1/4/2024

1. Modulize subtitle utilities.
2. Don't show VA tags when there is no va info.
3. Apply new player skin by [number17](https://github.com/Number178/kikoeru-quasar)

## 1/3/2024

1. Fix bugs on displaying page title on `WorkDetail` page.
2. Make the search feature compatible with backend.
3. Create socket.io object on boot. Connect socket when enter scanner page and disconnect after leaves scanner page.
4. Add document title to pages.

## 12/28/2023

1. Refactor the search tags.

## 12/27/2023

1. Remove watermark lyric from the subtitle file to avoid overrun.(Buggy)
2. Improve bolded subtitle line selection when viewing entire subtitle of current audio track.

## 8/16/2023

1. Optimize download speed monitor.
2. Add subtitle card so that user can see the whole lyrics when double click the lyric bar.
3. Add more metadata to `navigator.mediaSession.metadata` for better user experience.

## 8/15/2023

1. Player is now support PiP(picture in picture) subtitle.
2. Adjust `q-breadcrumbs` style in `WorkTree` so it will wrap around when text is too long.

### TODO
1. Finish admin pages.

## 8/14/2023

1. Subtitle type is now support `.lrc`, `.srt`, `.ass`, `.vtt`.
2. Pause subtitle when player is buffering data due to slow network.
3. Preserve previous scroll position when users get back to previous page using default back button on browser.
4. Remove underscore on some clickable elements.
5. Use hash `#` to relocate to previous users visited position.
6. Add `Random Play` feature.

## 8/13/2023

1. Subtitle is now will change if users selected/changed on subtitle list.
2. `WorkTree` can back to previous level folder when back button on the browser is clicked by users.
3. Add `#` navigation.
4. Subtitle type is now support `.srt`.

### TODO
~~1. Add pop-up play to subtitle bar.(Completed)~~

## 8/11/2023

1. Add subtitle list to show all related available subtitles for an audio track.
2. All subtitles that are relative to an audio track is now being store to the `queue` as `subtitles` and will also contain match `percentage` to show the possibility that subtitle is matched with that track.

### TODO
~~1. Need to complete logic when selecting different subtitle in subtitle list.~~(Completed)
~~1. Subtitle format only support `.lrc` now, need to support `.srt`, `.vtt`, and `.ass`.~~(Completed)

## 8/10/2023

1. Be able to calculate how likely does the subtitle file match current play file.
2. Subtitle is now working

## TODO
~~1. Need to find the right moment to reset `subtitleFiles` in store.(Completed)~~

## 8/9/2023

1. Add user `group` info into the auth store.
2. Add `admin dashboard` which can access by user with **admin** `group`.(Incomplete)

## 8/6/2023

1. Add login services
2. Restrict access to other pages other than login page if no valid token presents.
3. Improve `back` functionality. It is now can go back to same `WorkLib` page where they came from. After they clicked `workTree` in `WorkDetail` page.
4. Refactor all `localStorage` and `sessionStorage` to use quasar's `localStorage` and `sessionStorage` extensions for better data type conversion experience.

## 8/3/2023 

1. Refactor the Regex to detect search tags.

## 8/2/2023 

1. Optimize api requests caused by component transitions.
2. Optimize back button.
3. Create navigation guards that control the activation of pagination/page query to prevent repeat api requests.

### TODO 
1. ~~There is still a transition api request cause by `keyword`.~~(Completed, Need more testing)


## 8/1/2023

1. Handle download fail event.
2. Add download speed to the `DownloadCard` to indicate current download speed.
3. Limit `realTimeSizeDoneStore` report rate to 1 report per 500 ms

## 7/31/2023

1. User now can go to certain page by input page number in the input box next to the pagination buttons.
2. Handle when users open a work detail page in new tab/window push them to main page after they have clicked the back `<` button. 

### TODO 
1. Create worker for fetching files(download folder) from server.

## 7/30/2023

1. Add `random` sorting.
2. Add `q-chip` to works that have subtitle or SFW.
3. Add `PlayBar` component.
`
## 7/29/2023

1. Optimize route history and prevent duplicated fetch requests. 

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
~~4. Add random play option.~~(Completed)

## 7/15/2023

1. Searching feature is now working.
2. `WorksLib` page `WorkCard` and `WorkDetailPage` components are working correctly.

### TODO 
~~1. Fix `QueryMain` and Query`Result pages or deprecate them.~~(Deprecated)