/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout } from 'controller';
import { getSubjects } from './theme-filters.js';
import {
	fetchThemeData,
	loggedOut,
	redirectSearchAndType,
	redirectFilterAndType,
	redirectToThemeDetails
} from './controller';
import validateFilters from './validate-filters';

// `logged-out` middleware isn't SSR-compliant yet, but we can at least render
// the layout.
// FIXME: Also create loggedOut/multiSite/singleSite elements, depending on route.

export default function( router ) {
	const verticals = getSubjects().join( '|' );

	if ( config.isEnabled( 'manage/themes' ) ) {
		// Redirect interim showcase route to permanent one
		router( [ '/design', '/design/*' ], ( { originalUrl, res } ) => {
			res.redirect( 301, '/themes' + originalUrl.slice( '/design'.length ) );
		} );

		router( `/themes/:vertical(${ verticals })?/:tier(free|premium)?`, fetchThemeData, loggedOut, makeLayout );
		router(
			`/themes/:vertical(${ verticals })?/:tier(free|premium)?/filter/:filter`,
			validateFilters,
			fetchThemeData,
			loggedOut,
			makeLayout
		);
		router( '/themes/upload/*', makeLayout );
		// Redirect legacy (Atlas-based Theme Showcase v4) routes
		router( [
			'/themes/:site?/search/:search',
			'/themes/:site?/type/:tier(free|premium)',
			'/themes/:site?/search/:search/type/:tier(free|premium)'
		], redirectSearchAndType );
		router( [
			'/themes/:site?/filter/:filter',
			'/themes/:site?/filter/:filter/type/:tier(free|premium)'
		], redirectFilterAndType );
		router( [
			'/themes/:theme/:section(support)?',
			'/themes/:site/:theme/:section(support)?'
		], redirectToThemeDetails );
		// The following route definition is needed so direct hits on `/themes/<mysite>` don't result in a 404.
		router( '/themes/*', fetchThemeData, loggedOut, makeLayout );
	}
}
