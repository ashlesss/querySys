import levenshtein from 'fast-levenshtein';

/**
 * 
 * @param {*} subtitleFiles 
 * @param {*} currentFile 
 * @returns 
 */
export const calSamePrc = (subtitleFiles, currentFile) => {
    const subFilePrc = subtitleFiles.map(file => {
        const name1 = file.title.slice(0, file.title.lastIndexOf("."))
        const currPlayName = currentFile.title.slice(0, currentFile.title.lastIndexOf("."))
        const distance = levenshtein.get(name1, currPlayName);
        const maxLength = Math.max(name1.length, currPlayName.length);

        const namePrc = (1 - distance / maxLength) * 100;

        if (file.duration === 'noContent') {
            return {
            title: file.title,
            mediaStreamUrl: file.mediaStreamUrl,
            mediaDownloadUrl: file.mediaDownloadUrl,
            percentage: namePrc,
            duration: -1
            }
        }
        else {
            const duration1 = file.duration
            const currPlayDuration = currentFile.duration

            if (duration1 - currPlayDuration > 10) {
                return {
                    title: file.title,
                    mediaStreamUrl: file.mediaStreamUrl,
                    mediaDownloadUrl: file.mediaDownloadUrl,
                    percentage: 0,
                    duration: file.duration
                }
            }

            const diff = Math.abs(duration1 - currPlayDuration);
            const maxLength = Math.max(duration1, currPlayDuration);
            const durationPrc = (1 - diff / maxLength) * 100;
            const combPrc = (0.8 * durationPrc) + (0.2 * namePrc)
            return {
                title: file.title,
                mediaStreamUrl: file.mediaStreamUrl,
                mediaDownloadUrl: file.mediaDownloadUrl,
                percentage: combPrc,
                duration: file.duration
            }
        }
    })
    const sortedPrc = subFilePrc.sort((a, b) => b.percentage - a.percentage)
    return sortedPrc
}