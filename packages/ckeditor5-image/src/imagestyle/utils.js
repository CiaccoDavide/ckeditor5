/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/utils
 */

import { icons } from 'ckeditor5/src/core';
import { logWarning } from 'ckeditor5/src/utils';

const {
	objectFullWidth,
	objectInline,
	objectLeft,	objectRight, objectCenter,
	objectInlineLeft, objectInlineRight
} = icons;

/**
 * Default image arrangements provided by the plugin that can be referred in the
 * {@link module:image/image~ImageConfig#styles} configuration.
 *
 * There are available 5 styles focused on formatting:
 *
 * * **`'alignLeft'`** aligns the inline or block image to the left and wraps it with the text using the `image-style-align-left` class,
 * * **`'alignRight'`** aligns the inline or block image to the right and wraps it with the text using the `image-style-align-right` class,
 * * **`'alignCenter'`** centers the block image using the `image-style-align-center` class,
 * * **`'alignBlockLeft'`** aligns the block image to the left using the `image-style-block-align-left` class,
 * * **`'alignBlockRight'`** aligns the block image to the right using the `image-style-block-align-right` class,
 *
 * and 3 semantic styles:
 *
 * * **`'inline'`** is an inline image without any CSS class,
 * * **`'full'`** is a block image without any CSS class,
 * * **`'side'`** is a block image styled with the `image-style-side` CSS class.
 *
 * @readonly
 * @type {Object.<String,module:image/imagestyle~ImageStyleArrangementFormat>}
 */
const DEFAULT_ARRANGEMENTS = {
	// This style represents an image placed in the line of text.
	inline: {
		name: 'inline',
		title: 'In line',
		icon: objectInline,
		modelElements: [ 'imageInline' ],
		isDefault: true
	},

	// This style represents an image aligned to the left and wrapped with text.
	alignLeft: {
		name: 'alignLeft',
		title: 'Left aligned image',
		icon: objectInlineLeft,
		modelElements: [ 'image', 'imageInline' ],
		className: 'image-style-align-left'
	},

	// This style represents an image aligned to the left.
	alignBlockLeft: {
		name: 'alignBlockLeft',
		title: 'Left aligned image',
		icon: objectLeft,
		modelElements: [ 'image' ],
		className: 'image-style-block-align-left'
	},

	// This style represents a centered image.
	alignCenter: {
		name: 'alignCenter',
		title: 'Centered image',
		icon: objectCenter,
		modelElements: [ 'image' ],
		className: 'image-style-align-center'
	},

	// This style represents an image aligned to the right and wrapped with text.
	alignRight: {
		name: 'alignRight',
		title: 'Right aligned image',
		icon: objectInlineRight,
		modelElements: [ 'image', 'imageInline' ],
		className: 'image-style-align-right'
	},

	// This style represents an image aligned to the right.
	alignBlockRight: {
		name: 'alignBlockRight',
		title: 'Right aligned image',
		icon: objectRight,
		modelElements: [ 'image' ],
		className: 'image-style-block-align-right'
	},

	// This option is equal to the situation when no style is applied.
	full: {
		name: 'full',
		title: 'Full size image',
		icon: objectFullWidth,
		modelElements: [ 'image' ],
		isDefault: true
	},

	// This represents a side image.
	side: {
		name: 'side',
		title: 'Side image',
		icon: objectInlineRight,
		modelElements: [ 'image' ],
		className: 'image-style-side'
	}
};

/**
 * Default image groups provided by the plugin that can be referred in the
 * {@link module:image/image~ImageConfig#styles} configuration.
 *
 * There are 2 groups available:
 *
 * * **`'wrapText'`**, which contains the `alignLeft` and `alignRight` arrangements, that is, those that wraps the text around the image,
 * * **`'breakText'`**, which contains the `alignBlockLeft`, `alignCenter` and `alignBlockRight` arrangements, that is,
 * those that breaks the text around the image.
 *
 * @readonly
 * @type {Object.<String,module:image/imagestyle~ImageStyleGroupFormat>}
 */
const DEFAULT_GROUPS = {
	wrapText: {
		name: 'wrapText',
		title: 'Wrap text',
		defaultItem: 'alignLeft',
		items: [ 'alignLeft', 'alignRight' ]
	},

	breakText: {
		name: 'breakText',
		title: 'Break text',
		defaultItem: 'alignCenter',
		items: [ 'alignBlockLeft', 'alignCenter', 'alignBlockRight' ]
	}
};

