var _ = require('lodash'),
    util = require('./util.js'),
    instagram = require('instagram-node').instagram();

var pickInputs = {
        'userId': { key: 'userId', validate: { req: true } },
        'count': 'count',
        'min_id': 'min_id',
        'max_id': 'max_id'
    },
    pickOutputs = {
        'id': { key: 'data', fields: ['id']},
        'username': { key: 'data', fields: ['user.username']},
        'standard_resolution': { key: 'data', fields: ['images.standard_resolution.url']},
        'caption_text': { key: 'data', fields: ['caption.text']},
        'likes': { key: 'data', fields: ['likes.count']},
        'tags': { key: 'data', fields: ['tags']},
        'location': { key: 'data', fields: ['location']}
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('instagram').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        // check params.
        if (validateErrors)
            return this.fail(validateErrors);

        instagram.use({ access_token: _.get(credentials, 'access_token') });
        instagram.user_media_recent(inputs.userId, _.omit(inputs, 'userId'), function (error, medias) {

            error? this.fail(error) : this.complete(util.pickOutputs({ data: medias }, pickOutputs));
        }.bind(this));
    }
};
