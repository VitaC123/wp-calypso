/**
 * Internal dependencies
 */
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import { requestFeed } from 'state/reader/feeds/actions';
import { shouldFeedBeFetched } from 'state/reader/feeds/selectors';

export default {
	mapStateToProps: ( state, ownProps ) => getFeed( state, ownProps.feedId ),
	mapStateToRequest: ( dispatch, state, ownProps ) => {
		const site = ownProps.siteId && getSite( state, ownProps.siteId );
		const feedId = ownProps.feedId ? ownProps.feedId : site && site.feed_ID;

		if ( shouldFeedBeFetched( state, feedId ) ) {
			return () => dispatch( requestFeed( feedId ) );
		}
		return () => {};
	}
};
