/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';
import { map, reduce, merge, omit } from 'lodash';

export readerFeeds from './reader-feeds';
export readerSites from './reader-sites';

const mergeMapStatetoProps = ( needs, state )=>
	reduce(
		needs.mapStateToProps,
		( accum, mapStateToProps ) => merge( accum, mapStateToProps( state ) ),
		{},
	);

export default needs => Component => {
	class EnhancedComponent extends React.Component {
		componentWillMount() {
			this.makeRequests( this.props.requests );
		}

		componentWillReceiveProps( nextProps ) {
			this.makeRequests( nextProps.requests );
		}

		makeRequests = ( requests = [] ) => {
			requests.forEach( request => request() );
		}

		render() {
			const childProps = omit( this.props, 'queryComponents' );

			return (
				<Component { ...childProps } />
			);
		}
	}

	return connect(
		( state, ownProps ) => ( {
			requests: map( needs, need => need.mapStateToRequest( state, ownProps ) ),
			...mergeMapStatetoProps( needs, state )
		} )
	)( EnhancedComponent );
};
