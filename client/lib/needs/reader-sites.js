/**
 * Internal dependencies
 */
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import { shouldSiteBeFetched } from 'state/reader/sites/selectors';
import { requestSite } from 'state/reader/sites/actions';

export default {
	mapStateToProps: ( state, ownProps ) => getSite( state, ownProps.siteId ),
	mapStateToRequest: ( state, ownProps, dispatch ) => {
		const feed = ownProps.feed && getFeed( state, ownProps.feedId );
		const siteId = ownProps.siteId ? ownProps.siteId : feed && feed.blog_ID;

		if ( shouldSiteBeFetched( state, siteId ) ) {
			return () => dispatch( requestSite( siteId ) );
		}
		return () => {};
	}
};
