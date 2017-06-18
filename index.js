'use strict'

const Plugin = require('lisa-plugin')

module.exports = class KodiPlugin extends Plugin {

    /**
     * Initialisation of your plugin
     * Called once, when plugin is loaded
     * @returns Promise
     */
    init() {
        return super.init()
    }

    /**
     * Called when
     * @param action to execute
     * @param infos context of the action
     * @return Promise
     */
    interact(action, infos) {
        let room = infos.fields.room
        if (room) {
            room = room.id
        }
        let episode = infos.fields.episode
        if (episode) {
            episode = ("0" + episode).slice(-2)
        }
        switch (action) {
            case "PLAY_TV_SHOW":
                return this.drivers.kodi.playTvShow(infos.fields.show, infos.fields.season, episode, room)
            case "PLAY_MOVIE":
                return this.drivers.kodi.playMovie(infos.fields.movie, room)
            case "PAUSE_MEDIA_CENTER":
            case "PLAY_MEDIA_CENTER":
                return this.drivers.kodi.playPause(room)
            case "STOP_MEDIA_CENTER":
                return this.drivers.kodi.stop(room)
        }
        return Promise.resolve()
    }

    constructor(app) {
        super(app, {
            config: require('./config'),
            drivers: require('./drivers'),
            pkg: require('./package')
        })
    }
}