/**
 * Default image arrangement icons provided by the plugin that can be referred in the
 * {@link module:image/image~ImageConfig#styles} configuration.
 *
 * There are 7 icons available: `'full'`, `'left'`, `'inlineLeft'`, `'center'`, `'right'`, `'inlineRight'`, and `'inline'`.
 *
 * @readonly
 * @type {Object.<String,String>}
 */
const DEFAULT_ICONS = {
	full: objectFullWidth,
	left: objectLeft,
	right: objectRight,
	center: objectCenter,
	inlineLeft: objectInlineLeft,
	inlineRight: objectInlineRight,
	inline: objectInline
};

/**
 * Returns lists of the normalized and validated arrangements and groups.
 * @protected
 *
 * @param {Object} options
 *
 * @param {Boolean} options.isInlinePluginLoaded
 * Determines whether the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin has been loaded.
 *
 * @param {Boolean} options.isBlockPluginLoaded
 * Determines whether the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin has been loaded.
 *
 * @param {module:image/imagestyle~ImageStyleFormat} options.configuredStyles
 * The image styles configuration provided in the image styles {@link module:image/image~ImageConfig#styles configuration}
 * as a default or custom value.
 *
 * @returns {module:image/imagestyle~ImageStyleFormat}
 * * Each of arrangements contains a complete icon markup.
 * * The arrangements not supported by any of the loaded plugins are filtered out. TODO: plugins
 * * The groups with no {@link module:image/imagestyle~ImageStyleGroupFormat#items items} are filtered out.
 * * All of the group items not defined in the arrangements are filtered out.
 */
function normalizeStyles( options ) {
	const configuredArrangements = options.configuredStyles.arrangements || [];
	const configuredGroups = options.configuredStyles.groups || [];

	const arrangements = configuredArrangements
		.map( arrangement => normalizeDefinition( DEFAULT_ARRANGEMENTS, arrangement, 'arrangement' ) )
		.filter( arrangement => isValidArrangement( arrangement, options ) );

	const groups = configuredGroups
		.map( group => normalizeDefinition( DEFAULT_GROUPS, group, 'group' ) )
		.map( group => validateGroupItems( group, arrangements ) )
		.filter( group => !!group.items.length );

	return { arrangements, groups };
}

/**
 * Returns the default image styles configuration depending on the loaded image editing plugins.
 * @protected
 *
 * @param {Boolean} isInlinePluginLoaded
 * Determines whether the {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugin has been loaded.
 *
 * @param {Boolean} isBlockPluginLoaded
 * Determines whether the {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} plugin has been loaded.
 *
 * @returns {Object<String,Array>}
 * It returns an object with the lists of the image arrangements and groups defined as strings related to the
 * {@link module:image/imagestyle/utils~DEFAULT_ARRANGEMENTS default arrangements} and the
 * {@link module:image/imagestyle/utils~DEFAULT_GROUPS default groups}.
 */
function getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) {
	if ( isBlockPluginLoaded && isInlinePluginLoaded ) {
		return {
			arrangements: [
				'inline', 'alignLeft', 'alignRight',
				'alignCenter', 'alignBlockLeft', 'alignBlockRight'
			],
			groups: [ 'wrapText', 'breakText' ]
		};
	} else if ( isBlockPluginLoaded ) {
		return {
			arrangements: [ 'full', 'side' ]
		};
	} else if ( isInlinePluginLoaded ) {
		return {
			arrangements: [ 'inline', 'alignLeft', 'alignRight' ]
		};
	}

	return {};
}

// Normalizes an image arrangement or group provided in the {@link module:image/image~ImageConfig#styles}
// and returns it in a {@link module:image/imagestyle~ImageStyleArrangementFormat}/{@link module:image/imagestyle~ImageStyleGroupFormat}.
//
// @param {DEFAULT_ARRANGEMENTS|DEFAULT_GROUPS} defaults
// @param {Object|String} definition
// @param {'arrangement'|'group'} definitionType
//
// @returns {module:image/imagestyle~ImageArragementFormat}|{module:image/imagestyle~ImageStyleGroupFormat}
function normalizeDefinition( defaults, definition, definitionType ) {
	if ( typeof definition === 'string' ) {
		// Just the name of the style has been passed, but none of the defaults.
		// Warn because probably it's a mistake. TODO
		if ( !defaults[ definition ] ) {
			// Normalize the style anyway to prevent errors.
			definition = { name: definition };
		}
		// Just the name of the style has been passed and it's one of the defaults, just use it.
		// Clone the style to avoid overriding defaults.
		else {
			definition = { ...defaults[ definition ] };
		}
	} else {
		// If an object style has been passed and if the name matches one of the defaults,
		// extend it with defaults – the user wants to customize a default style.
		// Note: Don't override the user–defined style object, clone it instead.
		definition = extendStyle( defaults[ definition.name ], definition );
	}

	// If an icon is defined as a string and correspond with a name
	// in default icons, use the default icon provided by the plugin.
	if ( definitionType === 'arrangement' && typeof definition.icon === 'string' ) {
		definition.icon = DEFAULT_ICONS[ definition.icon ] || definition.icon;
	}

	return definition;
}

