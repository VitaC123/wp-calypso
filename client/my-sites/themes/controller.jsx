/**
 * External Dependencies
 */
import { compact, includes, isEmpty, startsWith } from 'lodash';
import debugFactory from 'debug';
import React from 'react';

/**
 * Internal Dependencies
 */
import SingleSiteComponent from 'my-sites/themes/single-site';
import MultiSiteComponent from 'my-sites/themes/multi-site';
import LoggedOutComponent from './logged-out';
import Upload from 'my-sites/themes/theme-upload';
import trackScrollPage from 'lib/track-scroll-page';
import { DEFAULT_THEME_QUERY } from 'state/themes/constants';
import { requestThemes, setBackPath } from 'state/themes/actions';
import { getThemesForQuery } from 'state/themes/selectors';
import { getAnalyticsData } from './helpers';

const debug = debugFactory( 'calypso:themes' );

function getProps( context ) {
	const { tier, filter, vertical, site_id: siteId } = context.params;

	const { basePath, analyticsPageTitle } = getAnalyticsData(
		context.path,
		tier,
		siteId
	);

	const boundTrackScrollPage = function() {
		trackScrollPage(
			basePath,
			analyticsPageTitle,
			'Themes'
		);
	};

	return {
		tier,
		filter,
		vertical,
		analyticsPageTitle,
		analyticsPath: basePath,
		search: context.query.s,
		trackScrollPage: boundTrackScrollPage
	};
}

export function upload( context, next ) {
	// Store previous path to return to only if it was main showcase page
	if ( startsWith( context.prevPath, '/design' ) &&
		! startsWith( context.prevPath, '/design/upload' ) ) {
		context.store.dispatch( setBackPath( context.prevPath ) );
	}

	context.primary = <Upload />;
	next();
}

export function singleSite( context, next ) {
	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <SingleSiteComponent { ...getProps( context ) } />;
	next();
}

export function multiSite( context, next ) {
	const props = getProps( context );

	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <MultiSiteComponent { ...props } />;
	next();
}

export function loggedOut( context, next ) {
	const props = getProps( context );

	context.primary = <LoggedOutComponent { ...props } />;
	next();
}

export function fetchThemeData( context, next ) {
	if ( ! context.isServerSide ) {
		return next();
	}

	const shouldUseCache = isEmpty( context.query ); // Don't cache URLs with query params
	const siteId = 'wpcom';
	const query = {
		search: context.query.s,
		tier: context.params.tier,
		filter: compact( [ context.params.filter, context.params.vertical ] ).join( ',' ),
		page: 1,
		number: DEFAULT_THEME_QUERY.number,
	};

	if ( shouldUseCache ) {
		const themes = getThemesForQuery( context.store.getState(), siteId, query );
		if ( themes ) {
			debug( 'found theme data in cache' );
			return next();
		}
	}

	context.store.dispatch( requestThemes( siteId, query ) ).then( next );
}

// Legacy (Atlas-based Theme Showcase v4) route redirects

export function redirectSearchAndType( { res, params: { site, search, tier } } ) {
	const target = '/design/' + compact( [ tier, site ] ).join( '/' ); // tier before site!
	if ( search ) {
		res.redirect( `${ target }?s=${ search }` );
	} else {
		res.redirect( target );
	}
}

export function redirectFilterAndType( { res, params: { site, filter, tier } } ) {
	let parts;
	if ( filter ) {
		parts = [ tier, 'filter', filter.replace( '+', ',' ), site ]; // The Atlas Showcase used plusses, we use commas
	} else {
		parts = [ tier, site ];
	}
	res.redirect( '/design/' + compact( parts ).join( '/' ) );
}

export function redirectToThemeDetails( { res, params: { site, theme, section } }, next ) {
	// Make sure we aren't matching a site -- e.g. /design/example.wordpress.com or /design/1234567
	if ( includes( theme, '.' ) || isFinite( theme ) ) {
		return next();
	}
	let redirectedSection;
	if ( section === 'support' ) {
		redirectedSection = 'setup';
	}
	res.redirect( '/theme/' + compact( [ theme, redirectedSection, site ] ).join( '/' ) );
}
