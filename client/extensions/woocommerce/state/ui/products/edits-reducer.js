/**
 * External dependencies
 */
import { isNumber } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT,
	WOOCOMMERCE_EDIT_PRODUCT_VARIATION_TYPE,
} from '../../action-types';

const debug = debugFactory( 'woocommerce:state:ui:products' );

const initialState = null;

export default function( state = initialState, action ) {
	const handlers = {
		[ WOOCOMMERCE_EDIT_PRODUCT ]: editProductAction,
		[ WOOCOMMERCE_EDIT_PRODUCT_VARIATION_TYPE ]: editProductVariationTypeAction,
	};

	const handler = handlers[ action.type ];

	return ( handler && handler( state, action ) ) || state;
}

function editProductAction( edits, action ) {
	const { product, data } = action.payload;

	const prevEdits = edits || {};
	const bucket = product && isNumber( product.id ) && 'updates' || 'creates';
	const _product = product || { id: { index: ( prevEdits[ bucket ] || [] ).length } };
	const _array = editProduct( prevEdits[ bucket ], _product, data );

	return {
		...prevEdits,
		[ bucket ]: _array,
		currentlyEditing: { productId: _product.id },
	};
}

function editProductVariationTypeAction( edits, action ) {
	const { product, attributeIndex, data } = action.payload;
	const attributes = product && product.attributes;

	const prevEdits = edits || {};
	const bucket = product && isNumber( product.id ) && 'updates' || 'creates';
	const _attributes = editProductVariationType( attributes, attributeIndex, data );
	const _product = product || { id: { index: ( prevEdits[ bucket ] || [] ).length } };
	const _array = editProduct( prevEdits[ bucket ], _product, { attributes: _attributes } );

	return {
		...prevEdits,
		[ bucket ]: _array,
		currentlyEditing: { productId: _product.id },
	};
}

function editProduct( array, product, data ) {
	// Use the existing product id (real or placeholder), or creates.length if no product.
	const prevArray = array || [];

	let found = false;

	// Look for this object in the appropriate create or edit array first.
	const _array = prevArray.map( ( p ) => {
		if ( product.id === p.id ) {
			found = true;
			return { ...p, ...data };
		}

		return p;
	} );

	if ( ! found ) {
		// update or create not already in edit state, so add it now.
		_array.push( { id: product.id, ...data } );
	}

	return _array;
}

function editProductVariationType( attributes, attributeIndex, data ) {
	const prevAttributes = attributes || [];
	const index = ( isNumber( attributeIndex ) ? attributeIndex : prevAttributes.length );

	const _attributes = [ ...prevAttributes ];
	const prevAttribute = prevAttributes[ index ] || { variation: true, options: [] };

	if ( prevAttribute.variation ) {
		_attributes[ index ] = { ...prevAttribute, ...data };
	} else {
		debug( 'WARNING: Attempting to edit a non-variation attribute as a variation type.' );
	}

	return _attributes;
}
