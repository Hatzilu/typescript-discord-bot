/**
 * some spotify links have a /intl-{country code}/ part in them that distube hates, so i'm cutting them out
 * if it's not a spotify link, exit early.
 * TODO: remove this function once 'spotify-uri' fixes the error these links cause, and once '@distube/spotify' updates their 'spotify-uri' package.
 */
export const normalizeSpotifyLocalizationLinks = (queryUrlOrString: string) => {
	const spotifyLocalizedUrlRegex = new RegExp(
		/https:\/\/open\.spotify\.com\/intl-(?<countryCode>.+?(?=\/))\//g,
	);

	const result = spotifyLocalizedUrlRegex.exec(queryUrlOrString);

	if (result === null || !result?.groups) {
		return queryUrlOrString;
	}

	const countryCode = result.groups['countryCode'];

	return queryUrlOrString.replace(`/intl-${countryCode}`, '');
};
