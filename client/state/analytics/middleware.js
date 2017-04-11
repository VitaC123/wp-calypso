/**
 * External dependencies
 */
import {
	has,
	invoke,
} from 'lodash';

/**
 * Internal dependencies
 */
import {
	ga,
	mc,
	tracks,
	pageView,
} from 'lib/analytics';
import {
	trackCustomAdWordsRemarketingEvent,
	trackCustomFacebookConversionEvent,
} from 'lib/analytics/ad-tracking';
import {
	ANALYTICS_EVENT_RECORD,
	ANALYTICS_PAGE_VIEW_RECORD,
	ANALYTICS_STAT_BUMP
} from 'state/action-types';

const eventServices = {
	ga: ( { category, action, label, value } ) => ga.recordEvent( category, action, label, value ),
	tracks: ( { name, properties } ) => tracks.recordEvent( name, properties ),
	fb: ( { name, properties } ) => trackCustomFacebookConversionEvent( name, properties ),
	adwords: ( { properties } ) => trackCustomAdWordsRemarketingEvent( properties ),
};

const pageViewServices = {
	ga: ( { url, title } ) => ga.recordPageView( url, title ),
	'default': ( { url, title } ) => pageView.record( url, title )
};

const statBump = ( { group, name } ) => mc.bumpStat( group, name );

export const dispatcher = ( { meta: { analytics } } ) => {
	analytics.forEach( ( { type, payload } ) => {
		const { service = 'default' } = payload;

		switch ( type ) {
			case ANALYTICS_EVENT_RECORD:
				return invoke( eventServices, service, payload );

			case ANALYTICS_PAGE_VIEW_RECORD:
				return invoke( pageViewServices, service, payload );

			case ANALYTICS_STAT_BUMP:
				return statBump( payload );
		}
	} );
};

export const analyticsMiddleware = () => next => action => {
	if ( has( action, 'meta.analytics' ) ) {
		dispatcher( action );
	}

	return next( action );
};

export default analyticsMiddleware;