// Checks if the arrangement is valid:
// * if it has the modelElements fields defined and filled,
// * if the defined modelElements are supported by any of the loaded image editing plugins.
// It also displays a console warning these conditions are not met.
//
// @param {module:image/imagestyle~ImageStyleArrangementFormat} arrangement
// @param {Object.<String,Boolean>} { isBlockPluginLoaded, isInlinePluginLoaded }
//
// @returns Boolean
function isValidArrangement( arrangement, { isBlockPluginLoaded, isInlinePluginLoaded } ) {
	const { modelElements, name } = arrangement;

	if ( !modelElements || !modelElements.length || !name ) {
		warnInvalidStyle( { arrangement } );

		return false;
	} else {
		const supportedElements = [ isBlockPluginLoaded ? 'image' : null, isInlinePluginLoaded ? 'imageInline' : null ];

		// Check if arrangement is supported by any of the loaded plugins.
		if ( !modelElements.some( elementName => supportedElements.includes( elementName ) ) ) {
			warnInvalidStyle( {
				arrangement,
				missingPlugins: modelElements.map( name => name === 'image' ? 'ImageBlockEditing' : 'ImageInlineEditing' )
			} );

			return false;
		}
	}

	return true;
}

// Validates the groupItems property of the group {module:image/imagestyle~ImageStyleGroupFormat}:
// * Sets the property to empty array if it is missing,
// * Filters out the items that are not defined as the arrangements
// It also displays a warning if the property was not set or some of the items was defined.
//
// @param {module:image/imagestyle~ImageStyleGroupFormat} originalGroup
// @param {Array.<{module:image/imagestyle~ImageStyleArrangementFormat}>} arrangements
//
// @returns {module:image/imagestyle~ImageStyleGroupFormat}
function validateGroupItems( originalGroup, arrangements ) {
	const group = { ...originalGroup, items: originalGroup.items || [] };
	const validItems = group.items.filter( item => !!arrangements.find( arrangement => arrangement.name === item ) );

	if ( !validItems.length || group.items.length !== validItems.length ) {
		warnInvalidStyle( { group: originalGroup } );

		return { ...originalGroup, items: validItems };
	}

	return group;
}

// Extends the default style with a style provided by the developer.
// Note: Don't override the custom–defined style object, clone it instead.
//
// @param {module:image/imagestyle~ImageStyleGroupFormat|module:image/imagestyle~ImageStyleArrangementFormat} source
// @param {Object} style
//
// @returns {module:image/imagestyle~ImageStyleGroupFormat|module:image/imagestyle~ImageStyleArrangementFormat}
function extendStyle( source, style ) {
	const extendedStyle = { ...style };

	for ( const prop in source ) {
		if ( !Object.prototype.hasOwnProperty.call( style, prop ) ) {
			extendedStyle[ prop ] = source[ prop ];
		}
	}

	return extendedStyle;
}

// Displays a console warning with the 'image-style-invalid' error.
// @param {Object} info
function warnInvalidStyle( info ) {
	/**
	 * The custom image style you provided is not valid.
	 * Check if it implements properly one of the following formats:
	 * * {@link module:image/imagestyle~ImageStyleArrangementFormat image style arrangement format},
	 * * {@link module:image/imagestyle~ImageStyleGroupFormat image style group format}
	 *
	 * and if the {@link module:image/imagestyle~ImageStyleArrangementFormat#modelElements required plugins} are loaded.
	 *
	 * @error image-style-invalid
	 * @param {String} [group] Name of a invalid group
	 * @param {String} [arrangement] Name of a invalid arrangement
	 * @param {String} [missingPlugins] Names of the plugins that have to be loaded for a particular arrangement
	 */
	logWarning( 'image-style-invalid', info );
}

export default {
	normalizeStyles,
	getDefaultStylesConfiguration,
	DEFAULT_ARRANGEMENTS,
	DEFAULT_GROUPS,
	DEFAULT_ICONS
};
