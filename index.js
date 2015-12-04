var _ = require('lodash');
var ig = require('instagram-node').instagram();

//username / Username
//images.standard_resolution.url / Media
//caption.text / Caption
//likes.count / Likes
//tags / Tags
//location / Location
//id / Media ID
var globalPickResult = {
    medias: {
        key: 'medias',
        fields: {
            'id': 'id',
            'user.username': 'username',
            'images.standard_resolution.url': 'standard_resolution_url',
            'caption.text': 'caption_text',
            'likes.count': 'likes_count',
            'tags': 'tags',
            'location': 'location'
        }
    }
};

module.exports = {

    /**
     * Return pick result.
     *
     * @param output
     * @param pickResult
     * @returns {*}
     */
    pickResult: function (output, pickResult) {
        var result = {};

        _.map(_.keys(pickResult), function (resultVal) {

            if (_.has(output, resultVal)) {

                if (_.isObject(pickResult[resultVal])) {
                    if (_.isArray(_.get(output, resultVal))) {

                        if (!_.isArray(result[pickResult[resultVal].key])) {
                            result[pickResult[resultVal].key] = [];
                        }

                        _.map(_.get(output, resultVal), function (inOutArrayValue) {

                            result[pickResult[resultVal].key].push(this.pickResult(inOutArrayValue, pickResult[resultVal].fields));
                        }, this);
                    } else if (_.isObject(_.get(output, resultVal))){

                        result[pickResult[resultVal].key] = this.pickResult(_.get(output, resultVal), pickResult[resultVal].fields);
                    }
                } else {
                    _.set(result, pickResult[resultVal], _.get(output, resultVal));
                }
            }
        }, this);

        return result;
    },

    /**
     * Set acess token.
     *
     * @param dexter
     * @param spotifyApi
     */
    authParams: function (dexter, spotifyApi) {

        if (dexter.environment('spotify_access_token')) {

            spotifyApi.setAccessToken(dexter.environment('spotify_access_token'));
        }
    },

    /**
     * To string inputs object.
     *
     * @param inputs
     * @param inputAttributes
     * @returns {{}}
     */
    prepareStringInputs: function (inputs) {
        var result = {};

        _.map(inputs, function (inputValue, inputKey) {

            result[inputKey] = _(inputValue).toString();
        });

        return result;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        ig.use({ access_token: dexter.environment('instagram_access_token') });

        if (!step.input('userId').first()) {

            this.fail('A [userId] is Required for this module.');
        }

        ig.user_media_recent(step.input('userId').first(), this.prepareStringInputs(_.omit(step.inputs(), 'userId')), function (err, medias) {

            if (err) {

                this.fail(err);
            } else {

                this.complete(this.pickResult({medias: medias}, globalPickResult));
            }
        }.bind(this));
    }
};
